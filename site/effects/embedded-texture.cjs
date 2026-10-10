'use strict';
// Bounded native raster adapters. Page captures admit resolved local paint and
// decoded media; unsupported native owners keep their ordinary HTML fallback.
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
  const nativeProperties = Object.freeze([
    ...textProperties,
    'font-feature-settings',
    'font-variation-settings',
    'box-sizing',
    'display',
    'position',
    'top',
    'right',
    'bottom',
    'left',
    'width',
    'height',
    'min-width',
    'max-width',
    'min-height',
    'max-height',
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'text-indent',
    'text-transform',
    'text-shadow',
    'text-decoration',
    'vertical-align',
    'list-style-type',
    'list-style-position',
    'flex',
    'order',
    'flex-direction',
    'flex-wrap',
    'align-items',
    'align-self',
    'justify-content',
    'justify-items',
    'justify-self',
    'align-content',
    'grid-template-columns',
    'grid-template-rows',
    'grid-auto-flow',
    'grid-auto-columns',
    'grid-auto-rows',
    'grid-column',
    'grid-row',
    'gap',
    'row-gap',
    'column-gap',
    'object-fit',
    'object-position',
    'background-color',
    'background-image',
    'background-position',
    'background-size',
    'background-repeat',
    'background-origin',
    'background-clip',
    'box-shadow',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'border-radius',
    'box-decoration-break',
    '-webkit-box-decoration-break',
    'isolation',
    'z-index',
    'opacity',
    'overflow',
    'overflow-x',
    'overflow-y',
    'transform',
    'transform-origin',
    'transform-box',
  ]);
  const vectorProperties = Object.freeze([
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-opacity',
    'stroke-width',
    'stroke-dasharray',
    'stroke-dashoffset',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'vector-effect',
    'paint-order',
  ]);
  const nativeTags = new Set([
    'main',
    'footer',
    'nav',
    'header',
    'section',
    'article',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'span',
    'a',
    'strong',
    'em',
    'small',
    'time',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'figure',
    'figcaption',
    'blockquote',
    'pre',
    'code',
    'br',
    'img',
    'button',
    'label',
    'b',
    'i',
    'sup',
    'sub',
    'hr',
  ]);
  const vectorTags = new Set([
    'svg',
    'g',
    'polygon',
    'polyline',
    'path',
    'rect',
    'circle',
    'ellipse',
    'line',
    'title',
    'desc',
  ]);
  const vectorAttributes = new Set([
    'viewBox',
    'preserveAspectRatio',
    'points',
    'd',
    'x',
    'y',
    'x1',
    'x2',
    'y1',
    'y2',
    'cx',
    'cy',
    'r',
    'rx',
    'ry',
    'width',
    'height',
    'transform',
    'fill',
    'fill-rule',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-miterlimit',
    'stroke-dasharray',
    'stroke-dashoffset',
    'vector-effect',
  ]);
  function safeCSS(source) {
    return !/(?:url|var)\s*\(|@|[<>{}]/i.test(source);
  }
  function visiblePaper(style, pseudo = false) {
    if (pseudo && inactive(style)) return false;
    if (value(style, 'display') === 'none' || value(style, 'opacity') === '0') return false;
    const color = value(style, 'background-color');
    return (
      (!!color && !['transparent', 'rgba(0, 0, 0, 0)'].includes(color)) ||
      !['none', ''].includes(value(style, 'background-image')) ||
      !['none', ''].includes(value(style, 'box-shadow')) ||
      (pseudo &&
        ['top', 'right', 'bottom', 'left'].some(
          (side) => parseFloat(value(style, 'border-' + side + '-width')) > 0
        ))
    );
  }
  function nativeSupported(node, style) {
    const vector = node.namespaceURI === 'http://www.w3.org/2000/svg';
    if (!(vector ? vectorTags : nativeTags).has(node.localName)) return false;
    if (
      ['filter', 'backdrop-filter', 'clip-path', 'mask-image', 'perspective'].some(
        (property) => !['none', ''].includes(value(style, property))
      ) ||
      !['normal', ''].includes(value(style, 'mix-blend-mode')) ||
      !['none', ''].includes(value(style, 'animation-name')) ||
      !['none', ''].includes(value(style, 'translate')) ||
      !['none', ''].includes(value(style, 'rotate')) ||
      !['none', ''].includes(value(style, 'scale'))
    )
      return false;
    if (!vector && !['none', ''].includes(value(style, 'transform'))) return false;
    if (!safeCSS(nativeProperties.map((property) => value(style, property)).join(';')))
      return false;
    if (vector) {
      return (
        safeCSS(vectorProperties.map((property) => value(style, property)).join(';')) &&
        [...node.attributes].every(
          ({ name, value: source }) =>
            !/^(?:href|xlink:href|on.+)$/i.test(name) && !/url\s*\(/i.test(source)
        )
      );
    }
    return (
      ['horizontal-tb', ''].includes(value(style, 'writing-mode')) &&
      ['ltr', ''].includes(value(style, 'direction'))
    );
  }
  function extendBounds(bounds, box, style) {
    if (!finiteRect(box)) return;
    bounds.left = Math.min(bounds.left, box.left);
    bounds.top = Math.min(bounds.top, box.top);
    bounds.right = Math.max(bounds.right, box.right);
    bounds.bottom = Math.max(bounds.bottom, box.bottom);
    for (const part of value(style, 'box-shadow').split(/,(?![^()]*\))/)) {
      if (/\binset\b/.test(part)) continue;
      const lengths = (part.match(/[-+]?(?:\d*\.)?\d+px/g) || []).map(parseFloat);
      if (lengths.length < 2) continue;
      const spread = Math.max(0, (lengths[2] || 0) * 2 + (lengths[3] || 0));
      bounds.left = Math.min(bounds.left, box.left + lengths[0] - spread);
      bounds.top = Math.min(bounds.top, box.top + lengths[1] - spread);
      bounds.right = Math.max(bounds.right, box.right + lengths[0] + spread);
      bounds.bottom = Math.max(bounds.bottom, box.bottom + lengths[1] + spread);
    }
  }
  function pseudoBox(rect, style, pseudo) {
    if (inactive(pseudo) || value(pseudo, 'display') === 'none') return undefined;
    const content = value(pseudo, 'content');
    if (
      !/^(?:"[^"\\]*"|'[^'\\]*')$/.test(content) ||
      !['none', ''].includes(value(pseudo, 'transform')) ||
      !['none', ''].includes(value(pseudo, 'filter')) ||
      !['none', ''].includes(value(pseudo, 'backdrop-filter')) ||
      !safeCSS(nativeProperties.map((property) => value(pseudo, property)).join(';'))
    )
      return null;
    // Bounded inline generated text (the native topic-list slash separators)
    // participates in its parent's normal layout, without an absolute outset.
    if (value(pseudo, 'position') !== 'absolute')
      return ['static', 'relative', ''].includes(value(pseudo, 'position')) ? undefined : null;
    let width = number(pseudo, 'width');
    let height = number(pseudo, 'height');
    if (value(pseudo, 'box-sizing') !== 'border-box') {
      for (const side of ['left', 'right'])
        width +=
          (parseFloat(value(pseudo, 'padding-' + side)) || 0) +
          (parseFloat(value(pseudo, 'border-' + side + '-width')) || 0);
      for (const side of ['top', 'bottom'])
        height +=
          (parseFloat(value(pseudo, 'padding-' + side)) || 0) +
          (parseFloat(value(pseudo, 'border-' + side + '-width')) || 0);
    }
    const left =
      rect.left + (parseFloat(value(style, 'border-left-width')) || 0) + number(pseudo, 'left');
    const top =
      rect.top + (parseFloat(value(style, 'border-top-width')) || 0) + number(pseudo, 'top');
    const result = { left, top, right: left + width, bottom: top + height, width, height };
    return finiteRect(result) ? result : null;
  }
  function nativeFontSupported(document, style, text) {
    return (
      fontsReady(document, style, text) &&
      value(style, 'font-family')
        .split(',')
        .every((family) =>
          systemFamilies.has(
            family
              .trim()
              .replace(/^['"]|['"]$/g, '')
              .toLowerCase()
          )
        )
    );
  }
  function extendNativeNodeBounds(node, owner, style, bounds, options) {
    if (node !== owner && node.localName !== 'svg' && !visiblePaper(style)) return;
    const boxes = node.getClientRects ? [...node.getClientRects()] : [node.getBoundingClientRect()];
    for (const original of boxes)
      extendBounds(bounds, copyRect(original, options.offsetX, options.offsetY), style);
  }
  function inspectNativePseudo(document, box, style, pseudo, bounds) {
    const material = pseudoBox(box, style, pseudo);
    if (material === null) return null;
    if (material) extendBounds(bounds, material, pseudo);
    if (inactive(pseudo)) return 0;
    const content = value(pseudo, 'content');
    if (content.length > 2 && !nativeFontSupported(document, pseudo, content.slice(1, -1)))
      return null;
    return Math.max(0, content.length - 2) * 3;
  }
  function inspectNativeNode(node, owner, document, view, options, bounds) {
    const style = view.getComputedStyle(node);
    const before = view.getComputedStyle(node, '::before');
    const after = view.getComputedStyle(node, '::after');
    if (!nativeSupported(node, style)) return null;
    const box = copyRect(node.getBoundingClientRect(), options.offsetX, options.offsetY);
    extendNativeNodeBounds(node, owner, style, bounds, options);
    let textBytes = 0;
    for (const pseudo of [before, after]) {
      const bytes = inspectNativePseudo(document, box, style, pseudo, bounds);
      if (bytes === null) return null;
      textBytes += bytes;
    }
    const hasDirectText = [...node.childNodes].some(
      (child) => child.nodeType === 3 && child.textContent.trim()
    );
    if (hasDirectText && !nativeFontSupported(document, style, node.textContent)) return null;
    if (
      node.localName === 'img' &&
      (!node.complete || !node.naturalWidth || !node.naturalHeight || !node.currentSrc)
    )
      return null;
    if (node.namespaceURI === 'http://www.w3.org/2000/svg')
      textBytes += [...node.attributes].reduce(
        (sum, attribute) => sum + (attribute.name.length + attribute.value.length + 4) * 3,
        0
      );
    return { node, style, before, after, box, textBytes };
  }
  function inspectNative(owner, ownerPath, document, view, options, caps) {
    const descendants = [...owner.querySelectorAll('*')];
    const text = owner.textContent || '';
    if (descendants.length + 1 > caps.descendants || text.length * 3 > caps.textBytes) return null;
    const nativeRect = owner.getBoundingClientRect();
    const rect = copyRect(nativeRect, options.offsetX, options.offsetY);
    const bounds = { ...rect };
    const nodes = [];
    let textBytes = text.length * 3;
    for (const node of [owner, ...descendants]) {
      if (options.clock() > options.acquisitionDeadline) return null;
      const record = inspectNativeNode(node, owner, document, view, options, bounds);
      if (!record) return null;
      textBytes += record.textBytes;
      if (textBytes > caps.textBytes) return null;
      nodes.push(record);
    }
    const envelope = {
      left: Math.max(-64, bounds.left),
      top: Math.max(-64, bounds.top),
      right: Math.min(options.width + 64, bounds.right),
      bottom: Math.min(options.height + 64, bounds.bottom),
    };
    envelope.width = envelope.right - envelope.left;
    envelope.height = envelope.bottom - envelope.top;
    if (!finiteRect(envelope)) return null;
    // A complete visible paper may be larger than one texture at high DPR.
    // Reduce sampling inside the original per-texture pixel ceiling.
    const area = envelope.width * envelope.height;
    const dpr = Math.min(options.dpr, Math.sqrt(settings.maxPixels / area));
    const pixelWidth = Math.max(1, Math.floor(envelope.width * dpr));
    const pixelHeight = Math.max(1, Math.floor(envelope.height * dpr));
    if (pixelWidth * pixelHeight > settings.maxPixels) return null;
    const range = document.createRange();
    let lines;
    try {
      range.selectNodeContents(owner);
      lines = [...range.getClientRects()]
        .map((line) => copyRect(line, options.offsetX, options.offsetY))
        .filter(finiteRect);
    } finally {
      range.detach?.();
    }
    return {
      document,
      view,
      owner,
      ownerPath,
      nodes,
      rect,
      envelope,
      lines,
      text,
      descendants: descendants.length,
      textBytes,
      dpr,
      pixelWidth,
      pixelHeight,
    };
  }
  function nativeDimensions(style, box, vector) {
    if (vector || ['inline', 'contents', 'none'].includes(value(style, 'display'))) return [];
    let width = box.width;
    let height = box.height;
    if (value(style, 'box-sizing') !== 'border-box') {
      for (const side of ['left', 'right'])
        width -=
          (parseFloat(value(style, 'padding-' + side)) || 0) +
          (parseFloat(value(style, 'border-' + side + '-width')) || 0);
      for (const side of ['top', 'bottom'])
        height -=
          (parseFloat(value(style, 'padding-' + side)) || 0) +
          (parseFloat(value(style, 'border-' + side + '-width')) || 0);
    }
    return width > 0 && height > 0 ? ['width:' + width + 'px', 'height:' + height + 'px'] : [];
  }
  function nativeImageSource(document, node) {
    const bitmap = document.createElement('canvas');
    try {
      const scale = Math.min(
        1,
        Math.sqrt(settings.maxPixels / (node.naturalWidth * node.naturalHeight))
      );
      bitmap.width = Math.max(1, Math.floor(node.naturalWidth * scale));
      bitmap.height = Math.max(1, Math.floor(node.naturalHeight * scale));
      const context = bitmap.getContext('2d');
      if (!context) throw new Error('Native image raster unavailable');
      context.drawImage(node, 0, 0, bitmap.width, bitmap.height);
      const source = bitmap.toDataURL('image/png');
      if (!/^data:image\/png;base64,/.test(source)) throw new Error('Native image not local');
      return source;
    } finally {
      bitmap.width = 0;
      bitmap.height = 0;
    }
  }
  function serializeNative(measured) {
    const { nodes, rect, envelope, pixelWidth, pixelHeight } = measured;
    const records = new Map(nodes.map((record, index) => [record.node, { ...record, index }]));
    const css = [];
    function declarations(style, properties) {
      return properties
        .map((property) => (value(style, property) ? property + ':' + value(style, property) : ''))
        .filter(Boolean);
    }
    function render(node) {
      if (node.nodeType === 3) return escapeXML(node.textContent);
      if (node.nodeType !== 1) return '';
      const record = records.get(node);
      if (!record) throw new Error('Native texture tree changed');
      const { style, before, after, index, box } = record;
      const vector = node.namespaceURI === 'http://www.w3.org/2000/svg';
      const properties = vector ? [...nativeProperties, ...vectorProperties] : nativeProperties;
      const styles = declarations(style, properties);
      styles.push('visibility:visible', 'animation:none', 'transition:none');
      styles.push(...nativeDimensions(style, box, vector));
      if (node === measured.owner) {
        styles.push(
          'position:absolute',
          'margin:0',
          'left:' + (rect.left - envelope.left) + 'px',
          'top:' + (rect.top - envelope.top) + 'px',
          'right:auto',
          'bottom:auto'
        );
      }
      for (const [name, pseudo] of [
        ['before', before],
        ['after', after],
      ]) {
        if (inactive(pseudo)) continue;
        css.push(
          '.embedded-node-' +
            index +
            '::' +
            name +
            '{' +
            [
              ...declarations(pseudo, nativeProperties),
              'content:' + value(pseudo, 'content'),
              'visibility:visible',
            ].join(';') +
            '}'
        );
      }
      const attributes = [
        'class="embedded-node-' + index + '"',
        'style="' + escapeXML(styles.join(';')) + '"',
      ];
      if (vector) {
        if (node.localName === 'svg') attributes.push('xmlns="http://www.w3.org/2000/svg"');
        for (const attribute of node.attributes) {
          if (vectorAttributes.has(attribute.name))
            attributes.push(attribute.name + '="' + escapeXML(attribute.value) + '"');
        }
      }
      if (node.localName === 'img')
        attributes.push('src="' + nativeImageSource(measured.document, node) + '"');
      const children = [...node.childNodes].map(render).join('');
      const tag = node.localName;
      if (['img', 'br', 'hr'].includes(tag)) return '<' + tag + ' ' + attributes.join(' ') + '/>';
      return '<' + tag + ' ' + attributes.join(' ') + '>' + children + '</' + tag + '>';
    }
    const content = render(measured.owner);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      pixelWidth +
      '" height="' +
      pixelHeight +
      '" viewBox="0 0 ' +
      envelope.width +
      ' ' +
      envelope.height +
      '"><foreignObject width="' +
      envelope.width +
      '" height="' +
      envelope.height +
      '"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:100%;height:100%">' +
      '<style>' +
      escapeXML(css.join('')) +
      '</style>' +
      content +
      '</div></foreignObject></svg>'
    );
  }
  function decodeNativeImages(root, view, options) {
    const { signal } = options;
    const images = [...root.querySelectorAll('img')].filter(
      (image) =>
        (!image.complete || !image.naturalWidth || !image.naturalHeight) &&
        value(view.getComputedStyle(image), 'display') !== 'none' &&
        (() => {
          const rect = copyRect(image.getBoundingClientRect(), options.offsetX, options.offsetY);
          return (
            finiteRect(rect) &&
            rect.right > -64 &&
            rect.left < options.width + 64 &&
            rect.bottom > -64 &&
            rect.top < options.height + 64
          );
        })()
    );
    if (!images.length) return Promise.resolve(true);
    if (images.some((image) => typeof image.decode !== 'function')) return Promise.resolve(false);
    return new Promise((resolve) => {
      let finished = false;
      let timeout;
      function finish(success) {
        if (finished) return;
        finished = true;
        view.clearTimeout(timeout);
        signal?.removeEventListener('abort', abort);
        resolve(success);
      }
      function abort() {
        finish(false);
      }
      signal?.addEventListener('abort', abort, { once: true });
      timeout = view.setTimeout(abort, Math.max(1, options.deadline - options.clock()));
      if (signal?.aborted) return abort();
      Promise.all(images.map((image) => Promise.resolve().then(() => image.decode()))).then(
        () =>
          finish(
            images.every((image) => image.complete && image.naturalWidth && image.naturalHeight)
          ),
        abort
      );
    });
  }
  async function captureAll(root, options = {}) {
    const assets = [];
    let controller;
    let externalAbort;
    try {
      const document = root?.ownerDocument;
      const view = document?.defaultView;
      if (
        !root?.isConnected ||
        !view ||
        typeof view.Image !== 'function' ||
        options.signal?.aborted
      )
        return null;
      const clock = () => view.performance?.now() ?? Date.now();
      const started = clock();
      const normalized = {
        ...options,
        offsetX: options.offsetX ?? 0,
        offsetY: options.offsetY ?? 0,
        dpr: options.dpr ?? view.devicePixelRatio ?? 1,
        clock,
        deadline: started + Math.min(160, options.preparationMs ?? 160),
      };
      if (
        ![
          normalized.width,
          normalized.height,
          normalized.offsetX,
          normalized.offsetY,
          normalized.dpr,
        ].every(Number.isFinite) ||
        normalized.width <= 0 ||
        normalized.height <= 0 ||
        normalized.dpr <= 0 ||
        normalized.dpr > settings.maxDpr
      )
        return null;
      const caps = options.caps;
      if (
        !caps ||
        ['owners', 'descendants', 'textBytes', 'layerPixels'].some(
          (name) => !Number.isFinite(caps[name]) || caps[name] < 0
        )
      )
        return null;
      if (typeof view.AbortController !== 'function') return null;
      controller = new view.AbortController();
      externalAbort = () => controller.abort();
      options.signal?.addEventListener('abort', externalAbort, { once: true });
      normalized.signal = controller.signal;
      if (options.signal?.aborted) controller.abort();
      if (!(await decodeNativeImages(root, view, normalized))) return null;
      normalized.acquisitionDeadline = Math.min(
        normalized.deadline,
        clock() + Math.min(80, options.acquisitionMs ?? 80)
      );
      const measured = [];
      const usage = { owners: 0, descendants: 0, textBytes: 0, layerPixels: 0 };
      const semantic = new Set([
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'img',
        'figure',
        'li',
        'dt',
        'dd',
        'figcaption',
        'blockquote',
        'pre',
        'a',
        'button',
        'label',
        'span',
        'time',
        'strong',
        'small',
      ]);
      function visit(node, path) {
        if (clock() > normalized.acquisitionDeadline) throw new Error('Native acquisition expired');
        if (node.hasAttribute('hidden')) return;
        const style = view.getComputedStyle(node);
        if (value(style, 'display') === 'none' || value(style, 'opacity') === '0') return;
        if (value(style, 'display') === 'contents') {
          if (!nativeSupported(node, style)) throw new Error('Unsupported native ancestor paint');
          [...node.children].forEach((child, index) => visit(child, [...path, index]));
          return;
        }
        const native = node.getBoundingClientRect();
        if (!finiteRect(native)) return;
        const box = copyRect(native, normalized.offsetX, normalized.offsetY);
        if (
          box.right <= -64 ||
          box.left >= normalized.width + 64 ||
          box.bottom <= -64 ||
          box.top >= normalized.height + 64
        )
          return;
        if (!nativeSupported(node, style)) throw new Error('Unsupported native ancestor paint');
        const before = view.getComputedStyle(node, '::before');
        const after = view.getComputedStyle(node, '::after');
        const atomic =
          visiblePaper(style) ||
          visiblePaper(before, true) ||
          visiblePaper(after, true) ||
          ['figure', 'svg'].includes(node.localName);
        const inlineGroup =
          node.localName === 'div' &&
          node.children.length > 0 &&
          [...node.children].every((child) =>
            ['span', 'time', 'strong', 'small'].includes(child.localName)
          );
        if (atomic || semantic.has(node.localName) || inlineGroup) {
          const item = inspectNative(node, path, document, view, normalized, caps);
          if (!item) throw new Error('Unsupported visible native paint');
          const increment = {
            owners: 1,
            descendants: item.descendants,
            textBytes: item.textBytes,
            layerPixels: item.pixelWidth * item.pixelHeight,
          };
          for (const name of Object.keys(usage)) {
            usage[name] += increment[name];
            if (usage[name] > caps[name]) throw new Error('Native texture capacity exceeded');
          }
          item.ownerIndex = measured.length;
          measured.push(item);
          return;
        }
        [...node.children].forEach((child, index) => visit(child, [...path, index]));
      }
      visit(root, []);
      const captured = await Promise.all(
        measured.map(async (item) => {
          const asset = await raster(item, normalized, serializeNative);
          if (asset) assets.push(asset);
          else controller.abort();
          return asset;
        })
      );
      if (
        captured.some((asset) => !asset) ||
        normalized.signal.aborted ||
        clock() > normalized.deadline
      )
        throw new Error('Native texture capture failed');
      assets.sort((a, b) => a.ownerIndex - b.ownerIndex);
      return assets;
    } catch {
      controller?.abort();
      for (const asset of assets) asset.dispose();
      return null;
    } finally {
      options.signal?.removeEventListener('abort', externalAbort);
    }
  }
  async function capture(root, options = {}) {
    let measured;
    try {
      measured = measure(root, options);
    } catch {
      return null;
    }
    return raster(measured, options, serialize);
  }
  function raster(measured, options, serializer) {
    if (!measured || options.signal?.aborted) return Promise.resolve(null);
    let canvas;
    let context;
    let image;
    let source;
    try {
      canvas = measured.document.createElement('canvas');
      canvas.width = measured.pixelWidth;
      canvas.height = measured.pixelHeight;
      context = canvas.getContext('2d');
      source = context && serializer(measured, context);
      if (source) image = new measured.view.Image();
    } catch {
      source = null;
    }
    if (!source) {
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      return Promise.resolve(null);
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
          ownerPath: measured.ownerPath,
          ownerIndex: measured.ownerIndex,
          descendants: measured.descendants || 0,
          textBytes: measured.textBytes || measured.text.length * 3,
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
          if (sample.data[3] > 0) return finish(true);
          // Headings and decoded cutouts may have a transparent center. Admit
          // their raster only after observing actual ink somewhere in its bound.
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          finish(pixels.some((alpha, index) => index % 4 === 3 && alpha > 0));
        } catch {
          finish(false);
        }
      };
      image.onerror = abort;
      options.signal?.addEventListener('abort', abort, { once: true });
      const timeoutMs =
        options.deadline === undefined
          ? settings.decodeTimeoutMs
          : Math.min(settings.decodeTimeoutMs, options.deadline - options.clock());
      if (timeoutMs <= 0) return abort();
      timeout = measured.view.setTimeout(abort, timeoutMs);
      if (options.signal?.aborted) return abort();
      try {
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      } catch {
        abort();
      }
    });
  }
  return { capture, captureAll, settings };
};
