'use strict';
const {performance}=require('node:perf_hooks');
// Node-side event observation only: no browser evaluation, retry or timing change.
function observe({page,context,browser,now=()=>performance.now()}){
  const started=now(),evidence={events:[],eventLimit:64,droppedEvents:0};
  let stage='setup',disposed=false;
  const bindings=[[page,'close','page-close'],[page,'crash','page-crash'],[context,'close','context-close'],[browser,'disconnected','browser-disconnected']].map(([target,event,kind])=>{
    const listener=()=>{
      if(evidence.events.length>=evidence.eventLimit){evidence.droppedEvents++;return;}
      evidence.events.push({kind,stage,elapsedMs:now()-started});
    };
    target.on(event,listener);return {target,event,listener};
  });
  return {
    stage(value){stage=value;},
    snapshot(){
      evidence.observation={stage,elapsedMs:now()-started,pageClosed:page.isClosed(),browserConnected:browser.isConnected()};
      return evidence;
    },
    dispose(){
      if(disposed)return;disposed=true;
      for(const {target,event,listener}of bindings)target.off(event,listener);
    }
  };
}
module.exports={observe};
