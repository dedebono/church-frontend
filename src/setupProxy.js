const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Determine backend target
  const rawTarget =
    process.env.REACT_APP_DEV_BACKENDS ||
    process.env.REACT_APP_PROD_BACKENDS ||
    'https://server2.dedebono.uk';

  let target = rawTarget.split(',')[0].trim().replace(/\/+$/, '');
  if (!target || target.includes('localhost:5000') || target.includes('127.0.0.1:5000')) {
    target = 'https://server2.dedebono.uk';
  }

  console.log(`[setupProxy] Proxying /api and /socket.io to: ${target}`);

  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Origin', target);
        proxyReq.setHeader('Referer', `${target}/`);
      },
      onError: (err, req, res) => {
        console.warn('[setupProxy] API Proxy warning:', err.message);
        if (!res.headersSent) {
          res.status(502).json({ error: 'Proxy error', message: err.message });
        }
      },
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      secure: false,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Origin', target);
      },
    })
  );
};
