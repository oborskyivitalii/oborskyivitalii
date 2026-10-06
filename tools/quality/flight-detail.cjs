'use strict';
const assert=require('node:assert/strict');
// Observe the existing paint state; never add a second animation scheduler.
async function begin(page){
  await page.evaluate(()=>{
    const scene=document.querySelector('.space-scene'),rows=[];
    const observer=new MutationObserver(()=>{
      if(scene.dataset.route!=='writing')return;
      const {geometry,detail,travel,rooms,roomModels}=scene.dataset;
      rows.push({geometry,detail:Number(detail),travel,rooms:Number(rooms),models:Number(roomModels),narrow:matchMedia('(max-width: 640px)').matches});
    });
    observer.observe(scene,{attributes:true,attributeFilter:['data-phase']});
    window.__previewFlightDetail={rows,observer};
  });
}
function validate(rows){
  assert.ok(rows.some(row=>row.travel==='flying'),'Writing travelling paints observed');
  assert.ok(rows.some(row=>row.travel==='settled'),'Writing arrival paints observed');
  for(const row of rows){
    assert.ok(Number.isFinite(row.detail),'finite detail tier');
    assert.equal(row.geometry,row.narrow||row.detail>=.5?'compact':'full','flight keeps normal viewport/adaptive detail');
    assert.ok(row.rooms>0&&row.rooms<=3&&row.models>=row.rooms&&row.models<=6,'bounded model cache');
  }
  return rows;
}
async function finish(page){
  // Include the old 250ms post-arrival refinement boundary in this tiny smoke.
  await page.waitForTimeout(400);
  const rows=await page.evaluate(()=>{
    const {rows,observer}=window.__previewFlightDetail;observer.disconnect();delete window.__previewFlightDetail;return rows;
  });
  return validate(rows);
}
module.exports={begin,finish,validate};
