
import https from "https";
import http from "http";

const DEFAULT_BACKOFF_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30_000;

let githubBackoffUntil = 0;
let lastBackoffNoticeAt = 0;

function getBackoffDuration(headers: any): number {
  const retryAfter = Number(headers["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 60 * 60 * 1000);
  }
  const resetAt = Number(headers["x-ratelimit-reset"]) * 1000;
  if (Number.isFinite(resetAt) && resetAt > Date.now()) {
    return Math.min(resetAt - Date.now(), 60 * 60 * 1000);
  }
  return DEFAULT_BACKOFF_MS;
}

function noteRateLimit(status: number, headers: any): void {
  const remaining = headers["x-ratelimit-remaining"];
  const isRateLimited =
    status === 403 ||
    status === 429 ||
    remaining === "0";

  if (!isRateLimited) {
    if (status >= 200 && status < 300) githubBackoffUntil = 0;
    return;
  }
  githubBackoffUntil = Math.max(
    githubBackoffUntil,
    Date.now() + getBackoffDuration(headers),
  );
  if (Date.now() - lastBackoffNoticeAt > 30_000) {
    lastBackoffNoticeAt = Date.now();
    console.warn(
      `[GitHub Sync] API temporarily unavailable (${status}); ` +
        `using local/remote fallback until ${new Date(githubBackoffUntil).toISOString()}.`,
    );
  }
}

async function requestIpv4(urlStr: string, options: any): Promise<any> {
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
      timeout: REQUEST_TIMEOUT_MS,
    };
    
    const req = mod.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        resolve({
          status: res.statusCode || 200,
          ok: (res.statusCode || 200) >= 200 && (res.statusCode || 200) < 300,
          headers: {
            get: (name: string) => res.headers[name.toLowerCase()]
          },
          json: async () => JSON.parse(data),
          text: async () => data,
          rawHeaders: res.headers,
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

export async function githubFetch(
  input: string,
  init: RequestInit = {},
): Promise<any | null> {
  if (Date.now() < githubBackoffUntil) return null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await requestIpv4(input, init);
      noteRateLimit(response.status, response.rawHeaders);
      return response;
    } catch (err: any) {
      if (attempt === 3) {
        throw err;
      }
      console.warn(`[GitHub Sync] fetch failed on attempt ${attempt} (${err.message}). Retrying...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
  return null;
}
