const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { compile, loadArticle, enumerateArticles } = require('../tools/publishing/article.cjs');
const {
  semanticDigest,
  adaptationDigest,
  blockDigest,
} = require('../tools/publishing/semantic.cjs');
const { renderKit, verifyKit } = require('../tools/publishing/kit.cjs');
const { appendPublicationEvent, validateEvent } = require('../tools/publishing/events.cjs');
const { execFileSync } = require('node:child_process');

const repo = path.resolve(__dirname, '..');
const python =
  process.env.SITE_MEDIA_PYTHON ||
  (fs.existsSync(path.join(repo, 'tools/quality/toolchain/venv/bin/python'))
    ? path.join(repo, 'tools/quality/toolchain/venv/bin/python')
    : 'python3');
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==',
  'base64'
);

function write(root, relative, bytes) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), bytes);
}

function json(root, relative, value) {
  write(root, relative, JSON.stringify(value, null, 2) + '\n');
}

function fixture(
  root,
  id = 'first-profile',
  {
    adaptation = false,
    figure = true,
    heroOnly = false,
    image = png,
    width = 1,
    height = 1,
    cover = figure,
    caption = 'Original test figure.',
    credit = 'Test author.',
  } = {}
) {
  const directory = `site/publications/${id}`;
  const manuscript =
    '# Test article\n\n## Source [link][ref]\n\nWhole article.\n\n' +
    (figure ? '![One pixel](asset:example)\n\n' : '') +
    '| Parameter | Value |\n| --- | --- |\n| A | `a` and b \\| c |\n\n' +
    '[ref]: https://example.com/research\n';
  write(root, `${directory}/manuscript.en.md`, manuscript);
  const assets =
    figure || heroOnly
      ? [
          {
            id: 'example',
            path: `site/assets/publications/${id}/example.png`,
            sha256: hash(image),
            width,
            height,
            alt: 'One pixel',
            caption,
            credit,
            reviewNote: 'Administrative test note; rights decision pending.',
          },
        ]
      : [];
  if (assets.length) {
    write(root, assets[0].path, image);
  }
  const metadata = {
    schema: 1,
    id,
    slug: id,
    title: 'Test article',
    summary: 'A precise summary.',
    authors: [{ name: 'Test author' }],
    language: 'en',
    topic: 'delivery',
    owner: { repository: 'oborskyivitalii/oborskyivitalii', path: directory },
    status: 'draft',
    source: 'manuscript.en.md',
    edition: 'first-edition',
    rights: {
      status: 'review-pending',
      notice: 'Author review pending.',
      references: [],
    },
    profile: 'profile.json',
    references: [],
    assets,
    platforms: {
      linkedin: adaptation
        ? {
            mode: 'adaptation',
            source: 'adaptations/linkedin.en.md',
            edition: 'linkedin-first',
          }
        : { mode: 'equivalent-rendition' },
      medium: { mode: 'equivalent-rendition' },
    },
    canonical: null,
  };
  json(root, `${directory}/publication.json`, metadata);
  const edition = {
    schema: 1,
    id: 'first-edition',
    articleId: id,
    language: 'en',
    kind: 'full-article',
    source: {
      path: 'manuscript.en.md',
      sha256: hash(manuscript),
      commit: null,
      blob: null,
    },
    owner: 'site',
    derivation: null,
    rights: 'review-pending',
  };
  edition.semanticSha256 = semanticDigest(metadata, edition.source);
  json(root, `${directory}/editions/first-edition.json`, edition);
  const launch = 'An authored launch post for the selected profile.\n';
  write(root, `${directory}/launch-post.en.md`, launch);
  const formats = figure ? ['html', 'md', 'txt', 'copy-ready'] : ['txt'];
  const role = assets.length
    ? { id: 'example' }
    : { omitReason: 'This authored plain text profile needs no image.' };
  json(root, `${directory}/profile.json`, {
    schema: 1,
    id: `${id}-profile`,
    platforms: {
      linkedin: { formats, relationship: metadata.platforms.linkedin.mode },
      medium: { formats, relationship: 'equivalent-rendition' },
    },
    launch: { source: 'launch-post.en.md', sha256: hash(launch) },
    seo: {
      title: 'Authored distribution title',
      summary: 'Authored distribution summary.',
    },
    assets: {
      cover: cover ? role : { omitReason: 'No dedicated cover selected for this edition.' },
      hero: role,
    },
    limits: {},
  });
  if (adaptation) {
    const adapted =
      '# A distinct argument\n\nAn authored shorter adaptation. [Source](https://example.com/research)\n';
    write(root, `${directory}/adaptations/linkedin.en.md`, adapted);
    const adaptationEdition = {
      ...edition,
      id: 'linkedin-first',
      kind: 'adaptation',
      source: {
        ...edition.source,
        path: 'adaptations/linkedin.en.md',
        sha256: hash(adapted),
      },
      derivation: {
        relationship: 'adaptation',
        baseEdition: edition.id,
        baseSourceSha256: edition.source.sha256,
        baseSemanticSha256: edition.semanticSha256,
      },
    };
    adaptationEdition.semanticSha256 = adaptationDigest(
      metadata,
      adaptationEdition.source,
      edition,
      'linkedin'
    );
    json(root, `${directory}/editions/linkedin-first.json`, adaptationEdition);
  }
  return { directory, metadata, edition };
}

async function withFixture(callback) {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'article-publishing-test-'));
  try {
    for (const relative of [
      'tools/publishing/toolchain/package-lock.json',
      'tools/publishing/article.cjs',
      'tools/publishing/ast.mjs',
      'tools/publishing/kit.cjs',
      'tools/publishing/platform-images.cjs',
      'tools/publishing/platform-images.py',
      'tools/publishing/web-media.py',
      'tools/quality/toolchain/requirements.txt',
      'tools/publishing/render.cjs',
      'tools/publishing/safety.cjs',
      'tools/publishing/provenance.cjs',
      'tools/publishing/history.cjs',
      'tools/publishing/events.cjs',
      'tools/publishing/site-event.cjs',
      'tools/publishing/semantic.cjs',
      'tools/publishing/profile.cjs',
      'tools/publishing/text.cjs',
      'tools/publishing/presentation.cjs',
      'site/publications/policy.json',
      'site/templates/articles/print.html',
      'site/engine/article-print.css',
    ]) {
      write(root, relative, fs.readFileSync(path.join(repo, relative)));
    }
    await callback(root);
  } finally {
    await fsp.rm(root, { recursive: true, force: true });
  }
}

function rasterPng({ width, height, depth, color, rows, key, palette, icc, interlace = 0 }) {
  return execFileSync(
    python,
    [
      '-c',
      [
        'import base64,json,struct,sys,zlib',
        'v=json.load(sys.stdin)',
        'def chunk(kind, data):',
        ' return struct.pack(">I",len(data))+kind+data+struct.pack(">I",zlib.crc32(kind+data))',
        'header=struct.pack(">IIBBBBB",v["width"],v["height"],v["depth"],v["color"],0,0,v["interlace"])',
        'key=chunk(b"tRNS",struct.pack(">"+"H"*len(v["key"]),*v["key"])) if v.get("key") else b""',
        'palette=chunk(b"PLTE",bytes(v["palette"])) if v.get("palette") else b""',
        'icc=chunk(b"iCCP",b"gray"+bytes(2)+zlib.compress(base64.b64decode(v["icc"]))) if v.get("icc") else b""',
        'data=zlib.compress(base64.b64decode(v["rows"]))',
        'sys.stdout.buffer.write(b"\\x89PNG\\r\\n\\x1a\\n"+chunk(b"IHDR",header)+icc+palette+key+chunk(b"IDAT",data[:3])+chunk(b"IDAT",data[3:])+chunk(b"IEND",b""))',
      ].join('\n'),
    ],
    {
      input: JSON.stringify({
        width,
        height,
        depth,
        color,
        key,
        palette,
        icc,
        interlace,
        rows: rows.toString('base64'),
      }),
    }
  );
}

test('platform derivatives preserve color, contrast and transparency through fitting', async () => {
  await withFixture(async (root) => {
    const generate = (program) =>
      execFileSync(python, [
        '-c',
        'import struct,sys; from PIL import Image,PngImagePlugin; ' + program,
      ]);
    const cases = [
      {
        id: 'linear-art',
        width: 80,
        height: 40,
        source: generate(
          'meta=PngImagePlugin.PngInfo(); meta.add(b"gAMA",struct.pack(">I",100000)); meta.add(b"cHRM",struct.pack(">8I",31270,32900,64000,33000,30000,60000,15000,6000)); Image.new("RGB",(80,40),(64,128,192)).save(sys.stdout.buffer,"PNG",pnginfo=meta)'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle:
          'assert all(abs(a-b)<=3 for a,b in zip(im.getpixel((im.width//2,im.height//2)),(137,188,225)))',
      },
      {
        id: 'white-ink',
        width: 80,
        height: 40,
        source: generate(
          'im=Image.new("RGBA",(80,40),(255,255,255,0)); im.paste((255,255,255,80),(25,10,55,30)); im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle: 'assert im.getpixel((im.width//2,im.height//2))[0]-im.getpixel((0,0))[0]>35',
      },
      {
        id: 'faint-ink-with-fringe',
        width: 160,
        height: 60,
        source: generate(
          'im=Image.new("RGBA",(160,60)); im.paste((0,0,0,15),(20,20,140,21)); im.putpixel((0,0),(255,255,255,1)); im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle:
          'y=437 if im.width==1920 else 20; assert im.getpixel((im.width//2,y))[0]<=im.getpixel((0,0))[0]-5',
      },
      {
        id: 'isolated-fringe',
        width: 160,
        height: 60,
        source: generate(
          'im=Image.new("RGBA",(160,60)); im.paste((0,0,0,255),(20,25,140,40)); [im.putpixel((i*15,0),(v,v,v,1)) for i,v in enumerate((255,118,32,0))]; im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle:
          'assert im.getpixel((im.width//2,0))[0]>245; assert im.getpixel((im.width//2,im.height//2))[0]<10',
      },
      {
        id: 'faint-stroke',
        width: 160,
        height: 60,
        source: generate(
          'im=Image.new("RGBA",(160,60)); im.paste((255,255,255,15),(20,20,140,21)); im.paste((0,0,0,255),(20,35,140,43)); im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle:
          'y=437 if im.width==1920 else 20; assert im.getpixel((im.width//2,y))[0]-im.getpixel((0,0))[0]>=5',
      },
      {
        id: 'pale-and-faint',
        width: 120,
        height: 60,
        source: generate(
          'im=Image.new("RGBA",(120,60)); im.paste((255,255,220,255),(25,10,95,29)); im.paste((255,255,255,48),(25,32,95,50)); im.paste((0,0,0,255),(15,18,22,46)); im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle:
          'background=im.getpixel((0,0))[0]; assert background<210; assert im.getpixel((im.width//2,im.height*7//10))[0]-background>=14',
      },
      {
        id: 'mixed-light-ink',
        width: 120,
        height: 60,
        source: generate(
          'im=Image.new("RGBA",(120,60)); im.paste((118,118,118,255),(20,20,100,40)); im.paste((255,255,255,255),(10,8,19,16)); im.save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/cover.jpg', 'medium/featured.jpg'],
        oracle: 'assert im.getpixel((im.width//2,im.height//2))[0]-im.getpixel((0,0))[0]>45',
      },
      {
        id: 'keyed-gray',
        width: 3840,
        height: 20,
        cover: false,
        source: generate(
          'row=struct.pack("<HH",0,65535)*1920; Image.frombytes("I;16",(3840,20),row*20).save(sys.stdout.buffer,"PNG",transparency=0)'
        ),
        outputs: ['linkedin/inline/example.png', 'medium/inline/example.png'],
        oracle:
          'gray,alpha=im.split(); assert 0<alpha.getextrema()[0]<=alpha.getextrema()[1]<255; assert gray.getextrema()[0]>=250',
      },
      {
        id: 'bilevel-ink',
        width: 3840,
        height: 20,
        cover: false,
        source: generate(
          'Image.frombytes("1",(3840,20),bytes([85])*(3840*20//8)).save(sys.stdout.buffer,"PNG")'
        ),
        outputs: ['linkedin/inline/example.png', 'medium/inline/example.png'],
        oracle: 'assert im.mode=="L"; assert 90<=im.getpixel((im.width//2,im.height//2))<=165',
      },
    ];
    // Valid grayscale ICC fixture generated with LittleCMS's grayscale profile API.
    const grayIcc =
      'AAABXGxjbXMEQAAAbW50ckdSQVlYWVogB+oACwAMABMAFwALYWNzcEFQUEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1sY21zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEZGVzYwAAALQAAAA2Y3BydAAAAOwAAABMd3RwdAAAATgAAAAUa1RSQwAAAUwAAAAQbWx1YwAAAAAAAAABAAAADGVuVVMAAAAaAAAAHABnAHIAYQB5ACAAYgB1AGkAbAB0AC0AaQBuAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADAAAAAcAE4AbwAgAGMAbwBwAHkAcgBpAGcAaAB0ACwAIAB1AHMAZQAgAGYAcgBlAGUAbAB5WFlaIAAAAAAAAPbWAAEAAAAA0y1wYXJhAAAAAAAAAAAAAjMz';
    for (const depth of [2, 4]) {
      const row = Buffer.concat([
        Buffer.from([0]),
        Buffer.alloc(240 * depth, depth === 2 ? 0x55 : 0x44),
        Buffer.alloc(240 * depth, 255),
      ]);
      cases.push({
        id: `packed-gray-${depth}`,
        width: 3840,
        height: 20,
        cover: false,
        source: rasterPng({
          width: 3840,
          height: 20,
          depth,
          color: 0,
          key: [depth === 2 ? 0x101 : 0x104],
          icc: grayIcc,
          rows: Buffer.concat(Array(20).fill(row)),
        }),
        outputs: ['linkedin/inline/example.png', 'medium/inline/example.png'],
        oracle:
          'import io; from PIL import ImageCms; assert im.mode=="LA"; assert ImageCms.ImageCmsProfile(io.BytesIO(im.info["icc_profile"])).profile.xcolor_space.strip()=="GRAY"; assert im.getpixel((im.width//4,im.height//2))[1]==0; assert im.getpixel((im.width*3//4,im.height//2))[1]==255',
      });
    }
    for (const { id, width, height, cover, source, outputs, oracle } of cases) {
      fixture(root, id, { image: source, width, height, ...(cover === false ? { cover } : {}) });
      const kit = await renderKit(root, id);
      await verifyKit(kit.directory);
      assert.match(
        fs.readFileSync(path.join(kit.directory, 'linkedin.txt'), 'utf8'),
        /upload linkedin\/inline\/example\.png/
      );
      assert.match(
        fs.readFileSync(path.join(kit.directory, 'medium.md'), 'utf8'),
        /medium\/(featured\.jpg|inline\/example\.png)/
      );
      for (const file of outputs) {
        execFileSync(python, [
          '-c',
          'import sys; from PIL import Image; im=Image.open(sys.argv[1]); im.load(); ' + oracle,
          path.join(kit.directory, file),
        ]);
      }
    }
  });
});

test('platform verification rejects incomplete PNG while generic hero and selected handoff stay usable', async () => {
  await withFixture(async (root) => {
    const corruptIdat = execFileSync(python, [
      '-c',
      [
        'import io,struct,sys,zlib',
        'from PIL import Image',
        'png=io.BytesIO(); Image.new("RGB",(1,1),(250,8,17)).save(png,"PNG")',
        'raw=png.getvalue(); out=io.BytesIO(); out.write(raw[:8]); offset=8',
        'while offset<len(raw):',
        ' length,kind=struct.unpack_from(">I4s",raw,offset)',
        ' payload=raw[offset+8:offset+8+length]',
        ' if kind==b"IDAT": payload=payload[:-4]',
        ' out.write(struct.pack(">I",len(payload))+kind+payload+struct.pack(">I",zlib.crc32(kind+payload)))',
        ' offset+=length+12',
        'sys.stdout.buffer.write(out.getvalue())',
      ].join('\n'),
    ]);
    for (const [id, image] of [
      ['missing-iend-crc', png.subarray(0, -4)],
      ['missing-adler', corruptIdat],
      ['bad-iend-crc', Buffer.concat([png.subarray(0, -1), Buffer.from([0])])],
      ['trailing-png-data', Buffer.concat([png, Buffer.from([0])])],
    ]) {
      fixture(root, id, { image });
      await assert.rejects(
        renderKit(root, id),
        /linkedin cover example: PNG (must end with a complete IEND|IDAT must contain a complete scanline stream)/
      );
      assert.deepEqual(fs.readdirSync(path.join(root, 'dist/publications', id)), []);
    }

    const invalidIndex = rasterPng({
      width: 1,
      height: 1,
      depth: 8,
      color: 3,
      palette: [255, 0, 0],
      rows: Buffer.from([0, 1]),
    });
    fixture(root, 'invalid-palette-index', { image: invalidIndex, cover: false });
    await assert.rejects(
      renderKit(root, 'invalid-palette-index'),
      /linkedin inline example: PNG references a missing palette entry/
    );

    const keyedRgb = rasterPng({
      width: 2,
      height: 1,
      depth: 16,
      color: 2,
      key: [0x123, 0x4567, 0x89ab],
      rows: Buffer.from('000123456789ab000000000000', 'hex'),
    });
    fixture(root, 'rgb16-key-cover', { image: keyedRgb, width: 2, height: 1 });
    await assert.rejects(
      renderKit(root, 'rgb16-key-cover'),
      /linkedin cover example: Convert 16-bit RGB keyed transparency to explicit alpha/
    );
    fixture(root, 'rgb16-key-inline', { image: keyedRgb, width: 2, height: 1, cover: false });
    const untouched = await renderKit(root, 'rgb16-key-inline');
    assert.deepEqual(
      fs.readFileSync(path.join(untouched.directory, 'linkedin/inline/example.png')),
      keyedRgb
    );

    const adam7 = rasterPng({
      width: 5,
      height: 3,
      depth: 8,
      color: 0,
      interlace: 1,
      rows: Buffer.concat(
        [2, 2, 2, 4, 3, 3, 6].map((length) => Buffer.from([0, ...Array(length - 1).fill(9)]))
      ),
    });
    fixture(root, 'adam7-inline', { image: adam7, width: 5, height: 3, cover: false });
    await renderKit(root, 'adam7-inline');

    fixture(root, 'valid-inline', { cover: false });
    const valid = await renderKit(root, 'valid-inline');
    const changed = path.join(root, 'damaged-upload');
    fs.cpSync(valid.directory, changed, { recursive: true });
    const manifest = JSON.parse(fs.readFileSync(path.join(changed, 'manifest.json')));
    const inventoryPath = 'linkedin-upload-kit.json';
    const inventory = JSON.parse(fs.readFileSync(path.join(changed, inventoryPath)));
    const upload = inventory.images[0];
    const broken = corruptIdat;
    upload.sha256 = hash(broken);
    upload.bytes = broken.length;
    write(changed, upload.path, broken);
    const inventoryBytes = JSON.stringify(inventory, null, 2) + '\n';
    write(changed, inventoryPath, inventoryBytes);
    Object.assign(
      manifest.outputs.find((entry) => entry.path === upload.path),
      { sha256: upload.sha256, bytes: upload.bytes }
    );
    Object.assign(
      manifest.outputs.find((entry) => entry.path === inventoryPath),
      { sha256: hash(inventoryBytes), bytes: Buffer.byteLength(inventoryBytes) }
    );
    manifest.transformations.find((item) => item.platform === 'linkedin').uploadInventorySha256 =
      hash(inventoryBytes);
    delete manifest.artifactId;
    manifest.artifactId = hash(JSON.stringify(manifest));
    json(changed, 'manifest.json', manifest);
    await assert.rejects(
      verifyKit(changed),
      /linkedin\/inline\/example.png: PNG IDAT must contain a complete scanline stream/
    );

    const animated = execFileSync(python, [
      '-c',
      'import sys; from PIL import Image; Image.new("RGBA",(16,16),"red").save(sys.stdout.buffer,"PNG",save_all=True,append_images=[Image.new("RGBA",(16,16),"blue")],duration=100,loop=0)',
    ]);
    const { directory } = fixture(root, 'generic-hero', {
      figure: false,
      heroOnly: true,
      image: animated,
      width: 16,
      height: 16,
    });
    const profilePath = directory + '/profile.json';
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath)));
    profile.platforms.medium.formats = ['html'];
    json(root, profilePath, profile);
    const generic = await renderKit(root, 'generic-hero');
    assert.deepEqual(fs.readFileSync(path.join(generic.directory, 'hero.png')), animated);
    const handoff = fs.readFileSync(path.join(generic.directory, 'INSTRUCTIONS.md'), 'utf8');
    assert.match(handoff, /Open `linkedin\.txt`/);
    assert.match(handoff, /Open `medium\.html`/);
    assert.doesNotMatch(handoff, /copy-ready|<platform>/);
    await verifyKit(generic.directory);
  });
});

test('native upload contracts fit both dimensions and bytes and keep print source intact', async () => {
  await withFixture(async (root) => {
    const generate = (program) =>
      execFileSync(python, ['-c', 'import random,sys; from PIL import Image; ' + program], {
        maxBuffer: 5_000_000,
      });
    const wide = generate(
      'im=Image.new("RGB",(4000,160),"red"); im.paste((0,0,255),(2000,0,4000,160)); im.save(sys.stdout.buffer,format="PNG")'
    );
    fixture(root, 'wide-image', {
      image: wide,
      width: 4000,
      height: 160,
      caption: 'Original $& test figure.',
      credit: 'Test author $$',
    });
    const wideKit = await renderKit(root, 'wide-image');
    const read = (kit, file) => fs.readFileSync(path.join(kit.directory, file));
    const inventory = (kit, platform) => JSON.parse(read(kit, platform + '-upload-kit.json'));
    const linked = inventory(wideKit, 'linkedin');
    const medium = inventory(wideKit, 'medium');
    assert.deepEqual([linked.cover.width, linked.cover.height], [1920, 1080]);
    assert.deepEqual([linked.images[0].width, linked.images[0].height], [1920, 77]);
    assert.deepEqual([medium.cover.width, medium.cover.height], [1600, 64]);
    assert.deepEqual(medium.images, [medium.cover]);
    assert.deepEqual(read(wideKit, 'images/01-example.png'), wide);
    assert.deepEqual(read(wideKit, 'cover.png'), wide);
    assert.match(read(wideKit, 'print.html').toString(), /width="4000" height="160"/);
    execFileSync(python, [
      '-c',
      [
        'import sys; from PIL import Image',
        'im=Image.open(sys.argv[1]); im.load()',
        'assert im.size==(1920,1080) and im.format=="JPEG"',
        'assert im.getpixel((0,0))==(255,255,255)',
        'assert im.getpixel((105,540))[0]>220',
        'assert im.getpixel((1815,540))[2]>220',
      ].join('\n'),
      path.join(wideKit.directory, linked.cover.path),
    ]);
    assert.equal(linked.images[0].sourceSha256, hash(wide));
    assert.equal(linked.images[0].sha256, hash(read(wideKit, linked.images[0].path)));
    const mediumHtml = read(wideKit, 'medium-copy-ready.html').toString();
    assert.match(mediumHtml, /alt="One pixel"/);
    assert.ok(mediumHtml.includes('Original $&amp; test figure.'));
    assert.ok(mediumHtml.includes('Test author $$'));
    assert.equal(
      (
        read(wideKit, 'INSTRUCTIONS.md')
          .toString()
          .match(/medium\/featured\.jpg/g) || []
      ).length,
      1
    );
    assert.equal(
      (read(wideKit, 'medium-copy-ready.html').toString().match(/<img /g) || []).length,
      1
    );
    assert.deepEqual(await verifyKit(wideKit.directory), wideKit.manifest);
    const verify = (directory, ...flags) =>
      execFileSync(
        process.execPath,
        [path.join(repo, 'tools/publishing/cli.cjs'), 'verify', directory, ...flags],
        {
          stdio: 'pipe',
          encoding: 'utf8',
        }
      );
    const renamed = path.join(root, 'renamed-kit');
    fs.cpSync(wideKit.directory, renamed, { recursive: true });
    assert.throws(() => verify(renamed), /Renamed kits require --expected-id/);
    assert.throws(
      () => verify(renamed, '--expected-id', 'a'.repeat(64)),
      /differs from the expected identity/
    );
    assert.match(
      verify(renamed, '--expected-id', wideKit.manifest.artifactId),
      /Verified artifact/
    );
    const renamedDigest = path.join(root, 'b'.repeat(64));
    fs.renameSync(renamed, renamedDigest);
    assert.throws(() => verify(renamedDigest), /artifact path and identity differ/);
    assert.match(
      verify(renamedDigest, '--expected-id', wideKit.manifest.artifactId),
      /Verified artifact/
    );
    fs.renameSync(renamedDigest, renamed);

    const previous = { ...wideKit.manifest, platformImages: 1 };
    previous.transformations = previous.transformations.map((transformation) => {
      const item = { ...transformation };
      delete item.figures;
      delete item.uploadInventorySha256;
      return item;
    });
    delete previous.artifactId;
    previous.artifactId = hash(JSON.stringify(previous));
    json(renamed, 'manifest.json', previous);
    assert.match(verify(renamed, '--expected-id', previous.artifactId), /Verified artifact/);
    const corruptDirectory = path.join(root, 'tampered-kit');
    fs.cpSync(wideKit.directory, corruptDirectory, { recursive: true });
    const tampered = JSON.parse(JSON.stringify(wideKit.manifest));
    const alteredHtml = read(wideKit, 'linkedin-copy-ready.html')
      .toString()
      .replace('alt="One pixel"', 'alt="Altered"');
    write(corruptDirectory, 'linkedin-copy-ready.html', alteredHtml);
    const htmlRecord = tampered.outputs.find((file) => file.path === 'linkedin-copy-ready.html');
    htmlRecord.sha256 = hash(alteredHtml);
    htmlRecord.bytes = Buffer.byteLength(alteredHtml);
    delete tampered.artifactId;
    tampered.artifactId = hash(JSON.stringify(tampered));
    json(corruptDirectory, 'manifest.json', tampered);
    await assert.rejects(
      verifyKit(corruptDirectory),
      /HTML images differ from the upload inventory/
    );

    const alteredInventory = { ...linked, images: [{ ...linked.images[0], alt: 'Altered' }] };
    const alteredBytes = JSON.stringify(alteredInventory, null, 2) + '\n';
    write(corruptDirectory, 'linkedin-upload-kit.json', alteredBytes);
    const inventoryRecord = tampered.outputs.find(
      (file) => file.path === 'linkedin-upload-kit.json'
    );
    inventoryRecord.sha256 = hash(alteredBytes);
    inventoryRecord.bytes = Buffer.byteLength(alteredBytes);
    delete tampered.artifactId;
    tampered.artifactId = hash(JSON.stringify(tampered));
    json(corruptDirectory, 'manifest.json', tampered);
    await assert.rejects(
      verifyKit(corruptDirectory),
      /upload inventory does not match its edition and roles/
    );

    const noisy = generate(
      'Image.frombytes("RGB",(960,960),random.Random(196).randbytes(960*960*3)).save(sys.stdout.buffer,format="PNG")'
    );
    assert.ok(noisy.length > 2_000_000 && noisy.length < 5_000_000);
    fixture(root, 'coverless-image', { image: noisy, width: 960, height: 960, cover: false });
    const coverless = await renderKit(root, 'coverless-image');
    for (const platform of ['linkedin', 'medium']) {
      const { cover, images } = inventory(coverless, platform);
      assert.equal(cover, null);
      assert.equal(images.length, 1);
      assert.ok(images[0].bytes <= 2_000_000);
      assert.ok(images[0].width < 960);
      assert.equal(images[0].width, images[0].height);
    }
    const handoff = read(coverless, 'INSTRUCTIONS.md').toString();
    assert.match(handoff, /declares no cover upload/);
    assert.match(handoff, /Medium: upload each ordered image below manually/);
    assert.doesNotMatch(handoff, /cover\.png|cover\.jpg|featured\.jpg/);

    const noisyCover = generate(
      'Image.frombytes("RGB",(1700,970),random.Random(196).randbytes(1700*970*3)).save(sys.stdout.buffer,format="PNG")'
    );
    fixture(root, 'high-entropy-cover', { image: noisyCover, width: 1700, height: 970 });
    const dense = await renderKit(root, 'high-entropy-cover');
    for (const platform of ['linkedin', 'medium']) {
      assert.ok(inventory(dense, platform).cover.bytes <= 2_000_000);
    }

    const grayscale = generate(
      'im=Image.new("I;16",(128,16)); im.putdata([[0,1000,32768,65535][x//32] for y in range(16) for x in range(128)]); im.save(sys.stdout.buffer,format="PNG")'
    );
    fixture(root, 'high-depth-cover', { image: grayscale, width: 128, height: 16 });
    const tones = await renderKit(root, 'high-depth-cover');
    for (const platform of ['linkedin', 'medium']) {
      execFileSync(python, [
        '-c',
        [
          'import sys; from PIL import Image',
          'im=Image.open(sys.argv[1]); im.load()',
          'values=[im.getpixel((im.width*i//8,im.height//2))[0] for i in [1,3,5,7]]',
          'assert all(abs(a-b)<5 for a,b in zip(values,[0,4,128,255])), values',
        ].join('\n'),
        path.join(tones.directory, inventory(tones, platform).cover.path),
      ]);
    }

    fixture(root, 'header-only-image', { image: png.subarray(0, 33) });
    await assert.rejects(renderKit(root, 'header-only-image'), /image decoding\/export failed/);
    const parent = path.join(root, 'dist/publications/header-only-image');
    assert.deepEqual(fs.readdirSync(parent), []);
  });
});

test('planned site links reach all eight platform formats and launch without claiming publication', async () => {
  await withFixture(async (root) => {
    const { directory, edition } = fixture(root, 'reserved-article');
    const expected = 'https://vitaliioborskyi.ai/articles/reserved-article.html';
    const profile = JSON.parse(fs.readFileSync(path.join(root, directory, 'profile.json')));
    const launch = 'Read: {{SITE_ARTICLE_URL}}\nPDF: {{SITE_PDF_URL}}\n';
    write(root, `${directory}/launch-post.en.md`, launch);
    profile.launch.sha256 = hash(launch);
    profile.distribution = { originalLabel: 'Original article', materialsLabel: 'PDF and updates' };
    json(root, `${directory}/profile.json`, profile);
    const source = fs.readFileSync(path.join(root, directory, 'manuscript.en.md'));
    const result = await renderKit(root, 'reserved-article');
    const verified = await verifyKit(result.directory);
    assert.equal(verified.distribution.articleUrl, expected);
    assert.equal(verified.distribution.materialsUrl, expected + '#article-materials');
    assert.equal(verified.distribution.state, 'planned');
    assert.equal(verified.canonical, null);
    for (const platform of ['linkedin', 'medium']) {
      for (const suffix of ['.html', '.md', '.txt', '-copy-ready.html']) {
        const output = fs.readFileSync(path.join(result.directory, platform + suffix), 'utf8');
        assert.ok(output.includes(expected), platform + suffix);
        assert.ok(output.includes(expected + '#article-materials'), platform + suffix);
        assert.ok(output.includes('Original article'), platform + suffix);
        if (suffix.endsWith('html')) assert.ok(output.includes(`href="${expected}"`));
      }
    }
    for (const name of ['launch-post.md', 'launch-post.txt']) {
      const output = fs.readFileSync(path.join(result.directory, name), 'utf8');
      assert.ok(output.includes(expected));
      assert.ok(output.includes(expected + '#article-materials'));
      assert.doesNotMatch(output, /\{\{SITE_/);
      assert.ok(!output.includes(expected + ' (' + expected + ')'));
    }
    assert.ok(fs.readFileSync(path.join(result.directory, 'article.md')).equals(source));
    assert.ok(
      !fs.readFileSync(path.join(result.directory, 'print.html'), 'utf8').includes(expected)
    );
    const article = loadArticle(root, 'reserved-article');
    assert.equal(article.metadata.canonical, null);
    assert.equal(article.metadata.published, null);
    assert.equal(article.metadata.modified, null);
    assert.deepEqual(article.events, []);
    assert.equal(article.edition.semanticSha256, edition.semanticSha256);
    assert.ok(!fs.existsSync(path.join(root, directory, 'publication-events')));
    assert.ok(article.inputs.includes('site/publications/policy.json'));
    const literalLaunch = 'Read: ' + expected + '\nPDF: ' + expected + '#article-materials\n';
    write(root, `${directory}/launch-post.en.md`, literalLaunch);
    profile.launch.sha256 = hash(literalLaunch);
    json(root, `${directory}/profile.json`, profile);
    const literalKit = await renderKit(root, 'reserved-article');
    const literalText = fs.readFileSync(path.join(literalKit.directory, 'launch-post.txt'), 'utf8');
    assert.ok(!literalText.includes(expected + ' (' + expected + ')'));
    assert.ok(literalText.includes(expected + '#article-materials'));
  });
});

test('bounded GFM AST preserves escaped pipes, code fences and heading source links', () => {
  const markdown =
    'Рішення `AI` [source][r]\n========================\n\n' +
    '## Repeat\n\n## Repeat\n\n' +
    '| Name | Detail |\n| --- | --- |\n| a | b \\| c |\n\n' +
    '```md\n| fake | table |\n| --- | --- |\n```\n\n[r]: https://example.com/source\n';
  const result = compile(markdown, []);
  assert.deepEqual(
    result.model.sections.map((section) => section.id),
    ['рішення-ai-source', 'repeat', 'repeat-2']
  );
  assert.match(result.html, /<th>Name<\/th>/);
  assert.match(result.html, /<td>b \| c<\/td>/);
  assert.match(result.platformHtml, /<strong>Detail:<\/strong> b \| c/);
  assert.match(result.html, /<pre><code>\| fake \| table \|/);
  assert.equal(result.model.tree.children.filter((node) => node.type === 'table').length, 1);
  const reviewMarkdown = compile(markdown, [], { preserveTables: true }).markdown;
  const review = compile(reviewMarkdown, []);
  assert.equal(review.model.tree.children.filter((node) => node.type === 'table').length, 1);
  assert.match(review.html, /<td>b \| c<\/td>/);
  assert.match(review.html, /<pre><code>\| fake \| table \|/);
  assert.doesNotMatch(reviewMarkdown, /### Table row/);
  assert.match(result.markdown, /### Table row 1/);
  assert.match(
    result.platformHtml,
    /Heading sources: <a href="https:\/\/example.com\/source">source/
  );
  assert.equal(result.text.match(/https:\/\/example.com\/source/g).length, 1);
});

test('both Markdown modes retain the admitted one-megabyte manuscript boundary', () => {
  const source = 'x'.repeat(1_000_000);
  for (const preserveTables of [false, true]) {
    const result = compile(source, [], { preserveTables });
    assert.equal(result.markdown, source + '\n');
    assert.equal(result.model.tree.children[0].children[0].value, source);
  }
  assert.throws(() => compile(source + 'x', []), /1 MB/);
});

test('AST rejects unsafe/raw/undeclared content and unknown anchors', () => {
  for (const [source, expected] of [
    ['<script>alert(1)</script>', /Unsupported Markdown node: html/],
    ['[unsafe](javascript:alert)', /Unsafe link/],
    ['![remote](https://example.com/image.png)', /Undeclared image/],
    ['[missing](#absent)', /Unknown article anchor/],
    ['```mermaid\ngraph TD\nA-->B\n```', /Mermaid requires/],
    ['- [ ] todo', /Task-list controls/],
    ['| Only header |\n| --- |', /header-only tables are unsupported/],
  ]) {
    assert.throws(() => compile(source, []), expected);
  }
});

test('heading IDs remain globally unique and emitted Markdown preserves literal/code/list semantics', () => {
  const collision = compile('## same\n\n## same\n\n## same-2\n\n## same\n', []);
  assert.equal(new Set(collision.model.sections.map((section) => section.id)).size, 4);
  const source =
    '# Literal examples\n\nEscaped \\*stars\\* and \\_underscores\\_ stay literal.\n\n' +
    'Embedded ``a`b`` and padded `` `edge` `` code.\n\n' +
    '- Parent\n  - Child with **bold**\n\n1. Ordered\n2. Follow-up\n\n' +
    'Hard break  \nnext line. [URL](https://example.com/a(b))\n';
  const original = compile(source, []);
  const roundtrip = compile(original.markdown, []);
  assert.equal(roundtrip.html, original.html);
  assert.match(roundtrip.html, /Escaped \*stars\* and _underscores_ stay literal/);
  assert.match(roundtrip.html, /<code>a`b<\/code>/);
  const title = compile('# *[Test](https://example.com/source)*\n\nBody.\n', [], { title: 'Test' });
  assert.match(title.bodyHtml, /Title sources:.*href="https:\/\/example.com\/source"/);
  assert.match(title.platformBodyHtml, /Title sources:.*href="https:\/\/example.com\/source"/);
  const table = compile('| [Source](https://example.com/source) |\n| --- |\n| Argument |\n', []);
  assert.match(table.text, /Source \(https:\/\/example.com\/source\): Argument/);
  const asset = {
    id: 'example',
    url: '/example.png',
    alt: 'Example',
    width: 1,
    height: 1,
    caption: 'Figure.',
    credit: 'Author.',
  };
  const figure = compile('# Test\n\n## Figure example\n\n![Example](asset:example)\n', [asset]);
  assert.notEqual(figure.model.sections[1].id, 'figure-example');
});

test('two independent profiles resolve figure and adaptation identities without UA figure assumptions', async () => {
  await withFixture(async (root) => {
    fixture(root);
    fixture(root, 'second-profile', { adaptation: true, figure: false });
    assert.deepEqual(enumerateArticles(root), ['first-profile', 'second-profile']);
    const first = loadArticle(root, 'first-profile', {
      assetUrl: (asset) => `/media/${asset.sha256}.png`,
    });
    assert.match(first.html, /<figure id="figure-example">/);
    assert.match(first.html, /src="\/media\/[a-f0-9]{64}.png"/);
    assert.equal(first.source.state, 'working-tree-review');
    assert.equal(first.metadata.published, null);
    const second = loadArticle(root, 'second-profile');
    assert.match(second.adaptations.linkedin.html, /An authored shorter adaptation/);
    assert.doesNotMatch(second.html, /shorter adaptation/);
    assert.notEqual(second.adaptations.linkedin.edition.id, second.edition.id);
    const firstDigest = second.source.sha256;
    write(root, 'site/publications/second-profile/adaptations/linkedin.en.md', 'changed');
    assert.throws(() => loadArticle(root, 'second-profile'), /declared SHA256 pin/);
    assert.equal(loadArticle(root, 'first-profile').edition.id, 'first-edition');
    assert.equal(firstDigest, second.edition.source.sha256);
  });
});

test('native and equivalent layouts move title furniture once, nest Contents and preserve grouped prose', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'layout-profile', {
      adaptation: true,
    });
    const manuscript =
      '# Test [article](https://example.com/title)\n\n*Subtitle with [its source](https://example.com/subtitle)*\n\n' +
      'Test author · Draft 3\n\n## First part\n\n### First detail\n\n' +
      '**What if not?**\n\nThe first answer.\n\n' +
      'A short table.\n\n| Case | Result |\n| --- | --- |\n| One | Pass |\n\n' +
      '### Second detail\n\n**What if not?**\n\nThe second answer.\n\n' +
      'A closing thought.\n\nA closing line.\n\n' +
      '## Sources\n\nSource notes remain.\n\n## Record\n\nDraft history remains.\n';
    write(root, `${directory}/manuscript.en.md`, manuscript);
    edition.source.sha256 = hash(manuscript);
    edition.semanticSha256 = semanticDigest(metadata, edition.source);
    json(root, `${directory}/editions/first-edition.json`, edition);
    const adaptedPath = `${directory}/editions/linkedin-first.json`;
    const adapted = JSON.parse(fs.readFileSync(path.join(root, adaptedPath), 'utf8'));
    adapted.derivation.baseSourceSha256 = edition.source.sha256;
    adapted.derivation.baseSemanticSha256 = edition.semanticSha256;
    adapted.semanticSha256 = adaptationDigest(metadata, adapted.source, edition, 'linkedin');
    json(root, adaptedPath, adapted);
    const result = compile(manuscript, []);
    const nodes = result.model.tree.children;
    const pin = (index) => blockDigest(nodes[index]);
    const profilePath = `${directory}/profile.json`;
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath), 'utf8'));
    profile.reader = {
      elements: [{ role: 'prompt', sha256: pin(5) }],
      sections: { appendices: ['sources', 'record'] },
    };
    profile.print = {
      titleBlock: { subtitle: pin(1), byline: pin(2) },
      keepTogether: [pin(8)],
      keepWithNext: [pin(7), pin(12)],
    };
    json(root, profilePath, profile);
    const kit = await renderKit(root, 'layout-profile');
    await verifyKit(kit.directory);
    for (const filename of [
      'print.html',
      'article.html',
      'medium.html',
      'medium-copy-ready.html',
    ]) {
      const html = fs.readFileSync(path.join(kit.directory, filename), 'utf8');
      const header = html.match(/<header[\s\S]*?<\/header>/)[0];
      const body = html.match(/<article[\s\S]*?<\/article>/)[0];
      assert.equal((html.match(/Test author · Draft 3/g) || []).length, 1, filename);
      assert.match(
        header,
        /Subtitle with <a href="https:\/\/example.com\/subtitle">its source<\/a>/
      );
      assert.match(header, /Test author · Draft 3/);
      assert.doesNotMatch(body, /Subtitle with|Test author · Draft 3/);
      assert.match(body, /Title sources: <a href="https:\/\/example.com\/title">article<\/a>/);
      assert.match(html, /<meta name="article-edition" content="first-edition"/);
      assert.match(
        html,
        /<li><a href="#first-part">First part<\/a><ol><li><a href="#first-detail">/
      );
      assert.match(html, /article-print-toc-appendices"\s*>[\s\S]*href="#sources"/);
      assert.match(
        body,
        /article-print-keep"><p><strong>What if not\?<\/strong><\/p>\n<p>The first answer\.<\/p>\n<\/div>/
      );
      assert.match(
        body,
        /article-print-keep"><p><strong>What if not\?<\/strong><\/p>\n<p>The second answer\.<\/p>\n<\/div>/
      );
      assert.match(
        body,
        /article-print-keep"><p>A closing thought\.<\/p>\n<p>A closing line\.<\/p>\n<\/div>/
      );
      assert.match(body, /Source notes remain\./);
      assert.match(body, /Draft history remains\./);
      if (filename === 'print.html' || filename === 'article.html') {
        assert.match(
          body,
          /article-print-keep"><p>A short table\.<\/p>\n<table>[\s\S]*?<\/table>\n<\/div>/
        );
      } else {
        assert.match(body, /Table row 1/);
      }
      if (filename.endsWith('-copy-ready.html')) {
        assert.match(html, /<body class="article-copy-ready">/);
        assert.match(html, /\.article-copy-ready \.article-print-toc,/);
      }
    }
    const adaptation = fs.readFileSync(path.join(kit.directory, 'linkedin.html'), 'utf8');
    assert.match(adaptation, /A distinct argument/);
    assert.doesNotMatch(adaptation, /Test author · Draft 3|Subtitle with|article-print-keep/);
    assert.match(adaptation, /article-print-toc-appendices" hidden/);
    assert.ok(
      kit.manifest.producer.inputs.some((entry) => entry.path === 'tools/publishing/render.cjs')
    );
    assert.equal(fs.readFileSync(path.join(kit.directory, 'article.md'), 'utf8'), manuscript);
    assert.match(
      fs.readFileSync(path.join(kit.directory, 'medium.txt'), 'utf8'),
      /Test author · Draft 3/
    );
    assert.match(
      fs.readFileSync(path.join(kit.directory, 'INSTRUCTIONS.md'), 'utf8'),
      /select all document content \(Ctrl\/Cmd\+A\)/
    );
  });
});

test('hosted image URLs preserve canonical upload text and enforce the same authored limit', async () => {
  await withFixture(async (root) => {
    const { directory, metadata } = fixture(root);
    const original = loadArticle(root, metadata.id);
    const profilePath = `${directory}/profile.json`;
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath), 'utf8'));
    const limit = Array.from(original.text).length;
    profile.limits = { linkedinCharacters: limit, mediumCharacters: limit };
    json(root, profilePath, profile);
    const hostedUrl = `article-media/${'a'.repeat(64)}/example.png`;
    const hostedOptions = { assetUrl: () => hostedUrl };
    const canonical = loadArticle(root, metadata.id);
    const hosted = loadArticle(root, metadata.id, hostedOptions);
    assert.equal(canonical.text, original.text);
    assert.equal(hosted.text, canonical.text);
    assert.equal(hosted.markdown, canonical.markdown);
    assert.ok(hosted.html.includes(`src="${hostedUrl}"`));
    assert.equal(hosted.assets[0].url, hostedUrl);
    assert.equal(hosted.assets[0].uploadPath, canonical.assets[0].url);
    for (const platform of ['linkedin', 'medium']) {
      profile.limits = { [platform + 'Characters']: limit - 1 };
      json(root, profilePath, profile);
      for (const options of [{}, hostedOptions]) {
        assert.throws(
          () => loadArticle(root, metadata.id, options),
          new RegExp('Profile ' + platform + ' text exceeds its authored character limit')
        );
      }
    }
  });
});

test('strict source selection rejects unknown fields, dishonest accepted edition and altered assets', async () => {
  await withFixture(async (root) => {
    const { directory, metadata } = fixture(root);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      publishedAt: '2026-01-01',
    });
    assert.throws(() => loadArticle(root, 'first-profile'), /Unknown publication field/);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      status: 'accepted',
      rights: { ...metadata.rights, status: 'accepted' },
    });
    assert.throws(() => loadArticle(root, 'first-profile'), /committed source and edition rights/);
    json(root, `${directory}/publication.json`, metadata);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      assets: metadata.assets.map((asset) => ({ ...asset, reviewNote: '' })),
    });
    assert.throws(() => loadArticle(root, 'first-profile'), /Invalid asset review note/);
    json(root, `${directory}/publication.json`, metadata);
    const altered = Buffer.from(png);
    altered[altered.length - 1] ^= 1;
    write(root, metadata.assets[0].path, altered);
    assert.throws(() => loadArticle(root, 'first-profile'), /bytes\/dimensions/);
  });
});

test('semantic editions reject meaningful metadata drift while profiles stay independent', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root);
    const initial = loadArticle(root, metadata.id);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      title: 'Changed argument title',
    });
    assert.throws(() => loadArticle(root, metadata.id), /semantic identity drifted/);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      assets: metadata.assets.map((asset) => ({
        ...asset,
        caption: 'A materially changed caption.',
      })),
    });
    assert.throws(() => loadArticle(root, metadata.id), /semantic identity drifted/);
    json(root, `${directory}/publication.json`, metadata);
    const profile = JSON.parse(fs.readFileSync(path.join(root, `${directory}/profile.json`)));
    profile.seo.title = 'An independently authored distribution title';
    json(root, `${directory}/profile.json`, profile);
    const revisedProfile = loadArticle(root, metadata.id);
    assert.equal(revisedProfile.edition.semanticSha256, initial.edition.semanticSha256);
    assert.equal(revisedProfile.furniture.seo.title, profile.seo.title);
    const source = Buffer.from([65, 32, 255, 32, 66, 46, 10]);
    write(root, `${directory}/manuscript.en.md`, source);
    const changed = {
      ...edition,
      source: { ...edition.source, sha256: hash(source) },
    };
    changed.semanticSha256 = semanticDigest(metadata, changed.source);
    json(root, `${directory}/editions/first-edition.json`, changed);
    assert.throws(() => loadArticle(root, metadata.id), /valid UTF-8 source bytes/);
  });
});

test('kit installs coherent source-bound HTML/MD/TXT/copy candidates and rejects output corruption', async () => {
  await withFixture(async (root) => {
    fixture(root, 'second-profile', { adaptation: true });
    const first = await renderKit(root, 'second-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const manifest = await verifyKit(first.directory);
    assert.equal(manifest.contentEdition, 'first-edition');
    assert.equal(manifest.transformations[0].contentEdition, 'linkedin-first');
    assert.equal(manifest.review.path, 'review.md');
    const review = await fsp.readFile(path.join(first.directory, 'review.md'), 'utf8');
    assert.match(review, /Whole article\./);
    assert.doesNotMatch(review, /shorter adaptation|### Table row|asset:|Administrative test note/);
    assert.match(review, /\| Parameter\s+\| Value/);
    assert.match(review, /images\/01-example\.png/);
    assert.match(review, /Original test figure\./);
    assert.match(review, /Test author\./);
    assert.match(
      await fsp.readFile(path.join(first.directory, 'medium.md'), 'utf8'),
      /### Table row 1/
    );
    assert.deepEqual(
      fs.readFileSync(path.join(first.directory, 'article.md')),
      fs.readFileSync(path.join(root, 'site/publications/second-profile/manuscript.en.md'))
    );
    assert.deepEqual(
      fs.readFileSync(path.join(first.directory, 'launch-post.md')),
      fs.readFileSync(path.join(root, 'site/publications/second-profile/launch-post.en.md'))
    );
    assert.equal(hash(fs.readFileSync(path.join(first.directory, 'hero.png'))), hash(png));
    assert.equal(hash(fs.readFileSync(path.join(first.directory, 'cover.png'))), hash(png));
    assert.match(
      await fsp.readFile(path.join(first.directory, 'INSTRUCTIONS.md'), 'utf8'),
      /set medium\/featured\.jpg as featured.*upload it once at its matching figure position/
    );
    assert.match(
      await fsp.readFile(path.join(first.directory, 'INSTRUCTIONS.md'), 'utf8'),
      /Administrative test note; rights decision pending/
    );
    const copy = await fsp.readFile(path.join(first.directory, 'medium-copy-ready.html'), 'utf8');
    assert.match(copy, /<style>/);
    const encoded = copy.match(/data:image\/jpeg;base64,([A-Za-z0-9+/=]+)/g);
    assert.equal(encoded.length, 1);
    assert.deepEqual(
      Buffer.from(encoded[0].split(',')[1], 'base64'),
      fs.readFileSync(path.join(first.directory, 'medium/featured.jpg'))
    );
    const rerender = await renderKit(root, 'second-profile', {
      generatedAt: '2026-10-12T00:00:01Z',
    });
    assert.notEqual(rerender.manifest.artifactId, manifest.artifactId);
    assert.equal(rerender.manifest.contentEdition, manifest.contentEdition);
    const link = path.join(root, 'outside-kit-hardlink.txt');
    fs.linkSync(path.join(first.directory, 'article.txt'), link);
    await assert.rejects(verifyKit(first.directory), /must not be a hardlink/);
    fs.unlinkSync(link);
    write(first.directory, 'medium.txt', 'corrupt');
    await assert.rejects(verifyKit(first.directory), /output inventory or bytes/);
    const forged = JSON.parse(fs.readFileSync(path.join(first.directory, 'manifest.json')));
    const output = forged.outputs.find((item) => item.path === 'medium.txt');
    output.sha256 = hash('corrupt');
    output.bytes = Buffer.byteLength('corrupt');
    delete forged.artifactId;
    forged.artifactId = hash(JSON.stringify(forged));
    json(first.directory, 'manifest.json', forged);
    await assert.rejects(verifyKit(first.directory), /artifact path and identity differ/);
    await assert.rejects(
      renderKit(root, 'second-profile', {
        generatedAt: '2026-10-12T00:00:00Z',
      }),
      /output inventory or bytes|artifact path and identity differ/
    );
  });
});

test('kit rename failure does not install partial assets or discard a prior candidate', async () => {
  await withFixture(async (root) => {
    fixture(root);
    const prior = await renderKit(root, 'first-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const sourceBefore = fs.readFileSync(
      path.join(root, 'site/publications/first-profile/manuscript.en.md')
    );
    await assert.rejects(
      renderKit(root, 'first-profile', {
        generatedAt: '2026-10-12T00:00:01Z',
        renameImpl: async () => {
          throw new Error('controlled install failure');
        },
      }),
      /Generation installation failed/
    );
    await verifyKit(prior.directory);
    assert.deepEqual(
      fs.readFileSync(path.join(root, 'site/publications/first-profile/manuscript.en.md')),
      sourceBefore
    );
    const names = await fsp.readdir(path.join(root, 'dist/publications/first-profile'));
    assert.deepEqual(names, [prior.manifest.artifactId]);
  });
});

test('a distinct plain profile emits only selected platform formats and authored furniture omissions', async () => {
  await withFixture(async (root) => {
    fixture(root, 'plain-profile', { figure: false });
    const kit = await renderKit(root, 'plain-profile');
    const names = kit.manifest.outputs.map((output) => output.path);
    assert.ok(names.includes('linkedin.txt'));
    assert.ok(names.includes('medium.txt'));
    assert.ok(!names.includes('linkedin.html'));
    assert.ok(!names.includes('medium-copy-ready.html'));
    assert.ok(!names.includes('cover.png'));
    assert.equal(kit.manifest.omissions.filter((item) => item.role).length, 2);
    assert.equal(
      kit.manifest.profile.selection.platforms.linkedin.relationship,
      'equivalent-rendition'
    );
  });
});

test('a new authored LinkedIn edition leaves full source and its prior edition untouched', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'revision-profile', {
      adaptation: true,
      figure: false,
    });
    const originalFull = fs.readFileSync(path.join(root, `${directory}/manuscript.en.md`));
    const originalEdition = fs.readFileSync(
      path.join(root, `${directory}/editions/first-edition.json`)
    );
    const before = await renderKit(root, 'revision-profile', {
      generatedAt: '2026-10-12T00:00:00Z',
    });
    const nextSource = '# An independently revised adaptation\n\nA different authored scope.\n';
    write(root, `${directory}/adaptations/linkedin.en.md`, nextSource);
    const nextEdition = {
      ...edition,
      id: 'linkedin-second',
      kind: 'adaptation',
      source: {
        ...edition.source,
        path: 'adaptations/linkedin.en.md',
        sha256: hash(nextSource),
      },
      derivation: {
        relationship: 'adaptation',
        baseEdition: edition.id,
        baseSourceSha256: edition.source.sha256,
        baseSemanticSha256: edition.semanticSha256,
      },
    };
    nextEdition.semanticSha256 = adaptationDigest(
      metadata,
      nextEdition.source,
      edition,
      'linkedin'
    );
    json(root, `${directory}/editions/linkedin-second.json`, nextEdition);
    json(root, `${directory}/publication.json`, {
      ...metadata,
      platforms: {
        ...metadata.platforms,
        linkedin: {
          ...metadata.platforms.linkedin,
          edition: 'linkedin-second',
        },
      },
    });
    const after = await renderKit(root, 'revision-profile', {
      generatedAt: '2026-10-12T00:00:01Z',
    });
    assert.equal(after.manifest.contentEdition, before.manifest.contentEdition);
    assert.equal(after.manifest.transformations[0].contentEdition, 'linkedin-second');
    assert.notEqual(after.manifest.artifactId, before.manifest.artifactId);
    assert.deepEqual(
      fs.readFileSync(path.join(root, `${directory}/manuscript.en.md`)),
      originalFull
    );
    assert.deepEqual(
      fs.readFileSync(path.join(root, `${directory}/editions/first-edition.json`)),
      originalEdition
    );
  });
});

test('translation validates its edition family and freezes its declared derivation', async () => {
  await withFixture(async (root) => {
    const original = fixture(root, 'original-article', { figure: false });
    const second = fixture(root, 'second-original', { figure: false });
    const secondSource = '# Test article\n\nA different source argument.\n';
    write(root, `${second.directory}/manuscript.en.md`, secondSource);
    second.edition.source.sha256 = hash(secondSource);
    second.edition.semanticSha256 = semanticDigest(second.metadata, second.edition.source);
    json(root, `${second.directory}/editions/first-edition.json`, second.edition);
    const translation = fixture(root, 'ukrainian-article', { figure: false });
    const source = '# Українська стаття\n\nПовний переклад аргументу.\n';
    fs.renameSync(
      path.join(root, `${translation.directory}/manuscript.en.md`),
      path.join(root, `${translation.directory}/manuscript.uk.md`)
    );
    write(root, `${translation.directory}/manuscript.uk.md`, source);
    const translatedEdition = {
      ...translation.edition,
      language: 'uk',
      source: {
        ...translation.edition.source,
        path: 'manuscript.uk.md',
        sha256: hash(source),
      },
    };
    const metadata = {
      ...translation.metadata,
      title: 'Українська стаття',
      language: 'uk',
      source: 'manuscript.uk.md',
      translationOf: {
        articleId: original.metadata.id,
        editionId: original.edition.id,
        sourceSha256: original.edition.source.sha256,
      },
    };
    json(root, `${translation.directory}/publication.json`, metadata);
    const profile = JSON.parse(
      fs.readFileSync(path.join(root, `${translation.directory}/profile.json`))
    );
    profile.launch.source = 'launch-post.uk.md';
    fs.renameSync(
      path.join(root, `${translation.directory}/launch-post.en.md`),
      path.join(root, `${translation.directory}/launch-post.uk.md`)
    );
    json(root, `${translation.directory}/profile.json`, profile);
    translatedEdition.semanticSha256 = semanticDigest(metadata, translatedEdition.source);
    json(root, `${translation.directory}/editions/first-edition.json`, translatedEdition);
    assert.equal(
      loadArticle(root, 'ukrainian-article').metadata.translationOf.articleId,
      'original-article'
    );
    const invalidMetadata = {
      ...metadata,
      translationOf: {
        ...metadata.translationOf,
        sourceSha256: 'f'.repeat(64),
      },
    };
    json(root, `${translation.directory}/publication.json`, invalidMetadata);
    json(root, `${translation.directory}/editions/first-edition.json`, {
      ...translatedEdition,
      semanticSha256: semanticDigest(invalidMetadata, translatedEdition.source),
    });
    assert.throws(
      () => loadArticle(root, 'ukrainian-article'),
      /distinct-language selected content edition/
    );
    const selected = [
      original,
      second,
      {
        directory: translation.directory,
        metadata,
        edition: translatedEdition,
      },
    ];
    for (const article of selected) {
      article.metadata.status = 'accepted';
      article.metadata.rights.status = 'accepted';
      article.edition.rights = 'accepted';
      json(root, `${article.directory}/publication.json`, article.metadata);
      json(root, `${article.directory}/editions/first-edition.json`, article.edition);
    }
    const git = (arguments_) =>
      execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.name', 'Translation edition test']);
    git(['config', 'user.email', 'translation-test@example.invalid']);
    git(['add', '-A']);
    git(['commit', '-qm', 'Commit translation sources']);
    const commit = git(['rev-parse', 'HEAD']);
    for (const article of selected) {
      article.edition.source.commit = commit;
      article.edition.source.blob = git([
        'rev-parse',
        `${commit}:${article.directory}/${article.metadata.source}`,
      ]);
      json(root, `${article.directory}/editions/first-edition.json`, article.edition);
    }
    git(['add', '-A']);
    git(['commit', '-qm', 'Freeze translation editions']);
    const frozen = loadArticle(root, 'ukrainian-article');
    assert.equal(frozen.source.state, 'committed');
    assert.equal(frozen.historyProof.frozenEditionCount, 1);
    const editionPath = path.join(root, `${translation.directory}/editions/first-edition.json`);
    const frozenBytes = fs.readFileSync(editionPath);
    const retargeted = {
      ...metadata,
      translationOf: {
        articleId: second.metadata.id,
        editionId: second.edition.id,
        sourceSha256: second.edition.source.sha256,
      },
    };
    const removed = { ...metadata };
    delete removed.translationOf;
    for (const changed of [retargeted, removed]) {
      json(root, `${translation.directory}/publication.json`, changed);
      assert.throws(() => loadArticle(root, 'ukrainian-article'), /semantic identity drifted/);
      assert.deepEqual(fs.readFileSync(editionPath), frozenBytes);
    }
    json(root, `${translation.directory}/publication.json`, metadata);
    assert.equal(loadArticle(root, 'ukrainian-article').edition.id, frozen.edition.id);
  });
});

test('platform events bind the declared document formats of real committed kits', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'platform-event', {
      figure: false,
    });
    const git = (arguments_) =>
      execFileSync('git', arguments_, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.name', 'Platform event test']);
    git(['config', 'user.email', 'platform-event@example.invalid']);
    git(['add', 'site']);
    git(['commit', '-qm', 'Commit platform source']);
    const commit = git(['rev-parse', 'HEAD']);
    edition.source.commit = commit;
    edition.source.blob = git(['rev-parse', `${commit}:${directory}/manuscript.en.md`]);
    edition.rights = 'accepted';
    metadata.status = 'accepted';
    metadata.rights.status = 'accepted';
    json(root, `${directory}/publication.json`, metadata);
    json(root, `${directory}/editions/first-edition.json`, edition);
    git(['add', 'site']);
    git(['commit', '-qm', 'Freeze platform edition']);
    const eventFor = (kit, documentPath, platform = 'linkedin') => {
      const output = kit.manifest.outputs.find((item) => item.path === documentPath);
      const manifestPath = path.relative(root, path.join(kit.directory, 'manifest.json'));
      const url = `https://example.com/${platform}/fixture-publication`;
      return {
        schema: 1,
        id: 'plain-text-publication',
        articleId: metadata.id,
        kind: 'publication',
        platform,
        url,
        occurredAt: '2026-10-12T00:00:00Z',
        editionId: edition.id,
        artifact: {
          kind: 'distribution-kit',
          id: kit.manifest.artifactId,
          manifestPath,
          manifestSha256: hash(fs.readFileSync(path.join(root, manifestPath))),
          documentPath,
        },
        inspection: {
          kind: 'platform-published',
          url,
          observedAt: '2026-10-12T00:01:00Z',
          httpStatus: 200,
          documentSha256: output?.sha256 || 'f'.repeat(64),
          evidence: ['https://example.com/fixture-inspection'],
        },
      };
    };
    const plain = await renderKit(root, metadata.id);
    assert.equal(plain.manifest.source.state, 'committed');
    appendPublicationEvent(root, metadata.id, eventFor(plain, 'linkedin.txt'));
    assert.equal(loadArticle(root, metadata.id).events[0].artifact.documentPath, 'linkedin.txt');
    assert.throws(
      () => validateEvent(root, directory, eventFor(plain, 'linkedin.html')),
      /does not declare its document output/
    );
    const profilePath = `${directory}/profile.json`;
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath)));
    for (const platform of ['linkedin', 'medium']) {
      profile.platforms[platform].formats = ['html', 'md', 'txt', 'copy-ready'];
    }
    json(root, profilePath, profile);
    const complete = await renderKit(root, metadata.id);
    for (const platform of ['linkedin', 'medium']) {
      for (const suffix of ['.html', '.md', '.txt', '-copy-ready.html']) {
        validateEvent(root, directory, eventFor(complete, `${platform}${suffix}`, platform));
      }
    }
    for (const documentPath of [
      'medium.txt',
      'medium-copy-ready.html',
      'article.html',
      'cover.png',
      'seo.json',
      'medium-upload-kit.json',
      'INSTRUCTIONS.md',
    ]) {
      assert.throws(
        () => validateEvent(root, directory, eventFor(complete, documentPath)),
        /wrong platform output/
      );
    }
    const documentPath = path.join(complete.directory, 'linkedin.txt');
    const originalBytes = fs.readFileSync(documentPath);
    const corruptEvent = eventFor(complete, 'linkedin.txt');
    fs.appendFileSync(documentPath, 'Corrupt platform bytes.\n');
    assert.throws(() => validateEvent(root, directory, corruptEvent), /document bytes are corrupt/);
    fs.writeFileSync(documentPath, originalBytes);
    assert.doesNotThrow(() => validateEvent(root, directory, corruptEvent));
  });
});

test('canonical and actual dates require an exact committed artifact and production-served inspection', async () => {
  await withFixture(async (root) => {
    const { directory, metadata, edition } = fixture(root, 'event-profile', {
      figure: false,
    });
    const profile = JSON.parse(fs.readFileSync(path.join(root, directory, 'profile.json')));
    const launch = 'Read {{SITE_ARTICLE_URL}}\nPDF {{SITE_PDF_URL}}\n';
    write(root, `${directory}/launch-post.en.md`, launch);
    profile.launch.sha256 = hash(launch);
    profile.distribution = { originalLabel: 'Original', materialsLabel: 'PDF' };
    json(root, `${directory}/profile.json`, profile);
    const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    git(['init', '-q']);
    git(['config', 'user.email', 'tests@example.com']);
    git(['config', 'user.name', 'Publication tests']);
    git(['add', 'site']);
    git(['commit', '-qm', 'Source fixture']);
    const commit = git(['rev-parse', 'HEAD']);
    const blob = git(['rev-parse', `${commit}:${directory}/manuscript.en.md`]);
    json(root, `${directory}/editions/first-edition.json`, {
      ...edition,
      source: { ...edition.source, commit, blob },
      rights: 'accepted',
    });
    const accepted = {
      ...metadata,
      status: 'accepted',
      rights: { ...metadata.rights, status: 'accepted' },
    };
    json(root, `${directory}/publication.json`, accepted);
    git(['add', 'site']);
    git(['commit', '-qm', 'Frozen edition fixture']);
    const descriptor = {
      articleId: 'event-profile',
      contentEdition: edition.id,
      sourceSha256: edition.source.sha256,
      semanticSha256: edition.semanticSha256,
      alias: 'articles/event-profile.html',
      url: `article-snapshots/${'a'.repeat(64)}/event-profile.html`,
      version: 'a'.repeat(64),
      assets: [],
    };
    const html =
      '<!doctype html><html><body><main>Coherent reader source fixture.</main></body></html>\n';
    descriptor.sha256 = hash(html);
    const revision = {
      schema: 1,
      edition: { id: 'production', origin: 'https://vitaliioborskyi.ai' },
      preview: false,
      articles: { 'event-profile:en': descriptor },
    };
    const publicBytes = {
      [descriptor.alias]: html,
      [descriptor.url]: html,
      'site-revision.json': JSON.stringify(revision) + '\n',
    };
    const files = Object.fromEntries(
      Object.entries(publicBytes).map(([name, bytes]) => [
        name,
        { sha256: hash(bytes), raw: Buffer.byteLength(bytes), gzip: 0 },
      ])
    );
    const siteId = hash(JSON.stringify(files));
    const artifactRoot = `dist/site-artifacts/${siteId}`;
    for (const [name, bytes] of Object.entries(publicBytes)) {
      write(root, `${artifactRoot}/public/${name}`, bytes);
    }
    const artifactManifest = {
      schema: 1,
      sourceCommit: git(['rev-parse', 'HEAD']),
      sourceTree: git(['rev-parse', 'HEAD^{tree}']),
      sourceDirty: false,
      edition: { id: 'production', origin: 'https://vitaliioborskyi.ai' },
      files,
      artifactDigest: siteId,
      components: revision,
    };
    json(root, `${artifactRoot}/artifact.json`, artifactManifest);
    const document = files[descriptor.alias];
    const url = 'https://vitaliioborskyi.ai/articles/event-profile.html';
    json(root, `${directory}/publication.json`, {
      ...accepted,
      canonical: url,
    });
    assert.throws(() => loadArticle(root, 'event-profile'), /Canonical must stay pending/);
    json(root, `${directory}/publication.json`, accepted);
    const event = {
      schema: 1,
      id: 'site-first',
      articleId: 'event-profile',
      kind: 'publication',
      platform: 'site',
      url,
      occurredAt: '2026-10-12T00:00:00Z',
      editionId: 'first-edition',
      artifact: {
        kind: 'site-artifact',
        id: siteId,
        manifestPath: `${artifactRoot}/artifact.json`,
        manifestSha256: hash(fs.readFileSync(path.join(root, `${artifactRoot}/artifact.json`))),
        documentPath: descriptor.alias,
      },
      inspection: {
        kind: 'production-served',
        url,
        observedAt: '2026-10-12T00:01:00Z',
        httpStatus: 200,
        documentSha256: document.sha256,
        evidence: ['https://author.example/inspection/1'],
      },
    };
    assert.throws(
      () =>
        appendPublicationEvent(root, 'event-profile', {
          ...event,
          artifact: { ...event.artifact, id: 'f'.repeat(64) },
        }),
      /coherent archived site artifact/
    );
    assert.throws(
      () =>
        appendPublicationEvent(root, 'event-profile', {
          ...event,
          inspection: { ...event.inspection, documentSha256: 'f'.repeat(64) },
        }),
      /Observed document digest/
    );
    const kit = await renderKit(root, 'event-profile');
    const platformEvent = (platform, occurredAt = '2026-10-12T00:02:00Z') => {
      const documentPath = platform + '.txt';
      const output = kit.manifest.outputs.find((item) => item.path === documentPath);
      const manifestPath = path.relative(root, path.join(kit.directory, 'manifest.json'));
      const destination =
        platform === 'medium'
          ? 'https://medium.com/@author/article'
          : 'https://www.linkedin.com/pulse/article';
      return {
        schema: 1,
        id: platform + '-observed',
        articleId: 'event-profile',
        kind: 'publication',
        platform,
        url: destination,
        occurredAt,
        editionId: 'first-edition',
        artifact: {
          kind: 'distribution-kit',
          id: kit.manifest.artifactId,
          manifestPath,
          manifestSha256: hash(fs.readFileSync(path.join(root, manifestPath))),
          documentPath,
        },
        inspection: {
          kind: 'platform-published',
          url: destination,
          observedAt: '2026-10-12T00:03:00Z',
          httpStatus: 200,
          documentSha256: output.sha256,
          evidence: ['https://author.example/platform-observation'],
        },
      };
    };
    assert.throws(
      () => appendPublicationEvent(root, 'event-profile', platformEvent('medium')),
      /prior verified website/
    );
    assert.ok(
      !fs.existsSync(path.join(root, directory, 'publication-events/medium-observed.json'))
    );
    json(root, `${directory}/publication-events/medium-observed.json`, platformEvent('medium'));
    assert.throws(() => loadArticle(root, 'event-profile'), /prior verified website/);
    fs.rmSync(path.join(root, directory, 'publication-events/medium-observed.json'));
    appendPublicationEvent(root, 'event-profile', event);
    assert.throws(() => appendPublicationEvent(root, 'event-profile', event), /EEXIST/);
    assert.throws(
      () =>
        appendPublicationEvent(
          root,
          'event-profile',
          platformEvent('medium', '2026-10-12T00:00:30Z')
        ),
      /prior verified website/
    );
    const wrongHost = platformEvent('linkedin');
    wrongHost.url = wrongHost.inspection.url = 'https://example.com/not-linkedin';
    assert.throws(() => appendPublicationEvent(root, 'event-profile', wrongHost), /platform host/);
    for (const platform of ['medium', 'linkedin']) {
      appendPublicationEvent(root, 'event-profile', platformEvent(platform));
    }
    json(root, `${directory}/publication.json`, {
      ...accepted,
      canonical: url,
    });
    const observed = loadArticle(root, 'event-profile');
    assert.equal(observed.metadata.published, event.occurredAt);
    assert.equal(observed.metadata.modified, event.occurredAt);
    git(['add', 'site']);
    git(['commit', '-qm', 'Observed event fixture']);
    json(root, `${directory}/publication-events/site-first.json`, {
      ...event,
      occurredAt: '2026-10-12T00:00:01Z',
    });
    assert.throws(() => loadArticle(root, 'event-profile'), /history|immutable|rewrit/i);
    json(root, `${directory}/publication-events/site-first.json`, event);
    write(root, `${artifactRoot}/public/${descriptor.alias}`, 'corrupt');
    assert.throws(() => loadArticle(root, 'event-profile'), /corrupt or excessive public bytes/);
  });
});

test('presentation binds PDF bytes, poster identity and edition semantics', async () => {
  await withFixture(async (root) => {
    const { metadata, edition, directory } = fixture(root);
    const originalIdentity = semanticDigest(metadata, edition.source);
    const bytes = fs.readFileSync(
      path.join(repo, 'site/assets/publications/pmday-ai-both-sides/presentation-v35.pdf')
    );
    metadata.presentation = {
      title: 'Source presentation',
      poster: 'example',
      pdf: {
        path: 'site/assets/publications/first-profile/slides.pdf',
        sha256: hash(bytes),
      },
      sourceUrl: 'https://example.com/slides.pdf',
    };
    write(root, metadata.presentation.pdf.path, bytes);
    const { loadPresentation } = require('../tools/publishing/presentation.cjs');
    const loaded = loadPresentation(root, metadata, metadata.assets);
    assert.deepEqual(loaded.file.bytes, bytes);
    assert.equal(loaded.file.mime, 'application/pdf');
    assert.notEqual(semanticDigest(metadata, edition.source), originalIdentity);
    edition.semanticSha256 = semanticDigest(metadata, edition.source);
    json(root, `${directory}/publication.json`, metadata);
    json(root, `${directory}/editions/${edition.id}.json`, edition);
    assert.ok(loadArticle(root, metadata.id).inputs.includes(metadata.presentation.pdf.path));
    const kit = await renderKit(root, metadata.id);
    assert.deepEqual(fs.readFileSync(path.join(kit.directory, 'presentation.pdf')), bytes);
    const defaultUploads = JSON.parse(
      fs.readFileSync(path.join(kit.directory, 'medium-upload-kit.json'), 'utf8')
    );
    assert.deepEqual(
      defaultUploads.images.map((image) => image.id),
      ['example']
    );
    await verifyKit(kit.directory);
    const manuscriptPath = `${directory}/${metadata.source}`;
    const manuscript = fs
      .readFileSync(path.join(root, manuscriptPath), 'utf8')
      .replace(
        '![One pixel](asset:example)',
        `[Presentation slides (PDF)](${metadata.presentation.sourceUrl}) · ` +
          '[Recording in Ukrainian](https://youtu.be/example)'
      );
    write(root, manuscriptPath, manuscript);
    edition.source.sha256 = hash(manuscript);
    edition.semanticSha256 = semanticDigest(metadata, edition.source);
    json(root, `${directory}/editions/${edition.id}.json`, edition);
    const profilePath = `${directory}/profile.json`;
    const profile = JSON.parse(fs.readFileSync(path.join(root, profilePath), 'utf8'));
    profile.reader = { references: 'inline', presentation: 'links' };
    json(root, profilePath, profile);
    const linkedKit = await renderKit(root, metadata.id);
    for (const file of ['article.html', 'print.html', 'linkedin.html', 'medium.html']) {
      const rendered = fs.readFileSync(path.join(linkedKit.directory, file), 'utf8');
      assert.equal((rendered.match(/href="https:\/\/example.com\/slides.pdf"/g) || []).length, 1);
      assert.equal((rendered.match(/href="https:\/\/youtu.be\/example"/g) || []).length, 1);
      assert.doesNotMatch(rendered, /figure-example|presentation-toggle|presentation-viewer/);
    }
    assert.ok(
      !linkedKit.manifest.omissions.some((omission) =>
        omission.feature.includes('Interactive presentation viewer')
      )
    );
    assert.deepEqual(fs.readFileSync(path.join(linkedKit.directory, 'presentation.pdf')), bytes);
    const linkedUploads = JSON.parse(
      fs.readFileSync(path.join(linkedKit.directory, 'medium-upload-kit.json'), 'utf8')
    );
    assert.deepEqual(linkedUploads.images, []);
    assert.doesNotMatch(
      fs.readFileSync(path.join(linkedKit.directory, 'INSTRUCTIONS.md'), 'utf8'),
      /images\/01-example\.png/
    );
    for (const file of ['images/01-example.png', 'cover.png', 'hero.png']) {
      assert.deepEqual(fs.readFileSync(path.join(linkedKit.directory, file)), png);
      assert.ok(linkedKit.manifest.outputs.some((output) => output.path === file));
    }
    await verifyKit(linkedKit.directory);
    metadata.presentation.poster = 'missing';
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /poster/);
    metadata.presentation.poster = 'example';
    const declaredPath = metadata.presentation.pdf.path;
    metadata.presentation.pdf.path = 'site/assets/publications/other/slides.pdf';
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /path or digest/);
    metadata.presentation.pdf.path = declaredPath;
    write(root, declaredPath, Buffer.concat([bytes, Buffer.from('changed')]));
    assert.throws(() => loadPresentation(root, metadata, metadata.assets), /bytes do not match/);
  });
});
