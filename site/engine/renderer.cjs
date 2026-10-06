"use strict";
// Canvas command submission is separate from projection and lifecycle clocks.
module.exports=function() {
  function path(ctx,points) {
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
  }
  function drawLineRun(ctx,shapes,index,colors) {
    const first=shapes[index],alpha=first.alpha;
    ctx.beginPath();ctx.lineWidth=first.lineWidth;ctx.strokeStyle=colors[first.color];ctx.globalAlpha=alpha;
    let end=index;
    while(end<shapes.length){
      const shape=shapes[end];
      if(shape.kind!=="line"||shape.arrow||shape.color!==first.color||shape.lineWidth!==first.lineWidth||Math.abs(shape.alpha-alpha)>1/256)break;
      const [from,to]=shape.points;ctx.moveTo(from[0],from[1]);ctx.lineTo(to[0],to[1]);end++;
    }
    ctx.stroke();return end-1;
  }
  function paintShapes(ctx,shapes,colors,paintCustom=null) {
    for(let index=0;index<shapes.length;index++) {
      const shape=shapes[index];
      if(paintCustom?.(ctx,shape))continue;
      // Depth order is unchanged. Only adjacent compatible lines are batched.
      if(shape.kind==="line"&&!shape.arrow){index=drawLineRun(ctx,shapes,index,colors);continue;}
      const points=shape.points,from=points[0],to=points[1];
      path(ctx,points);
      if(shape.kind==="face") {
        ctx.closePath();ctx.fillStyle=shape.room.faceColors[shape.material];ctx.globalAlpha=shape.alpha;ctx.fill();
        if(shape.edgeAlpha===0){ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.65;ctx.stroke();}
        // Explicit silhouettes survive; faint internal mesh edges are omitted
        // on desktop as on mobile. Thousands of invisible strokes cost time.
        else if(shape.room.world.faces[shape.material].edgeAlpha>.12){ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];ctx.globalAlpha=shape.edgeAlpha;ctx.stroke();}
      } else {ctx.lineWidth=shape.lineWidth;ctx.strokeStyle=colors[shape.color];ctx.globalAlpha=shape.alpha;ctx.stroke();}
      if(shape.arrow) {
        const dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy);if(length<10)continue;
        const size=5,ux=dx/length,uy=dy/length;
        ctx.beginPath();ctx.moveTo(to[0]-ux*size-uy*size*.55,to[1]-uy*size+ux*size*.55);ctx.lineTo(...to);ctx.lineTo(to[0]-ux*size+uy*size*.55,to[1]-uy*size-ux*size*.55);ctx.stroke();
      }
    }
    ctx.globalAlpha=1;
  }
  return {paintShapes};
};
