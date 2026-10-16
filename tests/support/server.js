// A small static file server for the tests (no dependencies). It serves a folder the way GitHub Pages does:
// a folder URL serves its index.html, and nothing outside the folder is reachable.
//   node tests/support/server.js [port] [folder]
"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");

var types = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2", ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8"};

function serve(folder, port) {
  var base = path.resolve(folder);
  var server = http.createServer(function (req, res) {
    var url = decodeURIComponent(req.url.split("?")[0]);
    var file = path.join(base, url);
    if (file !== base && file.indexOf(base + path.sep) !== 0) { res.writeHead(403); res.end(); return; }
    fs.stat(file, function (err, stat) {
      if (!err && stat.isDirectory()) {
        if (!url.endsWith("/")) { res.writeHead(301, {Location: url + "/"}); res.end(); return; }
        file = path.join(file, "index.html");
      }
      fs.readFile(file, function (err2, body) {
        if (err2) { res.writeHead(404, {"Content-Type": "text/plain"}); res.end("Not found"); return; }
        res.writeHead(200, {"Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store"});
        res.end(body);
      });
    });
  });
  return new Promise(function (resolve) { server.listen(port, "127.0.0.1", function () { resolve(server); }); });
}
module.exports = {serve: serve};

if (require.main === module) {
  var port = Number(process.argv[2] || 8000);
  var folder = process.argv[3] || path.join(__dirname, "..", "..");
  serve(folder, port).then(function () { console.log("Serving " + path.resolve(folder) + " at http://127.0.0.1:" + port + "/"); });
}
