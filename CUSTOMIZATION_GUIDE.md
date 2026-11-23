# 🛠️ Step-by-Step Customization Guide

Welcome! Your blog is built to be **100% plug and play**. You can personalize every single detail without touching server or backend code.

Here is the complete walkthrough on how to customize your blog with your own information.

---

## Quick Navigation

1. [Step 1: Your Identity & Site Info (`content/site.json`)](#step-1-your-identity--site-info-contentsitejson)
2. [Step 2: Your Resume & Experience (`content/resume.json`)](#step-2-your-resume--experience-contentresumejson)
3. [Step 3: Including Your Resume PDF](#step-3-including-your-resume-pdf)
4. [Step 4: Writing Your Own Posts (`content/posts/`)](#step-4-writing-your-own-posts-contentposts)
5. [Step 5: Your Avatar / Favicon (`public/favicon.svg`)](#step-5-your-avatar--favicon-publicfaviconsvg)
6. [Step 6: Receiving Contact Form Messages](#step-6-receiving-contact-form-messages)
7. [Step 7: Publishing Your Site](#step-7-publishing-your-site)

---

## Step 1: Your Identity & Site Info (`content/site.json`)

Open [`content/site.json`](./content/site.json). This file controls your site header, your homepage intro, your social links, and the footer copyright.

```json
{
  "name": "Jane Doe",
  "tagline": "Software Engineer & Designer",
  "intro": "Hi, I’m Jane. I build web applications, write about craft, and tinker with hardware.",
  "status": "Available for select freelance & consulting",
  "location": "New York, NY & Remote",
  "email": "jane@example.com",
  "links": [
    { "label": "GitHub", "url": "https://github.com/yourusername" },
    { "label": "LinkedIn", "url": "https://linkedin.com/in/yourusername" },
    { "label": "Twitter", "url": "https://twitter.com/yourusername" }
  ]
}
```

### What Each Field Controls:
| Field | Where it appears |
| --- | --- |
| `"name"` | Site logo/name at the top of every page, HTML page titles, footer copyright |
| `"tagline"` | Displayed right under your name in the header |
| `"intro"` | The welcoming paragraph at the top of the homepage and in RSS feed description |
| `"status"` | Small glowing pill badge (e.g., `🟢 Open to new roles`, `🟢 Freelance available`). Leave empty `""` to hide it. |
| `"location"` | Displayed in your resume contact header and bio |
| `"email"` | Displayed on the `/contact` page for readers who want to email directly |
| `"links"` | External links in the navigation bar (e.g. GitHub, LinkedIn, BlueSky, Portfolio) |

> 💡 **Tip:** In development mode (`npm run dev`), edits to `site.json` appear immediately upon browser refresh (`F5`).

---

## Step 2: Your Resume & Experience (`content/resume.json`)

Open [`content/resume.json`](./content/resume.json). This powers the interactive web resume at `/resume` and formats automatically for the **"Print / Save as PDF"** button.

### 1. Header & Contact Information
```json
{
  "name": "Jane Doe",
  "title": "Senior Full-Stack Engineer",
  "pdfUrl": "/resume.pdf",
  "contact": {
    "email": "jane@example.com",
    "location": "New York, NY",
    "website": "https://janedoe.dev",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "phone": "+1 (555) 123-4567"
  },
  "summary": "Full-stack engineer with 6+ years of experience building fast, accessible web systems. Passionate about clean code, developer experience, and reliable distributed backends."
}
```

### 2. Work Experience (`"experience"`)
Add as many jobs as you like. Each job can have high-level details plus bulleted highlights:
```json
  "experience": [
    {
      "role": "Lead Frontend Engineer",
      "org": "Acme Corp",
      "period": "2023 – Present",
      "details": "Spearheaded frontend architecture and component library redesign.",
      "highlights": [
        "Cut initial page bundle size by 45% using code-splitting.",
        "Mentored a team of 5 junior and mid-level engineers across testing and accessibility."
      ]
    },
    {
      "role": "Software Engineer",
      "org": "Startup Labs",
      "period": "2020 – 2023",
      "details": "Engineered REST APIs and real-time dashboard analytics.",
      "highlights": [
        "Implemented Redis caching layer that reduced database load by 35%."
      ]
    }
  ]
```

### 3. Featured Projects (`"projects"`)
Showcase your best side projects or client work:
```json
  "projects": [
    {
      "name": "TaskFlow",
      "period": "2024",
      "details": "A distraction-free task management tool built with Node.js and SQLite.",
      "link": "https://github.com/yourusername/taskflow",
      "tags": ["Node.js", "Express", "SQLite", "Docker"],
      "highlights": [
        "Over 500 active weekly users.",
        "Featured on Product Hunt #3 Product of the Day."
      ]
    }
  ]
```

### 4. Skills (`"skills"`)
You can group skills by category:
```json
  "skills": [
    {
      "category": "Languages",
      "items": ["JavaScript (ES2024)", "TypeScript", "Python", "SQL", "HTML5/CSS3"]
    },
    {
      "category": "Frameworks & Backend",
      "items": ["Node.js", "Express", "React", "PostgreSQL", "Redis"]
    },
    {
      "category": "Tools & Infrastructure",
      "items": ["Docker", "Git", "GitHub Actions", "Linux", "Nginx", "Cloudflare"]
    }
  ]
```
*(Or if you prefer a simple flat list, you can just write `["JavaScript", "Node.js", "Docker"]`)*.

### 5. Education (`"education"`)
```json
  "education": [
    {
      "role": "B.S. in Computer Science",
      "org": "State University",
      "period": "2016 – 2020",
      "details": "Dean's Honor List. Coursework in Data Structures, Algorithms, and Operating Systems."
    }
  ]
```

---

## Step 3: Including Your Resume PDF

The `/resume` page offers two ways to get a PDF:

### Option A: Use the Starter PDF or Replace It With Your Own File (Recommended)
1. Export your custom PDF from Word, Google Docs, Canva, LaTeX, or Figma.
2. Name the file **`resume.pdf`**.
3. Move or copy it into the **`public/`** folder (replacing `public/resume.pdf`).
4. That's it! When someone clicks **"📥 Download PDF"** on `/resume` or visits `/resume.pdf`, your custom PDF will open or download directly.

### Option B: Use "Print / Save as PDF"
Even before you make a custom PDF, you can click the **"🖨️ Print / Save as PDF"** button on the `/resume` page.
- Our custom print stylesheet automatically removes headers, footers, dark backgrounds, and buttons.
- It formats your resume into a clean black-and-white layout that you can save as a PDF directly from your browser's print dialog (`Ctrl+P` or `Cmd+P`).

### Option C: Link to an External PDF (Google Drive / Dropbox)
If your PDF is hosted online:
In `content/resume.json`, change:
```json
"pdfUrl": "https://drive.google.com/file/d/your-file-id/view"
```

---

## Step 4: Writing Your Own Posts (`content/posts/`)

All blog posts live in the [`content/posts/`](./content/posts/) directory.

### How to Create a New Post:
1. Create a new file in `content/posts/` named:
   ```
   YYYY-MM-DD-your-slug.md
   ```
   *Example: `2026-12-01-my-first-post.md`*

2. Add frontmatter metadata at the top between `---` markers:
   ```markdown
   ---
   title: "Why I Love Writing Small Software"
   summary: "A brief one-sentence summary that appears in search and post lists."
   tags: ["Engineering", "Thoughts"]
   ---

   Write your post here in standard **Markdown**.

   ## Subheading

   You can write paragraphs, lists, quotes, and code blocks:

   ```javascript
   function greet(name) {
     return `Hello, ${name}!`;
   }
   ```

   > "A quote that inspires you."
   ```

### Post Features Built-In:
- **Quotes around titles**: Always wrap title and summary in `"..."` so colons or special characters won't cause YAML syntax errors.
- **`tags`**: Add any tag keywords you want (e.g. `["JavaScript", "Career"]`). They automatically create filter pills on the homepage!
- **`draft: true`**: Add `draft: true` to your frontmatter to hide a post from visitors while you're still drafting it.
- **Reading Time**: Automatically calculated from word count (e.g. `⏱️ 3 min read`).
- **Copy Code Button**: Readers can click "Copy" on any code block.
- **Previous / Next Navigation**: Older/Newer post links appear automatically at the bottom of each post.

---

## Step 5: Your Avatar / Favicon (`public/favicon.svg`)

Open [`public/favicon.svg`](./public/favicon.svg):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#000"/>
  <text x="50%" y="54%" font-family="system-ui,sans-serif" font-size="20" font-weight="bold" fill="#fff" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>
```
- Swap the letter `"A"` with your initial (e.g., `"J"`).
- You can also change the `fill="#000"` background color to your favorite color (e.g. `#2563eb`).

---

## Step 6: Receiving Contact Form Messages

Your blog has a built-in contact form at `/contact`:
- Submissions are saved to `./data/messages.json`.
- Includes a honeypot field to block bots and a rate-limiter (max 5 submissions per 15 minutes).

### How to View Your Received Messages:
1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```
2. Set an `ADMIN_TOKEN` (at least 16 characters long):
   ```
   ADMIN_TOKEN=my-super-secret-password-12345
   ```
3. Fetch your messages anytime via `curl` or browser:
   ```bash
   curl -H "Authorization: Bearer my-super-secret-password-12345" http://localhost:3000/api/messages
   ```
   *(Or you can simply open `data/messages.json` directly in your text editor!)*

---

## Step 7: Publishing Your Site

When you're ready to share your blog with the world:

1. **Deploy anywhere that runs Node.js 20+**:
   - [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io), [DigitalOcean](https://digitalocean.com), or any VPS.
2. **Build & Start commands**:
   - Build: `npm install`
   - Start: `npm start`
3. **Environment variables on your host**:
   - `NODE_ENV=production`
   - `PORT=3000` (or host provided)
   - `ADMIN_TOKEN=your-private-token`
   - `DATA_DIR=/var/data` (mount a persistent disk so contact messages persist across redeploys)
4. **RSS & Sitemap**:
   - Your RSS feed is live at `https://your-site.com/feed.xml`.
   - Your search engine sitemap is at `https://your-site.com/sitemap.xml`.

---

🎉 **You're all set!** Edit [`content/site.json`](./content/site.json) to start making it yours right now!
