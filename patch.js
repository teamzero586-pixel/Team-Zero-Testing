const fs = require("fs");
const path = "artifacts/api-server/src/lib/github-sync.ts";
let code = fs.readFileSync(path, "utf8");
code = code.replace(/export async function githubFetch[\s\S]+/, `export async function githubFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response | null> {
  if (Date.now() < githubBackoffUntil) return null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(input, {
        ...init,
        signal: init.signal ?? controller.signal,
      });
      noteRateLimit(response);
      return response;
    } catch (err: any) {
      if (attempt === 3 || err.name === "AbortError") {
        throw err;
      }
      console.warn(\`[GitHub Sync] fetch failed on attempt \${attempt} (\${err.message}). Retrying...\`);
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}
`);
fs.writeFileSync(path, code);
