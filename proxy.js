import httpProxy from "http-proxy";
import fs from "fs";

const proxy = httpProxy.createProxyServer({ target: "http://127.0.0.1:8545" });

const FILENAME = "logs.log";

fs.writeFileSync(FILENAME, "");

function log(...messages) {
  const message = messages.join(" ").trim();
  console.log(message);
  fs.appendFileSync(FILENAME, "\n" + message);
}

proxy.on("proxyReq", (_, req) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    log("\n\nreq:", req.method, req.path, body);
  });
});

proxy.on("proxyRes", (proxyRes) => {
  let response = "";
  proxyRes.on("data", (chunk) => {
    response += chunk.toString();
  });

  proxyRes.on("end", () => {
    log("\n\nres:", response);
  });
});

proxy.listen(8543);
