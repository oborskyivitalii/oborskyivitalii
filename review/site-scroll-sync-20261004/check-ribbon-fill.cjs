'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {toolRequire,launchOptions}=require('../../tools/quality/common.cjs'),ribbons=require('./RIBBONS-PROTOTYPE.cjs');
const file=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);
assert.ok(fs.readFileSync(file,'utf8').includes('const paintRibbon='+ribbons.paintRibbon.toString()+';'),'pixel fixture is bound to the actual exported painter');
(async()=>{
  const browser=await toolRequire('playwright').chromium.launch(launchOptions('chromium')),rows=[];fs.mkdirSync(out,{recursive:true});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:900},offline:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(file).href);await page.waitForFunction(()=>document.querySelector('.space-scene').dataset.ready==='true');
    const pixel=await page.evaluate(({painter})=>{
      const paint=eval('('+painter+')'),c=document.createElement('canvas');c.width=120;c.height=120;const ctx=c.getContext('2d');
      const fixtures=[...[[[10,10],[90,15],[85,95],[20,90]],[[10,10],[90,65],[85,95],[20,30]],[[25,5],[95,25],[65,105],[5,75]],[[10,60],[110,60],[60,10],[60,110]]].map(corners=>({corners})),
        {corners:[[20,10],[90,15],[85,95],[20,90]],curves:[[5,50],[110,55]]}];let samples=0,holes=0,white=0;
      for(const {corners,curves}of fixtures){
        ctx.clearRect(0,0,120,120);const points=corners.map((p,i)=>[...p,i===0||i===3?0:1,i<2?10:0,25,65,230]);paint(ctx,{points,curves});
        const mask=document.createElement('canvas');mask.width=120;mask.height=120;const m=mask.getContext('2d');m.beginPath();m.moveTo(...corners[0]);
        if(curves){m.lineTo(...corners[1]);m.quadraticCurveTo(...curves[1],...corners[2]);m.lineTo(...corners[3]);m.quadraticCurveTo(...curves[0],...corners[0]);}
        else for(const p of corners.slice(1))m.lineTo(...p);m.closePath();m.fill();
        const pixels=ctx.getImageData(0,0,120,120).data,inside=m.getImageData(0,0,120,120).data;
        for(let y=2;y<118;y++)for(let x=2;x<118;x++){
          // Test interiors, away from intentional silhouette antialiasing.
          let core=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inside[((y+dy)*120+x+dx)*4+3]!==255)core=false;if(!core)continue;
          const i=(y*120+x)*4;samples++;if(pixels[i+3]!==255)holes++;if(Math.min(pixels[i],pixels[i+1],pixels[i+2])>200)white++;
        }
      }
      return {samples,holes,white};
    },{painter:ribbons.paintRibbon.toString()});
    assert.ok(pixel.samples>6000);assert.equal(pixel.holes,0,'every twisted facet interior is opaque');assert.equal(pixel.white,0,'no white strip in a saturated blue material');
    for(const theme of ['light','dark'])for(const route of ['index','research','writing','talks','credits']){
      await page.evaluate(theme=>{localStorage.setItem('vo.theme',theme);},theme);await page.goto(pathToFileURL(file).href+'?view='+route);await page.waitForFunction(r=>document.body.dataset.page===r&&document.querySelector('.space-scene').dataset.ready==='true',route);
      await page.locator('#space-motion').evaluate(el=>el.click());await page.waitForTimeout(80);
      const data=await page.locator('.space-scene').evaluate(el=>({material:el.dataset.ribbonMaterial,faces:Number(el.dataset.ribbonFaces),phase:Number(el.dataset.phase)}));assert.equal(data.material,'opaque-rgb');assert.ok(data.faces>0);
      const screenshot=path.join(out,route+'-'+theme+'.png');await page.screenshot({path:screenshot});rows.push({route,theme,...data,screenshot});
    }
    assert.deepEqual(errors,[]);await context.close();fs.writeFileSync(path.join(out,'ribbon-fill.json'),JSON.stringify({source:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),browser:browser.version(),pixel,rows,errors},null,2));console.log(JSON.stringify({pixel,views:rows.length,errors}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
