/*
  One link for everything: it opens straight on the first of five
  landings behind one fixed menu.
  - No hash (or an unknown one) opens the first landing. #verdo opens a landing.
  - Each landing is one logo screen. A nearly invisible switcher (bottom left)
    picks its Figma style variant and its background gradient.
  - The menu is built from brand/brands.js.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var landings = Array.prototype.slice.call(document.querySelectorAll(".landing"));
  var menu = document.getElementById("topnav-list");
  var fsBtn = document.getElementById("fullscreen");
  var current = null;

  // ---------- built from the brand registry ----------
  function buildMenu() {
    BRANDS.forEach(function (b) {
      var a = document.createElement("a");
      a.className = "topnav__link";
      a.href = "#" + b.id;
      a.setAttribute("data-brand", b.id);
      a.textContent = b.menu || b.name;
      var li = document.createElement("li");
      li.appendChild(a);
      menu.appendChild(li);
    });
    // The last page: every variant in one grid
    var li = document.createElement("li");
    li.innerHTML = '<a class="topnav__link" href="#overview">All</a>';
    menu.appendChild(li);
  }

  // On narrow screens the menu scrolls: mark which edge hides more items, CSS fades it
  function fadeMenu() {
    var max = menu.scrollWidth - menu.clientWidth;
    var more = [];
    if (menu.scrollLeft > 1) more.push("start");
    if (menu.scrollLeft < max - 1) more.push("end");
    menu.setAttribute("data-more", more.join(" "));
  }

  // ---------- arrows at the screen edges: previous / next slide of the deck ----------
  var arrows = document.querySelector(".page-arrows");

  function renderArrows() {
    if (!deck.slides.length) { arrows.hidden = true; return; }
    arrows.hidden = false;
    [["prev", -1], ["next", 1]].forEach(function (d) {
      var to = deck.slides[deck.index + d[1]];
      var a = arrows.querySelector(".page-arrow--" + d[0]);
      a.hidden = !to;   // the deck stops at its first and last slide
      if (!to) return;
      a.href = "#" + to.id;
      a.setAttribute("aria-label", (d[1] < 0 ? "Previous slide: " : "Next slide: ") + slideName(to));
    });
  }

  function slideName(slide) {
    var title = slide.querySelector(".slide__head h2");
    return title ? title.textContent : slide.id;
  }

  // ---------- routing ----------
  function show(hash) {
    var target = hash ? document.getElementById(hash) : null;
    var landing = target ? target.closest(".landing") : null;
    if (!landing) { landing = target = landings[0]; }

    if (landing !== current) {
      landings.forEach(function (l) { l.hidden = l !== landing; });
      current = landing;
      root.setAttribute("data-brand", landing.getAttribute("data-brand"));
      document.querySelectorAll(".topnav__link").forEach(function (a) {
        if (a.getAttribute("href") === "#" + landing.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      var active = menu.querySelector('[aria-current="page"]');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
      document.title = landing.id === "overview" ? "All variants · " + BrandUI.brandById("vitreeone").name : BrandUI.brandById(landing.id).name;
      // A landing with slides is a click-through deck: one slide per screen
      deck.slides = Array.prototype.slice.call(landing.querySelectorAll(".slide"));
      deck.index = -1;
      root.classList.toggle("has-deck", deck.slides.length > 0);
      tintChrome(landing);
      syncPageColour();
      centreCurrent();
      playLogo(landing);
    }

    if (deck.slides.length) goTo(Math.max(0, deck.slides.indexOf(target)));
    else {
      renderArrows();
      if (target !== landing) target.scrollIntoView({ block: "start" });
      else window.scrollTo(0, 0);
    }
  }

  function route() { show(decodeURIComponent(location.hash.slice(1))); }

  // The page behind the landing (overscroll on iPad, a window being resized) takes
  // the landing's own colour, so the default paper never shows around it
  function syncPageColour() {
    var colour = current ? getComputedStyle(current).backgroundColor : "";
    var none = !colour || colour === "transparent" || colour === "rgba(0, 0, 0, 0)";
    root.style.backgroundColor = none ? "" : colour;
    document.body.style.backgroundColor = none ? "" : colour;
  }

  // ---------- deck: slides shown one at a time, like a presentation ----------
  var deck = { slides: [], index: -1 };

  function initSlides() {
    // Swatches show the token's colour, its RGB and hex (tokens.css stays the only
    // source), and take light text on dark colours
    document.querySelectorAll("[data-swatch]").forEach(function (el) {
      var token = el.getAttribute("data-swatch");
      var hex = toHex(getComputedStyle(root).getPropertyValue(token).trim());
      el.style.setProperty("--sw", "var(" + token + ")");
      el.setAttribute("data-on", luminance(hex) < 0.18 ? "dark" : "light");
      var hexOut = el.querySelector("[data-hex]");
      if (hexOut) hexOut.textContent = hex;
      var rgbOut = el.querySelector("[data-rgb]");
      if (rgbOut) rgbOut.textContent = [1, 3, 5].map(function (i) { return parseInt(hex.substr(i, 2), 16); }).join("/");
    });
    // Each colour pair states its contrast, measured from the page itself
    document.querySelectorAll("[data-contrast]").forEach(function (el) {
      var ground = luminance(toHex(getComputedStyle(el).backgroundColor));
      var figure = luminance(toHex(getComputedStyle(el.firstElementChild).backgroundColor));
      var ratio = (Math.max(ground, figure) + 0.05) / (Math.min(ground, figure) + 0.05);
      var grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large text" : "Below AA";
      var out = el.parentNode.querySelector("[data-ratio]");
      if (out) out.textContent = grade + " · " + ratio.toFixed(1) + ":1";
    });
    // Each slide numbers itself: 01 / 11
    landings.forEach(function (landing) {
      var slides = landing.querySelectorAll(".slide");
      var pad = function (n) { return (n < 10 ? "0" : "") + n; };
      Array.prototype.forEach.call(slides, function (slide, i) {
        var count = slide.querySelector("[data-count]");
        if (count) count.textContent = pad(i + 1) + " / " + pad(slides.length);
        slide.setAttribute("aria-hidden", "true");
        slide.inert = true;
      });
    });
    root.classList.add("reveal-ready");
  }

  // Show slide i of the open deck (it stops at the ends). The hash follows without re-routing.
  function goTo(i) {
    var slides = deck.slides;
    if (!slides.length) return;
    i = Math.max(0, Math.min(slides.length - 1, i));
    var from = slides[deck.index] || slides[i];
    deck.index = i;
    slides.forEach(function (slide, k) {
      var on = k === i;
      slide.classList.toggle("is-current", on);
      slide.setAttribute("aria-hidden", String(!on));
      slide.inert = !on;
      if (!on) slide.classList.remove("is-in");
    });
    // Parts rise in again on every visit
    void slides[i].offsetWidth;
    slides[i].classList.add("is-in");
    if (location.hash !== "#" + slides[i].id) history.replaceState(null, "", "#" + slides[i].id);
    blendSky(from, slides[i], i / Math.max(1, slides.length - 1));
    renderArrows();
    window.dispatchEvent(new Event("scroll"));   // the menu re-reads the tone under it
  }

  function step(dir) { if (deck.slides.length) goTo(deck.index + dir); }

  // The sky behind the slides blends from the scene of the last slide to the new one
  // (--mix 0 → 100%) while its lights travel with the deck's progress (--p)
  var SKY_PARTS = ["base", "glow", "glow-2"];
  var skyTween = null;
  function blendSky(fromSlide, toSlide, progress) {
    var sky = current && current.querySelector(".slide-sky");
    if (!sky) return;
    var prefix = sky.getAttribute("data-scene-prefix");
    SKY_PARTS.forEach(function (part) {
      sky.style.setProperty("--from-" + part, "var(" + prefix + fromSlide.getAttribute("data-scene") + "-" + part + ")");
      sky.style.setProperty("--to-" + part, "var(" + prefix + toSlide.getAttribute("data-scene") + "-" + part + ")");
    });
    var startP = parseFloat(sky.style.getPropertyValue("--p")) || 0;
    var duration = parseFloat(getComputedStyle(root).getPropertyValue("--duration-reveal")) || 0;
    if (skyTween) cancelAnimationFrame(skyTween);
    var set = function (k) {
      sky.style.setProperty("--mix", (k * 100).toFixed(1) + "%");
      sky.style.setProperty("--p", (startP + (progress - startP) * k).toFixed(3));
    };
    if (fromSlide === toSlide || duration < 20 || document.hidden) { set(1); return; }
    var start = null;
    var frame = function (now) {
      if (start === null) start = now;
      var k = Math.min(1, (now - start) / duration);
      set(1 - Math.pow(1 - k, 3));   // ease out
      if (k < 1) skyTween = requestAnimationFrame(frame);
    };
    skyTween = requestAnimationFrame(frame);
  }

  // ---------- full screen (hidden where unsupported or already an installed app) ----------
  var requestFs = root.requestFullscreen || root.webkitRequestFullscreen;
  var exitFs = document.exitFullscreen || document.webkitExitFullscreen;
  var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone;

  function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

  function toggleFullscreen() {
    try {
      var r = isFullscreen() ? exitFs.call(document) : requestFs.call(root);
      if (r && r.catch) r.catch(function () {});
    } catch (e) { /* unsupported */ }
  }

  function syncFullscreen() {
    var on = isFullscreen();
    fsBtn.setAttribute("aria-pressed", String(on));
    fsBtn.setAttribute("aria-label", on ? "Exit full screen" : "Full screen");
    fsBtn.innerHTML = BrandUI.icon(on ? "collapse" : "expand");
  }

  if (requestFs && !standalone) {
    fsBtn.hidden = false;
    fsBtn.addEventListener("click", toggleFullscreen);
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
  }

  // ---------- logo hero: replay the entrance (CSS) when the landing opens ----------
  function playLogo(scope) {
    (scope || document).querySelectorAll("[data-logo-hero]").forEach(function (hero) {
      hero.classList.remove("is-playing");
      void hero.offsetWidth; // restart the CSS animations
      hero.classList.add("is-playing");
    });
  }

  // ---------- colour helpers: resolve a colour token and tell light from dark ----------
  var probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  function toHex(color) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    var d = probe.getImageData(0, 0, 1, 1).data;
    return "#" + [d[0], d[1], d[2]].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("").toUpperCase();
  }

  // The word as it is drawn (text-transform applied), for canvas measuring
  function drawnText(word, cs) {
    // Size and vertical centre are measured on the brand name, so typing never changes them
    var text = word.getAttribute("data-ref") || word.textContent;
    if (cs.textTransform === "uppercase") return text.toUpperCase();
    if (cs.textTransform === "lowercase") return text.toLowerCase();
    return text;
  }

  // Every wordmark gets the same letter height (--logo-ink-height), whatever its
  // font: measure how tall the letters stand above the baseline and scale the size.
  var lengthProbes = {};
  function tokenLength(token) {
    var el = lengthProbes[token];
    if (!el) {
      el = lengthProbes[token] = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:var(" + token + ")";
      document.body.appendChild(el);
    }
    return el.getBoundingClientRect().height;
  }

  function sizeInk(word, target) {
    if (!word || !probe.measureText) return;
    var cs = getComputedStyle(word);
    probe.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    var ascent = probe.measureText(drawnText(word, cs)).actualBoundingBoxAscent;
    if (!ascent) return;
    word.style.fontSize = (parseFloat(cs.fontSize) * target / ascent).toFixed(2) + "px";
  }

  // A long word on a narrow screen scales down to fit between the margins of its box
  function fitWidth(word, box) {
    if (!word || !box) return false;
    var hs = getComputedStyle(box);
    var room = box.clientWidth - parseFloat(hs.paddingLeft) - parseFloat(hs.paddingRight);
    var width = word.getBoundingClientRect().width;
    if (!width || width <= room) return false;
    word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * room / width).toFixed(2) + "px";
    return true;
  }

  // Vertical offset that puts the centre of the letters' ink (not the line box)
  // on the centre of the box. Fonts place glyphs differently inside the line.
  function centreInk(word) {
    if (!word || !probe.measureText) return;
    var cs = getComputedStyle(word);
    probe.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    var m = probe.measureText(drawnText(word, cs));
    if (!m.fontBoundingBoxAscent) return;
    var line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize);
    var baseline = (line - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
    var inkMid = baseline + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
    word.style.setProperty("--ink-shift", (line / 2 - inkMid).toFixed(2) + "px");
  }

  // Faces with monospaced Latin (Kosugi Maru) leave holes around narrow letters.
  // Space each letter by its ink instead: the same side bearing on every glyph,
  // the way a wordmark is kerned by hand. Tracking is added on top in CSS.
  var KERN_BEARING = 0.045; // em, each side of every letter

  function kernInk(word) {
    var glyphs = word ? word.querySelectorAll(".logo-hero__g") : [];
    if (!glyphs.length || !probe.measureText) return;
    var cs = getComputedStyle(word);
    var size = parseFloat(cs.fontSize);
    probe.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    glyphs.forEach(function (g) {
      var c = g.textContent;
      if (cs.textTransform === "uppercase") c = c.toUpperCase();
      else if (cs.textTransform === "lowercase") c = c.toLowerCase();
      var m = probe.measureText(c);
      var left = -m.actualBoundingBoxLeft;
      var right = m.width - m.actualBoundingBoxRight;
      g.style.marginLeft = (KERN_BEARING * size - left).toFixed(2) + "px";
      g.style.marginRight = (KERN_BEARING * size - right).toFixed(2) + "px";
    });
  }

  function fitWord(word, box, token) {
    sizeInk(word, tokenLength(token));
    kernInk(word);
    if (fitWidth(word, box)) kernInk(word);
  }

  function centreCurrent() {
    if (!current) return;
    if (current.id === "overview") {
      current.querySelectorAll(".overview__tile").forEach(function (tile) {
        fitWord(tile.querySelector(".overview__word"), tile, "--logo-tile-ink-height");
      });
      return;
    }
    var word = current.querySelector(".logo-hero__word");
    fitWord(word, word && word.closest(".logo-hero"), "--logo-ink-height");
    centreInk(word);
  }

  // Relative luminance of a #RRGGBB colour (WCAG)
  function luminance(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function isDark(token) {
    return luminance(toHex(getComputedStyle(root).getPropertyValue(token).trim())) < 0.18;
  }

  // ---------- Figma style variants (presentation/variants.js + --fig-* tokens) ----------
  // Colours (bg, page, ink, ink2) are set by applyColours: they depend on invert and the logo colour
  var PROPS = ["font", "size", "tracking", "weight", "case"];
  // The look of each landing (the user's picks): gradient, background colour (tokens
  // --bgpick-<landing>-<id>) and logo colour (auto, light, dark, pick-1 to pick-5).
  // Fixed: there are no controls any more, so choices saved on a device are not read.
  var DEFAULTS = {
    vitreeone: { gradient: "mist" },
    veriterra: { gradient: "mist", bgpick: "aubergine", ink: "pick-5" },
    verdo: { gradient: "flat", ink: "pick-1" },
    vaya: { gradient: "flat", ink: "pick-1" },
    vita: { gradient: "flat" }
  };

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  function stored(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  // The wordmark's markup for a variant: plain, two-tone (split) or letter by letter (kern)
  function setWord(word, name, v, ref) {
    if (!word) return;
    word.setAttribute("data-ref", ref);
    if (v.split) word.innerHTML = name.slice(0, v.split) + '<span class="logo-hero__b">' + name.slice(v.split) + "</span>";
    else if (v.kern) word.innerHTML = name.split("").map(function (c) { return '<span class="logo-hero__g">' + c + "</span>"; }).join("");
    else word.textContent = name;
    word.setAttribute("aria-label", name);
  }

  function applyVariant(landing, n, save) {
    var list = (window.VARIANTS || {})[landing.id];
    if (!list || !list[n - 1]) return;
    var v = list[n - 1];
    var pre = "--fig-" + landing.id + "-" + n + "-";
    PROPS.forEach(function (prop) {
      var has = getComputedStyle(root).getPropertyValue(pre + prop).trim() !== "";
      if (has) landing.style.setProperty("--v-" + prop, "var(" + pre + prop + ")");
      else landing.style.removeProperty("--v-" + prop);
    });
    landing.setAttribute("data-variant", String(n));
    if (v.mesh) landing.setAttribute("data-variant-mesh", "");
    else landing.removeAttribute("data-variant-mesh");
    applyColours(landing);
    setWord(landing.querySelector(".logo-hero__word"), BrandUI.brandById(landing.id).name, v, BrandUI.brandById(landing.id).name);
    // "variant2-": the variants were reordered, so numbers saved before are dropped
    if (save) store("variant2-" + landing.id, String(n));
    if (landing === current) centreCurrent();
    if (save) { playLogo(landing); window.dispatchEvent(new Event("scroll")); }
  }

  // Page, background and logo colours of the open variant, after two choices:
  // data-invert swaps page and ink; data-ink replaces the logo colour with
  // light, dark or one of the suggestions derived from the page (tokens.css).
  function applyColours(landing) {
    var n = Number(landing.getAttribute("data-variant")) || 1;
    var pre = "--fig-" + landing.id + "-" + n + "-";
    var has = function (prop) { return getComputedStyle(root).getPropertyValue(pre + prop).trim() !== ""; };
    var inverted = landing.hasAttribute("data-invert");
    var page = pre + (inverted ? "ink" : "page");
    var ink = pre + (inverted ? "page" : "ink");
    var bg = !inverted && has("bg") ? pre + "bg" : page;
    // A chosen background replaces the variant's own (not while inverted)
    var picked = landing.getAttribute("data-bgpick");
    if (picked && !inverted) page = bg = "--bgpick-" + landing.id + "-" + picked;
    landing.style.setProperty("--v-page", "var(" + page + ")");
    landing.style.setProperty("--v-bg", "var(" + bg + ")");
    var tone = isDark(page) ? "dark" : "light";
    landing.setAttribute("data-v-tone", tone);
    var hero = landing.querySelector("[data-logo-hero]");
    if (hero) hero.setAttribute("data-tone", tone);
    var choice = landing.getAttribute("data-ink") || "auto";
    // On a chosen background the automatic logo colour is light or dark, by contrast
    var auto = picked && !inverted ? "var(--logo-" + (tone === "dark" ? "light" : "dark") + ")" : "var(" + ink + ")";
    landing.style.setProperty("--v-ink", choice === "auto" ? auto : "var(--logo-" + choice + ")");
    if (choice === "auto" && !(picked && !inverted) && has("ink2")) landing.style.setProperty("--v-ink2", "var(" + pre + "ink2)");
    else landing.style.removeProperty("--v-ink2");
    if (landing === current) syncPageColour();
  }

  function setInvert(landing, on, save) {
    if (on) landing.setAttribute("data-invert", "");
    else landing.removeAttribute("data-invert");
    if (save) store("invert-" + landing.id, on ? "1" : "");
    applyColours(landing);
    if (landing === current) { tintChrome(landing); window.dispatchEvent(new Event("scroll")); }
    syncOverview();
  }

  // All variants: each tile shows its landing inverted or not; the header
  // button inverts (or restores) every landing at once
  function syncOverview() {
    var all = true;
    document.querySelectorAll(".overview__tile").forEach(function (tile) {
      var on = document.getElementById(tile.getAttribute("data-landing")).hasAttribute("data-invert");
      if (on) tile.setAttribute("data-invert", "");
      else { tile.removeAttribute("data-invert"); all = false; }
    });
    var btn = document.querySelector("[data-invert-all]");
    if (btn) btn.setAttribute("aria-pressed", String(all));
  }

  // The page arrows sit outside the landings, so they take the open landing's colours
  function tintChrome(landing) {
    var body = document.body.style;
    if (!landing || !landing.hasAttribute("data-variant")) {
      body.removeProperty("--sw-page");
      body.removeProperty("--sw-ink");
      return;
    }
    body.setProperty("--sw-page", landing.style.getPropertyValue("--v-page"));
    body.setProperty("--sw-ink", landing.getAttribute("data-v-tone") === "dark" ? "var(--color-paper-0)" : "var(--color-ink-900)");
  }

  // Every wordmark font is preloaded in index.html; this also gets them decoded,
  // so a variant shows its typeface at once
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return;
    var style = getComputedStyle(root);
    var loads = [];
    Object.keys(window.VARIANTS || {}).forEach(function (id) {
      window.VARIANTS[id].forEach(function (v, i) {
        var pre = "--fig-" + id + "-" + (i + 1) + "-";
        var family = style.getPropertyValue(pre + "font").trim();
        if (family) loads.push(document.fonts.load(style.getPropertyValue(pre + "weight").trim() + " 1em " + family).catch(function () {}));
      });
    });
    // Measurements need the real fonts
    Promise.all(loads).then(centreCurrent);
  }

  function initVariants() {
    loadFonts();
    landings.forEach(function (landing) {
      var list = (window.VARIANTS || {})[landing.id];
      if (!list) return;
      var def = DEFAULTS[landing.id] || {};
      // Invert (the All variants page) and the variant (its tiles) are still chosen and saved
      if (stored("invert-" + landing.id)) landing.setAttribute("data-invert", "");
      landing.setAttribute("data-ink", def.ink || "auto");
      if (def.bgpick) landing.setAttribute("data-bgpick", def.bgpick);
      var saved = Number(stored("variant2-" + landing.id));
      applyVariant(landing, saved >= 1 && saved <= list.length ? saved : 1, false);
      landing.setAttribute("data-gradient", def.gradient || "dawn");
    });
  }

  // ---------- All variants: one tile per Figma variant, grouped by landing ----------
  function buildOverview() {
    var box = document.querySelector("[data-overview]");
    if (!box) return;
    Object.keys(window.VARIANTS || {}).forEach(function (id) {
      var brand = BrandUI.brandById(id);
      var group = document.createElement("section");
      group.className = "overview__group";
      group.setAttribute("aria-label", brand.name);
      group.innerHTML = '<h2 class="overview__label">' + (brand.menu || brand.name) + "</h2>";
      var grid = document.createElement("div");
      grid.className = "overview__grid";
      window.VARIANTS[id].forEach(function (v, i) {
        var n = i + 1;
        var pre = "--fig-" + id + "-" + n + "-";
        var tile = document.createElement("a");
        tile.className = "overview__tile";
        tile.href = "#" + id;
        tile.setAttribute("data-landing", id);
        tile.setAttribute("aria-label", brand.name + ", variant " + n + ": " + v.name);
        ["bg", "page", "ink", "ink2", "font", "tracking", "weight", "case"].forEach(function (prop) {
          if (getComputedStyle(root).getPropertyValue(pre + prop).trim() !== "") tile.style.setProperty("--t-" + prop, "var(" + pre + prop + ")");
        });
        tile.innerHTML = '<span class="overview__word" aria-hidden="true"></span><span class="overview__name">' + n + " · " + v.name + "</span>";
        setWord(tile.querySelector(".overview__word"), brand.name, v, brand.name);
        tile.querySelector(".overview__word").removeAttribute("aria-label");
        tile.addEventListener("click", function () {
          var landing = document.getElementById(id);
          applyVariant(landing, n, true);
        });
        grid.appendChild(tile);
      });
      group.appendChild(grid);
      box.appendChild(group);
    });
    var btn = document.querySelector("[data-invert-all]");
    if (btn) btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      landings.forEach(function (l) { if ((window.VARIANTS || {})[l.id]) setInvert(l, on, true); });
    });
  }

  // ---------- init ----------
  function init() {
    buildMenu();
    buildOverview();
    initVariants();
    syncOverview();
    BrandUI.hydrateIcons();
    window.addEventListener("hashchange", route);
    window.addEventListener("resize", centreCurrent);
    menu.addEventListener("scroll", fadeMenu, { passive: true });
    window.addEventListener("resize", fadeMenu);
    // Scrolled state + the tone of whatever sits under the menu (light or dark slide)
    var nav = document.querySelector(".topnav");
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        document.body.classList.toggle("is-scrolled", window.scrollY > 8);
        var y = nav.getBoundingClientRect().bottom - 2;
        var stack = document.elementsFromPoint ? document.elementsFromPoint(window.innerWidth * 0.25, y) : [];
        var toned = stack.filter(function (el) { return !nav.contains(el) && el.closest("[data-tone]"); })[0];
        var tone = toned ? toned.closest("[data-tone]").getAttribute("data-tone") : "light";
        document.body.classList.toggle("nav-on-dark", tone === "dark");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    onScroll();
    // Tapping the menu item of the landing already open scrolls back to its top.
    document.querySelector(".topnav").addEventListener("click", function (e) {
      var a = e.target.closest(".topnav__link");
      if (a && a.getAttribute("href") === location.hash) { e.preventDefault(); window.scrollTo(0, 0); }
    });
    // Keyboard: the deck owns the arrows, space, page up / down, home and end
    document.addEventListener("keydown", function (e) {
      if (!deck.slides.length || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
      var keys = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 };
      if (e.key === " ") keys[" "] = e.shiftKey ? -1 : 1;
      if (e.key === "Home") { e.preventDefault(); goTo(0); return; }
      if (e.key === "End") { e.preventDefault(); goTo(deck.slides.length - 1); return; }
      if (!keys[e.key]) return;
      e.preventDefault();
      step(keys[e.key]);
    });
    initSlides();
    route();
    fadeMenu();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
