// ==========================================
// QPay Gateway Proxy Server
// ==========================================
// Энэ серверийг static IP-тэй VPS дээр ажиллуулна.
// Vercel → энэ VPS → QPay API гэж дуудна.
// VPS-ийн IP хаягийг QPay-д whitelist хийнэ.
//
// Жишээ: DigitalOcean $4/сар, Vultr $3.50/сар
// ==========================================

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080;

// ==========================================
// CONFIG
// ==========================================
const QPAY_TARGET = process.env.QPAY_TARGET || 'https://qr.qpay.mn';

// API key to protect this proxy (Vercel sends this in headers)
const GATEWAY_API_KEY = process.env.GATEWAY_API_KEY || 'change-this-to-a-strong-secret-key';

// Allowed origins (your Vercel domains)
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(helmet());
app.use(morgan('short'));

// Auth middleware - verify API key
app.use('/v1', (req, res, next) => {
  const apiKey = req.headers['x-gateway-key'];
  
  if (!apiKey || apiKey !== GATEWAY_API_KEY) {
    console.warn(`⚠️  Unauthorized request from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Optional: check origin
  if (ALLOWED_ORIGINS.length > 0) {
    const origin = req.headers['origin'] || req.headers['referer'] || '';
    const isAllowed = ALLOWED_ORIGINS.some(o => origin.includes(o));
    if (!isAllowed && req.ip !== '127.0.0.1') {
      // Log but don't block (Vercel may not send origin)
      console.warn(`⚠️  Request from unknown origin: ${origin}, IP: ${req.ip}`);
    }
  }

  next();
});

// ==========================================
// PROXY - Forward /v1/* → QPay /v1/*
// ==========================================
app.use('/v1', createProxyMiddleware({
  target: QPAY_TARGET,
  changeOrigin: true,
  secure: true,
  timeout: 30000,
  proxyTimeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => {
      // Remove our custom gateway key header before sending to QPay
      proxyReq.removeHeader('x-gateway-key');
      console.log(`→ ${req.method} ${QPAY_TARGET}${req.url}`);
    },
    proxyRes: (proxyRes, req) => {
      console.log(`← ${proxyRes.statusCode} ${req.method} ${req.url}`);
    },
    error: (err, req, res) => {
      console.error(`❌ Proxy error: ${err.message}`);
      res.status(502).json({ error: 'QPay gateway error', message: err.message });
    },
  },
}));

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'qpay-gateway',
    target: QPAY_TARGET,
    uptime: process.uptime(),
  });
});

app.get('/', (req, res) => {
  res.json({ service: 'QPay Gateway Proxy', status: 'running' });
});

// ==========================================
// START
// ==========================================
app.listen(PORT, '0.0.0.0', () => {
  console.log('==========================================');
  console.log(`🚀 QPay Gateway Proxy running on port ${PORT}`);
  console.log(`📡 Proxying to: ${QPAY_TARGET}`);
  console.log(`🔑 API Key protection: ${GATEWAY_API_KEY ? 'ENABLED' : 'DISABLED'}`);
  console.log('==========================================');
});
