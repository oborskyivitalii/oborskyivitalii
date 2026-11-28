'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { run: runResearch } = require('../tools/orchestration/editorial-research.cjs');
const { reduce } = require('../tools/orchestration/reducer.cjs');
const startFixture = require('./fixtures/orchestration-start.json');
const acceptFixture = require('./fixtures/orchestration-accept-only.json');

function fixture() {
  return structuredClone(startFixture);
}

function evaluate(input) {
  return reduce(JSON.stringify(input));
}

function event(input, kind, sequence, overrides = {}) {
  return {
    id: `fixture:event-${sequence}`,
    operationKey: input.decision.operationKey,
    run: input.run,
    sequence,
    kind,
    receipt: null,
    ...overrides,
  };
}

function keyFor(operation) {
  const entries = Object.keys(operation)
    .sort()
    .map((key) => [key, operation[key]]);
  return createHash('sha256')
    .update(JSON.stringify(Object.fromEntries(entries)))
    .digest('hex');
}

test('P01: malformed, unknown, nonfixture, oversized and deeply nested inputs fail closed', () => {
  const invalid = [
    '{',
    'null',
    '{}',
    12,
    {
      get secret() {
        throw Error('not JSON');
      },
    },
  ];
  for (const value of invalid) {
    assert.equal(reduce(value).ok, false);
  }
  const edits = [
    (input) => {
      input.extra = 'PRIVATE-OPAQUE-SENTINEL';
    },
    (input) => {
      input.operation.owner = 'real-owner';
    },
    (input) => {
      input.events[0].sequence = -1;
    },
    (input) => {
      input.model.pair = 'automatic-fallback';
    },
    (input) => {
      input.private = 'x'.repeat(1025);
    },
    (input) => {
      input.events = Array(129).fill(input.events[0]);
    },
    (input) => {
      input.prior = [];
    },
    (input) => {
      input.private = { a: { a: { a: { a: { a: { a: { a: {} } } } } } } };
    },
  ];
  for (const edit of edits) {
    const input = fixture();
    edit(input);
    const result = evaluate(input);
    assert.equal(result.ok, false);
    assert.deepEqual(result.effects, []);
    assert.ok(!JSON.stringify(result).includes('PRIVATE-OPAQUE-SENTINEL'));
  }
  assert.equal(reduce(' '.repeat(32769)).ok, false);
});

test('P01/P05: evaluation is deterministic, does not mutate fixture and never echoes opaque text', () => {
  const input = fixture();
  const before = structuredClone(input);
  const first = evaluate(input);
  assert.deepEqual(input, before);
  assert.deepEqual(first, evaluate(input));
  assert.ok(!JSON.stringify(first).includes(input.private));
  assert.deepEqual(Object.keys(first.public).sort(), [
    'acceptance',
    'held',
    'owningIssueClosed',
    'runtime',
    'scope',
  ]);
});

test('P02: accept-only yields zero proposals; combined start queues one proposal', () => {
  assert.deepEqual(evaluate(acceptFixture).effects, []);
  const input = fixture();
  input.events.push(event(input, 'request-start', 2));
  const result = evaluate(input);
  assert.equal(result.effects.length, 1);
  assert.equal(result.state.runtime, 'queued');
  input.prior = result.state;
  assert.deepEqual(evaluate(input).effects, []);
});

test('P02/P04: missing or revoked authority, unsupported and unverified required pair hold', () => {
  const edits = [
    (input) => {
      input.decision.authority = false;
    },
    (input) => {
      input.decision.revoked = true;
    },
    (input) => {
      input.decision.accepted = false;
    },
    (input) => {
      input.model.supported = false;
    },
    (input) => {
      input.model.pair = 'unverified';
    },
    (input) => {
      input.decision.operationKey = 'c'.repeat(64);
    },
  ];
  for (const edit of edits) {
    const input = fixture();
    edit(input);
    const result = evaluate(input);
    assert.equal(result.disposition, 'hold');
    assert.deepEqual(result.effects, []);
    assert.equal(result.state.runtime, 'idle');
  }
});

test('P02: queue ACK is not running; only matching start advances; result never closes issue', () => {
  const input = fixture();
  input.events.push(event(input, 'queue-ack', 2));
  assert.equal(evaluate(input).state.runtime, 'queued');
  input.events.push(event(input, 'start-observed', 3, { run: 'fixture:wrong-run' }));
  assert.equal(evaluate(input).state.runtime, 'queued');
  input.events.push(event(input, 'start-observed', 4));
  assert.equal(evaluate(input).state.runtime, 'running');
  input.events.push(event(input, 'result-observed', 5), event(input, 'queue-ack', 6));
  const result = evaluate(input);
  assert.equal(result.state.runtime, 'completed');
  assert.equal(result.public.owningIssueClosed, false);
  assert.equal(result.public.acceptance, 'not-established');
});

test('P03: plan/routing/model change cannot repeat dispatch; semantic source changes bind key', () => {
  const input = fixture();
  const first = evaluate(input);
  input.prior = first.state;
  input.planRevision += 1;
  input.routingRevision += 1;
  input.model.pair = 'terra-medium';
  input.events = [event(input, 'request-start', 2)];
  const revised = evaluate(input);
  assert.equal(revised.state.operationKey, first.state.operationKey);
  assert.deepEqual(revised.effects, []);
  for (const field of ['candidate', 'semanticInputs', 'target', 'intent']) {
    const changed = structuredClone(input);
    changed.operation[field] =
      field === 'candidate' || field === 'semanticInputs' ? 'c'.repeat(64) : 'fixture:different';
    changed.decision.operationKey = keyFor(changed.operation);
    changed.events = [event(changed, 'request-start', 3)];
    assert.equal(evaluate(changed).disposition, 'prior-operation-hold');
    assert.deepEqual(evaluate(changed).effects, []);
  }
});

test('P03: stale and duplicate observations cannot alter current completion', () => {
  const input = fixture();
  input.events.push(event(input, 'start-observed', 3), event(input, 'result-observed', 4));
  const completed = evaluate(input);
  input.prior = completed.state;
  input.events = [event(input, 'stop-unknown', 2), event(input, 'request-start', 1)];
  const result = evaluate(input);
  assert.equal(result.state.runtime, 'completed');
  assert.equal(result.state.stopUnknown, false);
  assert.deepEqual(result.effects, []);
});

test('P04: receipt recovery cannot clear unknown cessation; late result cannot resume', () => {
  const input = fixture();
  input.events.push(
    event(input, 'start-observed', 2),
    event(input, 'receipt-missing', 3),
    event(input, 'stop-unknown', 4),
    event(input, 'reconcile-receipt', 5, { receipt: 'fixture:receipt-one' }),
    event(input, 'result-observed', 6)
  );
  const result = evaluate(input);
  assert.equal(result.state.receiptUnknown, false);
  assert.equal(result.state.stopUnknown, true);
  assert.equal(result.state.runtime, 'running');
  assert.equal(result.disposition, 'hold');
  assert.equal(result.effects.length, 1);
  input.prior = result.state;
  input.events = [event(input, 'request-start', 7)];
  assert.deepEqual(evaluate(input).effects, []);
  input.events.push(event(input, 'stop-observed', 8));
  assert.equal(evaluate(input).state.runtime, 'stopped');
});

test('P04: wrong-source receipt cannot repair; matching recovery never replays work', () => {
  const input = fixture();
  input.events.push(event(input, 'receipt-missing', 2));
  const missing = evaluate(input);
  input.prior = missing.state;
  input.events = [
    event(input, 'reconcile-receipt', 3, {
      operationKey: 'c'.repeat(64),
      receipt: 'fixture:receipt-one',
    }),
  ];
  assert.equal(evaluate(input).state.receiptUnknown, true);
  input.events.push(event(input, 'reconcile-receipt', 4, { receipt: 'fixture:receipt-one' }));
  const recovered = evaluate(input);
  assert.equal(recovered.state.receiptUnknown, false);
  assert.deepEqual(recovered.effects, []);
  input.prior = recovered.state;
  input.events = [event(input, 'reconcile-receipt', 5, { receipt: 'fixture:conflict' })];
  assert.equal(evaluate(input).state.receiptUnknown, true);
});

test('P03 correction: reconciled candidate change holds without resetting operation lineage', () => {
  const input = fixture();
  input.events.push(
    event(input, 'start-observed', 2),
    event(input, 'result-observed', 3),
    event(input, 'reconcile-receipt', 4, { receipt: 'fixture:receipt-one' })
  );
  input.prior = evaluate(input).state;
  input.operation.candidate = 'c'.repeat(64);
  input.run = 'fixture:run-two';
  input.decision.operationKey = keyFor(input.operation);
  input.events = [event(input, 'request-start', 1)];
  const result = evaluate(input);
  assert.equal(result.disposition, 'prior-operation-hold');
  assert.deepEqual(result.effects, []);
  assert.deepEqual(result.state, input.prior);
});

const { evaluate: evaluateEditorial } = require('../tools/orchestration/editorial-article.cjs');

function editorialRun(outputs = ['html', 'pdf']) {
  const input = { run: '0'.repeat(64), author: 'editor', outputs, events: [] };
  const current = () => evaluateEditorial(JSON.stringify(input));
  const add = (event) => {
    input.events.push(event);
    try {
      return current();
    } catch (error) {
      input.events.pop();
      throw error;
    }
  };
  const brief = (artifact = 'a') =>
    add({
      type: 'brief',
      artifact: artifact.repeat(64),
      previous: current().brief?.review ?? null,
    });
  const manuscript = (artifact = 'b') =>
    add({
      type: 'manuscript',
      artifact: artifact.repeat(64),
      previous: current().manuscript?.review ?? null,
      brief: current().brief.review,
    });
  const render = (output, artifact) =>
    add({
      type: 'render',
      manuscript: current().manuscript.review,
      output,
      artifact: artifact.repeat(64),
      previous: current().artifacts[output]?.review ?? null,
    });
  const decision = (
    scope,
    choice,
    review = (current()[scope] ?? current().artifacts[scope]).review,
    author = 'editor'
  ) => add({ type: 'decision', scope, choice, review, author });
  return { input, current, add, brief, manuscript, render, decision };
}

test('editorial article accepts HTML independently while the requested PDF is deferred', () => {
  const run = editorialRun();
  run.brief();
  assert.throws(() => run.manuscript(), /brief decision required/);
  run.decision('brief', 'accept');
  run.manuscript();
  assert.throws(() => run.render('pdf', 'c'), /manuscript decision required/);
  run.decision('manuscript', 'accept');
  run.render('html', 'c');
  run.render('pdf', 'c');
  const htmlReview = run.current().artifacts.html.review;
  assert.throws(() => run.decision('pdf', 'accept', htmlReview), /stale editorial decision/);
  run.decision('html', 'accept');
  assert.throws(
    () => run.decision('pdf', 'accept', run.current().artifacts.pdf.review, 'worker'),
    /invalid editorial decision/
  );
  const result = run.decision('pdf', 'defer');
  assert.equal(result.artifacts.html.decision.choice, 'accept');
  assert.equal(result.artifacts.pdf.decision.choice, 'defer');
  assert.deepEqual(Object.keys(result), ['scope', 'stopped', 'brief', 'manuscript', 'artifacts']);
});

test('editorial changes invalidate exact decisions and preserve unaffected output decisions', () => {
  const run = editorialRun();
  const firstBrief = run.brief().brief.review;
  run.decision('brief', 'accept');
  const firstDraft = run.manuscript().manuscript.review;
  run.decision('manuscript', 'accept');
  run.render('html', 'c');
  const firstPdf = run.render('pdf', 'd').artifacts.pdf.review;
  run.decision('html', 'accept');
  run.decision('pdf', 'accept');
  const newPdf = run.render('pdf', 'e');
  assert.equal(newPdf.manuscript.review, firstDraft);
  assert.equal(newPdf.artifacts.html.decision.choice, 'accept');
  assert.equal(newPdf.artifacts.pdf.decision, null);
  assert.throws(() => run.decision('pdf', 'accept', firstPdf), /stale editorial decision/);

  const edited = run.manuscript('f');
  assert.deepEqual(edited.artifacts, {});
  assert.throws(
    () =>
      run.add({
        type: 'manuscript',
        artifact: 'b'.repeat(64),
        brief: firstBrief,
        previous: firstDraft,
      }),
    /stale editorial input/
  );
  assert.equal(run.current().manuscript.artifact, 'f'.repeat(64));
  assert.throws(() => run.decision('manuscript', 'accept', firstDraft), /stale editorial decision/);

  run.brief('1');
  assert.equal(run.current().manuscript, null);
  run.brief('a');
  assert.throws(() => run.decision('brief', 'accept', firstBrief), /stale editorial decision/);
});

test('editorial stop prevents later writing and a returned draft requires resubmission', () => {
  const stopped = editorialRun();
  stopped.brief();
  assert.equal(stopped.decision('brief', 'stop').stopped, true);
  assert.throws(() => stopped.manuscript(), /research stopped/);

  const run = editorialRun(['html']);
  run.brief();
  run.decision('brief', 'accept');
  const firstDraft = run.manuscript().manuscript.review;
  run.decision('manuscript', 'return');
  assert.throws(() => run.decision('manuscript', 'accept'), /must be resubmitted/);
  assert.notEqual(run.manuscript().manuscript.review, firstDraft);
  run.decision('manuscript', 'accept');
  assert.throws(() => run.render('pdf', 'd'), /output not requested/);
});

test('editorial input rejects unknown actions and bounded event and byte overflows', () => {
  const run = editorialRun();
  assert.throws(() => run.add({ type: 'publish' }), /invalid editorial event/);
  assert.throws(() => evaluateEditorial(' '.repeat(32_769)), /input size/);
  run.input.events = Array.from({ length: 65 }, () => null);
  assert.throws(() => run.current(), /invalid editorial plan/);
});

test('research can stop after accepting or returning R1 before any writing', () => {
  for (const choice of ['accept', 'return']) {
    const run = editorialRun();
    run.brief();
    run.decision('brief', choice);
    assert.equal(run.decision('brief', 'stop').stopped, true);
    assert.throws(() => run.manuscript(), /research stopped/);
  }
});

test('a returned PDF rejects results prepared before the return', () => {
  const run = editorialRun();
  run.brief();
  run.decision('brief', 'accept');
  run.manuscript();
  run.decision('manuscript', 'accept');
  const before = run.render('pdf', 'c').artifacts.pdf.review;
  run.decision('pdf', 'return');
  const stale = {
    type: 'render',
    manuscript: run.current().manuscript.review,
    output: 'pdf',
    artifact: 'd'.repeat(64),
    previous: before,
  };
  assert.throws(() => run.add(stale), /stale editorial input/);
  assert.equal(run.current().artifacts.pdf.decision.choice, 'return');
  assert.equal(run.render('pdf', 'd').artifacts.pdf.decision, null);
});

test('a freshly accepted replacement cannot admit work citing the previous accepted upstream', () => {
  const run = editorialRun();
  const firstBrief = run.brief().brief.review;
  run.decision('brief', 'accept');
  run.brief('1');
  run.decision('brief', 'accept');
  assert.throws(
    () =>
      run.add({
        type: 'manuscript',
        brief: firstBrief,
        artifact: 'b'.repeat(64),
        previous: null,
      }),
    /brief decision required/
  );
  const firstDraft = run.manuscript().manuscript.review;
  run.decision('manuscript', 'accept');
  run.manuscript('2');
  run.decision('manuscript', 'accept');
  assert.throws(
    () =>
      run.add({
        type: 'render',
        manuscript: firstDraft,
        artifact: 'c'.repeat(64),
        previous: null,
        output: 'html',
      }),
    /manuscript decision required/
  );
});

test('identical artifacts at the same replay position need separate HTML and PDF decisions', () => {
  const html = editorialRun();
  html.brief();
  html.decision('brief', 'accept');
  html.manuscript();
  html.decision('manuscript', 'accept');

  const pdf = editorialRun();
  pdf.input.events = structuredClone(html.input.events);
  const htmlReview = html.render('html', 'c').artifacts.html.review;
  const pdfReview = pdf.render('pdf', 'c').artifacts.pdf.review;

  assert.notEqual(htmlReview, pdfReview);
  assert.throws(() => html.decision('html', 'accept', pdfReview), /stale editorial decision/);
  assert.throws(() => pdf.decision('pdf', 'accept', htmlReview), /stale editorial decision/);
  assert.equal(
    html.decision('html', 'accept', htmlReview).artifacts.html.decision.choice,
    'accept'
  );
  assert.equal(pdf.decision('pdf', 'accept', pdfReview).artifacts.pdf.decision.choice, 'accept');
});

test('replacing the brief after writing does not reopen the research-only stop', () => {
  const run = editorialRun();
  run.brief();
  run.decision('brief', 'accept');
  run.manuscript();
  const replacement = run.brief('d');

  assert.equal(replacement.manuscript, null);
  assert.throws(
    () => run.decision('brief', 'stop', replacement.brief.review),
    /invalid editorial decision/
  );
  assert.equal(run.current().stopped, false);
  assert.equal(
    run.decision('brief', 'accept', replacement.brief.review).brief.decision.choice,
    'accept'
  );
});

test('article research uses separate skill packets and hands only the approved blueprint to drafting', () => {
  const replay = { run: 'a'.repeat(64), author: 'editor', outputs: ['html'], events: [] };
  const request = {
    replay,
    previous: null,
    attempt: 'b'.repeat(64),
    article: {
      issue: 217,
      title: 'Article material',
      audience: 'Authors',
      purpose: 'Explain selection',
      language: 'English',
      question: 'Is being listed sufficient?',
      sources: [
        { id: 'setup', url: 'https://example.org/setup', body: 'An allowlist selects candidates.' },
      ],
      reviewSources: [
        {
          id: 'review',
          url: 'https://example.org/review',
          body: 'A pending  approval excludes the file.',
        },
      ],
    },
  };
  const call = (action, fields = {}) => runResearch({ ...request, action, ...fields });
  const launch = (action, fields = {}) => {
    if (['critique', 'brief'].includes(action) && !Object.hasOwn(fields, 'analysis')) {
      const analyst = call('analysis', fields);
      return call(action, {
        ...fields,
        analysis: receipt(analyst, '/root/analyst', modeled(fields.research.result)),
      });
    }
    return call(action, fields);
  };
  const researcher = launch('research');
  assert.equal(researcher.launch.fork_turns, 'none');
  assert.match(researcher.launch.message, /source-research\/SKILL\.md/);
  assert.doesNotMatch(researcher.launch.message, /pending  approval/);
  const receipt = ({ packet, scope }, handle, result) => ({
    packet,
    scope,
    handle,
    resultHandle: handle,
    forkTurns: 'none',
    result,
  });
  const research = receipt(researcher, '/root/research', {
    thesis: 'A listing is sufficient.',
    outline: ['Explain the allowlist alone.'],
    evidence: [{ source: 'setup', quote: 'An allowlist selects candidates.' }],
    limits: ['The researcher has not observed review.'],
  });
  const modeled = (result) => ({
    ...result,
    thesis: 'An allowlist entry may suffice.',
    outline: ['Explain the candidate mechanism.'],
    model: {
      scope: 'Existing article materials',
      affected: ['Authors', 'Readers'],
      mechanism: 'Selection may depend on both listing and review.',
      unknowns: ['Review behavior before selection.'],
      alternatives: [
        {
          explanation: 'The list alone selects the file',
          disconfirmingObservation: 'A listed file is excluded.',
        },
        {
          explanation: 'Review also gates the listing',
          disconfirmingObservation: 'An unreviewed file is shown.',
        },
      ],
    },
    lens: null,
  });
  const packetBody = ({ launch }) => JSON.parse(launch.message.split('\n').at(-1));
  const analyst = call('analysis', { research });
  assert.deepEqual(analyst.selection, { skill: null, reason: 'no optional analysis need' });
  assert.deepEqual(
    packetBody(analyst).skills.map(({ file }) => file),
    ['.agents/skills/problem-space-model/SKILL.md']
  );
  assert.doesNotMatch(analyst.launch.message, /pending  approval/);
  const analysis = receipt(analyst, '/root/analyst', modeled(research.result));
  const [firstAlternative, secondAlternative] = analysis.result.model.alternatives;
  const duplicateAlternatives = {
    ...analysis,
    result: {
      ...analysis.result,
      model: {
        ...analysis.result.model,
        alternatives: [
          firstAlternative,
          {
            ...secondAlternative,
            explanation: firstAlternative.explanation.replace(' ', '\t  ').toUpperCase(),
          },
        ],
      },
    },
  };
  assert.throws(
    () => call('critique', { research, analysis: duplicateAlternatives }),
    /distinct alternative explanations/
  );
  assert.throws(() => call('critique', { research }), /analysis receipt is required/);
  assert.throws(() => call('brief', { research }), /analysis receipt is required/);
  assert.throws(
    () =>
      call('critique', {
        research,
        analysis: { ...analysis, handle: research.handle, resultHandle: research.handle },
      }),
    /distinct task handle/
  );
  assert.throws(
    () =>
      call('critique', {
        research,
        analysis: {
          ...analysis,
          result: {
            ...analysis.result,
            model: {
              ...analysis.result.model,
              alternatives: [analysis.result.model.alternatives[0]],
            },
          },
        },
      }),
    /testable alternatives count/
  );
  for (const [analysisNeeds, expected] of [
    [{ feedback: true }, 'systems-thinking'],
    [{ bottleneck: true, feedback: true }, 'constraint-first'],
    [{ uncertainApproach: true, bottleneck: true, feedback: true }, 'cynefin'],
  ]) {
    const article = { ...request.article, analysisNeeds };
    const selected = call('analysis', { research, article });
    assert.equal(selected.selection.skill, expected);
    assert.equal(selected.launch.fork_turns, 'none');
    assert.deepEqual(
      packetBody(selected).skills.map(({ file }) => file),
      ['.agents/skills/problem-space-model/SKILL.md', `.agents/skills/${expected}/SKILL.md`]
    );
    assert.throws(
      () => call('critique', { research, article, analysis }),
      /mismatched worker receipt/
    );
    const chosen = receipt(selected, '/root/analyst', {
      ...analysis.result,
      lens: { skill: expected, finding: 'A localized constraint needs a system-level check.' },
    });
    assert.throws(
      () =>
        call('critique', {
          research,
          article,
          analysis: {
            ...chosen,
            result: {
              ...chosen.result,
              lens: { ...chosen.result.lens, skill: 'wrong-skill' },
            },
          },
        }),
      /Unexpected analysis skill/
    );
    const next = call('critique', { research, article, analysis: chosen });
    assert.equal(packetBody(next).proposedThesis, analysis.result.thesis);
    assert.doesNotMatch(
      next.launch.message,
      /localized constraint|gates the listing|candidate mechanism/
    );
  }
  const critic = launch('critique', { research });
  assert.match(critic.launch.message, /competing-hypotheses\/SKILL\.md/);
  assert.match(critic.launch.message, /pending  approval/);
  assert.match(critic.launch.message, /An allowlist entry may suffice/);
  assert.doesNotMatch(critic.launch.message, /allowlist alone|has not observed review/);
  const critique = receipt(critic, '/root/critic', {
    verdict: 'narrows',
    reason: 'Approval is a separate condition.',
    thesis: 'An approved listing can select the file.',
    outline: ['Explain selection.', 'Explain approval.'],
    evidence: [{ source: 'review', quote: 'A pending  approval excludes the file.' }],
    limits: [],
  });
  assert.throws(() => launch('brief', { research }), /worker receipt/);
  const changed = JSON.parse(critic.launch.message.split('\n').at(-1));
  delete changed.skill;
  const withoutSkill = createHash('sha256')
    .update(critic.launch.message.split('\n')[0] + '\n' + JSON.stringify(changed))
    .digest('hex');
  assert.throws(
    () => launch('brief', { research, critique: { ...critique, packet: withoutSkill } }),
    /mismatched worker receipt/
  );
  assert.throws(
    () =>
      launch('brief', {
        research: {
          ...research,
          result: { ...research.result, outline: ['Different research outline.'] },
        },
        critique,
      }),
    /mismatched worker receipt/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique: { ...critique, result: { ...critique.result, limits: 'Not a list' } },
      }),
    /Invalid limits count/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique: { ...critique, resultHandle: '/root/other' },
      }),
    /mismatched worker receipt/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique: { ...critique, handle: research.handle, resultHandle: research.handle },
      }),
    /distinct task handle/
  );
  assert.throws(
    () =>
      call('brief', {
        research,
        analysis,
        critique: { ...critique, handle: analysis.handle, resultHandle: analysis.handle },
      }),
    /distinct task handle/
  );
  assert.throws(
    () =>
      call('brief', {
        research,
        critique,
        analysis: {
          ...analysis,
          result: {
            ...analysis.result,
            model: { ...analysis.result.model, scope: 'Changed analytical scope' },
          },
        },
      }),
    /mismatched worker receipt/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique: {
          ...critique,
          result: { ...critique.result, evidence: [{ source: 'review', quote: 'invented' }] },
        },
      }),
    /match an assigned primary source/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique,
        attempt: 'c'.repeat(64),
      }),
    /mismatched worker receipt/
  );

  assert.throws(
    () =>
      launch('critique', { research, replay: { ...replay, author: 'other', outputs: ['pdf'] } }),
    /mismatched worker receipt/
  );
  const output = launch('brief', { research, critique });
  const pending = { ...replay, events: [output.event] };
  const dispatch = (state, candidate = output.candidate) =>
    runResearch({ action: 'handoff', replay: state, candidate });
  assert.deepEqual(dispatch(pending), { status: 'awaiting-author' });
  const decision = (choice) => ({
    type: 'decision',
    scope: 'brief',
    review: output.review,
    author: replay.author,
    choice,
  });
  assert.deepEqual(dispatch({ ...replay, events: [output.event, decision('stop')] }), {
    status: 'stopped',
  });
  const accepted = { ...replay, events: [output.event, decision('accept')] };
  const writing = dispatch(accepted);
  assert.equal(writing.status, 'ready-to-draft');
  assert.equal(writing.blueprint, output.candidate.blueprint);
  assert.match(writing.blueprint, /An approved listing can select the file\./);
  assert.match(writing.blueprint, /Explain approval\./);
  assert.equal(output.candidate.analysis.model.scope, 'Existing article materials');
  assert.doesNotMatch(
    writing.blueprint,
    /Existing article materials|An unreviewed file is shown|Explain the candidate mechanism/
  );
  assert.match(writing.blueprint, /A pending  approval excludes the file\./);
  assert.match(writing.blueprint, /https:\/\/example.org\/review/);
  assert.doesNotMatch(writing.blueprint, /A listing is sufficient|allowlist alone/);
  assert.throws(
    () => dispatch(accepted, { ...output.candidate, title: 'Substituted' }),
    /not the accepted brief/
  );

  const returned = { ...replay, events: [output.event, decision('return')] };
  const current = evaluateEditorial(JSON.stringify(returned)).brief.review;
  assert.throws(
    () => launch('brief', { research, critique, replay: returned }),
    /Stale or stopped/
  );
  assert.throws(
    () =>
      launch('brief', {
        research,
        critique,
        replay: returned,
        previous: current,
        attempt: 'd'.repeat(64),
      }),
    /mismatched worker receipt/
  );
  const open = launch('brief', {
    research,
    critique: {
      ...critique,
      result: {
        verdict: 'open',
        reason: 'Evidence unavailable.',
        thesis: '',
        outline: [],
        evidence: [],
        limits: ['Load reader records.'],
      },
    },
  });
  const openReplay = {
    ...replay,
    events: [open.event, { ...decision('accept'), review: open.review }],
  };
  assert.deepEqual(dispatch(openReplay, open.candidate), { status: 'needs-evidence' });
  const supported = launch('brief', {
    research,
    critique: {
      ...critique,
      result: {
        ...critique.result,
        verdict: 'supports',
        thesis: analysis.result.thesis,
        outline: [],
      },
    },
  });
  assert.match(supported.candidate.blueprint, /Explain the candidate mechanism/);
  assert.match(
    supported.candidate.blueprint,
    /The mechanism and alternatives below are hypotheses to test/
  );
  assert.match(supported.candidate.blueprint, /Existing article materials/);
  const { analysis: ignored, ...historical } = supported.candidate;
  const historicalEvent = {
    ...supported.event,
    artifact: createHash('sha256').update(JSON.stringify(historical)).digest('hex'),
  };
  const historicalReview = evaluateEditorial(
    JSON.stringify({ ...replay, events: [historicalEvent] })
  ).brief.review;
  assert.equal(
    dispatch(
      { ...replay, events: [historicalEvent, { ...decision('accept'), review: historicalReview }] },
      historical
    ).blueprint,
    historical.blueprint
  );
  const fullReplay = { ...accepted, events: [output.event, ...Array(62).fill(decision('accept'))] };
  const start = (action, fields) =>
    launch(action, {
      ...fields,
      replay: fullReplay,
      previous: output.review,
      attempt: 'e'.repeat(64),
    });
  const newResearch = receipt(start('research'), research.handle, research.result);
  const newCritique = receipt(
    start('critique', { research: newResearch }),
    critique.handle,
    critique.result
  );
  assert.throws(
    () => start('brief', { research: newResearch, critique: newCritique }),
    /invalid editorial plan/
  );

  const largeQuotes = Array.from(
    { length: 12 },
    (_, index) => '~'.repeat(1_880) + ' text ' + index
  );
  const largeSource = largeQuotes.join('\n');
  const largeArticle = {
    ...request.article,
    sources: [{ ...request.article.sources[0], body: largeSource }],
    reviewSources: [{ ...request.article.reviewSources[0], body: largeSource }],
  };
  const fromLarge = (action, fields) => launch(action, { ...fields, article: largeArticle });
  const sourceResult = {
    ...research.result,
    evidence: largeQuotes.map((quote) => ({ source: 'setup', quote })),
  };
  const reviewResult = {
    ...critique.result,
    evidence: largeQuotes.map((quote) => ({ source: 'review', quote })),
    outline: Array.from({ length: 12 }, (_, index) => index + '&'.repeat(995)),
  };
  const largeResearch = receipt(fromLarge('research'), research.handle, sourceResult);
  const largeCritique = receipt(
    fromLarge('critique', { research: largeResearch }),
    critique.handle,
    reviewResult
  );
  const large = fromLarge('brief', { research: largeResearch, critique: largeCritique });
  const largeAccepted = {
    ...replay,
    events: [large.event, { ...decision('accept'), review: large.review }],
  };
  assert.ok(Buffer.byteLength(large.candidate.blueprint) > 100_000);
  assert.equal(dispatch(largeAccepted, large.candidate).blueprint, large.candidate.blueprint);
});
