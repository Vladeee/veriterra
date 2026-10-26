/*
  One link for everything: an intro screen with a Welcome button, then five
  landings behind one fixed menu.
  - No hash (or #intro) shows the intro. #verdo opens a landing.
  - Each landing is one logo screen. A nearly invisible switcher (bottom left)
    picks its Figma style variant and its background gradient.
  - The menu is built from brand/brands.js.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var intro = document.getElementById("intro");
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

  // ---------- previous / next page: arrows at the screen edges ----------
  var arrows = document.querySelector(".page-arrows");

  function pageName(landing) {
    var b = BrandUI.brandById(landing.id);
    return b ? (b.menu || b.name) : "All variants";
  }

  function renderArrows(landing) {
    if (!landing || landing === intro) { arrows.hidden = true; return; }
    arrows.hidden = false;
    var i = landings.indexOf(landing);
    [["prev", -1], ["next", 1]].forEach(function (d) {
      var to = landings[(i + d[1] + landings.length) % landings.length];
      var a = arrows.querySelector(".page-arrow--" + d[0]);
      a.href = "#" + to.id;
      a.setAttribute("aria-label", (d[1] < 0 ? "Previous page: " : "Next page: ") + pageName(to));
    });
  }

  // ---------- routing ----------
  function showIntro() {
    current = intro;
    intro.hidden = false;
    landings.forEach(function (l) { l.hidden = true; });
    document.body.classList.add("is-intro");
    if (switchEl) switchEl.hidden = true;
    renderArrows(null);
    root.setAttribute("data-brand", "vitreeone");
    document.title = BrandUI.brandById("vitreeone").name;
    window.scrollTo(0, 0);
  }

  function show(hash) {
    if (!hash || hash === "intro") { showIntro(); return; }
    var target = document.getElementById(hash);
    var landing = target ? target.closest(".landing") : null;
    if (!landing) { showIntro(); return; }

    if (landing !== current) {
      intro.hidden = true;
      document.body.classList.remove("is-intro");
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
      renderSwitch(landing);
      renderArrows(landing);
      centreCurrent();
      playLogo(landing);
    }

    if (target !== landing) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }

  function route() { show(decodeURIComponent(location.hash.slice(1))); }

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
  var probe = document.createElement("canvas").getContext("2d");
  function toHex(color) {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = color;
    probe.fillRect(0, 0, 1, 1);
    var d = probe.getImageData(0, 0, 1, 1).data;
    return "#" + [d[0], d[1], d[2]].map(function (v) { return v.toString(16).padStart(2, "0"); }).join("").toUpperCase();
  }

  // The word as it is drawn (text-transform applied), for canvas measuring
  function drawnText(word, cs) {
    var text = word.textContent;
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
    if (!current || current === intro) return;
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

  function isDark(token) {
    var hex = toHex(getComputedStyle(root).getPropertyValue(token).trim());
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 0.18;
  }

  // ---------- Figma style variants (presentation/variants.js + --fig-* tokens) ----------
  var switchEl = document.getElementById("variant-switch");
  var switchTimer = null;
  // Colours (bg, page, ink, ink2) are set by applyColours: they depend on invert and the logo colour
  var PROPS = ["accent", "font", "size", "tracking", "weight", "case"];
  var INKS = [
    { id: "auto", name: "Figma colour" },
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "pick-1", name: "Same hue" },
    { id: "pick-2", name: "Complement" },
    { id: "pick-3", name: "Split complement" },
    { id: "pick-4", name: "Split complement" },
    { id: "pick-5", name: "Brand tint" }
  ];
  var GRADIENTS = [
    { id: "dawn", name: "Dawn" },
    { id: "dusk", name: "Dusk" },
    { id: "horizon", name: "Horizon" },
    { id: "mist", name: "Mist" },
    { id: "aurora", name: "Aurora" },
    { id: "silk", name: "Silk" },
    { id: "flat", name: "Flat" }
  ];

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  function stored(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function flashSwitch(text) {
    if (text) switchEl.querySelector(".variant-switch__name").textContent = text;
    switchEl.classList.add("is-active");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(function () { switchEl.classList.remove("is-active"); }, 1800);
  }

  // The wordmark's markup for a variant: plain, two-tone (split) or letter by letter (kern)
  function setWord(word, name, v) {
    if (!word) return;
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
    if (v.accent) landing.setAttribute("data-variant-accent", "");
    else landing.removeAttribute("data-variant-accent");
    applyColours(landing);
    setWord(landing.querySelector(".logo-hero__word"), BrandUI.brandById(landing.id).name, v);
    if (save) store("variant-" + landing.id, String(n));
    if (landing === current) { renderSwitch(landing); centreCurrent(); }
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
    landing.style.setProperty("--v-page", "var(" + page + ")");
    landing.style.setProperty("--v-bg", "var(" + bg + ")");
    var tone = isDark(page) ? "dark" : "light";
    landing.setAttribute("data-v-tone", tone);
    var hero = landing.querySelector("[data-logo-hero]");
    if (hero) hero.setAttribute("data-tone", tone);
    var choice = landing.getAttribute("data-ink") || "auto";
    landing.style.setProperty("--v-ink", choice === "auto" ? "var(" + ink + ")" : "var(--logo-" + choice + ")");
    if (choice === "auto" && has("ink2")) landing.style.setProperty("--v-ink2", "var(" + pre + "ink2)");
    else landing.style.removeProperty("--v-ink2");
  }

  function setInvert(landing, on, save) {
    if (on) landing.setAttribute("data-invert", "");
    else landing.removeAttribute("data-invert");
    if (save) store("invert-" + landing.id, on ? "1" : "");
    applyColours(landing);
    if (landing === current) { renderSwitch(landing); window.dispatchEvent(new Event("scroll")); }
  }

  function setInk(landing, id, save) {
    landing.setAttribute("data-ink", id);
    if (save) store("ink-" + landing.id, id);
    applyColours(landing);
    if (landing === current) renderSwitch(landing);
  }

  function applyGradient(landing, id, save) {
    landing.setAttribute("data-gradient", id);
    if (save) store("gradient-" + landing.id, id);
    if (landing === current) renderSwitch(landing);
  }

  // The switcher lives outside the landings, so it takes the open variant's colours
  function renderSwitch(landing) {
    var list = landing ? (window.VARIANTS || {})[landing.id] : null;
    var body = document.body.style;
    if (!list) {
      switchEl.hidden = true;
      ["--sw-page", "--sw-ink", "--sw-logo"].forEach(function (p) { body.removeProperty(p); });
      return;
    }
    switchEl.hidden = false;
    var n = Number(landing.getAttribute("data-variant")) || 1;
    var dark = landing.getAttribute("data-v-tone") === "dark";
    body.setProperty("--sw-page", landing.style.getPropertyValue("--v-page"));
    body.setProperty("--sw-ink", dark ? "var(--color-paper-0)" : "var(--color-ink-900)");
    var ls = getComputedStyle(landing);
    var choice = landing.getAttribute("data-ink") || "auto";
    body.setProperty("--sw-logo", ls.getPropertyValue("--v-ink").trim());
    switchEl.querySelector('[data-action="invert"]').setAttribute("aria-pressed", String(landing.hasAttribute("data-invert")));
    switchEl.querySelector('[data-value="ink"]').textContent = choice === "light" ? "Light" : choice === "dark" ? "Dark" : choice === "auto" ? "Auto" : "Custom";
    renderPicker(landing);
    var grad = GRADIENTS.filter(function (g) { return g.id === landing.getAttribute("data-gradient"); })[0] || GRADIENTS[0];
    switchEl.querySelector('[data-value="variant"]').textContent = n + " / " + list.length;
    switchEl.querySelector('[data-value="gradient"]').textContent = grad.name;
    switchEl.querySelector(".variant-switch__name").textContent = list[n - 1].name;
  }

  // Logo colour swatches: the Figma colour, light, dark and five suggestions,
  // each resolved from the landing so it shows the colour it will give
  function renderPicker(landing) {
    var box = document.getElementById("logo-colours");
    if (box.hidden) return;
    var n = Number(landing.getAttribute("data-variant")) || 1;
    var auto = getComputedStyle(root).getPropertyValue("--fig-" + landing.id + "-" + n + "-" + (landing.hasAttribute("data-invert") ? "page" : "ink")).trim();
    var ls = getComputedStyle(landing);
    var choice = landing.getAttribute("data-ink") || "auto";
    box.innerHTML = "";
    INKS.forEach(function (ink) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-ink", ink.id);
      b.setAttribute("aria-label", ink.name);
      b.setAttribute("aria-pressed", String(ink.id === choice));
      b.style.setProperty("--sw", ink.id === "auto" ? auto : ls.getPropertyValue("--logo-" + ink.id).trim());
      box.appendChild(b);
    });
  }

  function togglePicker(open) {
    var box = document.getElementById("logo-colours");
    var btn = switchEl.querySelector('[data-action="picker"]');
    box.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    if (open && current && current !== intro) renderPicker(current);
  }

  function onSwitchAction(action, target) {
    if (!current || current === intro) return;
    if (action === "invert") {
      var on = !current.hasAttribute("data-invert");
      setInvert(current, on, true);
      flashSwitch(on ? "Inverted" : "Original colours");
    } else if (action === "ink") {
      var order = ["auto", "light", "dark"];
      var i = order.indexOf(current.getAttribute("data-ink") || "auto");
      var next = order[(i + 1) % order.length];
      setInk(current, next, true);
      flashSwitch("Logo · " + (next === "auto" ? "Figma colour" : next === "light" ? "Light" : "Dark"));
    } else if (action === "picker") {
      togglePicker(document.getElementById("logo-colours").hidden);
    } else if (action === "pick") {
      var id = target.getAttribute("data-ink");
      setInk(current, id, true);
      flashSwitch("Logo · " + INKS.filter(function (k) { return k.id === id; })[0].name);
    }
  }

  // Previous / next, wrapping around
  function step(kind, dir) {
    if (!current || current === intro) return;
    var list = (window.VARIANTS || {})[current.id];
    if (!list) return;
    if (kind === "variant") {
      var n = Number(current.getAttribute("data-variant")) || 1;
      applyVariant(current, (n - 1 + dir + list.length) % list.length + 1, true);
    } else {
      var ids = GRADIENTS.map(function (g) { return g.id; });
      var i = ids.indexOf(current.getAttribute("data-gradient"));
      applyGradient(current, ids[(i + dir + ids.length) % ids.length], true);
    }
    flashSwitch();
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
    switchEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (b) { step(b.getAttribute("data-step"), Number(b.getAttribute("data-dir"))); return; }
      var a = e.target.closest("[data-action]");
      if (a) { onSwitchAction(a.getAttribute("data-action"), a); return; }
      var pick = e.target.closest("#logo-colours [data-ink]");
      if (pick) onSwitchAction("pick", pick);
    });
    // The colour list closes on a tap elsewhere or Escape
    document.addEventListener("click", function (e) {
      if (!switchEl.contains(e.target)) togglePicker(false);
    });
    // Keyboard: left / right arrows change the variant, up / down the gradient
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { togglePicker(false); return; }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var map = { ArrowLeft: ["variant", -1], ArrowRight: ["variant", 1], ArrowUp: ["gradient", -1], ArrowDown: ["gradient", 1] };
      if (!map[e.key]) return;
      e.preventDefault();
      step(map[e.key][0], map[e.key][1]);
    });
    landings.forEach(function (landing) {
      var list = (window.VARIANTS || {})[landing.id];
      if (!list) return;
      if (stored("invert-" + landing.id)) landing.setAttribute("data-invert", "");
      var ink = stored("ink-" + landing.id);
      landing.setAttribute("data-ink", INKS.some(function (k) { return k.id === ink; }) ? ink : "auto");
      var saved = Number(stored("variant-" + landing.id));
      applyVariant(landing, saved >= 1 && saved <= list.length ? saved : 1, false);
      var grad = stored("gradient-" + landing.id);
      var known = GRADIENTS.some(function (g) { return g.id === grad; });
      applyGradient(landing, known ? grad : GRADIENTS[0].id, false);
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
        tile.setAttribute("aria-label", brand.name + ", variant " + n + ": " + v.name);
        ["bg", "page", "ink", "ink2", "accent", "font", "tracking", "weight", "case"].forEach(function (prop) {
          if (getComputedStyle(root).getPropertyValue(pre + prop).trim() !== "") tile.style.setProperty("--t-" + prop, "var(" + pre + prop + ")");
        });
        if (v.accent) tile.setAttribute("data-accent", "");
        tile.innerHTML = '<span class="overview__word" aria-hidden="true"></span><span class="overview__name">' + n + " · " + v.name + "</span>";
        setWord(tile.querySelector(".overview__word"), brand.name, v);
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
  }

  // ---------- init ----------
  function init() {
    buildMenu();
    buildOverview();
    initVariants();
    BrandUI.hydrateIcons();
    window.addEventListener("hashchange", route);
    window.addEventListener("resize", centreCurrent);
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
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
