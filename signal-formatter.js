// ============================================================
// Signal Formatter â Inflection Intelligence
// Convertit **bold** â <strong> et \n\n â paragraphes multiples
// SÃ©pare les sections Contexte/MÃ©canisme/ConsÃ©quence
// Ã charger sur les pages /signaux/...
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

  // Regex: titres de section en gras suivis d'un tiret
  const HEADING_RE = /(?=<strong>(?:Contexte|MÃ©canisme|ConsÃ©quence|Implications|Catalyseurs|Risques|Tendance|Dynamique|Signal|Analyse|Facteurs|Enjeux|OpportunitÃ©s|Acteurs|Projection|AccÃ©lÃ©rateurs|Freins|Verdict|SynthÃ¨se)[^<]*<\/strong>\s*[ââ\-:])/;

  function formatElement(el) {
    const text = el.textContent || '';
    if (el.dataset.formatted || text.length < 20) return;

    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // 1) Split sur \n\n si prÃ©sent
    if (html.includes('\n\n')) {
      const parts = html.split(/\n\n+/).filter(p => p.trim());
      if (parts.length > 1) { replaceParagraphs(el, parts); return; }
    }

    // 2) Split sur <strong>Heading</strong> â (Webflow supprime les \n)
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
