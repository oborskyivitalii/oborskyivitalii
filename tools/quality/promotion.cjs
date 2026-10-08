'use strict';
// Promotion reuses successful staging automation; it does not repeat that suite.
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const artifact = require('./artifact.cjs'),
  { sourceReport } = require('./validate.cjs');
function validate(manifest, gate, evidence) {
  assert.equal(gate.schema, 1);
  assert.equal(gate.kind, 'hosted-gate');
  assert.equal(gate.profile, 'staging');
  assert.equal(gate.pass, true);
  for (const key of ['sourceCommit', 'sourceTree', 'candidateCommit', 'artifactDigest'])
    assert.equal(gate[key], manifest[key], 'staging edition mismatch');
  require('./hosted-origin.cjs').target(gate.hostedOrigin, 'staging');
  for (const name of ['build', 'static', 'linux', 'native', 'performance', 'captures', 'host'])
    assert.equal(gate.jobs[name]?.result, 'success', 'full staging gate incomplete');
  if (process.env.SITE_ARTIFACT_ID)
    assert.equal(String(gate.githubArtifact?.id), process.env.SITE_ARTIFACT_ID);
  if (process.env.SITE_UPLOAD_DIGEST)
    assert.equal(gate.githubArtifact?.uploadDigest, process.env.SITE_UPLOAD_DIGEST);
  sourceReport(evidence, manifest);
  for (const key of ['independentReview', 'iosSafari', 'androidChrome'])
    assert.ok(
      evidence[key]?.pass === true && evidence[key].reviewer && evidence[key].record,
      'pending ' + key
    );
  for (const key of ['iosSafari', 'androidChrome'])
    assert.ok(
      evidence[key].device && evidence[key].os && evidence[key].browser,
      'missing device details'
    );
  return true;
}
if (require.main === module) {
  try {
    const [directory, gateFile, evidenceFile] = process.argv.slice(2),
      manifest = JSON.parse(fs.readFileSync(path.join(directory, 'artifact.json')));
    assert.equal(manifest.sourceDirty, false);
    assert.equal(manifest.sourceCommit, process.env.SITE_CANDIDATE_SHA);
    artifact.verify(path.join(directory, 'public'), manifest);
    validate(
      manifest,
      JSON.parse(fs.readFileSync(gateFile)),
      JSON.parse(fs.readFileSync(evidenceFile))
    );
    console.log('Exact staging evidence and independent/device acceptance verified.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { validate };
