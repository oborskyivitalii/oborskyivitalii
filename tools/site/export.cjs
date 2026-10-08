'use strict';
// User comparison copies; the maintained public/export producers remain owners.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {decorateColor}=require('./effects.cjs');
function standalone(html){
  const notice=/<aside\b[^>]*aria-label="Review copy"[^>]*>[\s\S]*?<\/aside>/g;
  assert.equal([...html.matchAll(notice)].length,1);html=html.replace(notice,'');
  const data=/(<script type="application\/json" id="site-pages">)([\s\S]*?)(<\/script>)/,match=html.match(data),payload=JSON.parse(match[2]);
  assert.deepEqual(Object.keys(payload.pages),['index','research','writing','talks','credits']);
  const links=text=>Object.entries(payload.files).reduce((text,[route,file])=>text.replaceAll('href="'+file,'href="?view='+route),text);
  for(const route of Object.keys(payload.pages))payload.pages[route]=links(payload.pages[route]);
  html=html.replace(data,()=>match[1]+JSON.stringify(payload).replace(/</g,'\\u003c')+match[3]);
  return links(html);
}
function exportVariants(directory, {variant = 'both'} = {}) {
  assert.ok(['base', 'color', 'both'].includes(variant), 'explicit base/color variant');
  directory = path.resolve(directory);
  fs.mkdirSync(directory, {recursive: true});
  const root = path.resolve(__dirname, '../..');
  const preview = path.join(root, 'review/site-v1-20261004-v11-interactive.html');
  const html = standalone(fs.readFileSync(preview, 'utf8'));
  const editions = [];
  if (variant !== 'color') editions.push(['Vitalii-Oborskyi-Final.html', html]);
  if (variant !== 'base') editions.push(['Vitalii-Oborskyi-Color-Prototype.html', decorateColor(html)]);
  const crypto = require('node:crypto');
  for (const [file, source] of editions) {
    fs.writeFileSync(path.join(directory, file), source);
    const identity = require('./variants.cjs').identity(source);
    const manifest = {
      schema: 1,
      variant: identity,
      sha256: crypto.createHash('sha256').update(source).digest('hex'),
      bytes: Buffer.byteLength(source),
      scope: 'offline comparison; hosted selection is declared separately'
    };
    fs.writeFileSync(path.join(directory, file + '.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return editions.map(([file]) => file);
}
if(require.main===module){console.log(exportVariants(process.argv[2],{variant:process.argv[3]||'both'}).join('\n'));}
module.exports={standalone,exportVariants};
