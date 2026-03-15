// ============================================================
// Signal Formatter - Inflection Intelligence
// Converts **bold** to <strong> and splits section headings
// Separates sections Contexte/Mecanisme/Consequence
// Load on /signaux/... pages
// ============================================================

(function() {
  'use strict';

  const CONTENT_SELECTORS = [
    '.ii-n p',
    '.ii-mt p',
    '.ii-ex p',
    '.ii-tab-content p',
    '.ii-impl p',
    '.ii-lect p',
    '.ii-ch p'
  ].join(', ');

  // Regex: bold section headings followed by a dash
  // Uses \uXXXX escapes for accented chars to avoid encoding issues
  const HEADING_RE = /(?=<strong>(?:Contexte|M\u00e9canisme|Cons\u00e9quence|Implications|Catalyseurs|Risques|Tendance|Dynamique|Signal|Analyse|Facteurs|Enjeux|Opportunit\u00e9s|Acteurs|Projection|Acc\u00e9l\u00e9rateurs|Freins|Verdict|Synth\u00e8se)[^<]*<\/strong>\s*[\u2014\u2013\-:])/;

  function formatElement(el) {
    const text = el.textContent || '';
    if (el.dataset.formatted || text.length < 20) return;

    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 1) Split on \n\n if present
    if (html.includes('\n\n')) {
      const parts = html.split(/\n\n+/).filter(p => p.trim());
      if (parts.length > 1) { replaceParagraphs(el, parts); return; }
    }

    // 2) Split on <strong>Heading</strong> dash (Webflow strips newlines)
    const secParts = html.split(HEADING_RE).filter(p => p.trim());
    if (secParts.length > 1) { replaceParagraphs(el, secParts); return; }

    // 3) Fallback
    html = html.replace(/\n/g, '<br>');
    if (html !== escapeHtml(text)) { el.innerHTML = html; }
    el.dataset.formatted = 'true';
  }

  function replaceParagraphs(el, parts) {
    const parent = el.parentElement;
    const frag = document.createDocumentFragment();
    parts.forEach(pText => {
      const p = document.createElement('p');
      p.innerHTML = pText.replace(/\n/g, '<br>').trim();
      p.dataset.formatted = 'true';
      p.style.marginBottom = '0.75em';
      frag.appendChild(p);
    });
    parent.replaceChild(frag, el);
  }

  function splitFormattedSections() {
    document.querySelectorAll('[data-formatted="true"]').forEach(p => {
      const html = p.innerHTML;
      const parts = html.split(HEADING_RE).filter(s => s.trim());
      if (parts.length > 1) {
        const parent = p.parentElement;
        if (!parent) return;
        const frag = document.createDocumentFragment();
        parts.forEach(part => {
          const np = document.createElement('p');
          np.innerHTML = part.trim();
          np.dataset.formatted = 'true';
          np.style.marginBottom = '0.75em';
          frag.appendChild(np);
        });
        parent.replaceChild(frag, p);
      }
    });
  }

  function escapeHtml(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatAll() {
    document.querySelectorAll(CONTENT_SELECTORS).forEach(formatElement);
    document.querySelectorAll('.signal-page p, .ii-signal p, [class*="ii-"] p').forEach(el => {
      if (!el.dataset.formatted && el.textContent.length > 20) formatElement(el);
    });
    splitFormattedSections();
  }

  function observeChanges() {
    new MutationObserver(muts => {
      if (muts.some(m => m.addedNodes.length > 0 || (m.type === 'attributes' && m.attributeName === 'class'))) {
        requestAnimationFrame(formatAll);
      }
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { formatAll(); observeChanges(); });
  } else {
    formatAll();
    observeChanges();
  }
  setTimeout(formatAll, 1000);
  setTimeout(formatAll, 3000);
})();
