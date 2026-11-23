# Content Guide (Plug & Play)

Welcome to your blog's content directory! This folder is designed to be completely **plug and play**—you can configure and customize everything without writing or editing any server code.

---

## 1. `site.json` — Site Settings & Identity

This file configures your site's global branding, header, and social links.

```json
{
  "name": "Your Name",
  "tagline": "Software Engineer & Writer",
  "intro": "A short, engaging sentence introducing yourself.",
  "status": "Available for select projects",
  "location": "City, State & Remote",
  "email": "you@example.com",
  "links": [
    { "label": "GitHub", "url": "https://github.com/yourusername" },
    { "label": "LinkedIn", "url": "https://linkedin.com/in/yourusername" },
    { "label": "Twitter", "url": "https://twitter.com/yourusername" }
  ]
}
```

- **`name`**: Shown in the header, page title, and footer.
- **`tagline`**: Displayed subtly under your name.
- **`intro`**: The welcoming paragraph at the top of the homepage.
- **`status`**: Optional status pill (e.g., "Available for work", "Building open source").
- **`location`**: Displayed on your resume and contact sections.
- **`email`**: Where readers can email you directly.
- **`links`**: External links shown in the site header navigation.

---

## 2. `resume.json` — Interactive & Printable Resume

Powering the `/resume` route, this file supports rich, detailed sections that render cleanly both on screen and in print/PDF.

```json
{
  "name": "Your Name",
  "title": "Your Professional Title",
  "pdfUrl": "/resume.pdf",
  "contact": {
    "email": "you@example.com",
    "location": "San Francisco, CA",
    "website": "https://yourwebsite.com",
    "github": "https://github.com/yourusername",
    "linkedin": "https://linkedin.com/in/yourusername",
    "phone": "+1 (555) 123-4567"
  },
  "summary": "A 2-3 sentence summary of your expertise, strengths, and what drives you.",
  "experience": [
    {
      "role": "Job Title",
      "org": "Company Name",
      "period": "2023 – Present",
      "details": "High-level summary of your role and responsibilities.",
      "highlights": [
        "Key achievement with measurable impact.",
        "Another bullet point highlighting leadership or architecture."
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "period": "2024",
      "details": "What it does and why it was built.",
      "link": "https://github.com/...",
      "tags": ["Node.js", "TypeScript", "Docker"],
      "highlights": ["100/100 Lighthouse score", "Featured on Hacker News"]
    }
  ],
  "skills": [
    {
      "category": "Languages & Core",
      "items": ["JavaScript", "TypeScript", "Python", "SQL"]
    },
    {
      "category": "Backend & Tools",
      "items": ["Node.js", "Express", "PostgreSQL", "Docker", "Git"]
    }
  ],
  "education": [
    {
      "role": "B.S. in Computer Science",
      "org": "University Name",
      "period": "2018 – 2022",
      "details": "Honors, GPA, or notable coursework."
    }
  ]
}
```

### Resume PDF:
- A downloadable PDF is served at `/resume.pdf`.
- When you have your own PDF ready, simply drop your file into `public/resume.pdf`! It replaces the starter file immediately.
- Visitors can also click the **"Print / Save as PDF"** button on the resume page anytime to generate a clean PDF using our print stylesheet.

---

## 3. `posts/` — Writing Blog Posts

Each post is a Markdown file inside `content/posts/` following the naming convention:

```
YYYY-MM-DD-your-post-slug.md
```

Example frontmatter:

```markdown
---
title: My First Insightful Post
summary: A one-sentence preview that appears in search and social cards.
tags: ["Engineering", "Productivity"]
---

Write your post content in standard Markdown.

### Subheadings

Use bullet points, blockquotes, and code snippets:

```javascript
console.log("Hello, world!");
```

Add `draft: true` to the frontmatter to keep the post hidden until you are ready to publish it!
```

- **Reading Time**: Automatically calculated from word count!
- **Tags**: Displayed as pill badges and filterable on the homepage.
- **Adjacent Post Navigation**: Automatically links to older and newer posts.
- **Search**: Readers can filter posts in real time using the search box on the homepage.
- **RSS Feed**: All published posts are automatically syndicated at `/feed.xml`.
