'use strict';

const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const { asyncHandler } = require('../lib/asyncHandler');
const { HttpError } = require('../lib/httpError');
const { renderPage } = require('../views/layout');
const views = require('../views/pages');

function escapeXml(unsafe) {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssFeed(site, posts, req) {
  const protocol = req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/posts/${escapeXml(post.slug)}</link>
      <guid>${baseUrl}/posts/${escapeXml(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary || post.title)}</description>
    </item>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(site.intro)}</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}

function buildSitemap(site, posts, req) {
  const protocol = req.protocol;
  const host = req.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  const staticUrls = ['/', '/resume', '/contact']
    .map(
      (p) => `  <url>
    <loc>${baseUrl}${p}</loc>
    <changefreq>weekly</changefreq>
  </url>`
    )
    .join('\n');

  const postUrls = posts
    .map(
      (post) => `  <url>
    <loc>${baseUrl}/posts/${escapeXml(post.slug)}</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>`;
}

function createPagesRouter({ content, posts, contact, contactLimiter, publicDir = path.resolve('public') }) {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const allPosts = await posts.list();
      const allTags = typeof posts.allTags === 'function' ? await posts.allTags() : [];
      const activeTag = req.query.tag ? String(req.query.tag).trim() : '';
      const filteredPosts = activeTag ? allPosts.filter((p) => (p.tags || []).includes(activeTag)) : allPosts;

      renderPage(res, {
        path: '/',
        body: views.home({
          posts: filteredPosts,
          tags: allTags,
          activeTag,
          totalCount: allPosts.length,
          site: res.locals.site,
        }),
      });
    })
  );

  router.get('/posts', (req, res) => res.redirect(301, '/'));

  router.get(
    '/posts/:slug',
    asyncHandler(async (req, res) => {
      const entry = await posts.findBySlug(req.params.slug);
      if (!entry) throw new HttpError(404, 'That post does not exist.');
      renderPage(res, {
        path: req.path,
        title: entry.title,
        description: entry.summary || undefined,
        body: views.post({ post: entry }),
      });
    })
  );

  router.get(
    '/resume',
    asyncHandler(async (req, res) => {
      const resume = await content.resume();
      renderPage(res, {
        path: '/resume',
        title: 'Resume',
        body: views.resume({
          resume,
          site: res.locals.site,
          pdfMissing: req.query.pdf === 'missing',
        }),
      });
    })
  );

  // Resume PDF: serves public/resume.pdf if it exists; otherwise redirects to /resume?pdf=missing
  router.get(
    '/resume.pdf',
    asyncHandler(async (req, res) => {
      const targetPdf = path.join(publicDir, 'resume.pdf');
      try {
        await fs.access(targetPdf);
        return res.sendFile(targetPdf, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="resume.pdf"',
          },
        });
      } catch {
        return res.redirect(303, '/resume?pdf=missing');
      }
    })
  );

  // RSS / Atom feed
  const rssHandler = asyncHandler(async (req, res) => {
    const list = await posts.list();
    res.type('application/xml').send(buildRssFeed(res.locals.site, list, req));
  });
  router.get('/feed.xml', rssHandler);
  router.get('/rss.xml', rssHandler);

  // Sitemap for search engines
  router.get(
    '/sitemap.xml',
    asyncHandler(async (req, res) => {
      const list = await posts.list();
      res.type('application/xml').send(buildSitemap(res.locals.site, list, req));
    })
  );

  router.get('/contact', (req, res) => {
    renderPage(res, {
      path: '/contact',
      title: 'Contact',
      body: views.contact({ site: res.locals.site, sent: req.query.sent === '1', limits: contact.LIMITS }),
    });
  });

  router.post(
    '/contact',
    contactLimiter,
    asyncHandler(async (req, res) => {
      const result = await contact.submit(req.body || {});
      // Post/Redirect/Get: refreshing the page after sending does not send the message again.
      if (result.ok) return res.redirect(303, '/contact?sent=1');

      return renderPage(res, {
        status: 422,
        path: '/contact',
        title: 'Contact',
        body: views.contact({ site: res.locals.site, values: result.values, errors: result.errors, limits: contact.LIMITS }),
      });
    })
  );

  return router;
}

module.exports = { createPagesRouter };
