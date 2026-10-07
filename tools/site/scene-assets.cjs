'use strict';
// Compile this finite, authored SVG at generation time. The browser receives
// numeric drawing commands, never an XML parser, font loader or image decoder.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const glyphs=['y','=','f','(','x',')','→','y','∼','P','(','y','|','x',')'];
const attributes={svg:['xmlns','width','height','viewBox','role','aria-labelledby'],title:['id'],desc:['id'],defs:[],linearGradient:['id','x1','y1','x2','y2','gradientUnits'],stop:['offset','stop-color'],g:['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin'],path:['data-glyph','stroke-width','d']};
const children={svg:['title','desc','defs','g'],defs:['linearGradient'],linearGradient:['stop'],g:['path'],title:[],desc:[],stop:[],path:[]};
function parseAttributes(source,tag){
  const found={},pattern=/\s+([\w:-]+)="([^"]*)"/g;let end=0;
  for(const match of source.matchAll(pattern)){
    assert.ok(!source.slice(end,match.index).trim(),'malformed SVG attributes');end=match.index+match[0].length;
    assert.ok(attributes[tag].includes(match[1])&&!Object.hasOwn(found,match[1]),'unexpected SVG attribute '+match[1]);found[match[1]]=match[2];
  }
  assert.ok(!source.slice(end).trim(),'malformed SVG attributes');return found;
}
function commands(d,width,height,inset){
  const token=/[MLHVC]|[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?/g;
  assert.equal(d.replace(token,'').replace(/[\s,]/g,''),'','unsupported SVG path token');
  const tokens=d.match(token)||[],out=[];let index=0,current=[0,0];
  while(index<tokens.length){
    const kind=tokens[index++],count={M:2,L:2,H:1,V:1,C:6}[kind];assert.ok(count,'explicit SVG path command required');
    const values=tokens.slice(index,index+count).map(Number);index+=count;
    assert.ok(values.length===count&&values.every(Number.isFinite),'finite complete SVG path command');
    const points=kind==='H'?[values[0],current[1]]:kind==='V'?[current[0],values[0]]:values;
    assert.ok(points.every((value,i)=>value>=inset&&value<=(i%2?height:width)-inset),'clipped SVG control geometry');
    assert.ok(out.length||kind==='M','SVG path must begin with move');
    current=points.slice(-2);out.push([kind==='H'||kind==='V'?'L':kind,...points]);
    assert.ok(out.length<=64,'bounded SVG glyph commands');
  }
  assert.ok(out.length>1,'empty SVG glyph');return out;
}
function compile(source){
  assert.ok(Buffer.byteLength(source)<=8192&&!/[&]|<!|<\?/.test(source),'bounded inert SVG source');
  assert.ok(zlib.gzipSync(source).length<=3072,'compressed SVG byte budget');
  const nodes=[],stack=[];let end=0;
  for(const match of source.matchAll(/<(\/)?([\w:-]+)([^>]*?)(\/?)>/g)){
    const text=source.slice(end,match.index);assert.ok(!text.trim()||['title','desc'].includes(stack.at(-1)),'unexpected SVG text');end=match.index+match[0].length;
    const [,closing,tag,raw,selfClosing]=match;assert.ok(Object.hasOwn(attributes,tag),'unsupported SVG element '+tag);
    if(closing){assert.ok(!raw.trim()&&!selfClosing&&stack.pop()===tag,'malformed SVG nesting');continue;}
    assert.ok(stack.length?children[stack.at(-1)].includes(tag):tag==='svg'&&nodes.length===0,'unsupported SVG topology');
    nodes.push({tag,attributes:parseAttributes(raw,tag)});assert.ok(nodes.length<=40,'bounded SVG element count');if(!selfClosing)stack.push(tag);
  }
  assert.ok(!stack.length&&!source.slice(end).trim(),'incomplete SVG document');
  const select=tag=>nodes.filter(node=>node.tag===tag).map(node=>node.attributes),one=tag=>{const values=select(tag);assert.equal(values.length,1,'one SVG '+tag);return values[0];};
  const svg=one('svg'),width=Number(svg.width),height=Number(svg.height),group=one('g'),gradient=one('linearGradient');
  assert.deepEqual(svg,{xmlns:'http://www.w3.org/2000/svg',width:'1380',height:'240',viewBox:'0 0 1380 240',role:'img','aria-labelledby':'title description'},'approved formula metadata');
  assert.deepEqual(one('title'),{id:'title'});assert.deepEqual(one('desc'),{id:'description'});assert.deepEqual(one('defs'),{});
  assert.equal(gradient.id,'ribbon');assert.deepEqual(nodes.filter(node=>node.attributes.id).map(node=>node.attributes.id).sort(),['description','ribbon','title'],'unique local SVG identities');
  assert.ok(width===1380&&height===240&&width<=2048&&height<=512,'fixed bounded formula surface');
  assert.equal(svg.xmlns,'http://www.w3.org/2000/svg');assert.equal(svg.viewBox,`0 0 ${width} ${height}`);
  assert.ok(source.includes('<title id="title">y = f(x) → y ∼ P(y|x)</title>'),'approved formula expression');
  assert.equal(group.fill,'none');assert.equal(group.stroke,`url(#${gradient.id})`);assert.equal(group['stroke-linecap'],'round');assert.equal(group['stroke-linejoin'],'round');assert.equal(Number(group['stroke-width']),14);
  assert.equal(gradient.gradientUnits,'userSpaceOnUse');
  const line=[gradient.x1,gradient.y1,gradient.x2,gradient.y2].map(Number);assert.ok(line.every(Number.isFinite),'finite SVG gradient');
  assert.deepEqual(line,[50,0,1330,0]);
  const stops=select('stop').map(stop=>[Number(stop.offset),stop['stop-color']]);
  assert.deepEqual(stops,[[0,'#ff2535'],[.34,'#ff008e'],[.64,'#8500ff'],[1,'#0063ff']]);
  const paths=select('path');assert.deepEqual(paths.map(p=>p['data-glyph']),glyphs,'approved finite glyph sequence');
  const compiled=paths.map(p=>{const stroke=Number(p['stroke-width']||group['stroke-width']);assert.equal(stroke,['→','|'].includes(p['data-glyph'])?10:14,'approved stronger formula strokes');return {stroke,commands:commands(p.d,width,height,stroke/2)};});
  assert.ok(compiled.reduce((sum,glyph)=>sum+glyph.commands.length,0)<=80,'bounded total SVG command count');
  return {width,height,gradient:{line,stops},paths:compiled,svg:source};
}
function load(root){return compile(fs.readFileSync(path.join(root,'site/assets/writing-paradigm.svg'),'utf8'));}
function runtime(art){const {svg,...compiled}=art;return compiled;}
module.exports={compile,load,runtime};
