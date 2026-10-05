'use strict';
// Source-derived inspection assets: the same finite meshes/projector as the site.
const fs=require('node:fs'),path=require('node:path');
const api=require('../../docs/space.js'),out=path.resolve(process.argv[2]||__dirname);
fs.mkdirSync(out,{recursive:true});
const world=api.worldFor('research'),symbols=['brain','line-chart','bar-chart','scatter-chart','attention','softmax','entropy'];
const escape=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const palette={cyan:'#76d5e5',amber:'#ffca73',paper:'#10202b'};
const blend=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
const cards=symbols.map(symbol=>{
  const o=world.objects.find(x=>x.symbol===symbol&&x.depth===0)||world.objects.find(x=>x.symbol===symbol);
  const point=p=>p.map((v,i)=>(v-o.center[i])/o.scale);
  const object={...o,center:[0,0,0],rootCenter:[0,0,0],root:0,phase:0,depth:0,scale:1,radius:o.radius/o.scale,firstFace:0,firstLine:0,points:o.points.map(point)};
  const model={objects:[object],faces:world.faces.slice(o.firstFace,o.firstFace+o.faceCount).map(f=>({...f,points:f.points.map(point)})),lines:world.lines.slice(o.firstLine,o.firstLine+o.lineCount).map(l=>({...l,a:point(l.a),b:point(l.b)}))};
  const width=1000,height=500,z=symbol==='attention'?14:10;
  const shapes=api.projectedWorld(model,{position:[0,0,z],target:[0,0,0]},width,height,0);
  const points=shapes.flatMap(s=>s.points),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;
  const scale=Math.min(530/w,220/h),dx=(620-w*scale)/2-left*scale,dy=(270-h*scale)/2-top*scale;
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 270" role="img" aria-label="'+escape(o.formula||symbol)+'"><g transform="translate('+dx+' '+dy+') scale('+scale+')">'+shapes.map(s=>{
    const pts=s.points.map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' '),color=palette[s.color];
    if(s.kind==='face')return '<polygon points="'+pts+'" fill="'+blend(palette.paper,color,model.faces[s.material].tint)+'" fill-opacity="'+s.alpha+'" stroke="'+color+'" stroke-opacity="'+s.edgeAlpha+'" stroke-width=".7"/>';
    return '<polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-opacity="'+s.alpha+'" stroke-width="'+s.lineWidth+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }).join('')+'</g></svg>';
  fs.writeFileSync(path.join(out,symbol+'.svg'),svg+'\n');
  return '<article class="'+(o.formula?'formula':'')+'"><h2>'+symbol.replace(/-/g,' ')+'</h2>'+svg+'<p>'+escape(o.formula||({brain:'Two hemispheres · cortical folds · cerebellum · stem','line-chart':'Raised series · contrasting trend · depth axis','bar-chart':'Solid columns · depth · varied heights','scatter-chart':'Two depth groups · guides · trend'}[symbol]))+'</p></article>';
});
fs.writeFileSync(path.join(out,'Primitive-Atlas.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Fractal primitive atlas</title><style>*{box-sizing:border-box}body{margin:0;background:#0a141e;color:#e7f1f4;font:16px system-ui,sans-serif;padding:36px;max-width:1400px;margin:auto}h1{font-size:36px;margin:0 0 10px}header p{color:#a7bbc6;max-width:780px;line-height:1.6}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px}article{background:#10202b;border:1px solid #28404c;border-radius:16px;padding:20px}h2{margin:0;text-transform:capitalize;font-size:19px}article p{font-size:14px;color:#b0c5cf;margin:0;line-height:1.5}svg{width:100%;height:auto;display:block}article:last-child{grid-column:1/-1;max-width:660px;justify-self:center;width:100%}@media(max-width:650px){body{padding:20px}main{grid-template-columns:1fr}h1{font-size:28px}}</style><header><h1>Shared fractal primitives</h1><p>Actual projected source geometry, enlarged for inspection. The site uses these same models in its finite recursive structure. Charts are decorative; they do not represent research measurements.</p></header><main>'+cards.join('')+'</main></html>\n');
console.log('Exported 7 source-derived SVG assets and Primitive-Atlas.html');
