'use strict';
// Transitional controller compatibility for reviewed Color runtime families.
// Fingerprints alone cannot authorize a branch: the verified runtime bytes must
// also match. New runtime bytes require a separately reviewed contract update.
const assert = require('node:assert/strict');
const common = require('./common.cjs');
const families = {
  issue106ReaderCorrections: {
    behavior: 'fixed-blocks',
    baseEngine: '2a8fc6d497c38a669e55417276b18f9359c2c7802111124f8bde053b34af4ec6',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '5f4dc5f28fd9425975e4faa5a587f3b63c0217b216b2210a2762f1dc6e4c5597',
    navigation: '62b524beb9fb8f5364cd179b986628bda0e3694f824c646bf0338423fabda14f',
    archive: 'e5077478895fbe15af0cbd3fe586bcefbdc4327b2921efcc84b64ace50c52760',
  },
  // Issue5 independent reader-flight review: signed local document trip and history direction.
  issue5ReaderFlight: {
    behavior: 'fixed-blocks',
    baseEngine: '4dd8f591aa75d9dde64358c03481902d032ad893f535a36f1ed4a9cafd1d323e',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '5f4dc5f28fd9425975e4faa5a587f3b63c0217b216b2210a2762f1dc6e4c5597',
    navigation: '62b524beb9fb8f5364cd179b986628bda0e3694f824c646bf0338423fabda14f',
    archive: 'e5077478895fbe15af0cbd3fe586bcefbdc4327b2921efcc84b64ace50c52760',
  },
  // Issue106 self-review: selected material links; exact new resource behavior is tested.
  issue106ReaderMaterials: {
    behavior: 'fixed-blocks',
    baseEngine: 'f05675e22407efb397a11bc3f9b823c2595c603f7a2b1e7623353850a6d6013a',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'de284482d7712000da599f9fe7eef5ee867dcc60b56b12a18e9c5b35542633cf',
    archive: 'e5077478895fbe15af0cbd3fe586bcefbdc4327b2921efcc84b64ace50c52760',
  },
  // Issue5 self-review: optional tag/index component; scene and navigation behavior preserved.
  issue5TagHistory: {
    behavior: 'fixed-blocks',
    baseEngine: '7afd713fdbfc5b76bcc9a627d57c96be54900356251d2be52f228fb935e698b5',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
    archive: 'e5077478895fbe15af0cbd3fe586bcefbdc4327b2921efcc84b64ace50c52760',
  },
  issue5PublicationTags: {
    behavior: 'fixed-blocks',
    baseEngine: '77d41ae5fb7911f61e73f060d5b08bef94b88d50f2a00c68e867089303c8bffa',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
    archive: '0d1bfbbea3736f49ae83e0e0fbaa603038764f6887a63760c1e4e982180f7745',
  },
  // Issue5 self-review: explicit template selection and verified native offline WebP.
  issue5GenericReader: {
    behavior: 'fixed-blocks',
    baseEngine: 'd65f9a0b17a14a80292d0ef7638d18c3f4639a7ec02c4c84cedcac18d7e5e875',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: '081d79445f07b7a0fd0525de02d8e19f5dc3638e97f8a026117ed6c7ec44723e',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },
  // Issue5 self-review: reader resource/notices producer changed; all five runtime bytes match issue5Reconciled.
  issue5ReaderResources: {
    behavior: 'fixed-blocks',
    baseEngine: '9aa5d9bba34f001dcc868a9ebdc64c5b58748ab62a0c09d432cc06282a4d3595',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'f30dd4d3c8090cfe12f372d1f5e592e7627f1f8c4c138674a19175549a3debcf',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },

  issue5Reconciled: {
    behavior: 'fixed-blocks',
    baseEngine: '2c6db864d4d349effa52078d3fa77d8dbc6c89d044c74c9cb55680c762285452',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'f30dd4d3c8090cfe12f372d1f5e592e7627f1f8c4c138674a19175549a3debcf',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },
  legacy: {
    behavior: 'following-spatial',
    baseEngine: 'fa4a705a0e232b75f58804ea4fd3b39a3b40c9a3e7343c09937a85378aae67d4',
    theme: 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
    space: 'e8fad3a3b68c999c67597617de862036ec7a9e835e39fc1a737ea4522c0ff6d6',
    navigation: '63460e40eb0ee7d2e2d3001365bc2e85b88edb964cbd34852a7d58c58eafe6e4',
  },
  fixed: {
    behavior: 'fixed-blocks',
    baseEngine: 'b7db2524761e66f58160f2af8d245fdbc55d275ccc0a649673bb8afc53d5c9cc',
    theme: 'b6df1591a86ce1f18662e26679926f5433febd935c453952f2443f78f2c0e0ee',
    space: '0107d6fc8c2ae706a562d6d80423af35c2ceb3c2459981b25dae9e897865feb4',
    navigation: 'f801bba9717cf262bee2c8d2ee529d4b1b995c8b3984e7a72a4619288a9910f2',
  },
  issue76: {
    behavior: 'fixed-blocks',
    baseEngine: '8ced6511a9420f145dd3409e168e0f9fa4786db025623165afa5e3cc13a6741d',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue5: {
    behavior: 'fixed-blocks',
    baseEngine: '2a34c34118bf22ebf9f07eed5ad1141c26bc91c1e1db7e32466aca46ef106ecc',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6',
  },
  issue5Continuation: {
    behavior: 'fixed-blocks',
    baseEngine: 'af3a14857c7bb84dc91c9f06da5825daace4f5d66e629205633ecdc7886e6436',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '96a22c3c86cdd43d32bed415a57d0f45148fc29a9952567e5d4e7e40396e92c6',
  },
  issue5History: {
    behavior: 'fixed-blocks',
    baseEngine: 'e9b83a6e561336d27ddeb1865284183f73dc669db08842a17d67312abbc1110e',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '1420a74b6ad087c9e639c239d1ca860f4708c881ff435b4b3b2f994080f1c358',
  },
  issue5Departure: {
    behavior: 'fixed-blocks',
    baseEngine: 'c32097fa36598b2fea92e1af6882d877063dd06dc03fb6e88b3d3eeb2559b40d',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7ae5bf170b71969aed8bd4ed71738e11857b89036cc0e1a5a7607fce2a5749f6',
  },
  issue5Smooth: {
    behavior: 'fixed-blocks',
    baseEngine: '2708a2e1f0ec3fcfb4f37fafce3bf4bec6f7811c98d6a7312e097092fc377ed0',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'f60f16a7c7293c0b9d801546a53f5ce13d2443bf06cc3c6cd15d2a032a71123e',
  },
  issue5Viewport: {
    behavior: 'fixed-blocks',
    baseEngine: 'a63e6d65c5437c80391655159ef802d162bf565033cba453be9abbbcc7eae787',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: '7d8d577ced2dfd8e9662ec2d0dedc010df1989f2f80d86a06fd139e44fed5e7c',
  },
  issue5Content: {
    behavior: 'fixed-blocks',
    baseEngine: '0bd39d2137c0b6ea2c9066c849573f22741a100098814f923f8022b07d46475a',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'b798fd75ba58f2b4e4cfec97b0c65275f3ffd006b23c04f4d53d9273c19b9c2a',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },
  issue5Presentation: {
    behavior: 'fixed-blocks',
    baseEngine: 'c2fc0582c0b25787336b818e47be5cb0e0c79b74760de5d3d6250869818c5496',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'c6b943e797d98d4001a726a22b728d49fa2b81ca1da5a421017d0e8e3e7b51ef',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },
  // Reviewed 2026-10-15: reader-link producers changed; the five runtime files did not.
  issue5ReaderLinks: {
    behavior: 'fixed-blocks',
    baseEngine: 'f15399168dba87612abc5bbff88845def9cb5b798ce108db0c6f1afdf84a52a0',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'c6b943e797d98d4001a726a22b728d49fa2b81ca1da5a421017d0e8e3e7b51ef',
    archive: '10c3d24bd56766a08c764c2b5a9fa81df78afd22e426a634e5450e8fb24f6efe',
  },
  issue39: {
    behavior: 'fixed-blocks',
    baseEngine: '77a4d80ad8427e79d10a7c3cb6a5dd20a858296b74fef3e735e5f20578a428ad',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39Licensed: {
    behavior: 'fixed-blocks',
    baseEngine: '53bb494ae3b2bc9ea5b838755ee5b2b9c48fab7183fc6c53a2461dc44dbb004f',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39LicensedCompact: {
    behavior: 'fixed-blocks',
    baseEngine: '73ab537313a205583a5a1f912161092f7b98994d4415a1f70696e0236af7a0b8',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: '0632b41dbfdc9e931db7513729c88b625240673c5a039c2bc61686cf15578487',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39WritingTbt: {
    behavior: 'fixed-blocks',
    baseEngine: 'ed13aef9321a94422fbe8c5b72150a7eb5f9f1ec883c61a0ad9a800dfc0655a5',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'e91efc5dccd49673849d989de9ec5ca5eacbfe445752c085e19f04d808dcc31b',
  },
  issue39CssClock: {
    behavior: 'fixed-blocks',
    baseEngine: 'd698a6c7db0821170873540183fb4443e3c84a65b1daee7f5368add4d2d7a9cb',
    theme: '6500c6baeb508580d979b799fe8f2db5a031bc8cec6461da6c5598d28275de5a',
    space: 'd5d1593e9c0c76910e68d5c965714f68af73bf2b26480f8835f784b02f953c41',
    navigation: 'f01ebd2fecef1164f68f40b032e0857ba232ba89b9af4bb85c208a3e10e3203e',
  },
};
const runtimes = [
  {
    id: 'issue106-reader-corrections-production',
    family: 'issue106ReaderCorrections',
    edition: 'production',
    fingerprint: '7d9d02e53bc1fc1246089b1e396d1801333a72f25900c2a8971dbbcc300a090b',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue106-reader-corrections-plain',
    family: 'issue106ReaderCorrections',
    edition: 'plain',
    fingerprint: 'cacdd8c68f82e349cffc80c7c46c11ea4b6788f1df8018f90bf54c4d8ba1b4f5',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue106-reader-corrections-staging',
    family: 'issue106ReaderCorrections',
    edition: 'staging',
    fingerprint: '76fb6d23b495ae2fd98f0ebc540bdfd0b9616a89735137159b855bbc03a0eacf',
    styles: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  {
    id: 'issue5-reader-flight-production',
    family: 'issue5ReaderFlight',
    edition: 'production',
    fingerprint: '4b89ff2b730bb3dc25cea506708c130457013afaaa9eb833d753a1129b2a3639',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-reader-flight-plain',
    family: 'issue5ReaderFlight',
    edition: 'plain',
    fingerprint: 'e52d0469ebf5aad6dfd10a0cb7470d7de00379639bf76500c9768ec128089b0e',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-reader-flight-staging',
    family: 'issue5ReaderFlight',
    edition: 'staging',
    fingerprint: 'ed26dfbd7db7261e16fdaa9c67f855c597a10221b672c24de636ea83d2aa9a49',
    styles: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  {
    id: 'issue106-reader-materials-production',
    family: 'issue106ReaderMaterials',
    edition: 'production',
    fingerprint: '11c81fc93b7ba04a6024065df43b3e4db074e09312758331669f99aa21eaf905',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue106-reader-materials-staging',
    family: 'issue106ReaderMaterials',
    edition: 'staging',
    fingerprint: 'e218d0ad5d3bdea13de6de3e7022aa0c841438c37fcc45b84c6c81c91bbf27ab',
    styles: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  {
    id: 'issue106-reader-materials-plain',
    family: 'issue106ReaderMaterials',
    edition: 'plain',
    fingerprint: '617ffe2feb6aa9e83d21f719bc827fbf4147e013cf4fbaf7b313302eb557e8ab',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-tag-history-production',
    family: 'issue5TagHistory',
    edition: 'production',
    fingerprint: '9aa6ae46ca99367a738ac0cd8b892c5bedf279464121421722057382515d9d13',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-tag-history-plain',
    family: 'issue5TagHistory',
    edition: 'plain',
    fingerprint: 'beb722380f784500d9d7a456f426569c0f87a56c7eeca0742d3e0e7ce55bdab0',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-tag-history-staging',
    family: 'issue5TagHistory',
    edition: 'staging',
    fingerprint: '92c35192a76774b43602fa6c29ad1e29bf906200dd73b36d7364207cee5a3532',
    styles: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  {
    id: 'issue5-publication-tags-production',
    family: 'issue5PublicationTags',
    edition: 'production',
    fingerprint: '4149b67d2f4f2736f56b777501d14d6ea30626d65f2fb92734c42dde3d07f141',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-publication-tags-plain',
    family: 'issue5PublicationTags',
    edition: 'plain',
    fingerprint: '622789e11a1bcf483e5dfb277226b873fec89d2d6694d8907daa348cad7cd630',
    styles: '358112c885a415ab809328d463f3ff0786c8b090e1fc377a62f35f2a04725189',
  },
  {
    id: 'issue5-publication-tags-staging',
    family: 'issue5PublicationTags',
    edition: 'staging',
    fingerprint: '34072105decc5584d9a54e0c6a59bf708de9af14db0dfd5a426eb8e7e4a1e9c4',
    styles: '0f172ce76a054c39df2d0c2ad36c945dcb402f0143bf89d434ece6bb75ea1180',
  },
  {
    id: 'issue5-generic-reader-production',
    family: 'issue5GenericReader',
    edition: 'production',
    fingerprint: '04e2eaf048e5a8cbab0d674938cce20df26ff63d7fd24df40ec9dfc014b99b39',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },
  {
    id: 'issue5-generic-reader-plain',
    family: 'issue5GenericReader',
    edition: 'plain',
    fingerprint: '182939eafde360ec7371554bd8433680f6d59eeb318e54cb671babd9fb11c547',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },
  {
    id: 'issue5-generic-reader-staging',
    family: 'issue5GenericReader',
    edition: 'staging',
    fingerprint: 'f7241068e842a3d03cefe57d97701e2dd9f8bbd5cc571353b6467c58b02ea350',
    styles: '12342444a81c54686eb840bda16c0afc40a569badd6644d8696437f031f8e64f',
  },
  {
    id: 'issue5-reader-resources-plain',
    family: 'issue5ReaderResources',
    edition: 'plain',
    fingerprint: '3e7f573d02a9f973eac2fabd1b0cc98fb91b82a527ace99b41d2fccb8651663a',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },
  {
    id: 'issue5-reader-resources-staging',
    family: 'issue5ReaderResources',
    edition: 'staging',
    fingerprint: '9b4f4cb63c1e1dc9a2b5d8a6a65e86560ab5504f8f2df65b0692710ff0f4271f',
    styles: '12342444a81c54686eb840bda16c0afc40a569badd6644d8696437f031f8e64f',
  },
  {
    id: 'issue5-reader-resources-production',
    family: 'issue5ReaderResources',
    edition: 'production',
    fingerprint: '8aa18d270794908ce98dc95d631dba2d67f54c4de74176a5672ac53fbaa5f324',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },

  {
    id: 'issue5-reconciled-production',
    family: 'issue5Reconciled',
    edition: 'production',
    fingerprint: '67aad573db12f043210a3a98b4e0f26f43d4bddb2c824d46ee21108f8ddf7177',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },
  {
    id: 'issue5-reconciled-plain',
    family: 'issue5Reconciled',
    edition: 'plain',
    fingerprint: '7acc79ca1645e6269866a09243c28a405a960898d4a937f8b877468b8a7baa94',
    styles: '0febf1812d0748533e48b5ab6dfc4e8bac6c3c6a787ac9701aaf6ebbe61d5cdc',
  },
  {
    id: 'issue5-reconciled-staging',
    family: 'issue5Reconciled',
    edition: 'staging',
    fingerprint: 'ff6746cb27316ab12f898dd46f6da34800f98413c84358e530405d59d2e48be6',
    styles: '12342444a81c54686eb840bda16c0afc40a569badd6644d8696437f031f8e64f',
  },
  {
    id: 'legacy-plain',
    family: 'legacy',
    edition: 'plain',
    fingerprint: 'bb973c6459ba89fbbaa7abb6b2bfb67f9adc675efc382bf9a864d308acde8a54',
    styles: 'ddf1e07ba9097140acc81cb79b6fbfcfee8d4ce4c5c624d95a6a4713cc0d524e',
  },
  {
    id: 'legacy-staging',
    family: 'legacy',
    edition: 'staging',
    fingerprint: 'b1fcbb9696d8e0fdc2c0fc35713f2a62048934f6840c0d2c0c683c26d0b84241',
    styles: '2a31faafb8f4f49b89a46b10d8e4f05a8aef86ca29133d2ff8a18bd6a10d2545',
  },
  {
    id: 'fixed-plain',
    family: 'fixed',
    edition: 'plain',
    fingerprint: '6b1ce6de9ab93436fefa3fe2e37d5948c47f01b909799598ed1c2e805592f5f4',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'fixed-staging',
    family: 'fixed',
    edition: 'staging',
    fingerprint: '7ffe1583b7fdb3f2858fba4ff294dea55e5ab2a80229b81210cf1005f4b8038e',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  {
    id: 'issue76-plain',
    family: 'issue76',
    edition: 'plain',
    fingerprint: '57999380a42cf44132b21d6d1a11fdb814abeaaac38ff3e25311ad6cd38052f8',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue76-staging',
    family: 'issue76',
    edition: 'staging',
    fingerprint: '49ab29ede2d117832a79151f02da524001024fa2109f79a9b55b7921bbb3dbd6',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  {
    id: 'issue5-plain',
    family: 'issue5',
    edition: 'plain',
    fingerprint: 'f25b16d9a69db8d07fcbf6271f32c86f6b23de2307d6db6fb45fc0863902e915',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-staging',
    family: 'issue5',
    edition: 'staging',
    fingerprint: 'fff8aed9032b954389b7527f244b88ad9f52ca41c182f21bbc378d43283f1ab7',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-continuation-plain',
    family: 'issue5Continuation',
    edition: 'plain',
    fingerprint: '0229f6f6ec90eece1750e83b8b9df9d5476f1be589b060475f2d10a015f641fc',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-continuation-staging',
    family: 'issue5Continuation',
    edition: 'staging',
    fingerprint: 'fa2fe668f6ebf5d2f4d80e963e01d8ec76f348dd750f3a304406edb410390710',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-history-plain',
    family: 'issue5History',
    edition: 'plain',
    fingerprint: '89d1c671dac5be16b0a1da03a61af5f7d94927c209b8ab6ba4399c9f48a6ad1b',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-history-staging',
    family: 'issue5History',
    edition: 'staging',
    fingerprint: 'fe21d1d32c68ef39ed1ff6476310f96ddb724190db0bdc42890f4814ab09a45f',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-departure-plain',
    family: 'issue5Departure',
    edition: 'plain',
    fingerprint: '9f04d35b2c92b9f6298b65fff35a843dc55a6e25bf7a9927251cd6f7892ed3f9',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-departure-staging',
    family: 'issue5Departure',
    edition: 'staging',
    fingerprint: 'de4bc3cb43106d8b2900a5ef5c6a9327a2571da106d483f33b792cafee6f3531',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-smooth-plain',
    family: 'issue5Smooth',
    edition: 'plain',
    fingerprint: 'dc829c53956977cfc7783375668bc3c2fff3fdbda9efb02f77e49a8a348cf978',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-smooth-staging',
    family: 'issue5Smooth',
    edition: 'staging',
    fingerprint: '95b145ea1b981045847944ae3234bce094b73e109c93a08b30b3c447c7261a99',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-viewport-plain',
    family: 'issue5Viewport',
    edition: 'plain',
    fingerprint: '695f497e5cb6ebd6b7b4320583b951c00dcc963c1cbcf8ccef1406ef0d01a79d',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-viewport-staging',
    family: 'issue5Viewport',
    edition: 'staging',
    fingerprint: 'cdff9548271f4dc89def0455f4b564f49b22331aafcbccb9d3e39d97767e9233',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-content-plain',
    family: 'issue5Content',
    edition: 'plain',
    fingerprint: '89c395df74b1e626735d0757f9572836fd2d3365b2deefe31b7ca46982cd219e',
    styles: '02bee22b9ed7e3ad06b6a23b54bb881e36e2484ba7c8b1a0e6de2e93527373aa',
  },
  {
    id: 'issue5-content-staging',
    family: 'issue5Content',
    edition: 'staging',
    fingerprint: 'dfa648a40b6218f1a6b881db08c518af0b7f50a22dd06994eb988a9c947146b7',
    styles: 'b6751a18bfbba5ece49027c981018d10ba8537e4abf123921556615351e82363',
  },
  {
    id: 'issue5-presentation-plain',
    family: 'issue5Presentation',
    edition: 'plain',
    fingerprint: '746181d6405b33c331e78582d04881afe6aea951e2c60206f916b8a0db0d5ab4',
    styles: 'c8fe7b17aebfc8890d7e6711c11c4c19f0dcee1c5fdc912abc64554f47293819',
  },
  {
    id: 'issue5-presentation-staging',
    family: 'issue5Presentation',
    edition: 'staging',
    fingerprint: '7e29127b8945042693b0f4e3441dea57a257b95cf82d92d60a53c8b59a24cba3',
    styles: '1807811a0be488799b26fc953210d78d2a66626d8466d9d6fa345855697e7a6b',
  },
  {
    id: 'issue5-reader-links-plain',
    family: 'issue5ReaderLinks',
    edition: 'plain',
    fingerprint: 'f6840a34e158431bdbb8ca4a3701267e876a6ba96260208d512456834bf7e563',
    styles: 'c8fe7b17aebfc8890d7e6711c11c4c19f0dcee1c5fdc912abc64554f47293819',
  },
  {
    id: 'issue5-reader-links-staging',
    family: 'issue5ReaderLinks',
    edition: 'staging',
    fingerprint: '59bfc6f8f2f2e88059cbffdf2b49fd3222624b27d786019418bc14e379ef8a85',
    styles: '1807811a0be488799b26fc953210d78d2a66626d8466d9d6fa345855697e7a6b',
  },
  {
    id: 'issue76-production',
    family: 'issue76',
    edition: 'production',
    fingerprint: 'a7fed56c7d5019efd5c5dbf4b88c6fea711bd0c30a418cafcbb587a6af726442',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-plain',
    family: 'issue39',
    edition: 'plain',
    fingerprint: '38fd594346f5250133ff433c27bc25eb2e1bfc7865f53dd3a3be783690d14fcc',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-staging',
    family: 'issue39',
    edition: 'staging',
    fingerprint: '20001067aff1664b0dafe384dc1de7e3a1ce4d4a5647cc84d9f3eed639f63af8',
    styles: '545b7cb79e15706a80087ebc5cf5139b0c4af564d47f141b7a1ede0915c18a97',
  },
  {
    id: 'issue39-production',
    family: 'issue39',
    edition: 'production',
    fingerprint: 'b4202b7c567affcaaad94eec403329d45ea18fbfd886ac0a3556926ca045f196',
    styles: '302fb2878c83f919c5fbbe9fdcf9a11ef0094b720682924d9a7d76bf4846670e',
  },
  {
    id: 'issue39-licensed-plain',
    family: 'issue39Licensed',
    edition: 'plain',
    fingerprint: '3f806604b25fb2f7f8fa04c9a2338c6dc8780a8e6894e7300fb0a28c272e7827',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },

  {
    id: 'issue39-licensed-staging',
    family: 'issue39Licensed',
    edition: 'staging',
    fingerprint: '79a40d3f5166b1ac87575db60bd9f24bcaef768d8158b7a963ae181ec58e777b',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-licensed-production',
    family: 'issue39Licensed',
    edition: 'production',
    fingerprint: 'bb5a2643fed4d2caef69289634bffe4a35b0ceef2345affbf3be6f25903c9c06',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-licensed-compact-plain',
    family: 'issue39LicensedCompact',
    edition: 'plain',
    fingerprint: '80cda9414465974ced82ba891839ed7d6ec6e8a7d2194d3cd6122e323f263bf3',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-licensed-compact-staging',
    family: 'issue39LicensedCompact',
    edition: 'staging',
    fingerprint: '2c543a78d13b006840f151d99fdbf5f551e001d9ee04bbbed636a55fe6b6017d',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-licensed-compact-production',
    family: 'issue39LicensedCompact',
    edition: 'production',
    fingerprint: 'b848de73373003be1f141f9d51d30d6fa7343df0b33ce41e00713335d553083e',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-writing-tbt-plain',
    family: 'issue39WritingTbt',
    edition: 'plain',
    fingerprint: '7e19acc943d0748d3976c989f2cea4f8126832de378a371aa71ecd091b75cab8',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-writing-tbt-staging',
    family: 'issue39WritingTbt',
    edition: 'staging',
    fingerprint: '4bbfd81338ddb659308ed833aa519d34f136278bacd6638efcdded6f8e968e2e',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-writing-tbt-production',
    family: 'issue39WritingTbt',
    edition: 'production',
    fingerprint: '6f9b49f746e1a5f2e18138d8d34ee0f9dd2b35b7a68d6b6cbe2b015424e28cf4',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-css-clock-plain',
    family: 'issue39CssClock',
    edition: 'plain',
    fingerprint: '6d9f94052d390ec92e5583543c1934b3c1c0796274759589a42cb44d38424714',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
  {
    id: 'issue39-css-clock-staging',
    family: 'issue39CssClock',
    edition: 'staging',
    fingerprint: '0144ed548a9d191f9dd27ce2542f7dd829d540f67a7f37f0466a3700cce03729',
    styles: 'b1806c4d615b073dab84b07c2e216da08a017c3c3fc645b155cf16756bc00a91',
  },
  {
    id: 'issue39-css-clock-production',
    family: 'issue39CssClock',
    edition: 'production',
    fingerprint: '1f922d2579f25cfd67186d2f8e0d0fd517c35aaef9ebef8d5a14d3aa30519b17',
    styles: 'ecb7d4f77389e55b23c4fe63ed91258428fb8b28a895068c210cfba99ca1ba8c',
  },
];
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
        ? { id: 'production', indexable: true, origin: 'https://vitaliioborskyi.ai' }
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
function flightCheck(manifest) {
  return select(manifest).behavior === 'fixed-blocks' ? 'blockFlight' : 'spatialFlight';
}
function fixedReadingEvidence(row) {
  const scroll = row.home?.scroll,
    model = require('../../docs/space.js');
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
  flightCheck,
  validateFlight,
  contract,
  rowPlan,
};
