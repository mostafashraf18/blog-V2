'use strict';

const { loadConfig } = require('./src/config');
const { createApp } = require('./src/app');

async function main() {
  const config = loadConfig();
  const app = createApp(config);
  const { content, posts } = app.locals.repositories;

  // Read all content once at start-up so mistakes (bad JSON, bad file names) show up immediately.
  await Promise.all([content.site(), content.resume(), posts.list()]);

  const server = app.listen(config.port, () => {
    console.log(`Blog running at http://localhost:${config.port} (${config.env})`);
  });

  server.on('error', (err) => {
    console.error(err.code === 'EADDRINUSE' ? `Port ${config.port} is already in use.` : err);
    process.exit(1);
  });

  let shuttingDown = false;
  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received. Shutting down.`);
    server.close((err) => process.exit(err ? 1 : 0));
    if (typeof server.closeIdleConnections === 'function') server.closeIdleConnections();
    setTimeout(() => process.exit(1), 10_000).unref();
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

for (const event of ['uncaughtException', 'unhandledRejection']) {
  process.on(event, (err) => {
    console.error(`${event}:`, err);
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
