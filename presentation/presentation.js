/*
  One link for everything: an intro screen with a Welcome button, then five
  landings behind one fixed menu.
  - No hash (or #intro) shows the intro. #verdo opens a landing. A hash inside
    a landing (#verdo-offer) opens that landing and scrolls to the block.
  - The menu and the "loop" strip are built from brand/brands.js.
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

  function buildLoops() {
    var companies = BRANDS.filter(function (b) { return !b.holding; });
    landings.forEach(function (landing) {
      var id = landing.id;
      var isHolding = BrandUI.brandById(id).holding;
      landing.querySelectorAll("[data-loop]").forEach(function (ol) {
        companies.forEach(function (b) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          a.className = "l-loop__step";
          a.href = "#" + b.id;
          a.setAttribute("data-brand", b.id);
          if (isHolding || b.id === id) a.setAttribute("aria-current", "true");
          a.innerHTML = '<span class="l-loop__word">' + b.loop + "</span><span class=\"caption\">" + b.name + "</span>";
          li.appendChild(a);
          ol.appendChild(li);
        });
      });
    });
  }

  // ---------- routing ----------
  function showIntro() {
    current = intro;
    root.classList.remove("has-slides");
    intro.hidden = false;
    landings.forEach(function (l) { l.hidden = true; });
    document.body.classList.add("is-intro");
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
      root.classList.toggle("has-slides", landing.hasAttribute("data-slides"));
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

  // ---------- placeholder actions (contact is not connected yet) ----------
  function initPlaceholders() {
    document.querySelectorAll("[data-placeholder-action]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        btn.textContent = "Not connected yet";
        btn.classList.add("is-done");
      });
    });
  }

  // ---------- logo hero: replay the entrance (CSS) when the landing opens ----------
  function playLogo(scope) {
    (scope || document).querySelectorAll("[data-logo-hero]").forEach(function (hero) {
      hero.classList.remove("is-playing");
      void hero.offsetWidth; // restart the CSS animations
      hero.classList.add("is-playing");
    });
  }

  // ---------- scroll reveal: [data-reveal] gets .is-in when it enters the screen ----------
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---------- typeface trial: [data-font-switch] sets data-font on its landing ----------
  function initFontSwitches() {
    document.querySelectorAll("[data-font-switch]").forEach(function (box) {
      var landing = box.closest(".landing");
      var key = "font-" + landing.id;
      var saved = null;
      try { saved = window.localStorage.getItem(key); } catch (e) { /* storage unavailable */ }
      function pick(font) {
        landing.setAttribute("data-font", font);
        box.querySelectorAll("[data-font]").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.getAttribute("data-font") === font));
        });
        try { window.localStorage.setItem(key, font); } catch (e) { /* storage unavailable */ }
      }
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-font]");
        if (b) { pick(b.getAttribute("data-font")); playLogo(landing); }
      });
      var fallback = box.getAttribute("data-default") || box.querySelector("[data-font]").getAttribute("data-font");
      pick(saved && box.querySelector('[data-font="' + saved + '"]') ? saved : fallback);
    });
  }

  // ---------- init ----------
  function init() {
    buildMenu();
    buildLoops();
    initPlaceholders();
    initFontSwitches();
    initReveal();
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
