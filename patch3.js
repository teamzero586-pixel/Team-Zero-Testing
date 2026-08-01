const fs = require("fs");
const path = "artifacts/api-server/src/routes/sms-routes.ts";
let code = fs.readFileSync(path, "utf8");

const requestIpv4Code = `
import https from "https";
import http from "http";

async function requestIpv4(urlStr: string, options: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const mod = url.protocol === "https:" ? https : http;
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || "GET",
      headers: options.headers || {},
      family: 4,
      timeout: options.timeout || 15000,
    };
    
    const req = mod.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          status: res.statusCode || 200,
          ok: (res.statusCode || 200) >= 200 && (res.statusCode || 200) < 300,
          text: async () => data,
          json: async () => JSON.parse(data),
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Timeout"));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}
`;

code = code.replace('import { githubFetch } from "../lib/github-sync.js";', 'import { githubFetch } from "../lib/github-sync.js";' + requestIpv4Code);

// replace fetch in runTelegramRequest
code = code.replace(/const response = await fetch\(url, options\);/g, 'const response = await requestIpv4(url, options);');

// replace fetch in fetchWithTimeout
code = code.replace(/const response = await fetch\(url, \{[\s\S]+?signal: controller\.signal[\s\S]+?\}\);/g, 'const response = await requestIpv4(url, { ...options, timeout });');

fs.writeFileSync(path, code);
