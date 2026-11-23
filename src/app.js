'use strict';

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');

const { HttpError } = require('./lib/httpError');
const { createContentRepository } = require('./repositories/contentRepository');
const { createPostRepository } = require('./repositories/postRepository');
const { createMessageRepository } = require('./repositories/messageRepository');
const { createContactService } = require('./services/contactService');
const { requestLogger } = require('./middleware/requestLogger');
const { siteLocals } = require('./middleware/siteLocals');
const { notFoundHandler, createErrorHandler } = require('./middleware/errorHandler');
const { createApiRouter } = require('./routes/api');
const { createPagesRouter } = require('./routes/pages');

/**
 * Builds the Express app. Everything it needs comes from `config`, so the same
 * function serves production (server.js) and tests.
 */
function createApp(config, { logger = console } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  // Repositories and services are created once and handed to the routes that need them.
  const content = createContentRepository({ contentDir: config.contentDir, ttlMs: config.cacheTtlMs });
  const posts = createPostRepository({
    postsDir: path.join(config.contentDir, 'posts'),
    ttlMs: config.cacheTtlMs,
    logger,
  });
  const messages = createMessageRepository({ dataDir: config.dataDir });
  const contact = createContactService({ messages });
  app.locals.repositories = { content, posts, messages };

  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.contactRateLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next) => next(new HttpError(429, 'Too many messages. Please try again in a few minutes.')),
  });

  if (config.logRequests) app.use(requestLogger(logger));

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // Forcing https breaks http://localhost in some browsers, so only do it in production.
          'upgrade-insecure-requests': config.isProd ? [] : null,
        },
      },
    })
  );

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use(express.static(config.publicDir, { index: false, maxAge: config.isProd ? '1d' : 0 }));
  app.use(express.urlencoded({ extended: false, limit: '10kb' }));
  app.use(siteLocals(content));

  app.use('/api', createApiRouter({ posts, messages, adminToken: config.adminToken }));
  app.use('/', createPagesRouter({ content, posts, contact, contactLimiter, publicDir: config.publicDir }));

  app.use(notFoundHandler);
  app.use(createErrorHandler({ isProd: config.isProd, logger }));

  return app;
}

module.exports = { createApp };
