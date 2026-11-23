'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { createContentRepository } = require('../src/repositories/contentRepository');
const { createPostRepository } = require('../src/repositories/postRepository');
const { layout } = require('../src/views/layout');
const views = require('../src/views/pages');

function escapeXml(unsafe) {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildRssFeed(site, posts, baseUrl) {
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

function buildSitemap(site, posts, baseUrl) {
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

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function writeHtml(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

async function build() {
  const rootDir = path.resolve(__dirname, '..');
  const contentDir = path.join(rootDir, 'content');
  const publicDir = path.join(rootDir, 'public');
  const distDir = path.join(rootDir, 'dist');

  const rawBase = (process.env.BASE_PATH || '').trim();
  const basePath = rawBase.replace(/\/+$/, ''); // e.g. "/blog" or ""
  const domain = (process.env.SITE_URL || 'https://mostafashraf18.github.io').replace(/\/+$/, '');
  const baseUrl = `${domain}${basePath}`;

  console.log('Building static site for GitHub Pages...');
  console.log(`Base path: "${basePath || '/'}"`);
  console.log(`Base URL: "${baseUrl}"`);

  // Clean / prepare dist dir
  await fs.rm(distDir, { recursive: true, force: true });
  await fs.mkdir(distDir, { recursive: true });

  // Repositories
  const content = createContentRepository({ contentDir });
  const posts = createPostRepository({ postsDir: path.join(contentDir, 'posts') });

  const [site, resume, allPosts, allTags] = await Promise.all([
    content.site(),
    content.resume(),
    posts.list(),
    posts.allTags(),
  ]);

  // Copy all assets from public/ into dist/
  await copyDir(publicDir, distDir);

  // GitHub Pages .nojekyll flag so folders like _assets aren't ignored
  await fs.writeFile(path.join(distDir, '.nojekyll'), '', 'utf8');

  // 1. Home page
  const homeHtml = layout({
    site,
    path: '/',
    basePath,
    body: views.home({ posts: allPosts, tags: allTags, activeTag: '', totalCount: allPosts.length, basePath }),
  }).toString();
  await writeHtml(path.join(distDir, 'index.html'), homeHtml);

  // 2. Individual posts
  for (const post of allPosts) {
    const postEntry = await posts.findBySlug(post.slug);
    const postHtml = layout({
      site,
      title: post.title,
      description: post.summary || undefined,
      path: `/posts/${post.slug}`,
      basePath,
      body: views.post({ post: postEntry, basePath }),
    }).toString();

    // Write both /posts/<slug>/index.html and /posts/<slug>.html for clean URL routing
    await writeHtml(path.join(distDir, 'posts', post.slug, 'index.html'), postHtml);
    await writeHtml(path.join(distDir, 'posts', `${post.slug}.html`), postHtml);
  }

  // 3. Resume page
  const resumeHtml = layout({
    site,
    title: 'Resume',
    path: '/resume',
    basePath,
    body: views.resume({ resume, site, pdfMissing: false, basePath }),
  }).toString();
  await writeHtml(path.join(distDir, 'resume', 'index.html'), resumeHtml);
  await writeHtml(path.join(distDir, 'resume.html'), resumeHtml);

  // 4. Contact page (using FormSubmit for static delivery to email)
  const contactLimits = { name: 100, email: 254, message: 5000 };
  const contactHtml = layout({
    site,
    title: 'Contact',
    path: '/contact',
    basePath,
    body: views.contact({
      site,
      limits: contactLimits,
      basePath,
      formAction: `https://formsubmit.co/${site.email || 'ma2963629@gmail.com'}`,
    }),
  }).toString();
  await writeHtml(path.join(distDir, 'contact', 'index.html'), contactHtml);
  await writeHtml(path.join(distDir, 'contact.html'), contactHtml);

  // 5. 404 page
  const notFoundHtml = layout({
    site,
    title: 'Page Not Found',
    path: '/404',
    basePath,
    body: views.error({ status: 404, message: 'The page you were looking for does not exist.', basePath }),
  }).toString();
  await writeHtml(path.join(distDir, '404.html'), notFoundHtml);

  // 6. RSS & Sitemap
  await fs.writeFile(path.join(distDir, 'feed.xml'), buildRssFeed(site, allPosts, baseUrl), 'utf8');
  await fs.writeFile(path.join(distDir, 'rss.xml'), buildRssFeed(site, allPosts, baseUrl), 'utf8');
  await fs.writeFile(path.join(distDir, 'sitemap.xml'), buildSitemap(site, allPosts, baseUrl), 'utf8');

  console.log(`Build complete! Static files ready in: ${distDir}`);
  console.log(`Generated: ${allPosts.length} posts, resume, contact, RSS feed, sitemap, 404 page.`);
}

build().catch((err) => {
  console.error('Static build failed:', err);
  process.exit(1);
});
