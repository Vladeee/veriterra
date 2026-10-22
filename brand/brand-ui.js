/*
  Shared behaviour for the style guide, the deck and the sites.
  - Icons:   <span class="icon" data-icon="arrow-right"></span>
  - Brands:  <div data-brand-switch data-target="html|scope" data-persist="key"></div>
             data-target="scope" themes the closest [data-brand-scope] ancestor.
  - Copy:    BrandUI.copy("text", "Copied HEX")
  - Brand names: <span data-brand-name="veriterra"></span>
  Needs brand/brands.js loaded first.
*/
(function () {
  "use strict";

  // 24×24 line icons, drawn with currentColor so they follow the text colour.
  var ICONS = {
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "minus": '<path d="M5 12h14"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "close": '<path d="M6 6l12 12M18 6 6 18"/>',
    "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
    "copy": '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    "expand": '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    "collapse": '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    "play": '<path d="M8 5.5v13l11-6.5z"/>',
    "info": '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.6v.1"/>',
    "alert": '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17v.1"/>',
    "map-pin": '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    "sprout": '<path d="M12 21v-9M12 12c0-4 2.8-6.5 7-6.5 0 4.2-2.8 6.5-7 6.5zM12 14.5c0-3.2-2.3-5.2-5.8-5.2 0 3.3 2.3 5.2 5.8 5.2z"/><path d="M6 21h12"/>',
    "basket": '<path d="M3.5 10h17l-1.8 9.2a1.5 1.5 0 0 1-1.5 1.3H6.8a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M8 10l3-6M16 10l-3-6M9 14v3M15 14v3"/>',
    "person": '<circle cx="12" cy="8" r="3.5"/><path d="M5 20.5c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
    "home": '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5.5h4V20"/>',
    "sun": '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    "drop": '<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0c0-4.2 6-10.6 6-10.6z"/>',
    "image": '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>'
  };

  function icon(name) {
    var body = ICONS[name];
    if (!body) return "";
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  function hydrateIcons(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(function (el) {
      if (!el.firstElementChild) el.innerHTML = icon(el.getAttribute("data-icon"));
    });
  }

  // ---------- storage (never required; may be unavailable) ----------
  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  // ---------- brands ----------
  function brands() { return window.BRANDS || []; }

  function brandById(id) {
    return brands().filter(function (b) { return b.id === id; })[0];
  }

  function fillBrandNames(root) {
    (root || document).querySelectorAll("[data-brand-name]").forEach(function (el) {
      var b = brandById(el.getAttribute("data-brand-name"));
      if (b) el.textContent = b.name;
    });
  }

  function setBrand(target, id) {
    target.setAttribute("data-brand", id);
    target.dispatchEvent(new CustomEvent("brandchange", { bubbles: true, detail: { brand: id } }));
  }

  function initSwitch(container) {
    if (container.dataset.ready) return;
    container.dataset.ready = "1";
    var target = container.getAttribute("data-target") === "scope"
      ? container.closest("[data-brand-scope]")
      : document.documentElement;
    if (!target) return;
    var key = container.getAttribute("data-persist");
    var current = (key && load(key)) || target.getAttribute("data-brand") || "holding";
    if (!brandById(current)) current = "holding";

    container.classList.add("segmented");
    container.setAttribute("role", "group");
    if (!container.getAttribute("aria-label")) container.setAttribute("aria-label", "Brand");

    brands().forEach(function (b) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "segmented__option";
      btn.setAttribute("data-brand", b.id);
      btn.setAttribute("aria-pressed", String(b.id === current));
      btn.innerHTML = '<span class="segmented__swatch" aria-hidden="true"></span>';
      btn.appendChild(document.createTextNode(b.name));
      btn.addEventListener("click", function () {
        container.querySelectorAll(".segmented__option").forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === btn));
        });
        setBrand(target, b.id);
        if (key) save(key, b.id);
      });
      container.appendChild(btn);
    });
    setBrand(target, current);
  }

  // ---------- clipboard + toast ----------
  var toastEl, toastTimer;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    // Force a frame so the transition runs even on repeated taps.
    toastEl.classList.remove("is-visible");
    void toastEl.offsetWidth;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-visible"); }, 1600);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.className = "visually-hidden";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copy(text, label) {
    var done = function () { toast((label || "Copied") + ": " + text); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () {
        if (fallbackCopy(text)) done(); else toast("Copy failed");
      });
    } else if (fallbackCopy(text)) {
      done();
    } else {
      toast("Copy failed");
    }
  }

  // ---------- colour helpers (used for live contrast checks) ----------
  var probe;
  function resolveColor(cssValue, context) {
    if (!probe) {
      probe = document.createElement("span");
      probe.className = "visually-hidden";
    }
    (context || document.body).appendChild(probe);
    probe.style.color = "";
    probe.style.color = cssValue;
    var rgb = getComputedStyle(probe).color;
    probe.remove();
    var m = rgb.match(/[\d.]+/g) || [0, 0, 0];
    return [Math.round(+m[0]), Math.round(+m[1]), Math.round(+m[2])];
  }

  function toHex(rgb) {
    return "#" + rgb.map(function (v) { return v.toString(16).padStart(2, "0"); }).join("").toUpperCase();
  }

  function luminance(rgb) {
    var c = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function init() {
    hydrateIcons();
    fillBrandNames();
    document.querySelectorAll("[data-brand-switch]").forEach(initSwitch);
  }

  window.BrandUI = {
    icon: icon,
    hydrateIcons: hydrateIcons,
    brands: brands,
    brandById: brandById,
    setBrand: setBrand,
    copy: copy,
    toast: toast,
    resolveColor: resolveColor,
    toHex: toHex,
    contrast: contrast,
    load: load,
    save: save
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
