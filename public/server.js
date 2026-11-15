/*
 * Static file server for the built React app on Azure App Service (Linux, Node).
 * Azure runs this file automatically when it sits in /home/site/wwwroot.
 *
 * - Brotli / gzip compression for text assets (compressed once, then cached in memory)
 * - Long-term caching for hashed files in /static, no caching for index.html
 * - Single-page-app fallback: unknown routes return index.html
 * - No dependencies: only Node built-ins
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;
const INDEX = path.join(ROOT, "index.html");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};
const COMPRESSIBLE = new Set([".html", ".js", ".mjs", ".css", ".json", ".map", ".txt", ".xml", ".svg", ".ttf", ".eot", ".ico"]);
const HIDDEN = new Set(["server.js"]);

const cache = new Map(); // key: file|encoding|mtime -> Buffer

function compressed(file, stat, encoding) {
  const key = `${file}|${encoding}|${stat.mtimeMs}`;
  let buf = cache.get(key);
  if (!buf) {
    const raw = fs.readFileSync(file);
    buf =
      encoding === "br"
        ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
        : zlib.gzipSync(raw, { level: 9 });
    cache.set(key, buf);
  }
  return buf;
}

function pickEncoding(header) {
  const h = String(header || "");
  if (/\bbr\b/.test(h)) return "br";
  if (/\bgzip\b/.test(h)) return "gzip";
  return null;
}

function resolveFile(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  const file = path.normalize(path.join(ROOT, decoded));
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) return null; // path traversal
  if (HIDDEN.has(path.basename(file))) return null;
  try {
    const stat = fs.statSync(file);
    if (stat.isFile()) return { file, stat };
    if (stat.isDirectory()) {
      const idx = path.join(file, "index.html");
      const s2 = fs.statSync(idx);
      if (s2.isFile()) return { file: idx, stat: s2 };
    }
  } catch {
    /* not found */
  }
  return null;
}

function send(req, res, file, stat, status = 200) {
  const ext = path.extname(file).toLowerCase();
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  const headers = {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control":
      ext === ".html"
        ? "no-cache"
        : rel.startsWith("static/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=86400",
    "Last-Modified": stat.mtime.toUTCString(),
  };

  if (status === 200 && ext !== ".html" && req.headers["if-modified-since"]) {
    const since = Date.parse(req.headers["if-modified-since"]);
    if (!Number.isNaN(since) && Math.floor(stat.mtimeMs / 1000) <= Math.floor(since / 1000)) {
      res.writeHead(304, headers);
      return res.end();
    }
  }

  const encoding = COMPRESSIBLE.has(ext) && stat.size > 1024 ? pickEncoding(req.headers["accept-encoding"]) : null;
  if (encoding) {
    const body = compressed(file, stat, encoding);
    headers["Content-Encoding"] = encoding;
    headers["Vary"] = "Accept-Encoding";
    headers["Content-Length"] = body.length;
    res.writeHead(status, headers);
    return res.end(req.method === "HEAD" ? undefined : body);
  }

  headers["Content-Length"] = stat.size;
  res.writeHead(status, headers);
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }
  try {
    const found = resolveFile(req.url || "/");
    if (found) return send(req, res, found.file, found.stat);

    // Missing asset (has a file extension) -> 404; app route -> index.html
    const ext = path.extname((req.url || "").split("?")[0]);
    if (ext && ext !== ".html") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    return send(req, res, INDEX, fs.statSync(INDEX));
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server error");
  }
});

server.listen(PORT, () => console.log(`MySuccess UI serving ${ROOT} on port ${PORT}`));
