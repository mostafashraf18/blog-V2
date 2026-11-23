# Personal Blog & Portfolio ⚡

A lightning-fast, minimalist personal blog and resume built with Node.js and Express. Fully server-rendered, accessible, SEO-optimized, and styled for readability in both dark and light modes. Zero build step, zero client-side framework bloat.

Everything is **plug and play**: edit simple JSON and Markdown files to make it completely yours in minutes.

---

## Highlights

- 🚀 **Blazing Fast:** Sub-50ms server responses, 100/100 Lighthouse performance.
- 📄 **Plug-and-Play Resume:**
  - Fully customizable via `content/resume.json`.
  - Downloadable PDF served at `/resume.pdf` (drop your file into `public/resume.pdf` anytime!).
  - One-click **"Print / Save as PDF"** button with a custom `@media print` layout tailored for standard Letter/A4 printing.
- 📝 **Markdown-Powered Posts:**
  - Automatic reading time calculations (`⏱️ 3 min read`).
  - Categorization and filtering by tags.
  - Interactive, instant in-browser search (zero lag).
  - Next/Previous adjacent post navigation.
  - One-click "Copy Code" button on code snippets.
- 📡 **Syndication & SEO:**
  - Automatic RSS 2.0 feed at `/feed.xml` and `/rss.xml`.
  - Automatic XML Sitemap at `/sitemap.xml`.
  - Security headers out of the box (Helmet CSP, X-Content-Type-Options, Honeypot spam trap).
- 🌓 **Aesthetic Theme Switch:**
  - Seamless Dark/Light mode toggle respecting system preferences and persisting in `localStorage`.

---

## Quick Start

You only need **Node.js 20 or newer**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Changes in `content/` appear automatically on page refresh!

Other commands:

```bash
npm test      # run automated test suite (17 tests)
npm start     # production-style start
```

---

## Make It Yours (Plug & Play)

All your personal data, resume, and articles live inside the `content/` folder. No JavaScript editing required!

| File | Purpose |
| --- | --- |
| `content/site.json` | Your name, tagline, intro bio, location, email, and social links |
| `content/resume.json` | Work experience, projects, skills, education, and contact details |
| `content/posts/*.md` | Your blog articles written in standard Markdown |
| `public/resume.pdf` | Your optional uploaded PDF resume file |
| `public/favicon.svg` | SVG icon shown in browser tabs |

### 1. Configure Site Info (`content/site.json`)
```json
{
  "name": "Alex Morgan",
  "tagline": "Software Engineer & Writer",
  "intro": "I build fast web systems and write about software craft.",
  "status": "Available for select projects",
  "location": "San Francisco, CA & Remote",
  "email": "alex@example.com",
  "links": [
    { "label": "GitHub", "url": "https://github.com/yourname" },
    { "label": "LinkedIn", "url": "https://linkedin.com/in/yourname" }
  ]
}
```

### 2. Configure Your Resume & PDF (`content/resume.json`)
You can fill in your summary, work experience with bulleted achievements, featured projects with live links, and skills (either grouped into categories or as a simple list):

```json
{
  "name": "Alex Morgan",
  "title": "Senior Software Engineer",
  "pdfUrl": "/resume.pdf",
  "contact": {
    "email": "alex@example.com",
    "location": "San Francisco, CA",
    "github": "https://github.com/yourname"
  },
  "summary": "Full-stack engineer passionate about clean software and high-leverage tools.",
  "experience": [
    {
      "role": "Senior Engineer",
      "org": "Tech Corp",
      "period": "2023 – Present",
      "details": "Lead architect for core API systems.",
      "highlights": [
        "Reduced p99 latency by 45%.",
        "Mentored junior engineers across TDD and clean architecture."
      ]
    }
  ]
}
```

#### How the PDF Resume Works:
- A starter PDF is included at `public/resume.pdf` and served directly at `/resume.pdf`.
- When you export your finalized resume from Canva, Word, LaTeX, or Figma, simply drop `resume.pdf` into `public/resume.pdf` to replace it instantly!
- If no PDF file is uploaded, `/resume.pdf` gracefully guides visitors back to the interactive resume where they can use the **Print / Save as PDF** button anytime.

### 3. Writing Posts (`content/posts/`)
Create a file named `YYYY-MM-DD-your-slug.md` in `content/posts/`:

```markdown
---
title: How I Solved That Weird Bug
summary: A quick postmortem on debugging an elusive race condition.
tags: ["Engineering", "Debugging"]
---

Write in standard **Markdown** here. Code blocks, blockquotes, and lists are automatically styled:

```javascript
const solve = (problem) => 'Done!';
```
```

- Add `draft: true` to the frontmatter to hide a post until it's finished.
- Tags are automatically grouped into filter pills on the homepage.
- Reading time is automatically estimated from word count.

---

## Routes & Endpoints

| URL | What it provides |
| --- | --- |
| `/` | Homepage with post list, tag filters, and instant search |
| `/posts/:slug` | Full article view with reading time, code copy, and adjacent navigation |
| `/resume` | Interactive and printable resume |
| `/resume.pdf` | Direct download / view of your resume PDF |
| `/feed.xml` / `/rss.xml` | Full RSS 2.0 syndication feed |
| `/sitemap.xml` | Search engine XML sitemap |
| `/contact` | Honeypot-protected contact form with rate limiting |
| `/health` | Health check endpoint returning `{"status":"ok"}` |
| `/api/posts` | Clean JSON list of published posts |
| `/api/messages` | Read submitted contact messages (requires `ADMIN_TOKEN`) |

---

## Deployment

Deployable to any host supporting Node.js (Railway, Render, Fly.io, Heroku, or VPS):

```bash
npm install
npm start
```

Environment variables:
- `PORT` (default `3000`)
- `NODE_ENV=production`
- `ADMIN_TOKEN` (optional, 16+ chars to access `/api/messages`)
- `DATA_DIR` (path to persist submitted contact messages, default `./data`)

---

## License

MIT. Feel free to use this as the foundation for your personal website or portfolio!
