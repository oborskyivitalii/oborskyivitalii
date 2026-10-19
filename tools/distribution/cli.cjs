'use strict';

const { loadCampaign } = require('./campaign.cjs');

function main(argv = process.argv.slice(2), root = process.cwd()) {
  const [command, articleId, ...extra] = argv;
  if (command !== 'validate' || !articleId || extra.length) {
    throw Error('Usage: node tools/distribution/cli.cjs validate ARTICLE_ID (draft only)');
  }
  const report = loadCampaign(root, articleId);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  return report;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { main };
