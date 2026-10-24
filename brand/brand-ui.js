/*
  Shared behaviour for the presentation and (later) the sites.
  - Icons:       <span class="icon" data-icon="arrow-right"></span>
  - Brand names: <span data-brand-name="veriterra"></span>, descriptors: data-brand-descriptor
  Needs brand/brands.js loaded first.
*/
(function () {
  "use strict";

  // 24×24 line icons, drawn with currentColor so they follow the text colour.
  var ICONS = {
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    "expand": '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    "collapse": '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    "home": '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5.5h4V20"/>'
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

  function brandById(id) {
    return (window.BRANDS || []).filter(function (b) { return b.id === id; })[0];
  }

  function fillBrandNames(root) {
    (root || document).querySelectorAll("[data-brand-name]").forEach(function (el) {
      var b = brandById(el.getAttribute("data-brand-name"));
      if (b) el.textContent = b.name;
    });
    (root || document).querySelectorAll("[data-brand-descriptor]").forEach(function (el) {
      var b = brandById(el.getAttribute("data-brand-descriptor"));
      if (b) el.textContent = b.descriptor;
    });
  }

  function init() {
    hydrateIcons();
    fillBrandNames();
  }

  window.BrandUI = { icon: icon, hydrateIcons: hydrateIcons, brandById: brandById };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
