const fs = require('fs');
const files = require('child_process').execSync('find . -name package.json -not -path "*/node_modules/*"').toString().trim().split('\n');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"version":\s*"0\.0\.0"/g, '"version": "1.0.0"');
  fs.writeFileSync(file, content);
}
console.log("Done fixing versions");
