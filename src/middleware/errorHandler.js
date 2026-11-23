'use strict';

const { HttpError } = require('../lib/httpError');
const { DEFAULT_SITE } = require('../repositories/contentRepository');
const { renderPage } = require('../views/layout');
const views = require('../views/pages');

function notFoundHandler(req, res, next) {
  next(new HttpError(404, 'The page you asked for does not exist.'));
}

function createErrorHandler({ isProd, logger = console }) {
  // Express recognises an error handler by its four arguments, so `next` must stay.
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) logger.error(err);

    // Never leak internal details to visitors in production.
    const message = status < 500 || !isProd ? err.message : 'Something went wrong on our side. Please try again later.';

    if (req.path.startsWith('/api/')) {
      return res.status(status).json({ error: message });
    }

    // If the site details themselves failed to load, fall back to defaults so the error page still renders.
    res.locals.site = res.locals.site || DEFAULT_SITE;
    return renderPage(res, {
      status,
      title: status === 404 ? 'Not found' : 'Error',
      path: req.path,
      body: views.error({ status, message }),
    });
  };
}

module.exports = { notFoundHandler, createErrorHandler };
