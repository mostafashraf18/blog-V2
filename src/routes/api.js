'use strict';

const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { HttpError } = require('../lib/httpError');
const { requireAdmin } = require('../middleware/requireAdmin');

function createApiRouter({ posts, messages, adminToken }) {
  const router = express.Router();

  router.get(
    '/posts',
    asyncHandler(async (req, res) => {
      const list = await posts.list();
      res.json(list.map(({ date, slug, summary, title }) => ({ date, slug, summary, title })));
    })
  );

  router.get(
    '/posts/:slug',
    asyncHandler(async (req, res) => {
      const entry = await posts.findBySlug(req.params.slug);
      if (!entry) throw new HttpError(404, 'Post not found');
      res.json(entry);
    })
  );

  router.get(
    '/messages',
    requireAdmin(adminToken),
    asyncHandler(async (req, res) => {
      res.json(await messages.all());
    })
  );

  return router;
}

module.exports = { createApiRouter };
