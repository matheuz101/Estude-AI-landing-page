// Local preview for the static source. Run: npm run dev
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".woff2": "font/woff2", ".svg": "image/svg+xml" };
http.createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405); return response.end(); }
  let requested;
  try { requested = decodeURIComponent(new URL(request.url, "http://localhost").pathname); }
  catch { response.writeHead(400); return response.end("Bad request"); }
  const filename = path.resolve(root, `.${requested === "/" ? "/index.html" : requested}`);
  const relative = path.relative(root, filename);
  const allowed = ["index.html", "style.css", "script.js"].includes(relative) || relative.startsWith(`assets${path.sep}`);
  if (!allowed || relative.startsWith("..") || path.isAbsolute(relative)) { response.writeHead(404); return response.end("Not found"); }
  fs.readFile(filename, (error, data) => {
    if (error) { response.writeHead(404); return response.end("Not found"); }
    response.writeHead(200, { "Content-Type": types[path.extname(filename)] || "application/octet-stream", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : data);
  });
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
