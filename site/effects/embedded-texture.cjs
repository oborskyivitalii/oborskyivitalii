'use strict';
// A deliberately narrow native raster adapter for the Research intro prototype.
// It admits plain text and resolved local paint, never arbitrary HTML/resources.
module.exports = function () {
  const settings = Object.freeze({
    selector: '.archive-intro > .hero-description',
    maxCharacters: 1024,
    maxLines: 16,
    maxPixels: 1000000,
    maxDpr: 2,
    decodeTimeoutMs: 1500,
  });
  const textProperties = Object.freeze([
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'font-stretch',
    'font-variant',
    'line-height',
    'letter-spacing',
    'word-spacing',
    'text-align',
    'white-space',
    'word-break',
    'overflow-wrap',
    'hyphens',
    'direction',
    'writing-mode',
    'color',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
  ]);
  const systemFamilies = new Set([
    'system-ui',
    '-apple-system',
    'blinkmacsystemfont',
    'segoe ui',
    'sans-serif',
  ]);
  const escapeXML = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
      return entities[character];
    });
  const value = (style, property) => style.getPropertyValue(property).trim();
  const number = (style, property) => {
    const source = value(style, property);
    return /^-?(?:\d+(?:\.\d*)?|\.\d+)px$/.test(source) ? parseFloat(source) : NaN;
  };
  const inactive = (style) => ['none', 'normal', ''].includes(value(style, 'content'));
  const finiteRect = (rect) =>
    rect &&
    ['left', 'top', 'right', 'bottom', 'width', 'height'].every((key) =>
      Number.isFinite(rect[key])
    ) &&
    rect.width > 0 &&
    rect.height > 0;
  function copyRect(rect, offsetX, offsetY) {
    return {
      left: rect.left - offsetX,
      top: rect.top - offsetY,
      right: rect.right - offsetX,
      bottom: rect.bottom - offsetY,
      width: rect.width,
      height: rect.height,
    };
  }
  function supportedPaint(style) {
    if (
      !['none', ''].includes(value(style, 'transform')) ||
      !['none', ''].includes(value(style, 'filter')) ||
      !['none', ''].includes(value(style, 'backdrop-filter')) ||
      !['none', ''].includes(value(style, 'background-image')) ||
      !['none', ''].includes(value(style, 'box-shadow')) ||
      !['normal', ''].includes(value(style, 'mix-blend-mode'))
    )
      return false;
    return ['top', 'right', 'bottom', 'left'].every(
      (side) => !parseFloat(value(style, 'border-' + side + '-width'))
    );
  }
  function supportedText(style) {
    if (!supportedPaint(style) || value(style, 'opacity') !== '1') return false;
    if (value(style, 'display') !== 'block' || value(style, 'writing-mode') !== 'horizontal-tb')
      return false;
    if (
      value(style, 'direction') !== 'ltr' ||
      value(style, 'white-space') !== 'normal' ||
      value(style, 'text-transform') !== 'none' ||
      value(style, 'text-shadow') !== 'none' ||
      !['none', ''].includes(value(style, 'text-decoration-line')) ||
      !['normal', ''].includes(value(style, 'font-feature-settings')) ||
      !['normal', ''].includes(value(style, 'font-variation-settings'))
    )
      return false;
    return value(style, 'font-family')
      .split(',')
      .every((family) =>
        systemFamilies.has(
          family
            .trim()
            .replace(/^['"]|['"]$/g, '')
            .toLowerCase()
        )
      );
  }
  function backgroundRect(rect, style) {
    if (
      !['""', "''"].includes(value(style, 'content')) ||
      value(style, 'position') !== 'absolute' ||
      value(style, 'display') === 'none' ||
      !supportedPaint(style)
    )
      return null;
    const left = number(style, 'left');
    const top = number(style, 'top');
    let width = number(style, 'width');
    let height = number(style, 'height');
    if (value(style, 'box-sizing') !== 'border-box') {
      for (const side of ['left', 'right']) width += number(style, 'padding-' + side);
      for (const side of ['top', 'bottom']) height += number(style, 'padding-' + side);
    }
    const opacity = Number(value(style, 'opacity'));
    if (![left, top, width, height, opacity].every(Number.isFinite) || opacity <= 0 || opacity > 1)
      return null;
    const box = {
      left: rect.left + left,
      top: rect.top + top,
      right: rect.left + left + width,
      bottom: rect.top + top + height,
      width,
      height,
    };
    return finiteRect(box) ? box : null;
  }
  function fontsReady(document, style, text) {
    if (!document.fonts || document.fonts.status !== 'loaded') return false;
    const families = value(style, 'font-family');
    // SVG image documents cannot borrow a page's web-font resources.
    if (typeof document.fonts[Symbol.iterator] === 'function') {
      for (const face of document.fonts) {
        const name = String(face.family)
          .replace(/^['"]|['"]$/g, '')
          .toLowerCase();
        if (systemFamilies.has(name)) return false;
      }
    }
    return document.fonts.check(value(style, 'font-size') + ' ' + families, text);
  }
  function measure(root, options) {
    const document = root?.ownerDocument;
    const view = document?.defaultView;
    if (!root?.isConnected || !view || typeof view.Image !== 'function') return null;
    const candidates = root.querySelectorAll(settings.selector);
    if (candidates.length !== 1) return null;
    const owner = candidates[0];
    if (
      owner.localName !== 'p' ||
      !owner.childNodes.length ||
      [...owner.childNodes].some((node) => node.nodeType !== 3)
    )
      return null;
    const text = owner.textContent;
    if (!text.trim() || text.length > settings.maxCharacters) return null;
    const style = view.getComputedStyle(owner);
    const before = view.getComputedStyle(owner, '::before');
    const after = view.getComputedStyle(owner, '::after');
    if (!supportedText(style) || !inactive(after) || !fontsReady(document, style, text))
      return null;
    // Hidden staging may suppress visibility, but cannot alter inherited geometry.
    for (let ancestor = owner.parentElement; ancestor; ancestor = ancestor.parentElement) {
      const ancestorStyle = view.getComputedStyle(ancestor);
      if (
        !['none', ''].includes(value(ancestorStyle, 'transform')) ||
        !['none', ''].includes(value(ancestorStyle, 'perspective')) ||
        !['none', ''].includes(value(ancestorStyle, 'filter'))
      )
        return null;
      if (ancestor === root) break;
    }
    const offsetX = options.offsetX ?? 0;
    const offsetY = options.offsetY ?? 0;
    const dpr = options.dpr ?? view.devicePixelRatio ?? 1;
    if (
      ![options.width, options.height, offsetX, offsetY, dpr].every(Number.isFinite) ||
      options.width <= 0 ||
      options.height <= 0 ||
      dpr <= 0 ||
      dpr > settings.maxDpr
    )
      return null;
    const nativeRect = owner.getBoundingClientRect();
    if (!finiteRect(nativeRect)) return null;
    const rect = copyRect(nativeRect, offsetX, offsetY);
    if (
      rect.right <= 0 ||
      rect.left >= options.width ||
      rect.bottom <= 0 ||
      rect.top >= options.height
    )
      return null;
    const material = backgroundRect(rect, before);
    if (!material) return null;
    const envelope = {
      left: Math.min(rect.left, material.left),
      top: Math.min(rect.top, material.top),
      right: Math.max(rect.right, material.right),
      bottom: Math.max(rect.bottom, material.bottom),
    };
    envelope.width = envelope.right - envelope.left;
    envelope.height = envelope.bottom - envelope.top;
    const pixelWidth = Math.ceil(envelope.width * dpr);
    const pixelHeight = Math.ceil(envelope.height * dpr);
    if (pixelWidth * pixelHeight > settings.maxPixels) return null;
    const range = document.createRange();
    let lines;
    try {
      range.selectNodeContents(owner);
      lines = [...range.getClientRects()].map((line) => copyRect(line, offsetX, offsetY));
    } finally {
      range.detach?.();
    }
    if (!lines.length || lines.length > settings.maxLines || !lines.every(finiteRect)) return null;
    return {
      document,
      view,
      owner,
      style,
      before,
      text,
      rect,
      material,
      envelope,
      lines,
      dpr,
      pixelWidth,
      pixelHeight,
    };
  }
  function serialize(measured, context) {
    const { rect, material, envelope, style, before, text, pixelWidth, pixelHeight } = measured;
    function color(source) {
      context.fillStyle = '#010203';
      context.fillStyle = source;
      const first = context.fillStyle;
      context.fillStyle = '#030201';
      context.fillStyle = source;
      return first === context.fillStyle ? first : null;
    }
    const textColor = color(value(style, 'color'));
    const paper = color(value(before, 'background-color'));
    const ownPaper = color(value(style, 'background-color'));
    if (!textColor || !paper || !ownPaper) return null;
    const paragraph = textProperties.map(
      (property) => property + ':' + (property === 'color' ? textColor : value(style, property))
    );
    paragraph.push(
      'position:absolute',
      'box-sizing:border-box',
      'margin:0',
      'left:' + (rect.left - envelope.left) + 'px',
      'top:' + (rect.top - envelope.top) + 'px',
      'width:' + rect.width + 'px',
      'height:' + rect.height + 'px',
      'background-color:' + ownPaper
    );
    const backdrop = [
      'position:absolute',
      'box-sizing:border-box',
      'left:' + (material.left - envelope.left) + 'px',
      'top:' + (material.top - envelope.top) + 'px',
      'width:' + material.width + 'px',
      'height:' + material.height + 'px',
      'background-color:' + paper,
      'opacity:' + value(before, 'opacity'),
      'border-radius:' + value(before, 'border-radius'),
    ];
    const css = [...paragraph, ...backdrop].join(';');
    if (/url\s*\(|var\s*\(|@import/i.test(css)) return null;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      pixelWidth +
      '" height="' +
      pixelHeight +
      '" viewBox="0 0 ' +
      envelope.width +
      ' ' +
      envelope.height +
      '">' +
      '<foreignObject width="' +
      envelope.width +
      '" height="' +
      envelope.height +
      '">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:100%;height:100%">' +
      '<div style="' +
      escapeXML(backdrop.join(';')) +
      '"></div>' +
      '<p style="' +
      escapeXML(paragraph.join(';')) +
      '">' +
      escapeXML(text) +
      '</p>' +
      '</div></foreignObject></svg>'
    );
  }
  async function capture(root, options = {}) {
    let measured;
    try {
      measured = measure(root, options);
    } catch {
      return null;
    }
    if (!measured || options.signal?.aborted) return null;
    let canvas;
    let context;
    let image;
    let source;
    try {
      canvas = measured.document.createElement('canvas');
      canvas.width = measured.pixelWidth;
      canvas.height = measured.pixelHeight;
      context = canvas.getContext('2d');
      source = context && serialize(measured, context);
      if (source) image = new measured.view.Image();
    } catch {
      source = null;
    }
    if (!source) {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      return null;
    }
    return new Promise((resolve) => {
      let finished = false;
      let timeout;
      function finish(success) {
        if (finished) return;
        finished = true;
        measured.view.clearTimeout(timeout);
        options.signal?.removeEventListener('abort', abort);
        image.onload = null;
        image.onerror = null;
        image.removeAttribute?.('src');
        if (!success) {
          canvas.width = 0;
          canvas.height = 0;
          resolve(null);
          return;
        }
        let disposed = false;
        resolve({
          canvas,
          owner: measured.owner,
          rect: measured.rect,
          envelope: measured.envelope,
          lines: measured.lines,
          dpr: measured.dpr,
          pixelCount: measured.pixelWidth * measured.pixelHeight,
          dispose() {
            if (disposed) return;
            disposed = true;
            canvas.width = 0;
            canvas.height = 0;
          },
        });
      }
      function abort() {
        finish(false);
      }
      image.onload = () => {
        if (finished) return;
        try {
          if (!image.naturalWidth || !image.naturalHeight) return finish(false);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          // A loaded image may silently omit foreignObject on an unsupported engine.
          const sample = context.getImageData(
            Math.floor(canvas.width / 2),
            Math.floor(canvas.height / 2),
            1,
            1
          );
          finish(sample.data[3] > 0);
        } catch {
          finish(false);
        }
      };
      image.onerror = abort;
      options.signal?.addEventListener('abort', abort, { once: true });
      timeout = measured.view.setTimeout(abort, settings.decodeTimeoutMs);
      if (options.signal?.aborted) return abort();
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    });
  }
  return { capture, settings };
};
