'use strict';

const { loadCampaign } = require('./campaign.cjs');

async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const [command, selectedId, ...extra] = argv;
  let report;
  if (command === 'validate' && selectedId && !extra.length) {
    report = loadCampaign(root, selectedId);
  } else if (command === 'validate-event' && selectedId && !extra.length) {
    report = require('./event.cjs').loadEvent(root, selectedId);
  } else if (command === 'build-event' && selectedId && extra.length >= 1 && extra.length <= 2) {
    report = await require('./kit.cjs').buildEvent(root, selectedId, extra[0], extra[1]);
  } else {
    throw Error(
      'Usage: validate ARTICLE_ID | validate-event EVENT_ID | build-event EVENT_ID OUTPUT [PIECE_ID] (draft only)'
    );
  }
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main };
