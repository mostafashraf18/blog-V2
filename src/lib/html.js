'use strict';

// A tiny templating helper. Every value is escaped unless it is wrapped in raw()
// or came from another html`...` template, so output is safe by default.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

class SafeHtml {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function render(value) {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  if (value === null || value === undefined || value === false) return '';
  return escapeHtml(value);
}

function html(strings, ...values) {
  let out = strings[0];
  values.forEach((value, i) => {
    out += render(value) + strings[i + 1];
  });
  return new SafeHtml(out);
}

/** Marks a string as already-safe HTML. Only use it for trusted content. */
function raw(value) {
  return new SafeHtml(String(value));
}

/** Allows only http(s), mailto and same-site links in href attributes. */
function safeHref(url) {
  const value = String(url ?? '').trim();
  return /^(https?:\/\/|mailto:|\/(?!\/))/i.test(value) ? value : '#';
}

module.exports = { html, raw, escapeHtml, safeHref };
