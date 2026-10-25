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
  }

  // ---------- routing ----------
  function showIntro() {
    current = intro;
    intro.hidden = false;
    landings.forEach(function (l) { l.hidden = true; });
    document.body.classList.add("is-intro");
    if (switchEl) switchEl.hidden = true;
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
      root.setAttribute("data-brand", landing.id);
      document.querySelectorAll(".topnav__link").forEach(function (a) {
        if (a.getAttribute("href") === "#" + landing.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      var active = menu.querySelector('[aria-current="page"]');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
      document.title = BrandUI.brandById(landing.id).name;
      renderSwitch(landing);
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

  // Vertical offset that puts the centre of the letters' ink (not the line box)
  // on the centre of the box. Fonts place glyphs differently inside the line.
  function centreInk(word) {
    if (!word || !probe.measureText) return;
    var cs = getComputedStyle(word);
    var text = word.textContent;
    if (cs.textTransform === "uppercase") text = text.toUpperCase();
    else if (cs.textTransform === "lowercase") text = text.toLowerCase();
    probe.font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    var m = probe.measureText(text);
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

  function centreCurrent() {
    if (!current || current === intro) return;
    var word = current.querySelector(".logo-hero__word");
    kernInk(word);
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
  var PROPS = ["bg", "page", "ink", "ink2", "accent", "font", "size", "tracking", "weight", "case"];
  var GRADIENTS = [
    { id: "dawn", name: "Dawn" },
    { id: "dusk", name: "Dusk" },
    { id: "horizon", name: "Horizon" },
    { id: "mist", name: "Mist" },
    { id: "flat", name: "Flat" }
  ];

  function store(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
  }

  function stored(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }

  function flashSwitch() {
    switchEl.classList.add("is-active");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(function () { switchEl.classList.remove("is-active"); }, 1800);
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
    landing.setAttribute("data-v-tone", isDark(pre + "page") ? "dark" : "light");
    ["image", "accent"].forEach(function (k) {
      if (v[k]) landing.setAttribute("data-variant-" + k, v[k] === true ? "" : v[k]);
      else landing.removeAttribute("data-variant-" + k);
    });
    var word = landing.querySelector(".logo-hero__word");
    var name = BrandUI.brandById(landing.id).name;
    if (word) {
      if (v.split) word.innerHTML = name.slice(0, v.split) + '<span class="logo-hero__b">' + name.slice(v.split) + "</span>";
      else if (v.kern) word.innerHTML = name.split("").map(function (c) { return '<span class="logo-hero__g">' + c + "</span>"; }).join("");
      else word.textContent = name;
      word.setAttribute("aria-label", name);
    }
    var hero = landing.querySelector("[data-logo-hero]");
    if (hero) hero.setAttribute("data-tone", landing.getAttribute("data-v-tone"));
    if (save) store("variant-" + landing.id, String(n));
    if (landing === current) { renderSwitch(landing); centreCurrent(); }
    if (save) { playLogo(landing); window.dispatchEvent(new Event("scroll")); }
  }

  function applyGradient(landing, id, save) {
    landing.setAttribute("data-gradient", id);
    if (save) store("gradient-" + landing.id, id);
    if (landing === current) renderSwitch(landing);
  }

  // The switcher lives outside the landings, so it takes the open variant's colours
  function renderSwitch(landing) {
    var list = landing ? (window.VARIANTS || {})[landing.id] : null;
    if (!list) { switchEl.hidden = true; return; }
    switchEl.hidden = false;
    var n = Number(landing.getAttribute("data-variant")) || 1;
    var pre = "--fig-" + landing.id + "-" + n + "-";
    switchEl.style.setProperty("--sw-ink", "var(" + pre + "ink)");
    switchEl.style.setProperty("--sw-page", "var(" + pre + "page)");
    var grad = GRADIENTS.filter(function (g) { return g.id === landing.getAttribute("data-gradient"); })[0] || GRADIENTS[0];
    switchEl.querySelector('[data-value="variant"]').textContent = n + " / " + list.length;
    switchEl.querySelector('[data-value="gradient"]').textContent = grad.name;
    switchEl.querySelector(".variant-switch__name").textContent = list[n - 1].name;
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
      if (b) step(b.getAttribute("data-step"), Number(b.getAttribute("data-dir")));
    });
    // Keyboard: left / right arrows change the variant, up / down the gradient
    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var map = { ArrowLeft: ["variant", -1], ArrowRight: ["variant", 1], ArrowUp: ["gradient", -1], ArrowDown: ["gradient", 1] };
      if (!map[e.key]) return;
      e.preventDefault();
      step(map[e.key][0], map[e.key][1]);
    });
    landings.forEach(function (landing) {
      var list = (window.VARIANTS || {})[landing.id];
      if (!list) return;
      var saved = Number(stored("variant-" + landing.id));
      applyVariant(landing, saved >= 1 && saved <= list.length ? saved : 1, false);
      var grad = stored("gradient-" + landing.id);
      var known = GRADIENTS.some(function (g) { return g.id === grad; });
      applyGradient(landing, known ? grad : GRADIENTS[0].id, false);
    });
  }

  // ---------- init ----------
  function init() {
    buildMenu();
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
