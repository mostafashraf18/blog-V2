'use strict';

const crypto = require('node:crypto');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 100, email: 254, message: 5000 };

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function validate(input = {}) {
  const values = {
    name: clean(input.name),
    email: clean(input.email),
    message: clean(input.message),
  };
  const errors = {};

  if (!values.name) errors.name = 'Please enter your name.';
  else if (values.name.length > LIMITS.name) errors.name = `Your name must be ${LIMITS.name} characters or fewer.`;

  if (!values.email) errors.email = 'Please enter your email address.';
  else if (values.email.length > LIMITS.email || !EMAIL.test(values.email)) errors.email = 'Please enter a valid email address.';

  if (!values.message) errors.message = 'Please write a message.';
  else if (values.message.length > LIMITS.message) errors.message = `Your message must be ${LIMITS.message} characters or fewer.`;

  return { values, errors };
}

/** Business rules for the contact form: validate, ignore bots, then store. */
function createContactService({ messages }) {
  return {
    LIMITS,

    async submit(input = {}) {
      // "website" is a hidden field that real visitors never fill in. Bots usually do.
      // Pretend it worked so they do not learn how to get around it.
      if (clean(input.website)) return { ok: true };

      const { values, errors } = validate(input);
      if (Object.keys(errors).length > 0) return { ok: false, values, errors };

      await messages.add({
        id: crypto.randomUUID(),
        receivedAt: new Date().toISOString(),
        ...values,
      });
      return { ok: true };
    },
  };
}

module.exports = { createContactService, validate };
