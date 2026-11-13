const path = require('node:path');
const { loadArticle } = require('./article.cjs');
const { renderKit, verifyKit } = require('./kit.cjs');

async function main(args) {
  const [command, selected, ...flags] = args;
  const root = path.resolve(__dirname, '../..');
  if (command === 'validate' && selected && !flags.length) {
    const article = loadArticle(root, selected);
    process.stdout.write(
      JSON.stringify({
        articleId: article.metadata.id,
        edition: article.edition.id,
        source: article.source,
        sections: article.sections.length,
        figures: article.model.figures.length,
      }) + '\n'
    );
    return;
  }
  const [verifyFlag, expectedId] = flags;
  const verifyFlags =
    !flags.length ||
    (flags.length === 2 && verifyFlag === '--expected-id' && /^[a-f0-9]{64}$/.test(expectedId));
  if (command === 'verify' && selected && verifyFlags) {
    const directory = path.resolve(selected);
    const manifest = await verifyKit(directory, { expectedId });
    if (!expectedId && path.basename(directory) !== manifest.artifactId) {
      throw new Error('Renamed kits require --expected-id from the original render');
    }
    process.stdout.write(`Verified artifact ${manifest.artifactId}\n`);
    return;
  }
  if (command === 'render' && selected && flags.every((flag) => flag === '--pdf')) {
    const result = await renderKit(root, selected, { pdf: flags.includes('--pdf') });
    process.stdout.write(`${result.directory}\n`);
    return;
  }
  throw new Error(
    'Usage: cli.cjs validate <id> | render <id> [--pdf] | verify <artifact-directory> [--expected-id <sha256>]'
  );
}

main(process.argv.slice(2)).catch((error) => {
  process.stderr.write(`Article publishing: ${error.message}\n`);
  if (error.recoveryPaths) {
    process.stderr.write(`Recovery paths: ${JSON.stringify(error.recoveryPaths)}\n`);
  }
  process.exitCode = 1;
});
