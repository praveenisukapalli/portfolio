const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { promisify } = require("node:util");

const gzip = promisify(zlib.gzip);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "src");
const NOT_FOUND_PAGE = path.join(PUBLIC_DIR, "404.html");
const COMPRESSIBLE = new Set([".html", ".css", ".js", ".json", ".svg", ".txt"]);
const MIN_GZIP_BYTES = 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://formspree.io",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// ---------- Static files ----------
// Gzipped bodies are cached per file version (ETag) so each asset is compressed once.
const gzipCache = new Map();

async function compress(filePath, etag, data) {
  const cached = gzipCache.get(filePath);
  if (cached && cached.etag === etag) return cached.body;
  const body = await gzip(data);
  gzipCache.set(filePath, { etag, body });
  return body;
}

async function serveFile(req, res, filePath, status = 200) {
  const stat = await fs.promises.stat(filePath);
  if (!stat.isFile()) throw Object.assign(new Error("Not a file"), { code: "EISDIR" });

  const ext = path.extname(filePath).toLowerCase();
  const etag = `W/"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
  const headers = {
    ...SECURITY_HEADERS,
    "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    // Assets aren't fingerprinted, so always revalidate; unchanged files return a cheap 304.
    "Cache-Control": "no-cache",
    ETag: etag,
    "Last-Modified": stat.mtime.toUTCString(),
  };

  const ifNoneMatch = req.headers["if-none-match"];
  if (status === 200 && ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === etag)) {
    res.writeHead(304, headers);
    return res.end();
  }

  let body = await fs.promises.readFile(filePath);
  if (COMPRESSIBLE.has(ext)) {
    headers.Vary = "Accept-Encoding";
    if (body.length >= MIN_GZIP_BYTES && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      body = await compress(filePath, etag, body);
      headers["Content-Encoding"] = "gzip";
    }
  }

  headers["Content-Length"] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}

async function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad request", "text/plain; charset=utf-8");
  }
  if (pathname.includes("\0")) return send(res, 400, "Bad request", "text/plain; charset=utf-8");
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  }

  try {
    await serveFile(req, res, filePath);
  } catch (err) {
    if (!["ENOENT", "EISDIR", "ENOTDIR"].includes(err.code)) console.error("Static file error:", err);
    try {
      await serveFile(req, res, NOT_FOUND_PAGE, 404);
    } catch {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
    }
  }
}

// ---------- Server ----------
function createServer() {
  return http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
    }
    serveStatic(req, res);
  });
}

module.exports = { createServer };

if (require.main === module) {
  createServer().listen(PORT, () => {
    console.log(`Portfolio running at http://localhost:${PORT}`);
  });
}
