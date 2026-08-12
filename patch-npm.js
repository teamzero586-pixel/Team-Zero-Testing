const fs = require('fs');
const file = '/usr/local/lib/node_modules/npm/node_modules/semver/classes/semver.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'throw new TypeError(`Invalid Version: ${version}`)',
  'console.error(">>> INVALID VERSION FOUND:", version, "type:", typeof version, "stack:", new Error().stack); throw new TypeError(`Invalid Version: ${version}`)'
);
fs.writeFileSync(file, content);
console.log("Patched!");
