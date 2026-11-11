const path = require("path");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const HF_SPACE = (process.env.OMEGAMIND_API_BASE || "https://not-omega-omegamind.hf.space").replace(/\/$/, "");
const PORT = Number(process.env.PORT) || 10000;

const app = express();

app.use(
  "/api",
  createProxyMiddleware({
    target: HF_SPACE,
    changeOrigin: true,
    secure: true,
    timeout: 0,
    proxyTimeout: 0,
    onProxyReq(proxyReq) {
      proxyReq.setHeader("accept", proxyReq.getHeader("accept") || "text/event-stream");
    },
    onError(err, _req, res) {
      if (!res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({
        error: "Could not reach the OmegaMind Hugging Face Space.",
        detail: err.message,
        space: HF_SPACE
      }));
    }
  })
);

app.use(express.static(__dirname, { extensions: ["html"] }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`OmegaMind site on ${PORT} → ${HF_SPACE}`);
});
