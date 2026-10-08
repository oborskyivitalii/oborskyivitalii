"use strict";
// Canvas command submission is separate from projection and lifecycle clocks.
module.exports=function(artwork=null,createSurface=null) {
  // Exactly one immutable bitmap serves every Writing room/detail model. Its
  // intrinsic size never follows viewport/DPR, and no resource owns a clock.
  let formulaSurface=null,formulaAttempted=false,formulaBuilds=0,formulaPaints=0,formulaFailures=0,formulaVisible=0,formulaLastPaints=0,formulaSubmissions=0,formulaLastSubmissions=0,formulaProjection=null;
  function formulaBitmap() {
    if(formulaAttempted)return formulaSurface;
    formulaAttempted=true;formulaBuilds++;
    try{
      if(!artwork||artwork.width!==1380||artwork.height!==240)throw Error('bounded formula artwork unavailable');
      const surface=createSurface?createSurface():document.createElement('canvas');
      surface.width=artwork.width;surface.height=artwork.height;
      const target=surface.getContext('2d');if(!target)throw Error('formula cache unavailable');
      const gradient=target.createLinearGradient(...artwork.gradient.line);
      for(const [offset,color]of artwork.gradient.stops)gradient.addColorStop(offset,color);
      target.strokeStyle=gradient;target.lineCap='round';target.lineJoin='round';
      for(const glyph of artwork.paths){
        target.beginPath();target.lineWidth=glyph.stroke;
        for(const [kind,...values]of glyph.commands){
          if(kind==='M')target.moveTo(...values);
          else if(kind==='L')target.lineTo(...values);
          else if(kind==='C')target.bezierCurveTo(...values);
          else throw Error('unsupported compiled formula command');
        }
        target.stroke();
      }
      formulaSurface=surface;
    }catch{formulaFailures++;formulaSurface=null;}
    return formulaSurface;
  }
  function paintFormula(ctx,shape) {
    formulaVisible++;formulaProjection=shape.projection||null;
    const surface=formulaBitmap();if(!surface)return;
    let saved=false;
    try{
      ctx.save();saved=true;ctx.globalAlpha=shape.alpha;ctx.globalCompositeOperation='source-over';
      // Warped glyphs are minified; request the native high-quality sampling
      // path rather than the default bilinear texture sampling.
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      // A fixed four-strip mesh follows the projected world plane. Three
      // z-slices give the actual tilted glyphs thickness, using the same single
      // cache. This is one landmark with at most 24 native submissions, not
      // viewport-sized caches, per-glyph geometry or another animation clock.
      for(let layer=0;layer<shape.cameraLayers.length;layer++){
        // Shared world haze is sufficient. Extra translucent rear copies created
        // a pale halo around every stroke instead of a definite solid edge.
        ctx.globalAlpha=shape.alpha;
        const corners=shape.cameraLayers[layer];
        const at=(u,v)=>{
          const top=corners[0].map((value,i)=>value+(corners[1][i]-value)*u),bottom=corners[3].map((value,i)=>value+(corners[2][i]-value)*u),p=top.map((value,i)=>value+(bottom[i]-value)*v);
          return [shape.origin[0]+p[0]*shape.focal/p[2],shape.origin[1]-p[1]*shape.focal/p[2]];
        };
        for(let strip=0;strip<4;strip++){
          const u=strip/4,U=(strip+1)/4,source=[[u*surface.width,0],[U*surface.width,0],[U*surface.width,surface.height],[u*surface.width,surface.height]],points=[at(u,0),at(U,0),at(U,1),at(u,1)];
          for(const triangle of [[0,1,2],[0,2,3]])paintFormulaTriangle(ctx,surface,triangle.map(i=>source[i]),triangle.map(i=>points[i]));
        }
      }
      formulaPaints++;formulaLastPaints++;
    }catch{formulaFailures++;formulaSurface=null;}
    finally{if(saved)ctx.restore();}
  }
  function paintFormulaTriangle(ctx,surface,source,points) {
    const [p,q,r]=source,[P,Q,R]=points,dx=q[0]-p[0],dy=q[1]-p[1],ex=r[0]-p[0],ey=r[1]-p[1],den=dx*ey-dy*ex;
    const a=((Q[0]-P[0])*ey-(R[0]-P[0])*dy)/den,c=((R[0]-P[0])*dx-(Q[0]-P[0])*ex)/den;
    const b=((Q[1]-P[1])*ey-(R[1]-P[1])*dy)/den,d=((R[1]-P[1])*dx-(Q[1]-P[1])*ex)/den;
    // Bound native resampling to this strip while keeping a two-CSS-pixel
    // neighbourhood in source x. The inverse affine x row is [d,-c]/det;
    // singular or extremely minified transforms safely use the whole bitmap.
    const determinant=Math.abs(a*d-b*c),guard=determinant>1e-12?Math.min(surface.width,Math.ceil(2*Math.hypot(c,d)/determinant)):surface.width;
    const left=Math.max(0,Math.min(p[0],q[0],r[0])-guard),right=Math.min(surface.width,Math.max(p[0],q[0],r[0])+guard);
    ctx.save();
    try{
      path(ctx,points);ctx.closePath();ctx.clip();
      ctx.transform(a,b,c,d,P[0]-a*p[0]-c*p[1],P[1]-b*p[0]-d*p[1]);
      ctx.drawImage(surface,left,0,right-left,surface.height,left,0,right-left,surface.height);formulaSubmissions++;formulaLastSubmissions++;
    }finally{ctx.restore();}
  }
  function formulaDiagnostics() {
    const width=formulaSurface?.width||0,height=formulaSurface?.height||0;
    return {status:formulaSurface?'ready':formulaAttempted?'failed':'unused',cacheBuilds:formulaBuilds,width,height,bytes:width*height*4,paintCount:formulaPaints,failures:formulaFailures,visibleCount:formulaVisible,lastPaintCount:formulaLastPaints,drawSubmissions:formulaSubmissions,lastDrawSubmissions:formulaLastSubmissions,projection:formulaProjection,attempts:formulaBuilds,builds:formulaSurface?formulaBuilds:0,failed:formulaFailures>0,draws:formulaPaints,visible:formulaVisible>0};
  }
  function facePalette(faces,colors,cache) {
    const rgb=Object.fromEntries(Object.entries(colors).map(([key,hex])=>[key,hex.slice(1).match(/.{2}/g).map(value=>parseInt(value,16))]));
    const paper=rgb.paper;
    return faces.map(face=>{
      const ink=rgb[face.fillColor||face.color],tint=face.tint;
      const red=Math.round(paper[0]+(ink[0]-paper[0])*tint);
      const green=Math.round(paper[1]+(ink[1]-paper[1])*tint);
      const blue=Math.round(paper[2]+(ink[2]-paper[2])*tint);
      // Lighting tints vary continuously; the actual six-digit RGB result has
      // far fewer values. Cache that exact result without quantizing geometry,
      // tint arithmetic or the colors submitted to Canvas.
      const key=red*65536+green*256+blue;
      if(!cache.has(key)){
        cache.set(key,"#"+key.toString(16).padStart(6,"0"));
        if(cache.size>16384)cache.delete(cache.keys().next().value);
      }
      return cache.get(key);
    });
  }
  function path(ctx,points) {
    ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
    for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
  }
  // Literal native/shadow slots preserve the exact setter stream. A controlled
  // comparison must establish benefit; this does not omit more paint work.
  function setFillStyle(ctx, state, value) {
    if (state.fillStyle === value) {
      return;
    }
    ctx.fillStyle = value;
    state.fillStyle = value;
  }
  function setStrokeStyle(ctx, state, value) {
    if (state.strokeStyle === value) {
      return;
    }
    ctx.strokeStyle = value;
    state.strokeStyle = value;
  }
  function setLineWidth(ctx, state, value) {
    if (state.lineWidth === value) {
      return;
    }
    ctx.lineWidth = value;
    state.lineWidth = value;
  }
  function setGlobalAlpha(ctx, state, value) {
    if (state.globalAlpha === value) {
      return;
    }
    ctx.globalAlpha = value;
    state.globalAlpha = value;
  }
  function invalidatePaintState(state) {
    state.globalAlpha = undefined;
    state.lineWidth = undefined;
    state.strokeStyle = undefined;
    state.fillStyle = undefined;
  }
  function drawLineRun(ctx, shapes, index, colors, state) {
    const first = shapes[index];
    const alpha = first.alpha;
    ctx.beginPath();
    setLineWidth(ctx, state, first.lineWidth);
    setStrokeStyle(ctx, state, colors[first.color]);
    setGlobalAlpha(ctx, state, alpha);
    let end = index;
    while (end < shapes.length) {
      const shape = shapes[end];
      if (shape.kind !== "line" || shape.arrow || shape.color !== first.color ||
          shape.lineWidth !== first.lineWidth || Math.abs(shape.alpha - alpha) > 1 / 256) {
        break;
      }
      const [from, to] = shape.points;
      ctx.moveTo(from[0], from[1]);
      ctx.lineTo(to[0], to[1]);
      end++;
    }
    ctx.stroke();
    return end - 1;
  }
  function paintShapes(ctx, shapes, colors, paintCustom = null) {
    formulaVisible = 0;
    formulaLastPaints = 0;
    formulaLastSubmissions = 0;
    formulaProjection = null;
    // Every paint starts unknown: resize or external drawing may reset native
    // state. A declining custom painter must leave the context untouched.
    const state = {};
    for (let index = 0; index < shapes.length; index++) {
      const shape = shapes[index];
      if (paintCustom?.(ctx, shape)) {
        invalidatePaintState(state);
        continue;
      }
      if (shape.kind === 'formula') {
        paintFormula(ctx, shape);
        invalidatePaintState(state);
        continue;
      }
      // Depth order is unchanged. Only adjacent compatible lines are batched.
      if (shape.kind === "line" && !shape.arrow) {
        index = drawLineRun(ctx, shapes, index, colors, state);
        continue;
      }
      const points = shape.points;
      const from = points[0];
      const to = points[1];
      path(ctx, points);
      if (shape.kind === "face") {
        const fill = shape.room.faceColors[shape.material];
        ctx.closePath();
        setFillStyle(ctx, state, fill);
        setGlobalAlpha(ctx, state, shape.alpha);
        ctx.fill();
        if (shape.edgeAlpha === 0) {
          setStrokeStyle(ctx, state, fill);
          setLineWidth(ctx, state, .65);
          ctx.stroke();
        }
        // Explicit silhouettes survive; faint internal mesh edges are omitted
        // on desktop as on mobile. Thousands of invisible strokes cost time.
        else if (shape.room.world.faces[shape.material].edgeAlpha > .12) {
          setLineWidth(ctx, state, shape.lineWidth);
          setStrokeStyle(ctx, state, colors[shape.color]);
          setGlobalAlpha(ctx, state, shape.edgeAlpha);
          ctx.stroke();
        }
      } else {
        setLineWidth(ctx, state, shape.lineWidth);
        setStrokeStyle(ctx, state, colors[shape.color]);
        setGlobalAlpha(ctx, state, shape.alpha);
        ctx.stroke();
      }
      if (shape.arrow) {
        const dx = to[0] - from[0];
        const dy = to[1] - from[1];
        const length = Math.hypot(dx, dy);
        if (length < 10) {
          continue;
        }
        const size = 5;
        const ux = dx / length;
        const uy = dy / length;
        ctx.beginPath();
        ctx.moveTo(to[0] - ux * size - uy * size * .55, to[1] - uy * size + ux * size * .55);
        ctx.lineTo(...to);
        ctx.lineTo(to[0] - ux * size + uy * size * .55, to[1] - uy * size - ux * size * .55);
        ctx.stroke();
      }
    }
    setGlobalAlpha(ctx, state, 1);
  }
  return {paintShapes,facePalette,formulaDiagnostics,prepareFormula:formulaBitmap,formulaReady:()=>!!formulaSurface,formulaDrawn:()=>formulaLastPaints>0};
};
