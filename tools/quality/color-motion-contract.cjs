'use strict';
// Transitional controller compatibility for reviewed Color runtime families.
// Fingerprints alone cannot authorize a branch: the verified runtime bytes must
// also match. New runtime bytes require a separately reviewed contract update.
const assert = require('node:assert/strict');
const common = require('./common.cjs');
// Shared bytes and reader policies are declared once; historical identities stay below.
const themes = {
  current: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
  legacy: 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
};
const archives = {
  paper: '24691f49c8c0b458958de6422396af4a6ea73f2d6bffa610e4f0ca788b04f383',
  editorial: '0422f2dc13bf5e78b79221aa9a28840c1f996b08927288f47c096ab7835a203e',
  article: 'e5077478895fbe15af0cbd3fe586bcefbdc4327b2921efcc84b64ace50c52760',
  tags: '0d1bfbbea3736f49ae83e0e0fbaa603038764f6887a63760c1e4e982180f7745',
  generic: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
};
const behaviorProfiles = {
  deferredMedia: {
    behavior: 'fixed-blocks',
    articleReading: 'stationary',
    readerInteractions: true,
    readerWholeBlocks: true,
    readerPaper: true,
    readerDeferredMedia: true,
  },
  paper: {
    behavior: 'fixed-blocks',
    articleReading: 'stationary',
    readerInteractions: true,
    readerWholeBlocks: true,
    readerPaper: true,
  },
  wholeBlocks: {
    behavior: 'fixed-blocks',
    articleReading: 'stationary',
    readerInteractions: true,
    readerWholeBlocks: true,
  },
  interactive: {
    behavior: 'fixed-blocks',
    articleReading: 'stationary',
    readerInteractions: true,
  },
  reader: {
    behavior: 'fixed-blocks',
    articleReading: 'stationary',
  },
  blocks: {
    behavior: 'fixed-blocks',
  },
  spatial: {
    behavior: 'following-spatial',
  },
};
const byteProfiles = {
  issue122R3Platform: {
    ...behaviorProfiles.deferredMedia,
    theme: themes.current,
    space: '16edd5e5d9ad2eb7b3a61deef2aa1feb1cfc287ce85eeaf42e2a174f30aec361',
    archive: archives.paper,
    navigation: '82d59217e998a5ec5f158ec7712947f07e1ad9329691c64bb09e58f54e625f44',
  },
  issue5R30Print: {
    ...behaviorProfiles.deferredMedia,
    theme: themes.current,
    space: '16edd5e5d9ad2eb7b3a61deef2aa1feb1cfc287ce85eeaf42e2a174f30aec361',
    archive: archives.paper,
    navigation: 'ae5de1cdfe8c7d0c609ddddf28250acad7aa65b0be9b9a85c0a14e2d10add79d',
  },
  issue5ReviewMarkdown: {
    ...behaviorProfiles.deferredMedia,
    theme: themes.current,
    space: 'fc83d10942db803777271def1034cacfb332ebf4848016f8e0021f4b203e35ff',
    archive: archives.paper,
    navigation: '92472210d3b6cc8689392237f084dd168a03e8d0647d693c502a7446c1eeb761',
  },
  issue5ReaderLoading: {
    ...behaviorProfiles.paper,
    theme: themes.current,
    space: '470e7ee294aa005ae84e71e5d2087eea0e07f289ab86d357823be94f291f6e8e',
    archive: archives.paper,
    navigation: 'def30421363bb90dd537cccf4f0c734d281c61050067d3f1fa434c9a01a7f4a1',
  },
  issue5ReaderMotion: {
    ...behaviorProfiles.wholeBlocks,
    theme: themes.current,
    space: '470e7ee294aa005ae84e71e5d2087eea0e07f289ab86d357823be94f291f6e8e',
    archive: archives.paper,
    navigation: '41eb305c17ef1be2ab6cd302a7aef65a79d8a548b30fa38d971867692d2653b9',
  },
  issue5ReaderInteractions: {
    ...behaviorProfiles.interactive,
    theme: themes.current,
    space: '4bc594dfdff3d567d497a840a03e26aadb5d8de5d701010bac5380dc9f3c31ea',
    archive: archives.paper,
    navigation: '9304a7c1e351e06beaea730fb814b420e8ab94d17d662eb3d137bd044fce52a0',
  },
  issue5ReaderVisibleBlocks: {
    ...behaviorProfiles.reader,
    theme: themes.current,
    space: '4fafe059ff287ad5accc9b1404fbc75c4db4a034f8ba2581824b31405f0680f2',
    archive: archives.paper,
    navigation: 'f34e5595bed38bff0a29123e4c92316bf25dad21baf073ca74ef0d0fddfefdf4',
  },
  issue5ReaderBlockElements: {
    ...behaviorProfiles.reader,
    theme: themes.current,
    space: '4fafe059ff287ad5accc9b1404fbc75c4db4a034f8ba2581824b31405f0680f2',
    archive: archives.paper,
    navigation: '3b8ab951f96b0b10887af06db22079124233a975a0b8217502d01b506be86bf7',
  },
  issue5CalmReader: {
    ...behaviorProfiles.reader,
    theme: themes.current,
    space: '4fafe059ff287ad5accc9b1404fbc75c4db4a034f8ba2581824b31405f0680f2',
    archive: archives.paper,
    navigation: 'f1c61812a5650b0a0cc6819a8e308be3a2b8810d6487fee1b51dcd3861738044',
  },
  issue5EditorialReader: {
    ...behaviorProfiles.reader,
    theme: themes.current,
    space: '4fafe059ff287ad5accc9b1404fbc75c4db4a034f8ba2581824b31405f0680f2',
    archive: archives.editorial,
    navigation: '9d4dc3de3d0acec893c90e59d4039bf9974921937bf7a51a07840243c7208038',
  },
  issue5RealArticle: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '4fafe059ff287ad5accc9b1404fbc75c4db4a034f8ba2581824b31405f0680f2',
    archive: archives.article,
    navigation: '26197e2d01b6b052db18864f7ac29c4d017810c1922e26bd2ce28364f9cb6a9b',
  },
  issue5ReaderNativeHistory: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '5f4dc5f28fd9425975e4faa5a587f3b63c0217b216b2210a2762f1dc6e4c5597',
    archive: archives.article,
    navigation: '26197e2d01b6b052db18864f7ac29c4d017810c1922e26bd2ce28364f9cb6a9b',
  },
  issue106ReaderCorrections: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '5f4dc5f28fd9425975e4faa5a587f3b63c0217b216b2210a2762f1dc6e4c5597',
    archive: archives.article,
    navigation: '62b524beb9fb8f5364cd179b986628bda0e3694f824c646bf0338423fabda14f',
  },
  issue106ReaderMaterials: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    archive: archives.article,
    navigation: 'de284482d7712000da599f9fe7eef5ee867dcc60b56b12a18e9c5b35542633cf',
  },
  issue5TagHistory: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    archive: archives.article,
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
  },
  issue5PublicationTags: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    archive: archives.tags,
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
  },
  issue5GenericReader: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    archive: archives.generic,
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
  },
  issue5ReaderResources: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    archive: archives.generic,
    navigation: 'f30dd4d3c8090cfe12f372d1f5e592e7627f1f8c4c138674a19175549a3debcf',
  },
  legacy: {
    ...behaviorProfiles.spatial,
    theme: themes.legacy,
    space: 'e8fad3a3b68c999c67597617de862036ec7a9e835e39fc1a737ea4522c0ff6d6',
    navigation: '63460e40eb0ee7d2e2d3001365bc2e85b88edb964cbd34852a7d58c58eafe6e4',
  },
  fixed: {
    ...behaviorProfiles.blocks,
    theme: themes.legacy,
    space: '0107d6fc8c2ae706a562d6d80423af35c2ceb3c2459981b25dae9e897865feb4',
    navigation: 'f801bba9717cf262bee2c8d2ee529d4b1b995c8b3984e7a72a4619288a9910f2',
  },
  issue76: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue5: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6',
  },
  issue5History: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '1420a74b6ad087c9e639c239d1ca860f4708c881ff435b4b3b2f994080f1c358',
  },
  issue5Departure: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7ae5bf170b71969aed8bd4ed71738e11857b89036cc0e1a5a7607fce2a5749f6',
  },
  issue5Smooth: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'f60f16a7c7293c0b9d801546a53f5ce13d2443bf06cc3c6cd15d2a032a71123e',
  },
  issue5Viewport: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7d8d577ced2dfd8e9662ec2d0dedc010df1989f2f80d86a06fd139e44fed5e7c',
  },
  issue5Content: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    archive: archives.generic,
    navigation: 'b798fd75ba58f2b4e4cfec97b0c65275f3ffd006b23c04f4d53d9273c19b9c2a',
  },
  issue5Presentation: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    archive: archives.generic,
    navigation: 'c6b943e797d98d4001a726a22b728d49fa2b81ca1da5a421017d0e8e3e7b51ef',
  },
  issue39WritingTbt: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39CssClock: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'f01ebd2fecef1164f68f40b032e0857ba232ba89b9af4bb85c208a3e10e3203e',
  },
  issue122ReadingBatch: {
    ...behaviorProfiles.blocks,
    theme: themes.current,
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: '5e78b3adb00439c7e4e0d3e95801803a0f110a1dd2ac599901278177768c3b7e',
  },
};
// Production uses the exact plain CSS bytes; it retains a distinct identity and edition guard.
const styles = {
  readerPaper: {
    plain: 'feec1cfd6dc5c920f2a2cbfd8a0f7b4b97b273315aa8b57d6591e65aff4aea20',
    staging: 'f742ff9a2e9e0bf2d1f3a8662f3c3080b77fed8c35cf746a8be90ccc8f2b9379',
  },
  readerMotion: {
    plain: '1c63819933458fc2aedd2ca54bfab4a0e000d59971b68da6e56abd6c048455ae',
    staging: '65d357b68be405b2fdb482f49dc5aa77594761d06e771d2c0d5365b3072643b7',
  },
  readerInteractions: {
    plain: '0b66eb34fc3f4e094cf924123054065a2dddd49e06d510c387099eba4d2b2d31',
    staging: 'b2aed8ab0ea20e42e9a6559d4ae07051198f656dc2f141f387cd74a10ee007a4',
  },
  readerVisibleBlocks: {
    plain: 'd8018d672d2d5791d802f76f73df209838807fd1f0ce88a23d8baa3ccb09f4b9',
    staging: 'eb184154bda61f825c989318a21c052cdcf01a5b16a769e8fbc1415ed9c7258e',
  },
  readerBlocks: {
    plain: '4353b7f0b9c42807aec027b2cdc1a72b0496c7874ae5086727fc08bfd66c8e0d',
    staging: '0bd3f89bf6407622cdb097baf63926c524898f8c69dafac59552bcb9d0129ab7',
  },
  calmReader: {
    plain: 'fa172655fdaa13fa7125fcd913a05c5c9d43551e2122a575f5348cf9b7950c13',
    staging: '48ea99fe993ff8c870cd92b5cfe5e50c74e2d8b96bc222e1959ca0e66bb0c0a4',
  },
  editorialReader: {
    plain: 'b87628400e51f96ae836144ce749a64792a1944ca1ccfd77f5209e6baf905f09',
    staging: 'dd184c812dc9fad32a8651ab061187c4ea1a5a2d4ca3335a6c24dcadc7403628',
  },
  readerMode: {
    plain: 'ef62faa96b45ced4bdac6aae85d0cf6ab4c0885b01298d0a1413111ba16c6b59',
    staging: 'd2b0501f5e1e73c14739a77b8c89e4fa12c6f1ac720779b7b3cba13ebd9f768c',
  },
  articleReader: {
    plain: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
    staging: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  genericReader: {
    plain: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
    staging: '12342444a81c54686eb840bda16c0afc40a569badd6644d8696437f031f8e64f',
  },
  legacy: {
    plain: 'ddf1e07ba9097140acc81cb79b6fbfcfee8d4ce4c5c624d95a6a4713cc0d524e',
    staging: '2a31faafb8f4f49b89a46b10d8e4f05a8aef86ca29133d2ff8a18bd6a10d2545',
  },
  fixed: {
    plain: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
    staging: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  article: {
    plain: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
    staging: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  presentation: {
    plain: 'c8fe7b17aebfc8890d7e6711c11c4c19f0dcee1c5fdc912abc64554f47293819',
    staging: '1807811a0be488799b26fc953210d78d2a66626d8466d9d6fa345855697e7a6b',
  },
  licensed: {
    plain: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
    staging: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
};
const families = {
  // Cold Writing preparation yields before its first paint; other R3 bytes match.
  issue122WritingStartup: {
    requiresPublicationRights: true,
    ...byteProfiles.issue122R3Platform,
    space: '9c12d83a6a738d80847819a7fff061910302512905f21426d0dcef876b974fec',
    id: 'issue122-writing-startup',
    baseEngine: 'a41ab65b9c8182318ae1333272289aac5d651fa1e19cc075609632b5fb082b85',
    styles: styles.readerPaper,
    plain: '628847e508a6091997ab314b52e5b79323e741778463d6491e544a6023007b5f',
    staging: '993315bbe3ce601abf0fdec276455f4e50892be022805cbbae86991ca16bd4c5',
    production: '9f647eb087b95c60a025c6f68823d91f52880ebb250b96b385c84cc1985256c1',
  },
  // Exact integrated platform bytes; acceptance still uses the existing full route.
  issue122R3Platform: {
    requiresPublicationRights: true,
    ...byteProfiles.issue122R3Platform,
    id: 'issue122-r3-platform',
    baseEngine: '43054e4d9861831ec39cbf2e4217ca33b13959bb329959fd7a86413b2ddea3d2',
    styles: styles.readerPaper,
    plain: 'ba98907322811d153fb4d67a1941bf847c6b505b15164943902774a95556d965',
    staging: '4040aee07b41e837fa0f8a95c7ecd0d263922097e62e9dbcbc07668729ab3de6',
    production: '10ea7815a570596cecc18432660293f87bf0e6a9a836d91495fd48dbc6a6ce14',
  },
  // R30 native print hierarchy changes producer identity; browser bytes match R29.
  issue5R30Print: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5R30Print,
    id: 'issue5-r30-print',
    baseEngine: 'c4aa9fa8604178e3ca297f5158cf62563f5eb3448a82b3b12f97a8a48f461f11',
    styles: styles.readerPaper,
    plain: 'fba2e4029b56b03c2f701fb5ea883a36a512fc8319af6bf42c272fcfe1f010c9',
    staging: '15891192cb1cfc9b5701234f77e7a54a2ffc6c31ec2cc95db699d1a9d94b656e',
    production: 'b6fac470206f55a3e9d130d4f5296f06fff9ae9840f63a5fd1ce803998dbe43e',
  },
  // Print indentation and canonical upload paths change identity, not browser bytes.
  issue5ReviewPaths: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5R30Print,
    id: 'issue5-review-paths',
    baseEngine: '36e9a52051ed974d077e86ea028f5c57838370418637c71391fdf0c9e1eca297',
    styles: styles.readerPaper,
    plain: '63e9b907837a5861fc6135ff150fbc3c7acae1131a7c8175a766022a92f8b194',
    staging: '5ca6283cd1013ea9815c4fdce0d057cbba70112ec73ec410c3ca97310f98ce6b',
    production: '41905cd01e0bf085262746917416f07cd6efded6868c038c612996b84c417bb0',
  },
  // Review PDF wrapping changes engine identity; browser bytes match the CPU family.
  issue5ReviewPrint: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5R30Print,
    id: 'issue5-review-print',
    baseEngine: '7373993efca8ba40ab7e30805ee156e975f842a3b1e122c17e6ebcdc1b73bcff',
    styles: styles.readerPaper,
    plain: '3bf38f00aa57eda569e085da8e6a2d59187dfd12cfa68b370ab27cf29a372688',
    staging: '3398b3711463015cd67800d7b477ac5603b056941c111a2a5c151cd6074039e2',
    production: '9c559ba9789cdaf5f083c6ec461d2660f4cb98e754b4b8b678fd629b4b3ab602',
  },
  // Native Canvas field dispatch and reader measurements after initial DOM assembly.
  issue5ReaderCpu: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5R30Print,
    id: 'issue5-reader-cpu',
    baseEngine: 'f25ab5a57a12f3c428957ca79e7e82e99bd480799646a218b9fda34934ffcc10',
    styles: styles.readerPaper,
    plain: '65251b15f2901166c8ad14076130e5e4a699dce776b896576999db17aa674f93',
    staging: '970dbe51c3f4b3e04f36d1be6c492888cf915141f8e4ac0f05f73fbc9beaabfc',
    production: '16c8fa33fa98fdd1a07df1d664fc674ecac1d2dc049c480378e9d92b94986ceb',
  },
  // Review-export producer inputs change identity; verified browser bytes are unchanged.
  issue5ReviewMarkdown: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReviewMarkdown,
    id: 'issue5-review-markdown',
    baseEngine: '0ae47df264d0690aa610d865f4ea8086aa2a9e1c934a44a3a1ea8e5c1e119a6f',
    styles: styles.readerPaper,
    plain: '40fdfd7664c5dd3466a20be9f9794c56d8a87a4d370f56b539312fdbf67de134',
    staging: 'e09f54aadf05ddd71b90ebfa5f51fbc76667ff3fa1176776ea3621273d4e6558',
    production: 'baf693a92f010b96304c2a31361bf7470ed61d9cdd060d0eaec8e19ad4a2b55d',
  },
  // Inert route snapshots and immediate reduced preference reconciliation.
  issue5ReaderDeferredMedia: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReviewMarkdown,
    id: 'issue5-reader-deferred-media',
    baseEngine: 'd69a96a542eb40eb8d61b03f083c6c108ee25e2632e0be415196a49767aa1764',
    styles: styles.readerPaper,
    plain: '0b6fbd4132f9b8a53cccecfbfeb81688ce0e296b17f3d9f44724057e62508b73',
    staging: 'bd7be6807f5af1b55242d40ab6205aa853463652810404dd7fef8a7993311dcd',
    production: 'ab314d676baa2a5457065ea122605db5cdb26103449a470117f3f72f15764185',
  },
  // Native lazy figure scheduling changes build identity; all runtime bytes stay unchanged.
  issue5ReaderLoading: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderLoading,
    id: 'issue5-reader-loading',
    baseEngine: '8b1ed9dac9df54ed1c31e39dd2038eefa9bd9b97ba907e9b002ed3d543bed079',
    styles: styles.readerPaper,
    plain: 'bc1db661894c706dee0482d7d367dbb66dc2c8c4d25630e114f6a3781c1fbd1b',
    staging: 'fd838abc67a14285ffc66d7177db752884cf67c20a3a8938f6a6c5caa7df0ef9',
    production: '57d1253ed040753d3aca8995288e44e2ed9652a4090677eeaeeab8b619619749',
  },
  // Build-time reader correction; browser scripts and paper paint are unchanged.
  issue5ReaderFastMedia: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderLoading,
    id: 'issue5-reader-fast-media',
    baseEngine: '465c7fdee2b899e612605bad26cb211e9089be51903d18e66fad8a64ade8c4ac',
    styles: styles.readerPaper,
    plain: 'cfd354c6fd1f68205dd9854432f72bc6c01d181b48c54be1ba764f66409791a2',
    staging: 'f0b42c82040361ae0c681950d8b336d0eda3b5251a5a4b389a212d3a539d0a6c',
    production: '6b216a762dc5c262404154b7587582a3822219f722802f98fa3976b8303f514f',
  },
  issue5ReaderStaging: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderLoading,
    id: 'issue5-reader-staging',
    baseEngine: 'b75ffa5ea6716d564b3bbb07d18e2186642dc898c0f81a4090538d5e27344b0d',
    styles: styles.readerPaper,
    plain: '023756b3578cea9d41a42fd848e6722b24ddb3318319cdda1baed5fa619c4a36',
    staging: 'a2fda4ebe2311b62ea9f962ca3cc52c483b32b82a2743586e23fb61645fe7dd8',
    production: '3c736ea414c48e87addf18c2b7de4cf6a8f1317bb86c52ac86b9b3fa7c994a87',
  },
  // Shared paper joins the bounded reader component wave.
  issue5ReaderPaper: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderLoading,
    id: 'issue5-reader-paper',
    baseEngine: 'fce0a3284a9ed13b3fe77e933843d45ecb201c0e57bc5f498317fc31fbd1c5c2',
    styles: styles.readerPaper,
    plain: 'f2d01b7048192df64b125adddd52934765f9d84ce4d896ec074ecbcbb44b4e58',
    staging: 'fd8fa1dc7d409f31cf363ff6cbb24d6317b3f07b9cf44c9f3ada22625d93e2d1',
    production: 'de4418f3425cf647475a4529c96e2394c5fb1355f6ba98cd94f858f944472464',
  },
  // Complete reader component paint; common ambient scene lifecycle.
  issue5ReaderMotion: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderMotion,
    id: 'issue5-reader-motion',
    baseEngine: '8dd77389019a4c8d5afc55b5062c56ab0aed7d4d0ca8cdb7c5999257c427f957',
    styles: styles.readerMotion,
    plain: 'e1868e73b02f18d08267428f5c66331be7eb988efce5941c836d9887b2b358ea',
    staging: '670c37166c2dcd925d8f2c995029bad2f08334737d44eda6fdaaf9d504c49587',
    production: '0d7981f896208aeffd0016aecacf2357e6bfc94e64175b8463e2fc5b04c91c3f',
  },
  // Shared reader dialogs and topic navigation; settled article scene is calm.
  issue5ReaderInteractions: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderInteractions,
    id: 'issue5-reader-interactions',
    baseEngine: 'b49a998110f2d53f9e33968ac4f5461b2480b7a7acb8d3f469aa4dea96739def',
    styles: styles.readerInteractions,
    plain: '39f4cd1f251ed129edba919f2d0d5484d61b956d65a49211e53155ded0993d8f',
    staging: '572ac5ca61e9959ff16c7ef9925e6c8ae4e59e32d7c08cfa9dfc8899be1efad7',
    production: 'ce0332f273ced2f135d65fd45fe554f07b941deaf5f00e2203df752e1c09af3e',
  },
  // Issue5 visible block inventory: omit unpainted placeholders and keep overflow; same route and scene clocks.
  issue5ReaderVisibleBlocks: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderVisibleBlocks,
    id: 'issue5-reader-visible-blocks',
    baseEngine: 'a7bc7a337754e9b6c2f7c56d3b6b94bc236becfff4245e19c8cda877046a3343',
    styles: styles.readerVisibleBlocks,
    plain: 'db9a862fc8a1c4efa5edeb492e50b6351801261b7bcbcf4f03885d2975a06a82',
    staging: 'd51a358cd7b5ac776212d36a0275830b146e39579b2c83981eb114eac5c53795',
    production: '7fb9d467d106f7f5eb6e0e0e242c4d58e15eba9593ac0373091461b44f87c826',
  },
  // Issue5 reader semantic rule shell; same leaf-block runtime and scene clock.
  issue5ReaderBlockElements: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderBlockElements,
    id: 'issue5-reader-block-elements',
    baseEngine: 'b34f8929614cf1193b77348c1fcac699496a18376d7bc0d2a1cf5e34dd3d469f',
    styles: styles.readerBlocks,
    plain: 'bc90a675857a4649ada8e8eb666c63eed54c3b6bf21d95d635b82f2571060e05',
    staging: '27155a5060cdae103e6afe9c9d1d9542f637214b9c1c4c47ccd91e431e1e2bba',
    production: '441bb6356dfc8e2943e2a54ef891517cb803f8d27b7aee49887a1c3fa63c1bdc',
  },
  // Issue5 article leaf-block wave and hierarchy directions; shared notes UI, same camera clock.
  issue5ReaderBlocks: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderBlockElements,
    id: 'issue5-reader-blocks',
    baseEngine: '499425a331ec84cb35108453d1ed3f71353ab842928e100f2f9e316527777d21',
    styles: styles.readerBlocks,
    plain: '8018ef3137d35551e38020c0f7a8ba6cea4d0a6e6ba52f0d558fb5384d54e266',
    staging: 'adcd94efb13038267e8f33e1ec13d7050ab82372ecf0c029452df537f5c53526',
    production: '43df9670f9ad33bdb3877ac3bb2cd1c0f7a961f8e88c439bba9223b057ce8045',
  },
  // Issue5 calm reader: shared single column, native contents and grouped closing; same scene and clock.
  issue5CalmReader: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5CalmReader,
    id: 'issue5-calm-reader',
    baseEngine: '2435a6dae3b843c6fb9c926e90635818c575b331ea2f61247091dd1b2ec9e898',
    styles: styles.calmReader,
    plain: '1538a5372013affee43e9b79f1da4dfdc8dc4c46a6947cbe98dfcac34debd16a',
    staging: '6922dc85ca09e8fec33fdaa9f3b3358bfca7e1c0d24e0ea0ea4b61930231441c',
    production: '73dd48f2286404d890e77852e6881a937453cba86fb544fcf3d70ac20c2c1bb8',
  },
  // Editorial hierarchy/roles producer: reader typography changes; all four runtime scripts are identical.
  issue5EditorialReader: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5EditorialReader,
    id: 'issue5-editorial-reader',
    baseEngine: 'de7565a27af4002f529e471b1476c00279e6182c1534f37a9fce38cc0d53e196',
    styles: styles.editorialReader,
    plain: '23521753d7a431dafc1538be77ea47c0db60cd329f1de02a8434e47a655dfafa',
    staging: '49d7d90eb1101b04353d474ba15f416320c2755771f69cd4afea690b9089c8ee',
    production: '615c5485744941ca65a00866cf97ac9638e4050949158b3b2208f7190c502641',
  },
  // Reusable reader mode: shared presentation/lifecycle; Writing scene geometry is unchanged.
  issue5ReaderMode: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5EditorialReader,
    id: 'issue5-reader-mode',
    baseEngine: '1f94dbdfcd0d81e593164a085e9337f899738dddbe9e21d997c77c7e8e663eef',
    styles: styles.readerMode,
    plain: '8bd1f8206e0a41cd9e8b92e7f3f74e63966397f8e172d67b3f162d84b8237b12',
    staging: '0f8cc4ad0bc4166aa5967f5d1afb357529e12cfa63f1f9132e6faa0ade01bc78',
    production: 'c8a34994ca50f6ac3c1859cd7b46f3191c3842c951807f67ee52bda73a5f3abc',
  },
  // Real-article rendition producer; delivered orbit runtime bytes are unchanged.
  issue5RealArticle: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5RealArticle,
    id: 'issue5-real-article',
    baseEngine: 'b3990c073a30842dd982c166d16d59bc17588d9fecf5fb72edb7a368bf89efb7',
    styles: styles.articleReader,
    plain: '2d68478cf5fb583ad130da6874480db3884ab0b6be6142a600754bfb24e35678',
    staging: '66f85f025e091091b1815a99cbffac896ea90348457f3c7daa356b6300356891',
    production: '586489b212ded320c20553b15586b73204c61cdffb5a882e54d318daf2d83a60',
  },
  // Issue5 delivery producer revision; orbit runtime bytes remain identical.
  issue5DeliveryMain: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5RealArticle,
    id: 'issue5-delivery-main',
    baseEngine: '51766901172d964490fa2495a4c85b9c010eda52541a03c75b76a5219ccb1900',
    styles: styles.articleReader,
    plain: 'b3fa2b9423ab425bd81744b55e3ec7d98c3bc7524d0f1e24279978aaf66e1c2d',
    staging: 'ead120e3f8afad7908ba13cc961db6de38cb104a7adcb92c620b54123da3c10e',
    production: 'ecb227ed244c75be6155719055df8d3cef76e008a6374aef85f97b18c7654ce7',
  },
  issue5Delivery: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5RealArticle,
    id: 'issue5-delivery',
    baseEngine: 'fe06ca108e5588c1e08c0e87cd9a308e970e89a0c598fcb6644d0b142d65fb7e',
    styles: styles.articleReader,
    plain: '1ea77dfc5472558a3885577175f0e2713eb120da23157a048ce234af378576d6',
    staging: '67dccca08c0f6afa5b6122d9b2e1cae3e5bcef2f5f6604969a73932091cf71c1',
    production: 'e9a32daab86aeff9f59af2d2e59fb445481d9c97fa5e4bf39a6ecf46b22c43e9',
  },
  // Issue5 reader orbit: same-scene geometry and cancellation independently reviewed in PR79.
  issue5ReaderOrbit: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5RealArticle,
    id: 'issue5-reader-orbit',
    baseEngine: '5d32de3b5bd9856a376c7347f61b9964231c1f25f6dbdfbf56f66293cf32af3e',
    styles: styles.articleReader,
    plain: '8c9bae11a7bef3ada0849d19e66bd10a583978d7cdd117a98c93bd1c78d30a77',
    staging: '51b3e2e4d1817f28fa2a02e9a4eb507362d299ecbee2e4a95df4bb10fff53c73',
    production: '41b1f53b5dd0f5eecbf93e5c5f63124c6400b45f071c12afbea2a5b583545fea',
  },
  // Issue5 independent native reader history review: bounded host alias recognition.
  issue5ReaderNativeHistory: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderNativeHistory,
    id: 'issue5-reader-native-history',
    baseEngine: 'ef7716cb697d2af720e04c3a8f1d7ccbb0b6a62f78aabbfdf4b8610e1d7b75ac',
    styles: styles.articleReader,
    plain: '71f9ff318f0f968cc342e49210ca7abc955c85701c4795945f5c8a2ee24adf03',
    staging: '9df7a7fe7eb59dd9de9ff9a8d926fbea140a3709c6cf11229aa2e336296e405b',
    production: 'f86384348c19d23023799eddd65ef34fde0fec4e93acccebdfc381bd87bf2123',
  },
  issue106ReaderCorrections: {
    requiresPublicationRights: true,
    ...byteProfiles.issue106ReaderCorrections,
    id: 'issue106-reader-corrections',
    baseEngine: '2a8fc6d497c38a669e55417276b18f9359c2c7802111124f8bde053b34af4ec6',
    styles: styles.articleReader,
    plain: 'cacdd8c68f82e349cffc80c7c46c11ea4b6788f1df8018f90bf54c4d8ba1b4f5',
    staging: '76fb6d23b495ae2fd98f0ebc540bdfd0b9616a89735137159b855bbc03a0eacf',
    production: '7d9d02e53bc1fc1246089b1e396d1801333a72f25900c2a8971dbbcc300a090b',
  },
  // Issue5 independent reader-flight review: signed local document trip and history direction.
  issue5ReaderFlight: {
    requiresPublicationRights: true,
    ...byteProfiles.issue106ReaderCorrections,
    id: 'issue5-reader-flight',
    baseEngine: '4dd8f591aa75d9dde64358c03481902d032ad893f535a36f1ed4a9cafd1d323e',
    styles: styles.articleReader,
    plain: 'e52d0469ebf5aad6dfd10a0cb7470d7de00379639bf76500c9768ec128089b0e',
    staging: 'ed26dfbd7db7261e16fdaa9c67f855c597a10221b672c24de636ea83d2aa9a49',
    production: '4b89ff2b730bb3dc25cea506708c130457013afaaa9eb833d753a1129b2a3639',
  },
  // Issue106 self-review: selected material links; exact new resource behavior is tested.
  issue106ReaderMaterials: {
    requiresPublicationRights: true,
    ...byteProfiles.issue106ReaderMaterials,
    id: 'issue106-reader-materials',
    baseEngine: 'f05675e22407efb397a11bc3f9b823c2595c603f7a2b1e7623353850a6d6013a',
    styles: styles.articleReader,
    plain: '617ffe2feb6aa9e83d21f719bc827fbf4147e013cf4fbaf7b313302eb557e8ab',
    staging: 'e218d0ad5d3bdea13de6de3e7022aa0c841438c37fcc45b84c6c81c91bbf27ab',
    production: '11c81fc93b7ba04a6024065df43b3e4db074e09312758331669f99aa21eaf905',
  },
  // Issue5 self-review: optional tag/index component; scene and navigation behavior preserved.
  issue5TagHistory: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5TagHistory,
    id: 'issue5-tag-history',
    baseEngine: '7afd713fdbfc5b76bcc9a627d57c96be54900356251d2be52f228fb935e698b5',
    styles: styles.articleReader,
    plain: 'beb722380f784500d9d7a456f426569c0f87a56c7eeca0742d3e0e7ce55bdab0',
    staging: '92c35192a76774b43602fa6c29ad1e29bf906200dd73b36d7364207cee5a3532',
    production: '9aa6ae46ca99367a738ac0cd8b892c5bedf279464121421722057382515d9d13',
  },
  issue5PublicationTags: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5PublicationTags,
    id: 'issue5-publication-tags',
    baseEngine: '77d41ae5fb7911f61e73f060d5b08bef94b88d50f2a00c68e867089303c8bffa',
    styles: styles.articleReader,
    plain: '622789e11a1bcf483e5dfb277226b873fec89d2d6694d8907daa348cad7cd630',
    staging: '34072105decc5584d9a54e0c6a59bf708de9af14db0dfd5a426eb8e7e4a1e9c4',
    production: '4149b67d2f4f2736f56b777501d14d6ea30626d65f2fb92734c42dde3d07f141',
  },
  // Issue5 self-review: explicit template selection and verified native offline WebP.
  issue5GenericReader: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5GenericReader,
    id: 'issue5-generic-reader',
    baseEngine: 'd65f9a0b17a14a80292d0ef7638d18c3f4639a7ec02c4c84cedcac18d7e5e875',
    styles: styles.genericReader,
    plain: '182939eafde360ec7371554bd8433680f6d59eeb318e54cb671babd9fb11c547',
    staging: 'f7241068e842a3d03cefe57d97701e2dd9f8bbd5cc571353b6467c58b02ea350',
    production: '04e2eaf048e5a8cbab0d674938cce20df26ff63d7fd24df40ec9dfc014b99b39',
  },
  // Issue5 self-review: reader resource/notices producer changed; all five runtime bytes match issue5Reconciled.
  issue5ReaderResources: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderResources,
    id: 'issue5-reader-resources',
    baseEngine: '9aa5d9bba34f001dcc868a9ebdc64c5b58748ab62a0c09d432cc06282a4d3595',
    styles: styles.genericReader,
    plain: '3e7f573d02a9f973eac2fabd1b0cc98fb91b82a527ace99b41d2fccb8651663a',
    staging: '9b4f4cb63c1e1dc9a2b5d8a6a65e86560ab5504f8f2df65b0692710ff0f4271f',
    production: '8aa18d270794908ce98dc95d631dba2d67f54c4de74176a5672ac53fbaa5f324',
  },
  issue5Reconciled: {
    requiresPublicationRights: true,
    ...byteProfiles.issue5ReaderResources,
    id: 'issue5-reconciled',
    baseEngine: '2c6db864d4d349effa52078d3fa77d8dbc6c89d044c74c9cb55680c762285452',
    styles: styles.genericReader,
    plain: '7acc79ca1645e6269866a09243c28a405a960898d4a937f8b877468b8a7baa94',
    staging: 'ff6746cb27316ab12f898dd46f6da34800f98413c84358e530405d59d2e48be6',
    production: '67aad573db12f043210a3a98b4e0f26f43d4bddb2c824d46ee21108f8ddf7177',
  },
  legacy: {
    ...byteProfiles.legacy,
    id: 'legacy',
    baseEngine: 'fa4a705a0e232b75f58804ea4fd3b39a3b40c9a3e7343c09937a85378aae67d4',
    styles: styles.legacy,
    plain: 'bb973c6459ba89fbbaa7abb6b2bfb67f9adc675efc382bf9a864d308acde8a54',
    staging: 'b1fcbb9696d8e0fdc2c0fc35713f2a62048934f6840c0d2c0c683c26d0b84241',
  },
  fixed: {
    ...byteProfiles.fixed,
    id: 'fixed',
    baseEngine: 'b7db2524761e66f58160f2af8d245fdbc55d275ccc0a649673bb8afc53d5c9cc',
    styles: styles.fixed,
    plain: '6b1ce6de9ab93436fefa3fe2e37d5948c47f01b909799598ed1c2e805592f5f4',
    staging: '7ffe1583b7fdb3f2858fba4ff294dea55e5ab2a80229b81210cf1005f4b8038e',
  },
  issue76: {
    ...byteProfiles.issue76,
    id: 'issue76',
    baseEngine: '8ced6511a9420f145dd3409e168e0f9fa4786db025623165afa5e3cc13a6741d',
    styles: styles.fixed,
    plain: '57999380a42cf44132b21d6d1a11fdb814abeaaac38ff3e25311ad6cd38052f8',
    staging: '49ab29ede2d117832a79151f02da524001024fa2109f79a9b55b7921bbb3dbd6',
    production: 'a7fed56c7d5019efd5c5dbf4b88c6fea711bd0c30a418cafcbb587a6af726442',
  },
  issue5: {
    ...byteProfiles.issue5,
    id: 'issue5',
    baseEngine: '2a34c34118bf22ebf9f07eed5ad1141c26bc91c1e1db7e32466aca46ef106ecc',
    styles: styles.article,
    plain: 'f25b16d9a69db8d07fcbf6271f32c86f6b23de2307d6db6fb45fc0863902e915',
    staging: 'fff8aed9032b954389b7527f244b88ad9f52ca41c182f21bbc378d43283f1ab7',
  },
  issue5Continuation: {
    ...byteProfiles.issue5,
    id: 'issue5-continuation',
    baseEngine: 'af3a14857c7bb84dc91c9f06da5825daace4f5d66e629205633ecdc7886e6436',
    styles: styles.article,
    plain: '0229f6f6ec90eece1750e83b8b9df9d5476f1be589b060475f2d10a015f641fc',
    staging: 'fa2fe668f6ebf5d2f4d80e963e01d8ec76f348dd750f3a304406edb410390710',
  },
  issue5History: {
    ...byteProfiles.issue5History,
    id: 'issue5-history',
    baseEngine: 'e9b83a6e561336d27ddeb1865284183f73dc669db08842a17d67312abbc1110e',
    styles: styles.article,
    plain: '89d1c671dac5be16b0a1da03a61af5f7d94927c209b8ab6ba4399c9f48a6ad1b',
    staging: 'fe21d1d32c68ef39ed1ff6476310f96ddb724190db0bdc42890f4814ab09a45f',
  },
  issue5Departure: {
    ...byteProfiles.issue5Departure,
    id: 'issue5-departure',
    baseEngine: 'c32097fa36598b2fea92e1af6882d877063dd06dc03fb6e88b3d3eeb2559b40d',
    styles: styles.article,
    plain: '9f04d35b2c92b9f6298b65fff35a843dc55a6e25bf7a9927251cd6f7892ed3f9',
    staging: 'de4bc3cb43106d8b2900a5ef5c6a9327a2571da106d483f33b792cafee6f3531',
  },
  issue5Smooth: {
    ...byteProfiles.issue5Smooth,
    id: 'issue5-smooth',
    baseEngine: '2708a2e1f0ec3fcfb4f37fafce3bf4bec6f7811c98d6a7312e097092fc377ed0',
    styles: styles.article,
    plain: 'dc829c53956977cfc7783375668bc3c2fff3fdbda9efb02f77e49a8a348cf978',
    staging: '95b145ea1b981045847944ae3234bce094b73e109c93a08b30b3c447c7261a99',
  },
  issue5Viewport: {
    ...byteProfiles.issue5Viewport,
    id: 'issue5-viewport',
    baseEngine: 'a63e6d65c5437c80391655159ef802d162bf565033cba453be9abbbcc7eae787',
    styles: styles.article,
    plain: '695f497e5cb6ebd6b7b4320583b951c00dcc963c1cbcf8ccef1406ef0d01a79d',
    staging: 'cdff9548271f4dc89def0455f4b564f49b22331aafcbccb9d3e39d97767e9233',
  },
  issue5Content: {
    ...byteProfiles.issue5Content,
    id: 'issue5-content',
    baseEngine: '0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a',
    styles: styles.article,
    plain: '89c395df74b1e626735d0757f9572836fd2d3365b2deefe31b7ca46982cd219e',
    staging: 'dfa648a40b6218f1a6b881db08c518af0b7f50a22dd06994eb988a9c947146b7',
  },
  issue5Presentation: {
    ...byteProfiles.issue5Presentation,
    id: 'issue5-presentation',
    baseEngine: 'c2fc0582c0b25787336b818e47be5cb0e0c79b74760de5d3d6250869818c5496',
    styles: styles.presentation,
    plain: '746181d6405b33c331e78582d04881afe6aea951e2c60206f916b8a0db0d5ab4',
    staging: '7e29127b8945042693b0f4e3441dea57a257b95cf82d92d60a53c8b59a24cba3',
  },
  // Reviewed 2026-10-15: reader-link producers changed; the five runtime files did not.
  issue5ReaderLinks: {
    ...byteProfiles.issue5Presentation,
    id: 'issue5-reader-links',
    baseEngine: 'f15399168dba87612abc5bbff88845def9cb5b798ce108db0c6f1afdf84a52a0',
    styles: styles.presentation,
    plain: 'f6840a34e158431bdbb8ca4a3701267e876a6ba96260208d512456834bf7e563',
    staging: '59bfc6f8f2f2e88059cbffdf2b49fd3222624b27d786019418bc14e379ef8a85',
  },
  issue39: {
    ...byteProfiles.issue76,
    id: 'issue39',
    baseEngine: '77a4d80ad8427e79d10a7c3cb6a5dd20a858296b74fef3e735e5f20578a428ad',
    styles: styles.fixed,
    plain: '38fd594346f5250133ff433c27bc25eb2e1bfc7865f53dd3a3be783690d14fcc',
    staging: '20001067aff1664b0dafe384dc1de7e3a1ce4d4a5647cc84d9f3eed639f63af8',
    production: 'b4202b7c567affcaaad94eec403329d45ea18fbfd886ac0a3556926ca045f196',
  },
  issue39Licensed: {
    requiresPublicationRights: true,
    ...byteProfiles.issue76,
    id: 'issue39-licensed',
    baseEngine: '53bb494ae3b2bc9ea5b838755ee5b2b9c48fab7183fc6c53a2461dc44dbb004f',
    styles: styles.licensed,
    plain: '3f806604b25fb2f7f8fa04c9a2338c6dc8780a8e6894e7300fb0a28c272e7827',
    staging: '79a40d3f5166b1ac87575db60bd9f24bcaef768d8158b7a963ae181ec58e777b',
    production: 'bb5a2643fed4d2caef69289634bffe4a35b0ceef2345affbf3be6f25903c9c06',
  },
  issue39LicensedCompact: {
    requiresPublicationRights: true,
    ...byteProfiles.issue76,
    id: 'issue39-licensed-compact',
    baseEngine: '73ab537313a205583a5a1f912161092f7b98994d4415a1f70696e0236af7a0b8',
    styles: styles.licensed,
    plain: '80cda9414465974ced82ba891839ed7d6ec6e8a7d2194d3cd6122e323f263bf3',
    staging: '2c543a78d13b006840f151d99fdbf5f551e001d9ee04bbbed636a55fe6b6017d',
    production: 'b848de73373003be1f141f9d51d30d6fa7343df0b33ce41e00713335d553083e',
  },
  issue39WritingTbt: {
    requiresPublicationRights: true,
    ...byteProfiles.issue39WritingTbt,
    id: 'issue39-writing-tbt',
    baseEngine: 'ed13aef9321a94422fbe8c5b72150a7eb5f9f1ec883c61a0ad9a800dfc0655a5',
    styles: styles.licensed,
    plain: '7e19acc943d0748d3976c989f2cea4f8126832de378a371aa71ecd091b75cab8',
    staging: '4bbfd81338ddb659308ed833aa519d34f136278bacd6638efcdded6f8e968e2e',
    production: '6f9b49f746e1a5f2e18138d8d34ee0f9dd2b35b7a68d6b6cbe2b015424e28cf4',
  },
  issue39CssClock: {
    requiresPublicationRights: true,
    ...byteProfiles.issue39CssClock,
    id: 'issue39-css-clock',
    baseEngine: 'd698a6c7db0821170873540183fb4443e3c84a65b1daee7f5368add4d2d7a9cb',
    styles: styles.licensed,
    plain: '6d9f94052d390ec92e5583543c1934b3c1c0796274759589a42cb44d38424714',
    staging: '0144ed548a9d191f9dd27ce2542f7dd829d540f67a7f37f0466a3700cce03729',
    production: '1f922d2579f25cfd67186d2f8e0d0fd517c35aaef9ebef8d5a14d3aa30519b17',
  },
  issue122ReadingBatch: {
    requiresPublicationRights: true,
    ...byteProfiles.issue122ReadingBatch,
    id: 'issue122-reading-batch',
    baseEngine: 'c9d33c990c64a1559211a0dcdf4ce9d1262a4e561489e4aedb74d897623220b7',
    styles: styles.licensed,
    plain: 'f0e456610c92933f2eee9977e5d6c9a70c5a8303f42be406c672318077c51190',
    staging: 'b5574a8dfb5c2c08eca0ed253aeda05e8d0fd3b2cbd69360fcf880436a0c6803',
    production: '3434d837588d950585ae419c407f95043a6a6920eaf9ebec9b08873ad8c6228a',
  },
};
// Expand only explicitly reviewed editions; an absent edition is never admitted.
const runtimes = Object.entries(families).flatMap(([family, value]) =>
  ['plain', 'staging', 'production']
    .filter((edition) => value[edition])
    .map((edition) => ({
      id: value.id + '-' + edition,
      family,
      edition,
      fingerprint: value[edition],
      styles: value.styles[edition === 'staging' ? 'staging' : 'plain'],
    }))
);
function reviewedRuntime(id) {
  const runtime = runtimes.find((item) => item.id === id);
  assert.ok(runtime, 'unknown reviewed Color runtime');
  const family = families[runtime.family];
  return {
    id: runtime.id,
    behavior: family.behavior,
    edition: runtime.edition,
    variant: {
      id: 'color',
      contract: 1,
      fingerprint: runtime.fingerprint,
      baseEngine: family.baseEngine,
      effects: ['travel'],
    },
    files: {
      'styles.css': runtime.styles,
      'theme.js': family.theme,
      'space.js': family.space,
      'archive.js':
        family.archive || '1307b2405daa50937e5746f4d8a71230842718377d853b4d0cf4704e7f2de9ad',
      'navigation.js': family.navigation,
    },
  };
}
function select(manifest) {
  const variant = common.variant(manifest);
  assert.equal(variant.id, 'color', 'Color motion requires a Color artifact');
  const declared = runtimes.find((item) => item.fingerprint === variant.fingerprint);
  assert.ok(declared, 'unreviewed Color motion runtime');
  const runtime = reviewedRuntime(declared.id);
  assert.deepEqual(variant, runtime.variant, 'conflicting Color motion identity');
  assert.equal(manifest.components?.engine, variant.fingerprint, 'Color engine differs');
  assert.equal(manifest.components?.contract, 1, 'Color scene contract differs');
  assert.deepEqual(
    manifest.edition,
    runtime.edition === 'staging'
      ? { id: 'staging', indexable: false, analytics: false }
      : runtime.edition === 'production'
        ? {
            id: 'production',
            indexable: true,
            origin: 'https://vitaliioborskyi.ai',
          }
        : undefined,
    'Color runtime edition differs'
  );
  for (const [name, hash] of Object.entries(runtime.files)) {
    assert.equal(manifest.files?.[name]?.sha256, hash, 'unreviewed Color bytes: ' + name);
    assert.equal(
      manifest.files?.['runtime/' + variant.fingerprint + '/' + name]?.sha256,
      hash,
      'conflicting immutable Color bytes: ' + name
    );
  }
  return runtime;
}
function publicationRequired(source, revision) {
  // Trusted family policy requires evidence; candidate metadata cannot grant clearance.
  const licensed = runtimes
    .filter((runtime) => families[runtime.family].requiresPublicationRights === true)
    .map((runtime) => reviewedRuntime(runtime.id));
  // Known licensed fingerprints or bytes still require exact identity/edition verification.
  const knownBytes = licensed.some(
    (runtime) =>
      runtime.variant.fingerprint === revision.engine ||
      Object.entries(runtime.files).every(
        ([name, sha256]) => source.files?.[name]?.sha256 === sha256
      )
  );
  const actual = { components: revision };
  if (!knownBytes && common.variant(actual).id !== 'color') return false;
  const candidate = { ...source, components: revision };
  const runtime = select(candidate);
  return licensed.some((reviewed) => reviewed.id === runtime.id);
}
function flightCheck(manifest) {
  return select(manifest).behavior === 'fixed-blocks' ? 'blockFlight' : 'spatialFlight';
}
function readerFamily(engine) {
  const runtime = runtimes.find((value) => value.fingerprint === engine);
  return runtime
    ? families[runtime.family]
    : Object.values(families).find((value) => value.baseEngine === engine);
}
function articleReadingMode(engine) {
  return readerFamily(engine)?.articleReading || 'entry';
}
function readerWholeBlocksRequired(engine) {
  return readerFamily(engine)?.readerWholeBlocks === true;
}
function readerPaperRequired(engine) {
  return readerFamily(engine)?.readerPaper === true;
}
function readerDeferredMediaRequired(engine) {
  return readerFamily(engine)?.readerDeferredMedia === true;
}
function readerInteractionsRequired(engine) {
  return readerFamily(engine)?.readerInteractions === true;
}
function fixedReadingEvidence(row) {
  const scroll = row.home?.scroll,
    builder = require('../site/build.cjs'),
    model = builder.model(common.root, builder.configuration(common.root).definitions);
  assert.equal(scroll?.label, 'selected-responses', 'missing fixed Home scroll evidence');
  assert.ok(Number.isFinite(scroll.end) && scroll.end >= 0, 'invalid fixed Home scroll range');
  assert.deepEqual(
    scroll.samples.map((sample) => sample.fraction),
    [0.9, 0.95, 0.99, 1],
    'missing fixed Home native gestures'
  );
  assert.deepEqual(
    JSON.parse(scroll.start),
    model.routePose('index', model.poses[model.initialPoses.index]),
    'fixed Home authored reading pose differs'
  );
  for (const sample of scroll.samples)
    assert.equal(sample.camera, scroll.start, 'reported fixed reading camera moved');
  assert.equal(scroll.samples.at(-1).y, scroll.end, 'reported fixed Home misses native bottom');
}
function validateFlight(row, manifest) {
  if (select(manifest).behavior === 'fixed-blocks') {
    fixedReadingEvidence(row);
    require('./block-flight.cjs').checkTiming(row.flight);
    return;
  }
  assert.ok(
    row.flight?.some(
      (sample) => sample.plane.flightStage === 'depart' && Number(sample.plane.flightDepth) > 0
    )
  );
  assert.ok(
    row.flight.some(
      (sample) => sample.plane.flightStage === 'arrive' && Number(sample.plane.flightDepth) < 0
    )
  );
}
// The reviewed block checker consumes this exact candidate pacing contract.
const contract = Object.freeze({
  maximumRows: 24,
  rows: Object.freeze({ durationMs: 700, phaseMs: 1000 }),
});
function rowPlan(width, rows) {
  assert.ok(Number.isFinite(width) && width > 0, 'missing pacing viewport');
  assert.ok(
    Number.isInteger(rows) && rows >= 0 && rows <= contract.maximumRows,
    'unbounded visual row plan'
  );
  const duration = rows === 1 ? contract.rows.phaseMs : contract.rows.durationMs;
  return {
    rowDurationMs: rows ? duration : 0,
    rowStepMs: rows > 1 ? (contract.rows.phaseMs - duration) / (rows - 1) : 0,
    plannedDurationMs: rows ? contract.rows.phaseMs : 0,
  };
}
module.exports = {
  select,
  reviewedRuntime,
  publicationRequired,
  flightCheck,
  articleReadingMode,
  readerInteractionsRequired,
  readerWholeBlocksRequired,
  readerPaperRequired,
  readerDeferredMediaRequired,
  validateFlight,
  contract,
  rowPlan,
};
