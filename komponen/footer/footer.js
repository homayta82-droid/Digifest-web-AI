const footerScriptUrl = document.currentScript?.src
  ? new URL(document.currentScript.src)
  : null;
const footerTemplateUrl = footerScriptUrl
  ? new URL('footer.html', footerScriptUrl)
  : new URL('/komponen/footer/footer.html', window.location.href);
footerTemplateUrl.searchParams.set('v', 'uniform-footer-3');
const footerStylesheetUrl = footerScriptUrl
  ? new URL('footer.css', footerScriptUrl)
  : new URL('/komponen/footer/footer.css', window.location.href);
footerStylesheetUrl.searchParams.set('v', 'mobile-footer-1');
const projectRootUrl = footerScriptUrl
  ? new URL('../../', footerTemplateUrl)
  : new URL('/', window.location.href);

function resolveProjectPath(value) {
  if (!value || /^(?:https?:|mailto:|tel:|#)/i.test(value)) return value;
  if (value.startsWith('/')) return new URL(value.slice(1), projectRootUrl).href;
  return value;
}

function replaceFooterSlots(markup) {
  const documentFragment = new DOMParser().parseFromString(markup, 'text/html');
  document.querySelectorAll('[data-footer-slot]').forEach((slot) => {
    const className = slot.dataset.footerSlot;
    const template = documentFragment.querySelector(`[data-footer-template="${className}"]`);
    if (!template) {
      throw new Error(`Footer template "${className}" could not be found`);
    }

    const footer = template.content.cloneNode(true);
    footer.querySelectorAll('[src], [href]').forEach((element) => {
      ['src', 'href'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        const resolved = resolveProjectPath(value);
        if (resolved) element.setAttribute(attribute, resolved);
      });
    });
    slot.replaceWith(footer);
  });
}

const loadFooter = () => {
  const slots = document.querySelectorAll('[data-footer-slot]');
  if (!slots.length) return;

  if (!document.querySelector('[data-footer-stylesheet]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = footerStylesheetUrl.href;
    stylesheet.dataset.footerStylesheet = '';
    document.head.append(stylesheet);
  }

  // Use sessionStorage cache if available for instant swap
  const cachedMarkup = sessionStorage.getItem('smansa_footer_markup_v4');
  if (cachedMarkup) {
    replaceFooterSlots(cachedMarkup);
    return;
  }

  fetch(footerTemplateUrl.href)
    .then((response) => {
      if (!response.ok) throw new Error('Footer component could not be loaded');
      return response.text();
    })
    .then((markup) => {
      try { sessionStorage.setItem('smansa_footer_markup_v4', markup); } catch (_) {}
      replaceFooterSlots(markup);
    })
    .catch((error) => console.error(error));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooter, { once: true });
} else {
  loadFooter();
}
