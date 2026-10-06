'use strict';
// Actual Canvas bitmap regression for the optional autonomous ribbon material.
// Run with an explicit output directory; does not change production artifacts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('../../tools/quality/toolchain/node_modules/playwright');
const math=require('../../site/engine/math.cjs'),source=require('./RIBBONS-PROTOTYPE.cjs');
async function check(page){
  return page.evaluate(strings=>{
    const api=eval('('+strings.math+')')(),section=eval('('+strings.ribbonGeometry+')')(api),signals=eval('('+strings.ribbonSignals+')')();
    const create=eval('('+strings.createRibbonMaterials+')'),paint=eval('('+strings.paintRibbon+')'),transform=eval('('+strings.textureTriangle+')');
    const material=create(api,section,signals),plain=create(api,section,{packets:()=>[]});
    const canvas=document.createElement('canvas');canvas.width=300;canvas.height=640;document.body.style.margin='0';document.body.append(canvas);const ctx=canvas.getContext('2d');
    const vertices=i=>[[40+10*Math.sin(i*.8),i*80+7*Math.sin(i),0,i*48],[260+13*Math.sin(i*.7),i*80+7*Math.sin(i+.4),48,i*48]];
    function render(m,curved=false,background='#142027'){
      ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=background;ctx.fillRect(0,0,300,640);
      if(curved)for(let i=0;i<8;i++){const a=vertices(i),b=vertices(i+1);paint(ctx,{texture:m.texture,points:[a[0],a[1],b[1],b[0]]},transform);}
      else paint(ctx,{texture:m.texture,points:[[40,0,0,0],[260,0,48,0],[260,640,48,384],[40,640,0,384]]},transform);
      return ctx.getImageData(0,0,300,640).data.slice();
    }
    const camera=start=>p=>[p[0],p[1],start+24-p[2]];
    const seams=[];const colors=render(plain(0,true,0,-72,7317,camera(0)),true);
    const pixel=(data,x,y)=>{const i=(Math.round(y)*300+Math.round(x))*4;return [...data.slice(i,i+3)];};
    for(let i=1;i<8;i++)for(const u of [.2,.5,.8]){
      const [a,b]=vertices(i),x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u;
      const before=pixel(colors,x,y-2),on=pixel(colors,x,y),after=pixel(colors,x,y+2);
      seams.push({i,u,before,on,after,jump:Math.max(...before.map((v,j)=>Math.abs(v-after[j]))),ridge:Math.max(...on.map((v,j)=>Math.abs(v-(before[j]+after[j])/2)))});
    }
    const opacity=[];
    for(const dark of [false,true])for(let k=0;k<3;k++){
      const m=plain(k,dark,0,-72,7317,camera(0)),pixels=m.texture.getContext('2d').getImageData(0,0,48,384).data;
      let translucentTexels=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]!==255)translucentTexels++;
      const a=render(m,true,'#00ff44'),b=render(m,true,'#ff00cc');let samples=0,changed=0,maxDifference=0;
      for(let i=1;i<8;i++)for(const u of [.1,.25,.5,.75,.9])for(const dy of [-2,0,2]){
        const [p,q]=vertices(i),x=p[0]+(q[0]-p[0])*u,y=p[1]+(q[1]-p[1])*u+dy;
        const first=pixel(a,x,y),second=pixel(b,x,y),difference=Math.max(...first.map((v,c)=>Math.abs(v-second[c])));
        samples++;if(difference)changed++;maxDifference=Math.max(maxDifference,difference);
      }
      opacity.push({dark,k,translucentTexels,samples,changed,maxDifference});
    }
    const runs=[];
    for(const direction of [-1,1]){
      let chosen;
      for(let k=0;k<3&&!chosen;k++)for(let cell=-12;cell<2;cell++)if(signals.schedule(k,cell).direction===direction){chosen={k,cell,event:signals.schedule(k,cell)};break;}
      const {k,cell,event}=chosen,start=(cell+1)*72,end=cell*72;
      const isolated=create(api,section,{packets:(...args)=>signals.packets(...args).filter(p=>p.cell===cell&&p.slot===0)});
      const positions=[];
      for(const fraction of [.4,.6]){
        const time=(event.start+event.duration*fraction)*1000,m=isolated(k,true,start,end,time,camera(start));
        const packet=m.packets.find(p=>p.cell===cell),actual=render(m),baseline=render(plain(k,true,start,end,time,camera(start)));
        let peak=-1,energy=0;
        for(let y=1;y<639;y++){
          let row=0;for(let x=120;x<180;x++)for(let c=0;c<3;c++)row+=Math.max(0,actual[(y*300+x)*4+c]-baseline[(y*300+x)*4+c]);
          if(row>energy){energy=row;peak=y;}
        }
        const across=[];
        for(const u of [.025,.1,.25,.5,.75,.9,.975]){
          const x=Math.round(40+220*u);let energy=0;
          for(let y=Math.max(0,peak-4);y<=Math.min(639,peak+4);y++)for(let c=0;c<3;c++)energy+=Math.max(0,actual[(y*300+x)*4+c]-baseline[(y*300+x)*4+c]);
          across.push({u,energy});
        }
        positions.push({fraction,peak,expected:(start-packet.z)/72*640,energy,across});
      }
      runs.push({direction,k,cell,positions});
    }
    const first=render(material(0,true,0,-72,2317,camera(0)),true),closed=render(material(0,true,0,-72,2317+24000*100,camera(0)),true);
    let changed=0;for(let i=0;i<first.length;i++)if(first[i]!==closed[i])changed++;
    const result={seams,opacity,runs,closedPixelDifferences:changed};window.__ribbonBitmap=result;return result;
  },Object.fromEntries(['ribbonGeometry','ribbonSignals','createRibbonMaterials','paintRibbon','textureTriangle'].map(key=>[key,source[key].toString()]).concat([['math',math.toString()]])));
}
async function main(directory){
  assert.ok(directory,'provide an explicit output directory');fs.mkdirSync(directory,{recursive:true});
  const browser=await chromium.launch({headless:true,executablePath:process.env.SITE_BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const page=await browser.newPage({viewport:{width:300,height:640}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    const result=await check(page);await page.screenshot({path:path.join(directory,'material-closeup.png')});
    fs.writeFileSync(path.join(directory,'material-bitmap.json'),JSON.stringify({browser:browser.version(),...result},null,2));
    assert.deepEqual(errors,[]);assert.equal(result.closedPixelDifferences,0);
    assert.ok(result.seams.every(s=>s.jump<=20&&s.ridge<=12),'continuous color and no facet grid at actual bitmap joins');
    assert.ok(result.opacity.every(p=>p.translucentTexels===0&&p.changed===0),'ribbon interiors and joins fully conceal changing background pixels');
    for(const run of result.runs){
      assert.ok(run.positions.every(p=>p.energy>100&&Math.abs(p.peak-p.expected)<28),'actual isolated light follows its material-space head');
      assert.ok(run.positions.every(p=>p.across.every(a=>a.energy>100)&&Math.min(...p.across.map(a=>a.energy))/Math.max(...p.across.map(a=>a.energy))>.65),'actual signal covers the ribbon width including both edges');
      assert.equal(Math.sign(run.positions[1].peak-run.positions[0].peak),-run.direction,'actual bitmap motion in each direction');
    }
    console.log(JSON.stringify({browser:browser.version(),seamSamples:result.seams.length,maxJump:Math.max(...result.seams.map(s=>s.jump)),maxRidge:Math.max(...result.seams.map(s=>s.ridge)),opacity:result.opacity,signals:result.runs,closedPixelDifferences:result.closedPixelDifferences}));
  }finally{await browser.close();}
}
if(require.main===module)main(process.argv[2]).catch(e=>{console.error(e.stack);process.exitCode=1;});
module.exports={check};
