const fs = require("fs");
const path = "artifacts/api-server/src/lib/github-sync.ts";
let code = fs.readFileSync(path, "utf8");
code = code.replace(/if \(attempt === 3 \|\| err\.message === "Timeout"\) \{/, "if (attempt === 3) {");
fs.writeFileSync(path, code);
