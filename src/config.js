'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

function toPort(value, fallback) {
  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : fallback;
}

function toTrustProxy(value, isProd) {
  const hops = Number.parseInt(value ?? (isProd ? '1' : '0'), 10);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
}

/**
 * Builds the app configuration. Environment variables are the defaults and
 * `overrides` win, which lets tests inject their own values.
 */
function loadConfig(overrides = {}) {
  dotenv.config();

  const rootDir = path.resolve(__dirname, '..');
  const env = overrides.env || process.env.NODE_ENV || 'development';
  const isProd = env === 'production';

  const config = {
    env,
    isProd,
    port: toPort(process.env.PORT, 3000),
    trustProxy: toTrustProxy(process.env.TRUST_PROXY, isProd),
    contentDir: path.resolve(process.env.CONTENT_DIR || path.join(rootDir, 'content')),
    dataDir: path.resolve(process.env.DATA_DIR || path.join(rootDir, 'data')),
    publicDir: path.join(rootDir, 'public'),
    adminToken: process.env.ADMIN_TOKEN || '',
    // In development content is re-read on every request, so edits show up on refresh.
    cacheTtlMs: isProd ? 60_000 : 0,
    contactRateLimit: 5,
    logRequests: env !== 'test',
    ...overrides,
  };

  if (config.adminToken && config.adminToken.length < 16) {
    throw new Error('ADMIN_TOKEN must be at least 16 characters long.');
  }

  return Object.freeze(config);
}

module.exports = { loadConfig };
