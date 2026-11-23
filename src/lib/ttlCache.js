'use strict';

/** Wraps an async loader and reuses its result for `ttlMs` milliseconds (0 disables caching). */
function createTtlCache(loader, ttlMs) {
  let value;
  let hasValue = false;
  let loadedAt = 0;

  return async function get() {
    if (hasValue && Date.now() - loadedAt < ttlMs) return value;
    value = await loader();
    hasValue = true;
    loadedAt = Date.now();
    return value;
  };
}

module.exports = { createTtlCache };
