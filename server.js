const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "src");
const MESSAGES_FILE = path.join(__dirname, "messages.json");
const MAX_BODY_BYTES = 10 * 1024;
const RATE_LIMIT = { windowMs: 15 * 60 * 1000, max: 5 };

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
  ".woff2": "font/woff2",
};

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

// ---------- Static files ----------
function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad request", "text/plain");
  }
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    return send(res, 403, "Forbidden", "text/plain");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) return send(res, 404, "Not found", "text/plain");
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    send(res, 200, data, type);
  });
}

// ---------- Contact API ----------
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT.max;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(ip);
  }
}, RATE_LIMIT.windowMs).unref();

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function validate({ name, email, message }) {
  if (typeof name !== "string" || !name.trim() || name.length > 100) return "Please enter a valid name.";
  if (typeof email !== "string" || email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email.";
  }
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 2000) {
    return "Message must be between 10 and 2000 characters.";
  }
  return null;
}

// Serialize writes so concurrent requests don't overwrite each other.
let writeQueue = Promise.resolve();

function saveMessage(entry) {
  writeQueue = writeQueue.then(async () => {
    let messages = [];
    try {
      messages = JSON.parse(await fs.promises.readFile(MESSAGES_FILE, "utf8"));
    } catch {
      // file missing or empty: start fresh
    }
    messages.push(entry);
    await fs.promises.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  });
  return writeQueue;
}

async function handleContact(req, res) {
  if (isRateLimited(req.socket.remoteAddress)) {
    return send(res, 429, { error: "Too many messages. Please try again later." });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (err) {
    return send(res, err.status || 400, { error: err.message });
  }

  // Honeypot filled: pretend success so bots don't retry.
  if (body.website) return send(res, 200, { ok: true });

  const error = validate(body);
  if (error) return send(res, 400, { error });

  try {
    await saveMessage({
      name: body.name.trim(),
      email: body.email.trim(),
      message: body.message.trim(),
      receivedAt: new Date().toISOString(),
    });
    console.log(`New message from ${body.name.trim()} <${body.email.trim()}>`);
    send(res, 200, { ok: true });
  } catch (err) {
    console.error("Failed to save message:", err);
    send(res, 500, { error: "Could not save your message. Please try again later." });
  }
}

// ---------- Server ----------
const server = http.createServer((req, res) => {
  if (req.url === "/api/contact") {
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" });
    return handleContact(req, res);
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method not allowed", "text/plain");
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
