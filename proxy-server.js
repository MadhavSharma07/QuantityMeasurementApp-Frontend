const http = require("http");

const TARGET_HOST = "localhost";
const TARGET_PORT = 8080;

const server = http.createServer((req, res) => {
  // ✅ CORS headers (important for browser)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Remove /api prefix
  const path = req.url.replace(/^\/api/, "");

  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: path,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err);
    res.writeHead(500);
    res.end("Proxy error");
  });
});

server.listen(3000, () => {
  console.log("✅ Proxy running at http://localhost:3000");
});