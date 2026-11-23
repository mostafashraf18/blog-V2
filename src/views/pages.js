'use strict';

const { html, raw, safeHref } = require('../lib/html');

function home({ posts = [], tags = [], activeTag = '', totalCount = 0, basePath = '' }) {
  const p = (url) => (basePath && url.startsWith('/') && !url.startsWith('//') ? `${basePath}${url}` : url);

  if (posts.length === 0) {
    return html`
      <div class="section-header">
        <h1>Posts</h1>
      </div>
      <p class="muted">No posts found${activeTag ? html` for tag "<strong>${activeTag}</strong>"` : ''}.</p>
      ${activeTag ? html`<p><a href="${p('/')}" class="btn btn-sm">Clear filter</a></p>` : ''}
    `;
  }

  const tagFilters = tags.length > 0 ? html`
    <div class="filter-bar no-print">
      <div class="tag-pills" role="navigation" aria-label="Filter by tag">
        <a href="${p('/')}" class="tag-pill${!activeTag ? ' active' : ''}">All (${totalCount || posts.length})</a>
        ${tags.map((t) => html`<a href="${p('/?tag=' + encodeURIComponent(t))}" class="tag-pill${activeTag === t ? ' active' : ''}">${t}</a>`)}
      </div>
      <div class="search-wrap">
        <input id="post-search" type="search" placeholder="Filter posts..." aria-label="Search posts by title or keyword" autocomplete="off">
      </div>
    </div>
  ` : '';

  return html`
    <div class="section-header">
      <h1>Posts${activeTag ? html` <span class="active-filter-badge">Tagged: ${activeTag}</span>` : ''}</h1>
    </div>
    ${tagFilters}
    <ul class="post-list" id="post-list">
      ${posts.map(
        (post) => html`
        <li class="post-card" data-tags="${(post.tags || []).join(' ').toLowerCase()}" data-title="${post.title.toLowerCase()}">
          <div class="post-row">
            <a class="post-title-link" href="${p('/posts/' + post.slug)}">${post.title}</a>
            <span class="muted meta-info">
              <time datetime="${post.date}">${post.date}</time>
              ${post.readingTime ? html` <span class="sep">·</span> <span class="read-estimate">${post.readingTime}</span>` : ''}
            </span>
          </div>
          ${post.summary ? html`<p class="post-snippet">${post.summary}</p>` : ''}
          ${post.tags && post.tags.length > 0 ? html`
            <div class="post-card-tags">
              ${post.tags.map((tag) => html`<a href="${p('/?tag=' + encodeURIComponent(tag))}" class="tag-badge">${tag}</a>`)}
            </div>
          ` : ''}
        </li>
      `
      )}
    </ul>
    <p id="no-search-results" class="muted" style="display:none; margin-top: 1.5rem;">No posts matched your search.</p>
  `;
}

function post({ post: entry, basePath = '' }) {
  const p = (url) => (basePath && url.startsWith('/') && !url.startsWith('//') ? `${basePath}${url}` : url);

  return html`
    <article class="single-post">
      <div class="post-top-nav no-print">
        <a class="muted back-link" href="${p('/')}">← Back to all posts</a>
      </div>
      <h1 class="post-title">${entry.title}</h1>
      <div class="post-metadata muted">
        <time datetime="${entry.date}">${entry.date}</time>
        ${entry.readingTime ? html` <span class="sep">·</span> <span>${entry.readingTime}</span>` : ''}
        ${entry.tags && entry.tags.length > 0 ? html`
          <span class="sep">·</span>
          <span class="inline-tags">${entry.tags.map((t) => html`<a href="${p('/?tag=' + encodeURIComponent(t))}" class="tag-badge">${t}</a>`)}</span>
        ` : ''}
      </div>
      <div class="post-body">
        ${raw(entry.html)}
      </div>
      ${(entry.prev || entry.next) ? html`
        <nav class="post-nav no-print" aria-label="Adjacent posts">
          ${entry.prev ? html`
            <a class="post-nav-card prev" href="${p('/posts/' + entry.prev.slug)}">
              <span class="post-nav-label muted">← Older post</span>
              <span class="post-nav-title">${entry.prev.title}</span>
            </a>
          ` : html`<div class="post-nav-placeholder"></div>`}
          ${entry.next ? html`
            <a class="post-nav-card next" href="${p('/posts/' + entry.next.slug)}">
              <span class="post-nav-label muted">Newer post →</span>
              <span class="post-nav-title">${entry.next.title}</span>
            </a>
          ` : html`<div class="post-nav-placeholder"></div>`}
        </nav>
      ` : ''}
    </article>
  `;
}

function resumeEntry(entry) {
  return html`
    <div class="resume-item">
      <div class="resume-item-top">
        <h3 class="role-org"><strong>${entry.role}</strong>${entry.org ? html` <span class="org-sep">·</span> <span class="org-name">${entry.link ? html`<a href="${safeHref(entry.link)}" target="_blank" rel="noopener noreferrer">${entry.org}</a>` : entry.org}</span>` : ''}</h3>
        ${entry.period ? html`<span class="period-pill muted">${entry.period}</span>` : ''}
      </div>
      ${entry.details ? html`<p class="sub resume-details">${entry.details}</p>` : ''}
      ${entry.highlights && entry.highlights.length > 0 ? html`
        <ul class="bullet-list">
          ${entry.highlights.map((h) => html`<li>${h}</li>`)}
        </ul>
      ` : ''}
    </div>
  `;
}

function resume({ resume: data, site = {}, pdfMissing = false, basePath = '' }) {
  const p = (url) => (basePath && url.startsWith('/') && !url.startsWith('//') ? `${basePath}${url}` : url);
  const hasProjects = data.projects && data.projects.length > 0;
  const hasContact = data.contact && Object.keys(data.contact).length > 0;

  return html`
    <div class="resume-container">
      <div class="resume-head">
        <div class="resume-heading">
          <h1>${data.name || 'Resume'}</h1>
          ${data.title ? html`<p class="resume-role-title">${data.title}</p>` : ''}
        </div>
        <div class="resume-cta-bar no-print">
          <a class="btn btn-primary" href="${p(data.pdfUrl || '/resume.pdf')}" download="resume.pdf">
            📥 Download PDF
          </a>
          <button class="btn btn-secondary" type="button" onclick="window.print()">
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>

      ${pdfMissing ? html`
        <div class="notice tip-banner no-print" role="status">
          <strong>Tip:</strong> Custom PDF not uploaded yet. Drop your <code>resume.pdf</code> into the <code>public/</code> folder to replace the default! You can also click <em>Print / Save as PDF</em> to export right away.
        </div>
      ` : ''}

      ${hasContact || site.email ? html`
        <div class="resume-contact-row">
          ${data.contact?.location || site.location ? html`<span class="contact-item">📍 ${data.contact?.location || site.location}</span>` : ''}
          ${data.contact?.email || site.email ? html`<span class="contact-item">✉️ <a href="${safeHref(`mailto:${data.contact?.email || site.email}`)}">${data.contact?.email || site.email}</a></span>` : ''}
          ${data.contact?.website ? html`<span class="contact-item">🌐 <a href="${safeHref(data.contact.website)}" target="_blank" rel="noopener noreferrer">${data.contact.website.replace(/^https?:\/\//, '')}</a></span>` : ''}
          ${data.contact?.github ? html`<span class="contact-item">💻 <a href="${safeHref(data.contact.github)}" target="_blank" rel="noopener noreferrer">GitHub</a></span>` : ''}
          ${data.contact?.linkedin ? html`<span class="contact-item">💼 <a href="${safeHref(data.contact.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>` : ''}
          ${data.contact?.phone ? html`<span class="contact-item">📞 ${data.contact.phone}</span>` : ''}
        </div>
      ` : ''}

      ${data.summary ? html`
        <section class="resume-section">
          <h2>Summary</h2>
          <p class="summary-paragraph">${data.summary}</p>
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? html`
        <section class="resume-section">
          <h2>Experience</h2>
          <div class="resume-entries">
            ${data.experience.map(resumeEntry)}
          </div>
        </section>
      ` : ''}

      ${hasProjects ? html`
        <section class="resume-section">
          <h2>Featured Projects</h2>
          <div class="projects-list">
            ${data.projects.map((proj) => html`
              <div class="project-box">
                <div class="resume-item-top">
                  <h3 class="role-org"><strong>${proj.name}</strong></h3>
                  ${proj.link ? html`<a class="project-ext-link" href="${safeHref(proj.link)}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>` : ''}
                </div>
                ${proj.details ? html`<p class="sub">${proj.details}</p>` : ''}
                ${proj.highlights && proj.highlights.length > 0 ? html`
                  <ul class="bullet-list">
                    ${proj.highlights.map((h) => html`<li>${h}</li>`)}
                  </ul>
                ` : ''}
                ${proj.tags && proj.tags.length > 0 ? html`
                  <div class="tech-tags-row">
                    ${proj.tags.map((t) => html`<span class="tag-badge">${t}</span>`)}
                  </div>
                ` : ''}
              </div>
            `)}
          </div>
        </section>
      ` : ''}

      ${data.skills && data.skills.length > 0 ? html`
        <section class="resume-section">
          <h2>Skills</h2>
          ${typeof data.skills[0] === 'string' ? html`
            <ul class="skills-tag-list">
              ${data.skills.map((skill) => html`<li class="skill-tag">${skill}</li>`)}
            </ul>
          ` : html`
            <div class="skills-categorized">
              ${data.skills.map((cat) => html`
                <div class="skill-group">
                  <strong class="skill-group-name">${cat.category}:</strong>
                  <span class="skill-group-items">${cat.items.join(', ')}</span>
                </div>
              `)}
            </div>
          `}
        </section>
      ` : ''}

      ${data.education && data.education.length > 0 ? html`
        <section class="resume-section">
          <h2>Education</h2>
          <div class="resume-entries">
            ${data.education.map(resumeEntry)}
          </div>
        </section>
      ` : ''}

      ${data.certifications && data.certifications.length > 0 ? html`
        <section class="resume-section">
          <h2>Certifications</h2>
          <ul class="bullet-list certifications-list">
            ${data.certifications.map((c) => html`
              <li class="cert-item">
                <strong>${c.name}</strong>${c.issuer ? html` <span class="muted">— ${c.issuer}</span>` : ''}${c.year ? html` <span class="muted">(${c.year})</span>` : ''}
              </li>
            `)}
          </ul>
        </section>
      ` : ''}
    </div>
  `;
}

function field({ name, label, value = '', error, type = 'text', multiline = false, maxLength }) {
  const id = `field-${name}`;
  const aria = error ? html` aria-invalid="true" aria-describedby="${id}-error"` : '';
  const control = multiline
    ? html`<textarea id="${id}" name="${name}" rows="6" maxlength="${maxLength}" required${aria}>${value}</textarea>`
    : html`<input id="${id}" name="${name}" type="${type}" value="${value}" maxlength="${maxLength}" required${aria}>`;

  return html`<div class="field">
  <label for="${id}">${label}</label>
  ${control}
  ${error ? html`<p class="error" id="${id}-error">${error}</p>` : ''}
</div>`;
}

function contact({ site, values = {}, errors = {}, sent = false, limits, formAction }) {
  return html`
    <div class="contact-page">
      <h1>Get in Touch</h1>
      ${sent ? html`<div class="notice success-banner" role="status"><strong>Your message was sent.</strong> Thank you for reaching out—I’ll get back to you soon!</div>` : ''}
      <p class="contact-intro">
        Have a question, an opportunity, or just want to chat? ${site.email ? html`Email me directly at <a href="${safeHref(`mailto:${site.email}`)}">${site.email}</a> or send a note below:` : html`Use the form below:`}
      </p>
      <form class="contact-form" method="post" action="${formAction || '/contact'}">
        ${field({ name: 'name', label: 'Your Name', value: values.name, error: errors.name, maxLength: limits.name })}
        ${field({ name: 'email', label: 'Email Address', type: 'email', value: values.email, error: errors.email, maxLength: limits.email })}
        ${field({ name: 'message', label: 'Your Message', value: values.message, error: errors.message, multiline: true, maxLength: limits.message })}
        <p class="hp" aria-hidden="true"><label>Leave this empty <input name="website" type="text" tabindex="-1" autocomplete="off"></label></p>
        <button class="btn btn-primary" type="submit">Send message →</button>
      </form>
    </div>
  `;
}

function error({ status, message, basePath = '' }) {
  const p = (url) => (basePath && url.startsWith('/') && !url.startsWith('//') ? `${basePath}${url}` : url);
  return html`
    <div class="error-page">
      <h1>${status === 404 ? 'Page not found' : `Error ${status}`}</h1>
      <p class="muted">${message}</p>
      <p><a class="btn btn-sm" href="${p('/')}">← Return to home</a></p>
    </div>
  `;
}

module.exports = { home, post, resume, contact, error };
