const fs = require('fs');
const file = '/usr/local/lib/node_modules/npm/node_modules/@npmcli/arborist/lib/node.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'canDedupe (preferDedupe = false) {',
  'canDedupe (preferDedupe = false) { if (this.version === "" || this.target?.version === "") console.error(">>> EMPTY VERSION NODE:", this.name, this.location, this.package);'
);
fs.writeFileSync(file, content);
console.log("Patched arborist!");
