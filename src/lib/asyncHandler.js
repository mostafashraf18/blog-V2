'use strict';

// Express 4 does not catch rejected promises, so async route handlers go through this.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
