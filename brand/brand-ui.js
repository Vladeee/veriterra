/*
  Shared behaviour for the presentation and (later) the sites.
  - Icons:       <span class="icon" data-icon="arrow-right"></span>
  - Ornaments:   <span class="ornament" data-ornament="leaf"></span> (filled, botanical)
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

  // 24×24 filled ornaments (botanical glyphs), drawn with currentColor.
  // Original shapes for Veriterra, in the spirit of the Dix Hectares reference.
  var ORNAMENTS = {
    "star": '<path d="M12 1.5 13.9 10.1 22.5 12 13.9 13.9 12 22.5 10.1 13.9 1.5 12 10.1 10.1Z"/>',
    "quatrefoil": '<circle cx="12" cy="6.6" r="4.6"/><circle cx="17.4" cy="12" r="4.6"/><circle cx="12" cy="17.4" r="4.6"/><circle cx="6.6" cy="12" r="4.6"/>',
    "leaf": '<path d="M12 22.5c-1-3.5-1.3-6.5-1-9.2C6.8 12.6 3.6 9.3 3 3c6.2.3 9.6 3.5 10 8 .8-2.8 3-5.4 7.5-6.6-.3 5.7-3.2 9-7.6 9.7-.2 2.4.1 5.2.9 8.4Z"/>',
    "sprout": '<path d="M11.2 23v-8.6C6.3 14.6 3 11.6 2.8 6.2c5 .1 8.2 2.6 8.9 6.6.5-4.9 3.8-8.3 9.5-8.6-.1 6.3-3.5 9.8-8.6 10.2V23Z"/>',
    "drop": '<path d="M12 1.8c3.4 4.7 7.2 9.2 7.2 13.4A7.2 7.2 0 0 1 4.8 15.2C4.8 11 8.6 6.5 12 1.8Z"/>',
    "seed": '<path d="M12 2c4.4 3.3 6 7.1 6 10s-1.6 6.7-6 10c-4.4-3.3-6-7.1-6-10S7.6 5.3 12 2Z"/>',
    "wheat": '<path d="M11.3 23V7h1.4v16Z"/><ellipse cx="12" cy="4.2" rx="1.9" ry="3"/><ellipse cx="9" cy="9.2" rx="1.8" ry="3" transform="rotate(-35 9 9.2)"/><ellipse cx="15" cy="9.2" rx="1.8" ry="3" transform="rotate(35 15 9.2)"/><ellipse cx="9" cy="14.2" rx="1.8" ry="3" transform="rotate(-35 9 14.2)"/><ellipse cx="15" cy="14.2" rx="1.8" ry="3" transform="rotate(35 15 14.2)"/>',
    "sun": '<circle cx="12" cy="12" r="5"/><path d="M12 0.8 13.3 5h-2.6ZM12 23.2 10.7 19h2.6ZM0.8 12 5 10.7v2.6ZM23.2 12 19 13.3v-2.6ZM4.1 4.1 7.9 6.1 6.1 7.9ZM19.9 19.9 16.1 17.9l1.8-1.8ZM19.9 4.1 17.9 7.9 16.1 6.1ZM4.1 19.9 6.1 16.1l1.8 1.8Z"/>',
    "clover": '<circle cx="12" cy="6.8" r="4.3"/><circle cx="7.2" cy="13.6" r="4.3"/><circle cx="16.8" cy="13.6" r="4.3"/><path d="M11.3 13h1.4v10h-1.4Z"/>',
    "flower": '<circle cx="12" cy="12" r="2.6"/><path d="M12 1c2 2.4 2.2 5 0 8-2.2-3-2-5.6 0-8ZM12 23c-2-2.4-2.2-5 0-8 2.2 3 2 5.6 0 8ZM1 12c2.4-2 5-2.2 8 0-3 2.2-5.6 2-8 0ZM23 12c-2.4 2-5 2.2-8 0 3-2.2 5.6-2 8 0ZM4.2 4.2c3.1.3 5 2 5.4 5.4C6.2 9.2 4.5 7.3 4.2 4.2ZM19.8 19.8c-3.1-.3-5-2-5.4-5.4 3.4.4 5.1 2.3 5.4 5.4ZM19.8 4.2c-.3 3.1-2 5-5.4 5.4.4-3.4 2.3-5.1 5.4-5.4ZM4.2 19.8c.3-3.1 2-5 5.4-5.4-.4 3.4-2.3 5.1-5.4 5.4Z"/>',
    "arrow": '<path d="M2 11.2h14.2c-1.6-1.5-2.4-3.4-2.4-5.6 2.8 2.2 5.6 4.3 8.2 6.4-2.6 2.1-5.4 4.2-8.2 6.4 0-2.2.8-4.1 2.4-5.6H2Z"/><path d="M3 8.2c2.3.3 3.7 1.4 4.3 3-2.2.2-3.7-.8-4.3-3ZM3 15.8c.6-2.2 2.1-3.2 4.3-3-.6 1.6-2 2.7-4.3 3Z"/>'
  };

  function ornament(name) {
    var body = ORNAMENTS[name];
    if (!body) return "";
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

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
    (root || document).querySelectorAll("[data-ornament]").forEach(function (el) {
      if (!el.firstElementChild) el.innerHTML = ornament(el.getAttribute("data-ornament"));
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

  window.BrandUI = { icon: icon, ornament: ornament, ornamentNames: Object.keys(ORNAMENTS), hydrateIcons: hydrateIcons, brandById: brandById };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
