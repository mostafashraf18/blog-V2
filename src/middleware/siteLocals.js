'use strict';

const { asyncHandler } = require('../lib/asyncHandler');

/** Makes the site details (name, intro, links) available to every view as res.locals.site. */
function siteLocals(content) {
  return asyncHandler(async (req, res, next) => {
    res.locals.site = await content.site();
    next();
  });
}

module.exports = { siteLocals };
