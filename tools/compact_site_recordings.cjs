"use strict";
// Review-only delivery encoding of actual Chromium captures; not generated motion.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto"),{execFileSync}=require("node:child_process");
const out=path.resolve(__dirname,"../review/site-v1-20261003-v10-captures");
function compact(source,target) {
  const temporary=target+".compact.webm";
  execFileSync(process.env.SITE_REVIEW_FFMPEG||"ffmpeg",["-hide_banner","-loglevel","error","-y","-i",source,"-vf","scale=960:600","-c:v","libvpx-vp9","-b:v","450k","-maxrate","450k","-bufsize","900k","-crf","32","-deadline","realtime","-cpu-used","6","-an",temporary],{stdio:"pipe"});
  fs.renameSync(temporary,target);
}
const delivery={dimensions:{width:960,height:600},method:"VP9 CRF 32, constrained 450 kbps encoding of actual 1440x900 Chromium recordings; screenshots retain original dimensions. No generated or interpolated frames."};
if(require.main===module) {
  const file=path.join(out,"captures.json"),manifest=JSON.parse(fs.readFileSync(file,"utf8"));
  if(JSON.stringify(manifest.recording_delivery)!==JSON.stringify(delivery)) {
    for(const name of Object.keys(manifest.files).filter(p=>p.endsWith(".webm"))) {
      const video=path.join(out,name);compact(video,video);
      manifest.files[name]=crypto.createHash("sha256").update(fs.readFileSync(video)).digest("hex");
    }
    manifest.recording_delivery=delivery;
    fs.writeFileSync(file,JSON.stringify(manifest,null,2)+"\n");
  }
  for(const [name,hash] of Object.entries(manifest.files).filter(([p])=>p.endsWith(".webm"))) {
    if(crypto.createHash("sha256").update(fs.readFileSync(path.join(out,name))).digest("hex")!==hash)throw Error(`Recording bytes changed: ${name}`);
  }
  process.stdout.write("Actual scroll recordings compacted for delivery at 960 × 600.\n");
}
module.exports={compact,delivery};
