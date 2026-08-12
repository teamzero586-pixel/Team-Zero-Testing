const fs = require('fs');
const file = '/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/node.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'if (preferDedupe || semver.gte(other.version, this.version)) {',
  'let gteResult = false; try { gteResult = semver.gte(other.version || "0.0.0", this.version || "0.0.0"); } catch(e) { gteResult = false; } if (preferDedupe || gteResult) {'
);
fs.writeFileSync(file, content);
console.log("Patched node.js");
