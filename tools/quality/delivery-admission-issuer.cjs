'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const admission = require('./delivery-admission.cjs');
const json = require('./delivery-json.cjs');
const name = 'Change admission';
function configuration(env) {
  if (env.CHANGE_ADMISSION_ENABLED !== 'true') return null;
  const app = admission.positive(env.CHANGE_ADMISSION_APP_ID);
  const installation = admission.positive(env.CHANGE_ADMISSION_INSTALLATION_ID);
  assert.ok(env.CHANGE_ADMISSION_APP_PRIVATE_KEY, 'missing environment-only App key');
  return {
    app,
    installation,
    privateKey: env.CHANGE_ADMISSION_APP_PRIVATE_KEY,
  };
}
function jwt(config, seconds = Math.floor(Date.now() / 1000)) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned =
    encode({ alg: 'RS256', typ: 'JWT' }) +
    '.' +
    encode({ iat: seconds - 60, exp: seconds + 300, iss: String(config.app) });
  return (
    unsigned +
    '.' +
    crypto.sign('RSA-SHA256', Buffer.from(unsigned), config.privateKey).toString('base64url')
  );
}
async function authenticate(config, repositoryId, request = fetch) {
  admission.positive(repositoryId);
  const authorization = jwt(config);
  async function call(route, method, token, body) {
    const response = await request('https://api.github.com' + route, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    // API error bodies are not logged: they must never expose credentials.
    assert.ok(response.ok, 'App API request failed: HTTP ' + response.status);
    return response.status === 204 ? null : response.json();
  }
  const app = await call('/app', 'GET', authorization);
  assert.equal(app.id, config.app, 'unexpected issuing App');
  const installation = await call(
    '/app/installations/' + config.installation,
    'GET',
    authorization
  );
  assert.equal(installation.account?.login, 'oborskyivitalii');
  assert.equal(installation.app_id, config.app);
  assert.equal(
    installation.repository_selection,
    'selected',
    'install only into selected repositories'
  );
  assert.equal(installation.permissions?.checks, 'write');
  assert.equal(installation.permissions?.statuses, 'write');
  for (const [permission, value] of Object.entries(installation.permissions)) {
    assert.ok(['checks', 'statuses', 'metadata'].includes(permission), 'unexpected App permission');
    if (permission === 'metadata') assert.equal(value, 'read');
  }
  const token = await call(
    '/app/installations/' + config.installation + '/access_tokens',
    'POST',
    authorization,
    {
      repository_ids: [repositoryId],
      permissions: { checks: 'write', statuses: 'write' },
    }
  );
  assert.equal(typeof token.token, 'string');
  assert.ok(token.token.length, 'empty installation token');
  try {
    const available = await call('/installation/repositories', 'GET', token.token);
    assert.equal(available.total_count, 1, 'issuer token is not repository-scoped');
    assert.equal(available.repositories.length, 1);
    assert.equal(available.repositories[0].id, repositoryId);
    assert.equal(available.repositories[0].full_name, admission.repository);
  } catch (error) {
    try {
      await call('/installation/token', 'DELETE', token.token);
    } catch {
      // Preserve the original failure if revocation is unreachable; never expose the token.
    }
    throw error;
  }
  const prefix = '/repos/' + admission.repository + '/check-runs';
  return {
    app: config.app,
    async create(body) {
      return call(prefix, 'POST', token.token, body);
    },
    async get(id) {
      return call(prefix + '/' + admission.positive(id), 'GET', token.token);
    },
    async update(id, body) {
      return call(prefix + '/' + admission.positive(id), 'PATCH', token.token, body);
    },
    async revoke() {
      await call('/installation/token', 'DELETE', token.token);
    },
  };
}
function binding(context, pr) {
  return [
    admission.positive(context.runId),
    admission.positive(process.env.GITHUB_RUN_ATTEMPT),
    admission.positive(pr),
  ].join('/');
}
async function publish(issuer, context, pr, source, snapshot, retain) {
  const external = binding(context, pr);
  const created = await issuer.create({
    name,
    head_sha: source,
    status: 'in_progress',
    external_id: external,
    details_url: 'https://github.com/' + admission.repository + '/actions/runs/' + context.runId,
    output: {
      title: 'Fresh full-route snapshot required',
      summary:
        'Preparation only. Current main requirements remain mandatory; lane activation is excluded.',
    },
  });
  admission.positive(created.id);
  assert.equal(created.app?.id, issuer.app, 'wrong check producer');
  let result;
  try {
    const first = await snapshot();
    result = first;
    if (first.state === 'eligible-snapshot') {
      const last = await snapshot();
      admission.sameSnapshot(first, last);
      result = last;
    }
    await retain(result);
    const check = await issuer.get(created.id);
    assert.equal(check.app?.id, issuer.app);
    assert.equal(check.name, name);
    assert.equal(check.head_sha, source);
    assert.equal(check.external_id, external);
    assert.equal(result.candidate.commit, source);
    assert.equal(result.controller.commit, context.sha);
    return await issuer.update(created.id, {
      status: 'completed',
      conclusion: result.state === 'eligible-snapshot' ? 'success' : 'failure',
      output: {
        title: result.state,
        summary:
          'Nonactivated full-route snapshot. Digest: ' +
          json.digest(json.canonical(result)) +
          '. Blocking obligations: ' +
          (result.blockers?.join(', ') || 'none in this observed snapshot') +
          '. Current three required checks remain in force. ' +
          result.freshness,
      },
    });
  } catch (error) {
    try {
      await retain({
        state: 'blocked',
        error: error.message,
        authority: { merge: false },
      });
    } catch {
      // Diagnostic storage failure must not prevent terminal failure publication.
    }
    await issuer.update(created.id, {
      status: 'completed',
      conclusion: 'failure',
      output: {
        title: 'Admission snapshot blocked',
        summary: error.message.slice(0, 2000),
      },
    });
    throw error;
  }
}

module.exports = { name, configuration, jwt, authenticate, publish };
