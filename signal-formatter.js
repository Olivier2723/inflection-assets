// ============================================================
// Signal Formatter — Inflection Intelligence
// Convertit **bold** → <strong> et \n\n → paragraphes multiples
// À charger sur les pages /signaux/...
// ============================================================

(function() {
  'use strict';

  // Sélecteurs des éléments de contenu à formater
  const CONTENT_SELECTORS = [
    '.ii-n p',
    '.ii-mt p',
    '.ii-ex p',
    '.ii-tab-content p',
    '.ii-impl p',
    '.ii-lect p',
    '.ii-ch p'
  ].join(', ');

  function formatElement(el) {
    const text = el.textContent || '';
    if (el.dataset.formatted || text.length < 20) return;

    let html = escapeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    if (html.includes('\n\n')) {
      const paragraphs = html.split(/\n\n+/).filter(p => p.trim());
      if (paragraphs.length > 1) {
        const parent = el.parentElement;
        const fragment = document.createDocumentFragment();
        paragraphs.forEach(pText => {
          const newP = document.createElement('p');
          newP.innerHTML = pText.replace(/\n/g, '<br>').trim();
          newP.dataset.formatted = 'true';
          newP.style.marginBottom = '0.75em';
          fragment.appendChild(newP);
        });
        parent.replaceChild(fragment, el);
        return;
      }
    }

    html = html.replace(/\n/g, '<br>');

    if (html !== escapeHtml(text)) {
      el.innerHTML = html;
    }

    el.dataset.formatted = 'true';
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatAll() {
    const elements = document.querySelectorAll(CONTENT_SELECTORS);
    elements.forEach(formatElement);

    const allParagraphs = document.querySelectorAll('.signal-page p, .ii-signal p, [class*="ii-"] p');
    allParagraphs.forEach(el => {
      if (!el.dataset.formatted && el.textContent.length > 20) {
        formatElement(el);
      }
    });
  }

  function observeChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldFormat = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0 ||
            (mutation.type === 'attributes' && mutation.attributeName === 'class')) {
          shouldFormat = true;
          break;
        }
      }
      if (shouldFormat) {
        requestAnimationFrame(formatAll);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      formatAll();
      observeChanges();
    });
  } else {
    formatAll();
    observeChanges();
  }

  setTimeout(formatAll, 1000);
  setTimeout(formatAll, 3000);

})();
