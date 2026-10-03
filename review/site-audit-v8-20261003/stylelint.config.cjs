const path = require('node:path');
module.exports = {extends:[path.join(process.env.SITE_AUDIT_TOOLS || '/tmp/site-v8-audit', 'node_modules/stylelint-config-standard/index.js')]};
