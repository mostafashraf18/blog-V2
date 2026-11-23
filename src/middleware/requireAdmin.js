'use strict';

const crypto = require('node:crypto');
const { HttpError } = require('../lib/httpError');

/** Protects a route with a bearer token. With no token configured the route does not exist. */
function requireAdmin(token) {
  const expected = Buffer.from(token || '');

  return (req, res, next) => {
    if (!token) return next(new HttpError(404, 'Not found'));

    const header = req.get('authorization') || '';
    const supplied = Buffer.from(header.startsWith('Bearer ') ? header.slice(7) : '');
    const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);

    if (!valid) return next(new HttpError(401, 'Unauthorized'));
    res.set('Cache-Control', 'no-store');
    return next();
  };
}

module.exports = { requireAdmin };
