/**
 * Local CORS proxy for development. Replaces local-cors-proxy (which depended on vulnerable request/form-data).
 * Usage: PROXY_URL=https://example.com/ ORIGIN=http://localhost:5173 PORT=8010 node proxy-server.js
 */
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const PROXY_URL = process.env.PROXY_URL || 'https://design.digiserve.org/';
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';
const PORT = Number(process.env.PORT) || 8010;

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(
  '/',
  createProxyMiddleware({
    target: PROXY_URL.replace(/\/$/, ''),
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/': '/' },
    onProxyReq: (proxyReq, req) => {
      const origin = new URL(PROXY_URL);
      proxyReq.setHeader('Host', origin.host);
    },
  })
);

app.listen(PORT, () => {
  console.log(`CORS proxy running at http://localhost:${PORT} -> ${PROXY_URL} (origin: ${ORIGIN})`);
});
