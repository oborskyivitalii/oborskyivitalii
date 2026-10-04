'use strict';
// Advisory proposal under #13. Never skips/reuses a mandatory job.
const keys=['producer','engine','scenes','assets','templates','analytics','routes'];
function propose(before,after) {
  const valid=value=>value?.contract===1&&Object.keys(value).length===keys.length+1&&keys.every(key=>/^[a-f0-9]{64}$/.test(value[key]));
  const unchanged=valid(before)&&valid(after)&&keys.every(key=>before[key]===after[key]);
  return {schema:1,scope:unchanged?'content-only':'full',mandatoryJobs:'all current jobs remain required',evidenceReuse:false,adoption:'proposal pending reviewed #13 policy'};
}
module.exports={propose};
