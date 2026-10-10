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
    'appearance',
    '-webkit-appearance',
    'color-scheme',
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
    'outline',
    'outline-offset',
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
    'form',
    'select',
    'option',
    'optgroup',
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
  function nativeAncestorSupported(node, style) {
    const vector = node.namespaceURI === 'http://www.w3.org/2000/svg';
    if (!(vector ? vectorTags : nativeTags).has(node.localName)) return false;
    if (node.localName === 'select' && (node.multiple || node.size > 1)) return false;
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
    return (
      vector ||
      (['horizontal-tb', ''].includes(value(style, 'writing-mode')) &&
        ['ltr', ''].includes(value(style, 'direction')))
    );
  }
  function nativeSupported(node, style) {
    if (!nativeAncestorSupported(node, style)) return false;
    if (!safeCSS(nativeProperties.map((property) => value(style, property)).join(';')))
      return false;
    if (node.namespaceURI !== 'http://www.w3.org/2000/svg') return true;
    return (
      safeCSS(vectorProperties.map((property) => value(style, property)).join(';')) &&
      [...node.attributes].every(
        ({ name, value: source }) =>
          !/^(?:href|xlink:href|on.+)$/i.test(name) && !/url\s*\(/i.test(source)
      )
    );
  }
  function fullyClipped(style) {
    return /^inset\(50%(?:\s+50%){0,3}\)$/.test(value(style, 'clip-path'));
  }
  function nativeStyle(view, node, pseudo, options) {
    let styles = options.styleCache.get(node);
    if (!styles) {
      styles = new Map();
      options.styleCache.set(node, styles);
    }
    const key = pseudo || '';
    if (!styles.has(key)) {
      const resolved = view.getComputedStyle(node, pseudo);
      const properties = new Map();
      styles.set(key, {
        getPropertyValue(property) {
          if (!properties.has(property))
            properties.set(property, resolved.getPropertyValue(property));
          return properties.get(property);
        },
      });
    }
    return styles.get(key);
  }
  function nativeRect(node, options) {
    if (!options.rectCache.has(node))
      options.rectCache.set(node, copyRect(node.getBoundingClientRect(), 0, 0));
    return options.rectCache.get(node);
  }
  function invisibleNative(node, owner, view, options) {
    for (let current = node; current; current = current.parentElement) {
      const style = nativeStyle(view, current, undefined, options);
      if (
        current.hasAttribute('hidden') ||
        value(style, 'display') === 'none' ||
        value(style, 'opacity') === '0' ||
        fullyClipped(style)
      )
        return true;
      if (current === owner) break;
    }
    return false;
  }
  function extendBounds(bounds, box, style) {
    if (!finiteRect(box)) return;
    bounds.left = Math.min(bounds.left, box.left);
    bounds.top = Math.min(bounds.top, box.top);
    bounds.right = Math.max(bounds.right, box.right);
    bounds.bottom = Math.max(bounds.bottom, box.bottom);
    if (!['none', ''].includes(value(style, 'outline-style'))) {
      const outset =
        (parseFloat(value(style, 'outline-width')) || 0) +
        (parseFloat(value(style, 'outline-offset')) || 0);
      bounds.left = Math.min(bounds.left, box.left - outset);
      bounds.top = Math.min(bounds.top, box.top - outset);
      bounds.right = Math.max(bounds.right, box.right + outset);
      bounds.bottom = Math.max(bounds.bottom, box.bottom + outset);
    }
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
    if (!Object.values(result).every(Number.isFinite) || width < 0 || height < 0) return null;
    if (width === 0 || height === 0) return emptyPseudoPaint(pseudo) ? undefined : null;
    return result;
  }
  function emptyPseudoPaint(style) {
    return (
      ['""', "''"].includes(value(style, 'content')) &&
      ['none', ''].includes(value(style, 'box-shadow')) &&
      (['none', ''].includes(value(style, 'outline-style')) || number(style, 'outline-width') === 0)
    );
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
  function rejectNative(options, code, tag, extra = {}) {
    try {
      options.onReject?.({ reason: code, path: options.ownerPath || [], tag, ...extra });
    } catch {
      // Optional public diagnostics cannot change capture or cleanup behavior.
    }
    return null;
  }
  function extendNativeNodeBounds(node, owner, style, bounds, options) {
    if (options.decoration) return;
    if (node !== owner && node.localName !== 'svg' && !visiblePaper(style)) return;
    const boxes = node.getClientRects ? [...node.getClientRects()] : [nativeRect(node, options)];
    for (const original of boxes)
      extendBounds(bounds, copyRect(original, options.offsetX, options.offsetY), style);
  }
  function inspectNativePseudo(document, box, style, pseudo, bounds, options, tag) {
    const material = pseudoBox(box, style, pseudo);
    if (material === null) return rejectNative(options, 'unsupported-pseudo-paint', tag);
    if (material) extendBounds(bounds, material, pseudo);
    if (inactive(pseudo)) return 0;
    const content = value(pseudo, 'content');
    if (content.length > 2 && !nativeFontSupported(document, pseudo, content.slice(1, -1)))
      return rejectNative(options, 'unsupported-pseudo-font', tag);
    return Math.max(0, content.length - 2) * 3;
  }
  function inspectNativeNode(node, owner, document, view, options, bounds) {
    const style = nativeStyle(view, node, undefined, options);
    const before = nativeStyle(view, node, '::before', options);
    const after = nativeStyle(view, node, '::after', options);
    if (!nativeSupported(node, style))
      return rejectNative(options, 'unsupported-native-paint', node.localName);
    const box = copyRect(nativeRect(node, options), options.offsetX, options.offsetY);
    extendNativeNodeBounds(node, owner, style, bounds, options);
    let textBytes = 0;
    for (const pseudo of [before, after]) {
      const bytes = inspectNativePseudo(
        document,
        box,
        style,
        pseudo,
        bounds,
        options,
        node.localName
      );
      if (bytes === null) return null;
      textBytes += bytes;
    }
    const hasDirectText = [...node.childNodes].some(
      (child) => child.nodeType === 3 && child.textContent.trim()
    );
    if (hasDirectText && !nativeFontSupported(document, style, node.textContent))
      return rejectNative(options, 'unsupported-native-font', node.localName);
    if (
      node.localName === 'img' &&
      (!node.complete || !node.naturalWidth || !node.naturalHeight || !node.currentSrc)
    )
      return rejectNative(options, 'native-image-not-decoded', node.localName);
    if (node.namespaceURI === 'http://www.w3.org/2000/svg')
      textBytes += [...node.attributes].reduce(
        (sum, attribute) => sum + (attribute.name.length + attribute.value.length + 4) * 3,
        0
      );
    const control = node.localName === 'select' ? selectedControl(node) : null;
    return { node, style, before, after, box, textBytes, control };
  }
  function inspectNative(owner, ownerPath, document, view, options, caps, decoration = false) {
    const descendants = decoration ? [] : [...owner.querySelectorAll('*')];
    const text = decoration ? '' : owner.textContent || '';
    const ownerOptions = { ...options, ownerPath, decoration };
    if (descendants.length + 1 > caps.descendants || text.length * 3 > caps.textBytes)
      return rejectNative(ownerOptions, 'native-owner-capacity', owner.localName);
    const rect = copyRect(nativeRect(owner, options), options.offsetX, options.offsetY);
    const bounds = decoration
      ? nativeBorderBounds(rect, nativeStyle(view, owner, undefined, options), options)
      : { ...rect };
    if (!bounds) return false;
    const nodes = [];
    const skippedNodes = new Set();
    let textBytes = text.length * 3;
    for (const node of [owner, ...descendants]) {
      if (options.clock() > options.acquisitionDeadline)
        return rejectNative(ownerOptions, 'acquisition-deadline', node.localName);
      if (node !== owner && invisibleNative(node, owner, view, options)) {
        skippedNodes.add(node);
        continue;
      }
      const record = inspectNativeNode(node, owner, document, view, ownerOptions, bounds);
      if (!record) return null;
      textBytes += record.textBytes;
      if (textBytes > caps.textBytes)
        return rejectNative(ownerOptions, 'native-text-capacity', node.localName);
      nodes.push(record);
    }
    const envelope = {
      left: Math.max(0, bounds.left),
      top: Math.max(0, bounds.top),
      right: Math.min(options.width, bounds.right),
      bottom: Math.min(options.height, bounds.bottom),
    };
    envelope.width = envelope.right - envelope.left;
    envelope.height = envelope.bottom - envelope.top;
    if (!finiteRect(envelope)) return false;
    // A complete visible paper may be larger than one texture at high DPR.
    // Reduce sampling inside the original per-texture pixel ceiling.
    const area = envelope.width * envelope.height;
    const dpr = Math.min(options.dpr, Math.sqrt(settings.maxPixels / area));
    const pixelWidth = Math.max(1, Math.floor(envelope.width * dpr));
    const pixelHeight = Math.max(1, Math.floor(envelope.height * dpr));
    if (pixelWidth * pixelHeight > settings.maxPixels)
      return rejectNative(ownerOptions, 'native-texture-capacity', owner.localName);
    const range = document.createRange();
    let lines;
    try {
      lines = [];
      if (!decoration) {
        range.selectNodeContents(owner);
        lines = [...range.getClientRects()]
          .map((line) => copyRect(line, options.offsetX, options.offsetY))
          .filter(finiteRect);
      }
    } finally {
      range.detach?.();
    }
    return {
      document,
      view,
      owner,
      ownerPath,
      nodes,
      skippedNodes,
      rect,
      envelope,
      lines,
      text,
      decoration,
      paintRects: decoration
        ? nativeBorderBoxes(rect, nativeStyle(view, owner, undefined, options), options)
        : [envelope],
      paintFingerprint: nativePaintFingerprint(nodes, text),
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
  function selectedControl(node) {
    const index = Number.isInteger(node.selectedIndex) ? node.selectedIndex : 0;
    const selected = node.selectedOptions?.[0] || node.options?.[index] || node.children[index];
    return { selectedIndex: index, text: selected?.textContent || '' };
  }
  function nativeControls(measured) {
    if (measured.decoration) return [];
    return (measured.nodes || [])
      .filter(({ node }) => node.localName === 'select')
      .map(({ node, control }) => {
        const path = [];
        for (let current = node; current !== measured.owner; current = current.parentElement) {
          path.unshift([...current.parentElement.children].indexOf(current));
        }
        return { ownerPath: [...(measured.ownerPath || []), ...path], ...control };
      });
  }
  function nativePaintFingerprint(nodes, text) {
    let hash = 2166136261;
    function append(source) {
      for (let index = 0; index < source.length; index++)
        hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
      hash = Math.imul(hash ^ 0, 16777619);
    }
    append(text);
    for (const { node, style, before, after, control } of nodes) {
      append(node.localName);
      for (const paint of [style, before, after]) {
        // Inactive pseudo boxes produce no native paint. A later generated
        // box changes this marker and receives the complete paint fingerprint.
        if (paint !== style && inactive(paint)) {
          append('inactive:' + value(paint, 'content'));
          continue;
        }
        append(
          [...nativeProperties, ...vectorProperties, 'content']
            .map((name) => value(paint, name))
            .join(';')
        );
      }
      if (node.namespaceURI === 'http://www.w3.org/2000/svg')
        for (const attribute of node.attributes)
          if (vectorAttributes.has(attribute.name)) append(attribute.name + ':' + attribute.value);
      if (node.localName === 'img')
        append([node.currentSrc, node.naturalWidth, node.naturalHeight].join(':'));
      if (control) append(control.selectedIndex + ':' + control.text);
    }
    return (hash >>> 0).toString(16);
  }
  function nativeBorderBoxes(rect, style, options) {
    const boxes = [];
    for (const side of ['top', 'right', 'bottom', 'left']) {
      const width = parseFloat(value(style, 'border-' + side + '-width')) || 0;
      if (!width || value(style, 'border-' + side + '-style') === 'none') continue;
      const box = { ...rect };
      if (side === 'top') box.bottom = rect.top + width;
      if (side === 'bottom') box.top = rect.bottom - width;
      if (side === 'left') box.right = rect.left + width;
      if (side === 'right') box.left = rect.right - width;
      box.left = Math.max(0, box.left);
      box.top = Math.max(0, box.top);
      box.right = Math.min(options.width, box.right);
      box.bottom = Math.min(options.height, box.bottom);
      if (box.right <= box.left || box.bottom <= box.top) continue;
      boxes.push(box);
    }
    return boxes;
  }
  function nativeBorderBounds(rect, style, options) {
    const boxes = nativeBorderBoxes(rect, style, options);
    if (!boxes.length) return null;
    return {
      left: Math.min(...boxes.map((box) => box.left)),
      top: Math.min(...boxes.map((box) => box.top)),
      right: Math.max(...boxes.map((box) => box.right)),
      bottom: Math.max(...boxes.map((box) => box.bottom)),
    };
  }
  function fieldAncestorSupported(style) {
    return (
      ['1', ''].includes(value(style, 'opacity')) &&
      ['auto', ''].includes(value(style, 'z-index')) &&
      ['overflow-x', 'overflow-y'].every((property) =>
        ['visible', ''].includes(value(style, property))
      )
    );
  }
  function nativeImageDimensions(measured, node, box) {
    const scale = Math.min(
      1,
      Math.max(
        (box.width * measured.dpr) / node.naturalWidth,
        (box.height * measured.dpr) / node.naturalHeight
      ),
      Math.sqrt(settings.maxPixels / (node.naturalWidth * node.naturalHeight))
    );
    if (!Number.isFinite(scale) || scale <= 0) throw new Error('Native image capacity');
    return {
      width: Math.max(1, Math.floor(node.naturalWidth * scale)),
      height: Math.max(1, Math.floor(node.naturalHeight * scale)),
    };
  }
  function nativeImageSource(measured, node, box) {
    const { document } = measured;
    const bitmap = document.createElement('canvas');
    try {
      const dimensions = nativeImageDimensions(measured, node, box);
      bitmap.width = dimensions.width;
      bitmap.height = dimensions.height;
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
  function nativeMarkup(measured, prefix = '') {
    const { nodes, rect, envelope } = measured;
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
      if (measured.skippedNodes?.has(node)) return '';
      const record = records.get(node);
      if (!record) throw new Error('Native texture tree changed');
      const { style, before, after, index, box } = record;
      const className = 'embedded-node-' + prefix + index;
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
          '.' +
            className +
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
        'class="' + className + '"',
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
        attributes.push('src="' + nativeImageSource(measured, node, box) + '"');
      const selected = record.control;
      const children = measured.decoration
        ? ''
        : selected
          ? '<option selected="selected">' + escapeXML(selected.text) + '</option>'
          : [...node.childNodes].map(render).join('');
      const tag = node.localName;
      if (['img', 'br', 'hr'].includes(tag)) return '<' + tag + ' ' + attributes.join(' ') + '/>';
      return '<' + tag + ' ' + attributes.join(' ') + '>' + children + '</' + tag + '>';
    }
    return { content: render(measured.owner), css };
  }
  function nativeSVG(measured, markup) {
    const { envelope, pixelWidth, pixelHeight } = measured;
    const { content, css } = markup;
    // Rounded pixel dimensions have independent X/Y sampling. The SVG must
    // use those same axes rather than introduce default centered letterboxing.
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      pixelWidth +
      '" height="' +
      pixelHeight +
      '" preserveAspectRatio="none" viewBox="0 0 ' +
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
  function serializeNative(measured) {
    return nativeSVG(measured, nativeMarkup(measured));
  }
  function serializeField(measured) {
    const fragments = measured.fieldOwners.map((owner) => {
      const fragment = nativeMarkup({ ...owner, dpr: measured.dpr }, owner.ownerIndex + '-');
      const placement = [
        'position:absolute',
        'overflow:hidden',
        'isolation:isolate',
        'left:' + (owner.envelope.left - measured.envelope.left) + 'px',
        'top:' + (owner.envelope.top - measured.envelope.top) + 'px',
        'width:' + owner.envelope.width + 'px',
        'height:' + owner.envelope.height + 'px',
      ].join(';');
      return {
        css: fragment.css,
        content: '<div style="' + escapeXML(placement) + '">' + fragment.content + '</div>',
      };
    });
    return nativeSVG(measured, {
      css: fragments.flatMap((fragment) => fragment.css),
      content: fragments.map((fragment) => fragment.content).join(''),
    });
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
    if (!images.length) return true;
    if (images.some((image) => typeof image.decode !== 'function')) return false;
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
  function measureNativeOwners(root, document, view, normalized, caps) {
    const clock = normalized.clock;
    // Each synchronous acquisition owns its cache; media decode finishes
    // before this snapshot, and later captures always read fresh native styles.
    normalized.styleCache = new WeakMap();
    normalized.rectCache = new WeakMap();
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
      'select',
      'span',
      'time',
      'strong',
      'small',
    ]);
    function fail(code, path, node, extra) {
      rejectNative({ ...normalized, ownerPath: path }, code, node.localName, extra);
      throw new Error('Native capture rejected');
    }
    function admit(item, path, node) {
      const increment = {
        owners: 1,
        descendants: item.descendants,
        textBytes: item.textBytes,
        layerPixels: item.pixelWidth * item.pixelHeight,
      };
      for (const name of Object.keys(usage)) {
        usage[name] += increment[name];
        if (usage[name] > caps[name])
          fail('shared-texture-capacity', path, node, {
            limit: name,
            usage: usage[name],
            maximum: caps[name],
          });
      }
      item.ownerIndex = measured.length;
      measured.push(item);
    }
    function admitFieldDecoration(node, path, style, box) {
      if (!normalized.fieldCapture) return;
      if (!fieldAncestorSupported(style)) fail('unsupported-field-ancestor', path, node);
      if (!nativeBorderBounds(box, style, normalized)) return;
      const decoration = inspectNative(node, path, document, view, normalized, caps, true);
      if (!decoration) fail('unsupported-field-decoration', path, node);
      admit(decoration, path, node);
    }
    function visit(node, path) {
      if (clock() > normalized.acquisitionDeadline) fail('acquisition-deadline', path, node);
      if (node.hasAttribute('hidden')) return;
      const style = nativeStyle(view, node, undefined, normalized);
      if (
        value(style, 'display') === 'none' ||
        value(style, 'opacity') === '0' ||
        fullyClipped(style)
      )
        return;
      if (value(style, 'display') === 'contents') {
        if (!nativeAncestorSupported(node, style)) fail('unsupported-native-ancestor', path, node);
        if (normalized.fieldCapture && !fieldAncestorSupported(style))
          fail('unsupported-field-ancestor', path, node);
        [...node.children].forEach((child, index) => visit(child, [...path, index]));
        return;
      }
      const native = nativeRect(node, normalized);
      if (!finiteRect(native)) return;
      const box = copyRect(native, normalized.offsetX, normalized.offsetY);
      if (
        box.right <= -64 ||
        box.left >= normalized.width + 64 ||
        box.bottom <= -64 ||
        box.top >= normalized.height + 64
      )
        return;
      // Structural ancestors are never serialized. Validate their inherited
      // layout effects here; complete resolved paint admission belongs to each
      // captured owner, avoiding a full style clone for every unpainted wrapper.
      if (!nativeAncestorSupported(node, style)) fail('unsupported-native-ancestor', path, node);
      const before = nativeStyle(view, node, '::before', normalized);
      const after = nativeStyle(view, node, '::after', normalized);
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
        if (normalized.fieldCapture && !['auto', ''].includes(value(style, 'z-index')))
          fail('unsupported-field-stacking', path, node);
        const item = inspectNative(node, path, document, view, normalized, caps);
        if (item === false) return;
        if (!item) fail('unsupported-visible-native-paint', path, node);
        admit(item, path, node);
        return;
      }
      admitFieldDecoration(node, path, style, box);
      [...node.children].forEach((child, index) => visit(child, [...path, index]));
    }
    visit(root, []);
    return { measured, usage };
  }
  function nativeTransientPixels(measured, ownerPixels) {
    const images = measured.flatMap((item) =>
      item.nodes
        .filter(({ node }) => node.localName === 'img')
        .map(({ node, box }) => {
          const dimensions = nativeImageDimensions(item, node, box);
          return dimensions.width * dimensions.height;
        })
    );
    // Known bitmap surfaces: owner canvases and decoded SVG images, each
    // inlined PNG decode, and the largest sequential PNG encoding canvas.
    return (
      ownerPixels * 2 + images.reduce((sum, pixels) => sum + pixels, 0) + Math.max(0, ...images)
    );
  }
  function nativeCaptureContext(root, options, onReject) {
    const document = root?.ownerDocument;
    const view = document?.defaultView;
    if (!root?.isConnected || !view || typeof view.Image !== 'function' || options.signal?.aborted)
      return rejectNative({ ...options, onReject }, 'native-capture-unavailable', root?.localName);
    const clock = () => view.performance?.now() ?? Date.now();
    const started = clock();
    const normalized = {
      ...options,
      offsetX: options.offsetX ?? 0,
      offsetY: options.offsetY ?? 0,
      dpr: options.dpr ?? view.devicePixelRatio ?? 1,
      clock,
      deadline: Math.min(
        started + Math.min(160, options.preparationMs ?? 160),
        options.deadline ?? Infinity
      ),
      onReject,
    };
    if (
      ![
        normalized.width,
        normalized.height,
        normalized.offsetX,
        normalized.offsetY,
        normalized.dpr,
        normalized.deadline,
      ].every(Number.isFinite) ||
      normalized.width <= 0 ||
      normalized.height <= 0 ||
      normalized.dpr <= 0 ||
      normalized.dpr > settings.maxDpr
    )
      return rejectNative(normalized, 'invalid-capture-geometry', root.localName);
    const caps = options.caps;
    if (
      !caps ||
      ['owners', 'descendants', 'textBytes', 'layerPixels'].some(
        (name) => !Number.isFinite(caps[name]) || caps[name] < 0
      )
    )
      return rejectNative(normalized, 'invalid-capture-capacity', root.localName);
    return { document, view, normalized };
  }
  async function captureAll(root, options = {}) {
    const assets = [];
    let controller;
    let externalAbort;
    let reported = false;
    const onReject = (detail) => {
      if (reported) return;
      reported = true;
      options.onReject?.(detail);
    };
    try {
      const context = nativeCaptureContext(root, options, onReject);
      if (!context) return null;
      const { document, view, normalized } = context;
      const clock = normalized.clock;
      const caps = options.caps;
      if (typeof view.AbortController !== 'function')
        return rejectNative(normalized, 'native-cancellation-unavailable', root.localName);
      controller = new view.AbortController();
      externalAbort = () => controller.abort();
      options.signal?.addEventListener('abort', externalAbort, { once: true });
      normalized.signal = controller.signal;
      if (options.signal?.aborted) controller.abort();
      const decoded = decodeNativeImages(root, view, normalized);
      if (!(typeof decoded === 'boolean' ? decoded : await decoded))
        return rejectNative(normalized, 'native-media-decode-failed', 'img');
      normalized.acquisitionDeadline = Math.min(
        normalized.deadline,
        clock() + Math.min(80, options.acquisitionMs ?? 80)
      );
      const { measured, usage } = measureNativeOwners(root, document, view, normalized, caps);
      const transientPixels = options.fieldCapture
        ? nativeTransientPixels(measured, usage.layerPixels)
        : usage.layerPixels;
      if (transientPixels > caps.layerPixels)
        return rejectNative(normalized, 'field-decode-capacity', root.localName, {
          limit: 'layerPixels',
          usage: transientPixels,
          maximum: caps.layerPixels,
        });
      const captured = await Promise.all(
        measured.map(async (item) => {
          const asset = await raster(item, normalized, serializeNative);
          if (asset) assets.push(asset);
          else controller.abort();
          return asset;
        })
      );
      const expired = clock() > normalized.deadline;
      if (expired) rejectNative(normalized, 'preparation-deadline', root.localName);
      if (captured.some((asset) => !asset) || normalized.signal.aborted || expired)
        throw new Error('Native texture capture failed');
      assets.sort((a, b) => a.ownerIndex - b.ownerIndex);
      assets.transientPixels = transientPixels;
      return assets;
    } catch {
      rejectNative({ ...options, onReject }, 'native-capture-failed', root?.localName);
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
  function canvasDisposer(canvas) {
    let disposed = false;
    return () => {
      if (disposed) return;
      disposed = true;
      canvas.width = 0;
      canvas.height = 0;
    };
  }
  function fieldEnvelope(assets) {
    const envelope = {
      left: Math.min(...assets.map((asset) => asset.envelope.left)),
      top: Math.min(...assets.map((asset) => asset.envelope.top)),
      right: Math.max(...assets.map((asset) => asset.envelope.right)),
      bottom: Math.max(...assets.map((asset) => asset.envelope.bottom)),
    };
    envelope.width = envelope.right - envelope.left;
    envelope.height = envelope.bottom - envelope.top;
    return envelope;
  }
  function fieldDimensions(envelope, dpr, available) {
    if (!finiteRect(envelope) || available < 1) return null;
    const sampling = Math.min(
      dpr,
      Math.sqrt(Math.min(settings.maxPixels, available) / (envelope.width * envelope.height))
    );
    const width = Math.max(1, Math.floor(envelope.width * sampling));
    const height = Math.max(1, Math.floor(envelope.height * sampling));
    return width * height <= available ? { width, height, dpr: sampling } : null;
  }
  function fieldAsset(root, assets, canvas, envelope, dpr) {
    return {
      canvas,
      owner: root,
      ownerPath: [],
      ownerIndex: 0,
      rect: envelope,
      envelope,
      lines: [],
      dpr,
      pixelCount: canvas.width * canvas.height,
      descendants: assets.reduce((sum, asset) => sum + asset.descendants, 0),
      textBytes: assets.reduce((sum, asset) => sum + asset.textBytes, 0),
      sourceOwners: assets
        .filter((asset) => !asset.decoration)
        .map(
          ({
            ownerPath,
            rect,
            lines,
            envelope: sourceEnvelope,
            textContent,
            controls,
            paintFingerprint,
          }) => ({
            ownerPath,
            rect,
            lines,
            envelope: sourceEnvelope,
            textContent,
            controls,
            paintFingerprint,
          })
        ),
      decorations: assets
        .filter((asset) => asset.decoration)
        .map(({ ownerPath, rect, envelope: sourceEnvelope, paintFingerprint }) => ({
          ownerPath,
          rect,
          envelope: sourceEnvelope,
          paintFingerprint,
        })),
      dispose: canvasDisposer(canvas),
    };
  }
  function sameNativeRect(first, second) {
    return (
      !!second &&
      ['left', 'top', 'width', 'height'].every((key) => Math.abs(first[key] - second[key]) <= 0.75)
    );
  }
  function sameNativeSource(current, previous) {
    return (
      JSON.stringify(current.ownerPath) === JSON.stringify(previous.ownerPath) &&
      current.text === previous.textContent &&
      current.paintFingerprint === previous.paintFingerprint &&
      sameNativeRect(current.rect, previous.rect) &&
      sameNativeRect(current.envelope, previous.envelope) &&
      current.lines.length === previous.lines.length &&
      current.lines.every((line, index) => sameNativeRect(line, previous.lines[index])) &&
      JSON.stringify(nativeControls(current)) === JSON.stringify(previous.controls || [])
    );
  }
  function matchesField(root, sourceOwners, options = {}) {
    try {
      const document = root?.ownerDocument;
      const view = document?.defaultView;
      if (!root?.isConnected || !view || !Array.isArray(sourceOwners) || !options.caps)
        return false;
      const clock = () => view.performance?.now() ?? Date.now();
      const deadline = clock() + Math.min(80, options.acquisitionMs ?? 80);
      const normalized = {
        ...options,
        offsetX: options.offsetX ?? 0,
        offsetY: options.offsetY ?? 0,
        dpr: options.dpr ?? view.devicePixelRatio ?? 1,
        fieldCapture: true,
        clock,
        deadline,
        acquisitionDeadline: deadline,
      };
      if (![options.width, options.height, normalized.dpr, deadline].every(Number.isFinite))
        return false;
      const { measured } = measureNativeOwners(root, document, view, normalized, options.caps);
      const semantic = measured.filter((item) => !item.decoration);
      if (
        semantic.length !== sourceOwners.length ||
        !semantic.every((item, index) => sameNativeSource(item, sourceOwners[index]))
      )
        return false;
      const decorations = measured.filter((item) => item.decoration);
      if (
        options.decorations &&
        (decorations.length !== options.decorations.length ||
          !decorations.every((item, index) => {
            const previous = options.decorations[index];
            return (
              JSON.stringify(item.ownerPath) === JSON.stringify(previous.ownerPath) &&
              item.paintFingerprint === previous.paintFingerprint &&
              sameNativeRect(item.rect, previous.rect) &&
              sameNativeRect(item.envelope, previous.envelope)
            );
          }))
      )
        return false;
      return clock() <= deadline;
    } catch {
      return false;
    }
  }
  function fieldSource(owner) {
    return {
      ownerPath: owner.ownerPath,
      rect: owner.rect,
      lines: owner.lines,
      envelope: owner.envelope,
      textContent: owner.text,
      controls: nativeControls(owner),
      paintFingerprint: owner.paintFingerprint,
      decoration: owner.decoration,
      descendants: owner.descendants,
      textBytes: owner.textBytes,
    };
  }
  function fieldPixelBox(box, measured) {
    const scaleX = measured.pixelWidth / measured.envelope.width;
    const scaleY = measured.pixelHeight / measured.envelope.height;
    return {
      left: Math.max(0, Math.floor((box.left - measured.envelope.left) * scaleX)),
      top: Math.max(0, Math.floor((box.top - measured.envelope.top) * scaleY)),
      right: Math.min(
        measured.pixelWidth,
        Math.ceil((box.right - measured.envelope.left) * scaleX)
      ),
      bottom: Math.min(
        measured.pixelHeight,
        Math.ceil((box.bottom - measured.envelope.top) * scaleY)
      ),
    };
  }
  function subtractFieldBox(box, cover) {
    const left = Math.max(box.left, cover.left);
    const top = Math.max(box.top, cover.top);
    const right = Math.min(box.right, cover.right);
    const bottom = Math.min(box.bottom, cover.bottom);
    if (left >= right || top >= bottom) return [box];
    return [
      { ...box, bottom: top },
      { ...box, top: bottom },
      { left: box.left, right: left, top, bottom },
      { left: right, right: box.right, top, bottom },
    ].filter((part) => part.left < part.right && part.top < part.bottom);
  }
  function exclusiveFieldBoxes(owner, measured, options) {
    let boxes = owner.paintRects.map((box) => fieldPixelBox(box, measured));
    for (const other of measured.fieldOwners) {
      if (other === owner) continue;
      for (const cover of other.paintRects) {
        if (options.clock() > options.deadline) return null;
        // The shared SVG is drawn at its exact pixel dimensions, and every
        // owner is clipped to its native envelope. Outward floor/ceil already
        // excludes every pixel a peer can touch, including a fractional edge.
        // An extra halo would erase adjacent one-pixel native border strips.
        const pixels = fieldPixelBox(cover, measured);
        boxes = boxes.flatMap((box) => subtractFieldBox(box, pixels));
      }
    }
    return boxes;
  }
  function fieldBoxHasInk(box, pixels, width) {
    for (let y = box.top; y < box.bottom; y++)
      for (let x = box.left; x < box.right; x++)
        if (pixels[(y * width + x) * 4 + 3] > 0) return true;
    return false;
  }
  function ambiguousDecoration(owner, measured) {
    if (!owner.decoration) return false;
    const others = measured.fieldOwners.filter((other) => other !== owner);
    function overlaps(first, second) {
      return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top
      );
    }
    // Isolation can resolve rounding at adjoining borders. It cannot prove
    // which native owner contributed ink inside genuinely overlapping paint.
    if (
      others.some((other) =>
        owner.paintRects.some((rect) => other.paintRects.some((cover) => overlaps(rect, cover)))
      )
    )
      return false;
    return others.some(
      (other) =>
        other.decoration &&
        owner.paintRects.some((rect) => {
          const box = fieldPixelBox(rect, measured);
          return other.paintRects.some((cover) => overlaps(box, fieldPixelBox(cover, measured)));
        })
    );
  }
  async function fieldHasNativeInk(context, measured, options) {
    if (options.signal?.aborted || options.clock() > options.deadline) {
      rejectNative(options, 'preparation-deadline', measured.owner.localName);
      return false;
    }
    const pixels = context.getImageData(0, 0, measured.pixelWidth, measured.pixelHeight).data;
    for (const owner of measured.fieldOwners) {
      const boxes = exclusiveFieldBoxes(owner, measured, options);
      if (!boxes || options.signal?.aborted || options.clock() > options.deadline) {
        rejectNative(options, 'preparation-deadline', measured.owner.localName);
        return false;
      }
      if (!boxes.some((box) => fieldBoxHasInk(box, pixels, measured.pixelWidth))) {
        // Fractional adjacent borders may legitimately share one raster pixel.
        // Prove that owner's native paint in isolation instead of borrowing
        // its neighbour's alpha. Both the composite and isolated paint need ink.
        if (
          ambiguousDecoration(owner, measured) &&
          owner.paintRects.some((rect) =>
            fieldBoxHasInk(fieldPixelBox(rect, measured), pixels, measured.pixelWidth)
          )
        ) {
          const proof = await raster(owner, options, serializeNative);
          if (proof) {
            proof.dispose();
            if (!options.signal?.aborted && options.clock() <= options.deadline) continue;
            rejectNative(options, 'preparation-deadline', measured.owner.localName);
            return false;
          }
        }
        rejectNative(
          { ...options, ownerPath: owner.ownerPath },
          'native-owner-raster-blank',
          owner.owner.localName
        );
        return false;
      }
    }
    return true;
  }
  async function captureField(root, options = {}) {
    let reported = false;
    const onReject = (detail) => {
      if (reported) return;
      reported = true;
      options.onReject?.(detail);
    };
    let capture;
    let complete = false;
    const fieldOptions = { ...options, onReject, fieldCapture: true };
    try {
      const retained = options.retainedPixels ?? 0;
      if (!Number.isFinite(retained) || retained < 0)
        return rejectNative(fieldOptions, 'invalid-field-retained-capacity', root?.localName);
      fieldOptions.caps = { ...options.caps, layerPixels: options.caps?.layerPixels - retained };
      const context = nativeCaptureContext(root, fieldOptions, onReject);
      if (!context) return null;
      const { document, view, normalized } = context;
      if (typeof view.AbortController !== 'function')
        return rejectNative(normalized, 'native-cancellation-unavailable', root.localName);
      const decoded = decodeNativeImages(root, view, normalized);
      if (!(typeof decoded === 'boolean' ? decoded : await decoded))
        return rejectNative(normalized, 'native-media-decode-failed', 'img');
      normalized.acquisitionDeadline = Math.min(
        normalized.deadline,
        normalized.clock() + Math.min(80, options.acquisitionMs ?? 80)
      );
      const { measured } = measureNativeOwners(root, document, view, normalized, normalized.caps);
      if (!measured.length) return rejectNative(normalized, 'native-field-empty', root.localName);
      const envelope = fieldEnvelope(measured);
      const dimensions = fieldDimensions(envelope, normalized.dpr, settings.maxPixels);
      if (!dimensions) return rejectNative(normalized, 'native-texture-capacity', root.localName);
      const fieldOwners = measured.map((owner) => ({ ...owner, dpr: dimensions.dpr }));
      const pixelCount = dimensions.width * dimensions.height;
      // One SVG decode, its destination canvas, and the bounded ownership-alpha
      // readback coexist. PNG decode and sequential encoding surfaces remain charged.
      const borderProofPixels = Math.max(
        0,
        ...fieldOwners
          .filter((owner) => owner.decoration)
          .map((owner) => owner.pixelWidth * owner.pixelHeight * 3)
      );
      const peak = nativeTransientPixels(fieldOwners, pixelCount) + pixelCount + borderProofPixels;
      if (peak > normalized.caps.layerPixels)
        return rejectNative(normalized, 'field-peak-capacity', root.localName, {
          limit: 'layerPixels',
          usage: retained + peak,
          maximum: options.caps.layerPixels,
        });
      const measuredField = {
        document,
        view,
        owner: root,
        ownerPath: [],
        ownerIndex: 0,
        rect: envelope,
        envelope,
        lines: [],
        text: '',
        dpr: dimensions.dpr,
        pixelWidth: dimensions.width,
        pixelHeight: dimensions.height,
        fieldOwners,
      };
      capture = await raster(measuredField, normalized, serializeField);
      if (!capture) return null;
      if (normalized.signal?.aborted || normalized.clock() > normalized.deadline)
        return rejectNative(normalized, 'preparation-deadline', root.localName);
      const asset = fieldAsset(
        root,
        measured.map(fieldSource),
        capture.canvas,
        envelope,
        dimensions.dpr
      );
      complete = true;
      return asset;
    } catch {
      return rejectNative(fieldOptions, 'native-field-composite-failed', root?.localName);
    } finally {
      if (!complete) capture?.dispose();
    }
  }
  function raster(measured, options, serializer) {
    if (!measured || options.signal?.aborted) return Promise.resolve(null);
    let canvas;
    let context;
    let image;
    let source;
    let proofController;
    const nativeOptions = { ...options, ownerPath: measured.ownerPath };
    try {
      canvas = measured.document.createElement('canvas');
      canvas.width = measured.pixelWidth;
      canvas.height = measured.pixelHeight;
      context = canvas.getContext('2d');
      source = context && serializer(measured, context);
      if (source) image = new measured.view.Image();
      if (source && measured.fieldOwners) proofController = new measured.view.AbortController();
    } catch {
      source = null;
    }
    if (!source) {
      rejectNative(
        nativeOptions,
        context ? 'raster-serialization-failed' : 'native-canvas-unavailable',
        measured.owner.localName
      );
      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      let finished = false;
      let timeout;
      function finish(success, code) {
        if (finished) return;
        finished = true;
        measured.view.clearTimeout(timeout);
        options.signal?.removeEventListener('abort', abort);
        image.onload = null;
        image.onerror = null;
        image.removeAttribute?.('src');
        if (!success) {
          rejectNative(nativeOptions, code || 'native-raster-failed', measured.owner.localName);
          // A failed field must cancel its pending isolated proof before the
          // caller can begin another capture against the same pixel capacity.
          proofController?.abort();
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
          textContent: measured.text,
          paintFingerprint: measured.paintFingerprint,
          controls: nativeControls(measured),
          decoration: !!measured.decoration,
          dispose() {
            if (disposed) return;
            disposed = true;
            canvas.width = 0;
            canvas.height = 0;
          },
        });
      }
      function abort() {
        finish(false, options.signal?.aborted ? 'capture-aborted' : 'raster-decode-failed');
      }
      image.onload = async () => {
        if (finished) return;
        try {
          if (!image.naturalWidth || !image.naturalHeight)
            return finish(false, 'native-raster-empty');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          if (measured.fieldOwners)
            return finish(
              await fieldHasNativeInk(context, measured, {
                ...options,
                signal: proofController.signal,
              }),
              'native-raster-blank'
            );
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
          finish(
            pixels.some((alpha, index) => index % 4 === 3 && alpha > 0),
            'native-raster-blank'
          );
        } catch {
          finish(false, 'native-raster-readback-failed');
        }
      };
      image.onerror = abort;
      options.signal?.addEventListener('abort', abort, { once: true });
      const timeoutMs =
        options.deadline === undefined
          ? settings.decodeTimeoutMs
          : Math.min(settings.decodeTimeoutMs, options.deadline - options.clock());
      if (timeoutMs <= 0) return finish(false, 'preparation-deadline');
      timeout = measured.view.setTimeout(() => finish(false, 'preparation-deadline'), timeoutMs);
      if (options.signal?.aborted) return abort();
      try {
        image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      } catch {
        abort();
      }
    });
  }
  return { capture, captureAll, captureField, matchesField, settings };
};
