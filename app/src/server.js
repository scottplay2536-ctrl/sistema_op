const http = require("http");

const port = process.env.PORT || 3000;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function handleRequest(req, res) {
  if (req.url === "/") {
    sendJson(res, 200, {
      service: "Proyecto DevOps en Azure",
      status: "ok",
      platform: "AKS",
      message: "Aplicacion desplegada correctamente"
    });
    return;
  }

  if (req.url === "/health") {
    sendJson(res, 200, { status: "healthy" });
    return;
  }

  sendJson(res, 404, { error: "not_found" });
}

if (require.main === module) {
  http.createServer(handleRequest).listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = { handleRequest };

// Forzar recompilacion nativa x86 en la nube para Azure AKS v1.0.2
