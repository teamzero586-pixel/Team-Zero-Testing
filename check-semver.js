const fs = require('fs');
const semver = require('semver');
const glob = require('glob'); // Not available? I'll use child_process
const { execSync } = require('child_process');

const files = execSync('find . -name package.json -not -path "*/node_modules/*"').toString().trim().split('\n');

for (const file of files) {
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    if (pkg[depType]) {
      for (const [name, version] of Object.entries(pkg[depType])) {
        if (version === '*' || version === 'latest') continue;
        if (!semver.validRange(version)) {
          console.log(`Invalid version in ${file}: ${name}@${version}`);
        }
      }
    }
  }
}
