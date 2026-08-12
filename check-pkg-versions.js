const fs = require('fs');
const files = require('child_process').execSync('find . -name package.json -not -path "*/node_modules/*"').toString().trim().split('\n');

for (const file of files) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (pkg.version === undefined) {
    console.log(`MISSING version in ${file}`);
  } else if (pkg.version === '') {
    console.log(`EMPTY version in ${file}`);
  }
}
console.log("Done checking pkg versions");
