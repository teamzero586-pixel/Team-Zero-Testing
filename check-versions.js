const fs = require('fs');
const files = require('child_process').execSync('find . -name package.json -not -path "*/node_modules/*"').toString().trim().split('\n');

for (const file of files) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[depType]) {
      for (const [name, version] of Object.entries(pkg[depType])) {
        if (!version || version.trim() === '') {
          console.log(`EMPTY version in ${file}: ${name}`);
        }
      }
    }
  }
}
console.log("Done");
