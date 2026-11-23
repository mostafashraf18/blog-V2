'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

/** Stores contact-form messages as one JSON object per line (messages.ndjson). */
function createMessageRepository({ dataDir }) {
  const file = path.join(dataDir, 'messages.ndjson');

  return {
    async add(message) {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.appendFile(file, `${JSON.stringify(message)}\n`, 'utf8');
    },

    async all() {
      let source;
      try {
        source = await fs.readFile(file, 'utf8');
      } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
      }
      return source
        .split('\n')
        .filter(Boolean)
        .flatMap((line) => {
          try {
            return [JSON.parse(line)];
          } catch {
            return []; // ignore a damaged line instead of failing the whole read
          }
        });
    },
  };
}

module.exports = { createMessageRepository };
