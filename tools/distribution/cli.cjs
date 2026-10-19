'use strict';

const { loadCampaign } = require('./campaign.cjs');

function articleArguments(args) {
  const positional = [];
  const options = {};
  for (let index = 0; index < args.length; index++) {
    const key = { '--publisher-root': 'publisherRoot', '--publisher-sha': 'publisherSha' }[
      args[index]
    ];
    if (key) {
      if (Object.hasOwn(options, key) || !args[index + 1] || args[index + 1].startsWith('--')) {
        throw Error('Missing or repeated publisher option');
      }
      options[key] = args[++index];
    } else if (args[index].startsWith('--')) throw Error('Unknown article option');
    else positional.push(args[index]);
  }
  if (Boolean(options.publisherRoot) !== Boolean(options.publisherSha)) {
    throw Error('Select both publisher root and exact SHA');
  }
  return { positional, options };
}

async function main(argv = process.argv.slice(2), root = process.cwd()) {
  const [command, selectedId, ...extra] = argv;
  let report;
  if (command === 'validate' && selectedId && !extra.length) {
    report = loadCampaign(root, selectedId);
  } else if (command === 'validate-event' && selectedId && !extra.length) {
    report = require('./event.cjs').loadEvent(root, selectedId);
  } else if (command === 'build-event' && selectedId && extra.length >= 1 && extra.length <= 2) {
    report = await require('./kit.cjs').buildEvent(root, selectedId, extra[0], extra[1]);
  } else if (['validate-article', 'build-article'].includes(command) && selectedId) {
    const { positional, options } = articleArguments(extra);
    const kit = require('./article-kit.cjs');
    if (command === 'validate-article' && !positional.length) {
      report = kit.inspectArticle(root, selectedId, options);
    } else if (command === 'build-article' && positional.length >= 1 && positional.length <= 2) {
      report = await kit.buildArticle(root, selectedId, positional[0], positional[1], options);
    } else throw Error('Invalid article preparation arguments');
  } else {
    throw Error(
      'Usage: validate ARTICLE_ID | validate-event EVENT_ID | build-event EVENT_ID OUTPUT [PIECE_ID] | validate-article ARTICLE_ID | build-article ARTICLE_ID OUTPUT [PIECE_ID] [--publisher-root ROOT --publisher-sha SHA] (draft only)'
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
