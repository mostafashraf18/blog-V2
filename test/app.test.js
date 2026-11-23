'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { loadConfig } = require('../src/config');
const { createApp } = require('../src/app');

const TOKEN = 'test-admin-token-1234567890';
const silent = { info() {}, warn() {}, error() {} };

let tmp;
const servers = [];

async function startServer(overrides = {}) {
  const config = loadConfig({
    env: 'test',
    contentDir: path.join(tmp, 'content'),
    dataDir: path.join(tmp, `data-${servers.length}`),
    adminToken: TOKEN,
    ...overrides,
  });
  const server = await new Promise((resolve) => {
    const s = createApp(config, { logger: silent }).listen(0, '127.0.0.1', () => resolve(s));
  });
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

const form = (data) => ({
  method: 'POST',
  redirect: 'manual',
  body: new URLSearchParams(data),
});

const validMessage = { name: 'Ada', email: 'ada@example.com', message: 'Hello there.' };
const auth = { headers: { Authorization: `Bearer ${TOKEN}` } };

before(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-test-'));
  const contentDir = path.join(tmp, 'content');
  await fs.mkdir(path.join(contentDir, 'posts'), { recursive: true });
  await fs.writeFile(
    path.join(contentDir, 'site.json'),
    JSON.stringify({
      name: 'Test Person',
      intro: 'Hello there.',
      email: 'test@example.com',
      links: [{ label: 'GitHub', url: 'https://github.com/test' }],
    })
  );
  await fs.writeFile(
    path.join(contentDir, 'resume.json'),
    JSON.stringify({
      summary: 'Resume summary.',
      experience: [{ role: 'Engineer', org: 'Acme', period: '2020 – 2024', details: 'Built things.' }],
      skills: ['Node.js'],
    })
  );
  const posts = path.join(contentDir, 'posts');
  await fs.writeFile(path.join(posts, '2026-01-02-hello-world.md'), '---\ntitle: Hello World\nsummary: First post.\n---\n\nThis is **bold**.\n');
  await fs.writeFile(path.join(posts, '2025-12-01-secret-draft.md'), '---\ntitle: Secret Draft\ndraft: true\n---\n\nHidden.\n');
  await fs.writeFile(path.join(posts, 'not-a-valid-name.md'), '---\ntitle: Bad name\n---\n');
});

after(async () => {
  for (const server of servers) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  await fs.rm(tmp, { recursive: true, force: true });
});

describe('pages', () => {
  let base;
  before(async () => {
    base = await startServer();
  });

  it('shows the home page with published posts only', async () => {
    const res = await fetch(base);
    const body = await res.text();
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(body, /Test Person/);
    assert.match(body, /Hello World/);
    assert.match(body, /2026-01-02/);
    assert.doesNotMatch(body, /Secret Draft/);
    assert.doesNotMatch(body, /Bad name/);
  });

  it('renders a post from Markdown', async () => {
    const res = await fetch(`${base}/posts/hello-world`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<strong>bold<\/strong>/);
  });

  it('returns a 404 page for unknown or draft posts', async () => {
    for (const slug of ['nope', 'secret-draft']) {
      const res = await fetch(`${base}/posts/${slug}`);
      assert.equal(res.status, 404);
      assert.match(res.headers.get('content-type'), /text\/html/);
    }
  });

  it('shows the resume and contact pages', async () => {
    const resume = await (await fetch(`${base}/resume`)).text();
    assert.match(resume, /Engineer/);
    assert.match(resume, /Node\.js/);
    assert.match(resume, /Download PDF/);
    const contact = await (await fetch(`${base}/contact`)).text();
    assert.match(contact, /test@example\.com/);
    assert.match(contact, /<form class="contact-form" method="post" action="\/contact">/);
  });

  it('serves the RSS feed and sitemap XML', async () => {
    const feed = await fetch(`${base}/feed.xml`);
    assert.equal(feed.status, 200);
    assert.match(feed.headers.get('content-type'), /application\/xml/);
    const feedXml = await feed.text();
    assert.match(feedXml, /<rss version="2\.0"/);
    assert.match(feedXml, /Hello World/);

    const sitemap = await fetch(`${base}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    const sitemapXml = await sitemap.text();
    assert.match(sitemapXml, /<urlset/);
    assert.match(sitemapXml, /\/posts\/hello-world/);
  });

  it('handles resume.pdf route gracefully', async () => {
    const res = await fetch(`${base}/resume.pdf`, { redirect: 'manual' });
    // Either serves the file (200) or redirects to /resume?pdf=missing (303)
    assert.ok(res.status === 200 || res.status === 303);
    if (res.status === 303) {
      assert.match(res.headers.get('location'), /\/resume\?pdf=missing/);
    }
  });

  it('serves static files and the health check', async () => {
    assert.equal((await fetch(`${base}/css/style.css`)).status, 200);
    assert.equal((await fetch(`${base}/js/theme.js`)).status, 200);
    const health = await fetch(`${base}/health`);
    assert.deepEqual(await health.json(), { status: 'ok' });
  });

  it('sends security headers and hides the framework', async () => {
    const res = await fetch(base);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(res.headers.get('content-security-policy'));
    assert.equal(res.headers.get('x-powered-by'), null);
  });
});

describe('contact form', () => {
  let base;
  before(async () => {
    base = await startServer();
  });

  const stored = async () => (await (await fetch(`${base}/api/messages`, auth)).json()).length;

  it('rejects invalid input and escapes what was typed', async () => {
    const res = await fetch(`${base}/contact`, form({ name: '<script>alert(1)</script>', email: 'nope', message: '' }));
    const body = await res.text();
    assert.equal(res.status, 422);
    assert.match(body, /Please enter a valid email address\./);
    assert.match(body, /Please write a message\./);
    assert.doesNotMatch(body, /<script>alert\(1\)<\/script>/);
    assert.match(body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.equal(await stored(), 0);
  });

  it('saves a valid message and redirects', async () => {
    const res = await fetch(`${base}/contact`, form(validMessage));
    assert.equal(res.status, 303);
    assert.equal(res.headers.get('location'), '/contact?sent=1');
    const messages = await (await fetch(`${base}/api/messages`, auth)).json();
    assert.equal(messages.length, 1);
    assert.equal(messages[0].email, 'ada@example.com');

    const page = await (await fetch(`${base}/contact?sent=1`)).text();
    assert.match(page, /Your message was sent/);
  });

  it('quietly ignores bots that fill the hidden field', async () => {
    const before = await stored();
    const res = await fetch(`${base}/contact`, form({ ...validMessage, website: 'http://spam.example' }));
    assert.equal(res.status, 303);
    assert.equal(await stored(), before);
  });

  it('rate limits repeated submissions', async () => {
    const limited = await startServer({ contactRateLimit: 2 });
    const statuses = [];
    for (let i = 0; i < 3; i += 1) {
      statuses.push((await fetch(`${limited}/contact`, form(validMessage))).status);
    }
    assert.deepEqual(statuses, [303, 303, 429]);
  });
});

describe('api', () => {
  let base;
  before(async () => {
    base = await startServer();
  });

  it('lists posts without their HTML body', async () => {
    const posts = await (await fetch(`${base}/api/posts`)).json();
    assert.equal(posts.length, 1);
    assert.deepEqual(Object.keys(posts[0]).sort(), ['date', 'slug', 'summary', 'title']);
  });

  it('returns one post or a JSON 404', async () => {
    const found = await (await fetch(`${base}/api/posts/hello-world`)).json();
    assert.match(found.html, /<strong>bold<\/strong>/);

    const missing = await fetch(`${base}/api/posts/nope`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type'), /application\/json/);
    assert.ok((await missing.json()).error);
  });

  it('protects the messages endpoint', async () => {
    assert.equal((await fetch(`${base}/api/messages`)).status, 401);
    assert.equal((await fetch(`${base}/api/messages`, { headers: { Authorization: 'Bearer wrong' } })).status, 401);
    assert.equal((await fetch(`${base}/api/messages`, auth)).status, 200);
  });

  it('hides the messages endpoint when no token is configured', async () => {
    const open = await startServer({ adminToken: '' });
    assert.equal((await fetch(`${open}/api/messages`, auth)).status, 404);
  });
});

describe('config', () => {
  it('rejects a short admin token', () => {
    assert.throws(() => loadConfig({ adminToken: 'short' }), /at least 16 characters/);
  });
});
