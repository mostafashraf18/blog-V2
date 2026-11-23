'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { createTtlCache } = require('../lib/ttlCache');

const DEFAULT_SITE = Object.freeze({
  name: 'Your Name',
  intro: 'Hi. I’m Your Name. This is my blog where I write things.',
  email: '',
  links: [],
});

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const list = (value) => (Array.isArray(value) ? value : []);

async function readJson(file) {
  let source;
  try {
    source = await fs.readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
  try {
    return JSON.parse(source);
  } catch (err) {
    throw new Error(`Invalid JSON in ${file}: ${err.message}`);
  }
}

function normalizeSite(data) {
  return {
    name: text(data.name) || DEFAULT_SITE.name,
    tagline: text(data.tagline || data.title),
    intro: text(data.intro) || DEFAULT_SITE.intro,
    bio: text(data.bio),
    location: text(data.location),
    status: text(data.status || data.available),
    email: text(data.email),
    links: list(data.links).filter((link) => link && text(link.label) && text(link.url)),
    resumePdf: text(data.resumePdf || '/resume.pdf'),
  };
}

function normalizeResume(data) {
  const entries = (value) =>
    list(value)
      .filter((entry) => entry && text(entry.role))
      .map((entry) => ({
        role: text(entry.role),
        org: text(entry.org),
        period: text(entry.period),
        details: text(entry.details),
        highlights: list(entry.highlights).map(text).filter(Boolean),
        link: text(entry.link || entry.url),
      }));

  const projects = (value) =>
    list(value)
      .filter((entry) => entry && text(entry.name || entry.title))
      .map((entry) => ({
        name: text(entry.name || entry.title),
        period: text(entry.period),
        details: text(entry.details || entry.description),
        highlights: list(entry.highlights).map(text).filter(Boolean),
        tags: list(entry.tags || entry.tech).map(text).filter(Boolean),
        link: text(entry.link || entry.url),
      }));

  let skills = [];
  if (Array.isArray(data.skills)) {
    skills = data.skills
      .map((item) => {
        if (typeof item === 'string') return text(item);
        if (item && typeof item === 'object') {
          return {
            category: text(item.category || item.name),
            items: list(item.items || item.skills).map(text).filter(Boolean),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  const certs = (value) =>
    list(value)
      .filter(Boolean)
      .map((item) => {
        if (typeof item === 'string') return { name: text(item), issuer: '', year: '' };
        return {
          name: text(item.name || item.title),
          issuer: text(item.issuer || item.org),
          year: text(item.year || item.date || item.period),
        };
      })
      .filter((c) => c.name);

  return {
    name: text(data.name),
    title: text(data.title),
    summary: text(data.summary),
    pdfUrl: text(data.pdfUrl || data.pdf || '/resume.pdf'),
    contact: data.contact && typeof data.contact === 'object' ? data.contact : {},
    experience: entries(data.experience),
    projects: projects(data.projects),
    education: entries(data.education),
    certifications: certs(data.certifications),
    skills,
    interests: list(data.interests).map(text).filter(Boolean),
  };
}

/** Reads the site details and resume from JSON files in the content folder. */
function createContentRepository({ contentDir, ttlMs = 0 }) {
  return {
    site: createTtlCache(async () => normalizeSite(await readJson(path.join(contentDir, 'site.json'))), ttlMs),
    resume: createTtlCache(async () => normalizeResume(await readJson(path.join(contentDir, 'resume.json'))), ttlMs),
  };
}

module.exports = { createContentRepository, DEFAULT_SITE };
