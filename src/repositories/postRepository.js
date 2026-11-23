'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { createTtlCache } = require('../lib/ttlCache');

// Post files are named YYYY-MM-DD-your-slug.md, for example 2026-11-20-on-starting-small.md
const FILE_NAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9_\-]+)\.md$/i;

function estimateReadingTime(markdown) {
  const clean = (markdown || '').replace(/```[\s\S]*?```/g, ' ').replace(/[#*`_~>[\]()]/g, '');
  const words = clean.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Reads Markdown posts from a folder. Posts are written by the site owner,
 * so their Markdown (including any raw HTML) is trusted.
 */
function createPostRepository({ postsDir, ttlMs = 0, logger = console }) {
  async function load() {
    let files;
    try {
      files = await fs.readdir(postsDir);
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }

    const posts = [];
    for (const file of files.filter((name) => name.endsWith('.md'))) {
      const match = FILE_NAME.exec(file);
      if (!match) {
        logger.warn(`Skipping "${file}": name must look like 2026-11-20-my-post.md`);
        continue;
      }
      const source = await fs.readFile(path.join(postsDir, file), 'utf8');
      let parsed;
      try {
        parsed = matter(source);
      } catch (err) {
        logger.warn(`Skipping "${file}": invalid frontmatter (${err.message})`);
        continue;
      }
      const { data, content } = parsed;
      if (data.draft === true) continue;

      const tags = Array.isArray(data.tags)
        ? data.tags.map(String).map((t) => t.trim()).filter(Boolean)
        : (typeof data.tags === 'string' ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);

      posts.push({
        slug: match[2].toLowerCase(),
        date: match[1],
        title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : match[2],
        summary: typeof data.summary === 'string' ? data.summary.trim() : '',
        tags,
        readingTime: typeof data.readingTime === 'string' && data.readingTime.trim()
          ? data.readingTime.trim()
          : estimateReadingTime(content),
        html: marked.parse(content, { async: false }),
      });
    }

    // Newest first
    return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  }

  const all = createTtlCache(load, ttlMs);

  return {
    list: all,
    async findBySlug(slug) {
      const list = await all();
      const index = list.findIndex((post) => post.slug === slug);
      if (index === -1) return null;
      const post = list[index];
      const newer = index > 0 ? { slug: list[index - 1].slug, title: list[index - 1].title } : null;
      const older = index < list.length - 1 ? { slug: list[index + 1].slug, title: list[index + 1].title } : null;
      return { ...post, prev: older, next: newer };
    },
    async allTags() {
      const list = await all();
      const set = new Set();
      for (const p of list) {
        for (const t of p.tags || []) set.add(t);
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    },
  };
}

module.exports = { createPostRepository };
