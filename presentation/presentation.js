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
      a.textContent = b.name;
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
    ["align", "image", "accent"].forEach(function (k) {
      var attr = k === "align" ? "data-logo-align" : "data-variant-" + k;
      if (v[k]) landing.setAttribute(attr, v[k] === true ? "" : v[k]);
      else landing.removeAttribute(attr);
    });
    var word = landing.querySelector(".logo-hero__word");
    var name = BrandUI.brandById(landing.id).name;
    if (word) {
      if (v.split) word.innerHTML = name.slice(0, v.split) + '<span class="logo-hero__b">' + name.slice(v.split) + "</span>";
      else word.textContent = name;
    }
    var hero = landing.querySelector("[data-logo-hero]");
    if (hero) hero.setAttribute("data-tone", landing.getAttribute("data-v-tone"));
    if (save) { try { window.localStorage.setItem("variant-" + landing.id, String(n)); } catch (e) { /* storage unavailable */ } }
    if (landing === current) renderSwitch(landing);
    if (save) { playLogo(landing); flashSwitch(); window.dispatchEvent(new Event("scroll")); }
  }

  function renderSwitch(landing) {
    var list = landing ? (window.VARIANTS || {})[landing.id] : null;
    if (!list || list.length < 2) { switchEl.hidden = true; return; }
    switchEl.hidden = false;
    var dots = switchEl.querySelector(".variant-switch__dots");
    var current = Number(landing.getAttribute("data-variant")) || 1;
    dots.innerHTML = "";
    list.forEach(function (v, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Variant " + (i + 1) + ": " + v.name);
      b.setAttribute("aria-pressed", String(i + 1 === current));
      b.addEventListener("click", function () { applyVariant(landing, i + 1, true); });
      dots.appendChild(b);
    });
    switchEl.querySelector(".variant-switch__name").textContent = current + " · " + list[current - 1].name;
    var grad = landing.getAttribute("data-gradient");
    switchEl.querySelectorAll("[data-gradient]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-gradient") === grad));
    });
  }

  // ---------- background gradient: data-gradient on the landing ----------
  var GRADIENTS = ["streaks", "halo", "horizon", "flat"];

  function applyGradient(landing, name, save) {
    landing.setAttribute("data-gradient", name);
    if (save) { try { window.localStorage.setItem("gradient-" + landing.id, name); } catch (e) { /* storage unavailable */ } }
    if (landing === current) renderSwitch(landing);
  }

  function initVariants() {
    switchEl.querySelectorAll("[data-gradient]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (current && current !== intro) { applyGradient(current, b.getAttribute("data-gradient"), true); flashSwitch(); }
      });
    });
    landings.forEach(function (landing) {
      if (!(window.VARIANTS || {})[landing.id]) return;
      var saved = null;
      try { saved = Number(window.localStorage.getItem("variant-" + landing.id)); } catch (e) { /* storage unavailable */ }
      var count = window.VARIANTS[landing.id].length;
      applyVariant(landing, saved >= 1 && saved <= count ? saved : 1, false);
      var grad = null;
      try { grad = window.localStorage.getItem("gradient-" + landing.id); } catch (e) { /* storage unavailable */ }
      applyGradient(landing, GRADIENTS.indexOf(grad) >= 0 ? grad : GRADIENTS[0], false);
    });
  }

  // ---------- init ----------
  function init() {
    buildMenu();
    initVariants();
    BrandUI.hydrateIcons();
    window.addEventListener("hashchange", route);
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
