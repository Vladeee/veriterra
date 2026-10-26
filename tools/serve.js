// Tiny static file server for previewing the site (no dependencies, Node 14+).
// Usage: node tools/serve.js [port]   (default 5180). Serves the repository root.
// Used by .claude/launch.json, so the preview panel in Claude Desktop can start it.
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2] || process.env.PORT || 5180);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

http
  .createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, "http://x").pathname); }
    catch (e) { res.writeHead(400); res.end("Bad request"); return; }
    let file = path.join(root, rel);
    if (!file.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); return; }
      res.writeHead(200, {
        "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`veriterra preview on http://localhost:${port}/`));
