/**
 * Global Latin / Western Arabic Numerals Enforcement (0-9)
 * Guarantees that ALL numbers across the entire system, dashboards, forms,
 * tables, charts, and official printable reports strictly use Western Arabic (Latin) digits (0123456789).
 */

// 1. Force Number.prototype.toLocaleString to always use 'en-US'
if (typeof Number !== 'undefined' && Number.prototype) {
  const origNumToLocaleString = Number.prototype.toLocaleString;
  Number.prototype.toLocaleString = function(locales, options) {
    return origNumToLocaleString.call(this, 'en-US', options);
  };
}

// 2. Force Intl.NumberFormat to always use 'en-US' with numberingSystem: 'latn'
if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
  const OrigNF = Intl.NumberFormat;
  const WrappedNF = function(locales, options = {}) {
    const safeOptions = { ...options, numberingSystem: 'latn' };
    return new OrigNF('en-US', safeOptions);
  };
  WrappedNF.prototype = OrigNF.prototype;
  WrappedNF.supportedLocalesOf = OrigNF.supportedLocalesOf;
  Intl.NumberFormat = WrappedNF;
}

// 3. Force Date formatting to always use English numbers
if (typeof Date !== 'undefined' && Date.prototype) {
  const origDateToLocaleString = Date.prototype.toLocaleString;
  Date.prototype.toLocaleString = function(locales, options) {
    return origDateToLocaleString.call(this, 'en-US', options);
  };

  const origDateToLocaleDateString = Date.prototype.toLocaleDateString;
  Date.prototype.toLocaleDateString = function(locales, options) {
    return origDateToLocaleDateString.call(this, 'en-US', options);
  };
}

// 4. Helper to clean and convert any Eastern Arabic / Persian digits to standard Latin digits (0-9)
export const toCleanLatinDigits = (val) => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/[\u0660-\u0669]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
    .replace(/[\u06F0-\u06F9]/g, d => String.fromCharCode(d.charCodeAt(0) - 0x06F0 + 48))
    .replace(/٫/g, '.');
};

// Deeply sanitize all strings/numbers inside an object or array to ensure pure Latin digits
export const deepSanitizeLatinDigits = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return /[\u0660-\u0669\u06F0-\u06F9]/.test(data) ? toCleanLatinDigits(data) : data;
  }
  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => deepSanitizeLatinDigits(item));
  }
  if (typeof data === 'object') {
    const copy = {};
    for (const key of Object.keys(data)) {
      copy[key] = deepSanitizeLatinDigits(data[key]);
    }
    return copy;
  }
  return data;
};

// 5. Scrubber for localStorage: cleanse any existing stored reports or data of Arabic numerals
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToClean = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keysToClean.push(k);
    }
    keysToClean.forEach(key => {
      try {
        const val = localStorage.getItem(key);
        if (val && /[\u0660-\u0669\u06F0-\u06F9]/.test(val)) {
          const cleaned = toCleanLatinDigits(val);
          localStorage.setItem(key, cleaned);
        }
      } catch (_) {}
    });
  } catch (_) {}
}

// 6. Intercept all user typing / pasting to auto-convert any Arabic-Indic digits to Latin
if (typeof window !== 'undefined') {
  // Ensure documentElement has lang="en" to stop browser form controls from localizing numbers
  if (document.documentElement) {
    document.documentElement.setAttribute('lang', 'en');
  }

  const handleInputCleanse = (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      const val = target.value;
      if (typeof val === 'string' && /[\u0660-\u0669\u06F0-\u06F9]/.test(val)) {
        const cleaned = toCleanLatinDigits(val);
        target.value = cleaned;
      }
    }
  };

  window.addEventListener('input', handleInputCleanse, true);
  window.addEventListener('change', handleInputCleanse, true);
  window.addEventListener('paste', handleInputCleanse, true);

  // Auto-tag all input elements with lang="en-US" so browser number steppers never localize to Arabic
  const tagInputsWithEn = () => {
    try {
      document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.getAttribute('lang') !== 'en-US') {
          el.setAttribute('lang', 'en-US');
        }
        if (el.getAttribute('inputmode') === 'decimal' || el.getAttribute('dir') === 'ltr') {
          el.style.fontFamily = "'Segoe UI', Roboto, Tahoma, Arial, sans-serif";
          el.style.direction = "ltr";
          el.style.unicodeBidi = "plaintext";
        }
      });
    } catch (_) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tagInputsWithEn);
  } else {
    tagInputsWithEn();
  }

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      tagInputsWithEn();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}
