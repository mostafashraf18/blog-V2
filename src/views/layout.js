'use strict';

const { html, safeHref } = require('../lib/html');

function navLink(href, label, currentPath, basePath = '') {
  const fullHref = basePath ? `${basePath}${href}` : href;
  const current = href === currentPath ? html` aria-current="page" class="active"` : '';
  return html`<a href="${fullHref}"${current}>${label}</a>`;
}

function layout({ site, title, description, body, path = '/', basePath = '' }) {
  const pageTitle = title ? `${title} | ${site.name}` : site.name;
  const p = (url) => (url.startsWith('http') || url.startsWith('mailto:') || !basePath ? url : `${basePath}${url}`);

  const internalLinks = [
    navLink('/', 'Posts', path, basePath),
    navLink('/resume', 'Resume', path, basePath),
    navLink('/contact', 'Contact', path, basePath),
  ];

  const externalLinks = (site.links || []).map(
    (link) => html`<a href="${safeHref(link.url)}" target="_blank" rel="noopener noreferrer">${link.label} ↗</a>`
  );

  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="description" content="${description || site.intro}">
<title>${pageTitle}</title>
<link rel="icon" href="${p('/favicon.svg')}" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="${site.name} RSS Feed" href="${p('/feed.xml')}">
<link rel="stylesheet" href="${p('/css/style.css')}">
<script src="${p('/js/theme.js')}"></script>
</head>
<body>
<div class="wrap">
  <header class="site-header">
    <div class="top">
      <div class="branding">
        <p class="name"><a href="${p('/')}">${site.name}</a></p>
        ${site.tagline ? html`<p class="tagline">${site.tagline}</p>` : ''}
      </div>
      <div class="header-controls">
        <button class="mode" id="mode" type="button" hidden aria-label="Switch theme"></button>
      </div>
    </div>
    <p class="site-intro">${site.intro}</p>
    ${site.status ? html`<p class="status-pill"><span class="status-dot"></span> ${site.status}</p>` : ''}
    <nav class="nav-links" aria-label="Main Navigation">
      <span class="nav-group internal">${internalLinks.map((l, i) => (i === 0 ? l : html` <span class="nav-sep">·</span> ${l}`))}</span>
      ${externalLinks.length > 0 ? html`<span class="nav-sep nav-divider">|</span> <span class="nav-group external">${externalLinks.map((l, i) => (i === 0 ? l : html` <span class="nav-sep">·</span> ${l}`))}</span>` : ''}
    </nav>
  </header>
  <main>${body}</main>
  <footer class="site-footer">
    <div class="footer-content">
      <p>© ${new Date().getFullYear()} ${site.name} · Plug &amp; play blog</p>
      <p class="footer-links">
        <a href="${p('/feed.xml')}">RSS</a> · <a href="${p('/sitemap.xml')}">Sitemap</a> · <a href="${p('/resume.pdf')}">PDF Resume</a>
      </p>
    </div>
  </footer>
</div>
</body>
</html>
`;
}

/** Sends a full HTML page. Expects res.locals.site to be set (see middleware/siteLocals). */
function renderPage(res, { status = 200, ...page }) {
  res.status(status).type('html').send(layout({ site: res.locals.site, ...page }).toString());
}

module.exports = { layout, renderPage };
