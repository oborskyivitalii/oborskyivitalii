'use strict';
// One first WebKit process per fresh runner; never warm or retry the cold case.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const artifact = require('./artifact.cjs'),
  cause = require('./cause-probe.cjs');
async function main(label, normalDir, controlDir, output) {
  const allowed = ['browser-gate-trace', ...require('./writing-variants.cjs').coldNativeLabels];
  assert.ok(allowed.includes(label));
  const candidate = process.env.SITE_CANDIDATE_SHA;
  fs.mkdirSync(output, { recursive: true });
  const inputs = Object.fromEntries(
    [
      ['color', normalDir],
      ['control', controlDir],
    ].map(([id, dir]) => {
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'artifact.json'))),
        publicDir = path.join(dir, 'public');
      artifact.verify(publicDir, manifest);
      return [id, { manifest, publicDir }];
    })
  );
  cause.validateInput(inputs.color.manifest, inputs.control.manifest, candidate, label);
  const record = {
    schema: 1,
    kind: 'cold-native-one-factor',
    label,
    replica: process.env.COLD_REPLICA,
    port: process.env.COLD_NATIVE_PORT || 'wpe',
    nativeProfile: process.env.COLD_NATIVE_PROFILE === 'true',
    fullGate: false,
    performanceAcceptance: false,
    protocol:
      'Exactly one first-process WebKit cold Index per fresh runner. Original foreground/baseline/1500ms next-paint bounds; 2200ms recovery remains separate. Only the declared private ablation changes normal Color. No prior browser launch, warmup or retry.',
    environment: require('./common.cjs').environment(),
    identities: Object.fromEntries(
      Object.entries(inputs).map(([id, v]) => [id, { ...v.manifest, files: undefined }])
    ),
    rows: [],
    errors: [],
    complete: false,
    pass: false,
  };
  const save = () =>
    fs.writeFileSync(path.join(output, 'cold-native.json'), JSON.stringify(record, null, 2) + '\n');
  save();
  const { server, url } = await require('./writing-probe.cjs').serve(inputs);
  try {
    await cause.webkitTrial(url, output, record, false, 1);
    record.complete = record.rows.length === 1 && record.rows[0].evidenceValid;
    record.pass = record.complete;
    save();
    assert.equal(record.complete, true);
  } catch (error) {
    record.errors.push({ message: error.message, stack: error.stack });
    save();
    throw error;
  } finally {
    server.close();
  }
}
if (require.main === module)
  main(process.argv[2], ...process.argv.slice(3).map((p) => path.resolve(p))).catch((error) => {
    console.error(error.stack);
    process.exitCode = 1;
  });
module.exports = { main };
