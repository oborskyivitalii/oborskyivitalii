"use strict";
// Historical proposal integrity only. Reproduce using this file at commit
// 585aa52b12d7b8ab11ea90c105281f2e109a510e; current export owner is tools/build_site_previews.cjs.
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
if(process.argv.length!==3||process.argv[2]!=='--check')throw Error('Archived proposal: use --check for stored-output integrity, or tools/build_site_previews.cjs for current pages.');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'review/site-visual-proposal-20261002.json'),'utf8'));
const expected={...manifest.files,[manifest.illustrative_board.path]:manifest.illustrative_board.sha256,[manifest.illustrative_board.prompt]:manifest.illustrative_board.prompt_sha256};
for(const [file,hash] of Object.entries(expected)){const actual=createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');if(actual!==hash)throw Error('Changed historical output: '+file);}
process.stdout.write('Historical proposal output hashes match; not current-source freshness.\n');
