'use strict';
// Linux WebKit uses the desktop GTK port on a fresh, private virtual display.
// No browser launch, warmup, forced paint or WPE fallback occurs here.
const {spawn}=require('node:child_process');
function ready(child,timeoutMs){
  return new Promise((resolve,reject)=>{
    let output='',errors='',done=false;
    const finish=(error,name)=>{
      if(done)return;done=true;clearTimeout(timer);child.stdout.off('data',onData);
      child.off('error',onError);child.off('exit',onExit);
      if(error){child.kill();reject(error);}else resolve(name);
    };
    const onData=data=>{
      output+=String(data);
      if(output.length>128)return finish(Error('Invalid Xvfb display output'));
      if(!output.includes('\n'))return;
      if(!/^\d+\r?\n$/.test(output))return finish(Error('Invalid Xvfb display number'));
      finish(null,':'+output.trim());
    };
    const onError=error=>finish(error),onExit=code=>finish(Error('Xvfb exited before readiness: '+code+' '+errors));
    const timer=setTimeout(()=>finish(Error('Xvfb readiness exceeded '+timeoutMs+'ms')),timeoutMs);
    child.stdout.on('data',onData);child.stderr.on('data',data=>{errors=(errors+String(data)).slice(-512);});
    child.once('error',onError);child.once('exit',onExit);
  });
}
async function start(engine,{platform=process.platform,launch=spawn,timeoutMs=3000}={}){
  if(engine!=='webkit'||platform!=='linux')return null;
  const child=launch('Xvfb',['-displayfd','1','-screen','0','1440x900x24','-nolisten','tcp'],{stdio:['ignore','pipe','pipe']});
  const name=await ready(child,timeoutMs);
  return {name,backend:'Xvfb',port:'gtk',stop(){child.kill('SIGTERM');}};
}
module.exports={ready,start};
