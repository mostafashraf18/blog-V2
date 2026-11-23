// Black/white theme switch & interactive enhancements.
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'theme';

  function read() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function write(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      /* storage can be blocked; the switch still works for this visit */
    }
  }

  function current() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var saved = read();
  if (saved) root.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function () {
    // Theme button
    var button = document.getElementById('mode');
    if (button) {
      function updateLabel() {
        button.textContent = current() === 'dark' ? '☀️ Light' : '🌙 Dark';
      }

      button.hidden = false;
      updateLabel();
      button.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        write(next);
        updateLabel();
      });
    }

    // Instant client-side post search
    var searchInput = document.getElementById('post-search');
    var postList = document.getElementById('post-list');
    var noResults = document.getElementById('no-search-results');

    if (searchInput && postList) {
      var items = postList.querySelectorAll('.post-card');
      searchInput.addEventListener('input', function () {
        var query = searchInput.value.toLowerCase().trim();
        var visibleCount = 0;

        items.forEach(function (item) {
          var title = item.getAttribute('data-title') || '';
          var tags = item.getAttribute('data-tags') || '';
          var snippet = (item.querySelector('.post-snippet') ? item.querySelector('.post-snippet').textContent : '').toLowerCase();

          var match = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1 || snippet.indexOf(query) !== -1;
          item.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });

        if (noResults) {
          noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    }

    // Copy code button for code snippets
    var preBlocks = document.querySelectorAll('.post-body pre');
    preBlocks.forEach(function (pre) {
      var code = pre.querySelector('code');
      if (!code) return;

      var btn = document.createElement('button');
      btn.className = 'code-copy-btn no-print';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.setAttribute('aria-label', 'Copy code to clipboard');

      btn.addEventListener('click', function () {
        var codeText = code.innerText || code.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(codeText).then(function () {
            btn.textContent = 'Copied!';
            setTimeout(function () {
              btn.textContent = 'Copy';
            }, 2000);
          });
        }
      });

      pre.appendChild(btn);
    });
  });
})();
