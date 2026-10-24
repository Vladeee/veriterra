/*
  Presentation: five landings behind one fixed menu.
  - The URL hash picks the landing: deck/#verdo. A hash pointing inside a
    landing (#verdo-offer) opens that landing and scrolls to the block.
  - The menu and the "loop" strip are built from brand/brands.js.
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
    var home = document.getElementById("topnav-home");
    BRANDS.forEach(function (b) {
      var a = document.createElement("a");
      a.className = "topnav__link" + (b.holding ? " topnav__link--holding" : "");
      a.href = "#" + b.id;
      a.setAttribute("data-brand", b.id);
      a.textContent = b.name;
      if (b.holding) { home.appendChild(a); return; }
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
  function show(hash) {
    var target = hash ? document.getElementById(hash) : null;
    var landing = target ? target.closest(".landing") : null;
    if (!landing) landing = landings[0];

    if (landing !== current) {
      landings.forEach(function (l) { l.hidden = l !== landing; });
      current = landing;
      root.setAttribute("data-brand", landing.id);
      document.querySelectorAll(".topnav__link").forEach(function (a) {
        if (a.getAttribute("href") === "#" + landing.id) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      var active = menu.querySelector('[aria-current="page"]');
      if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
      document.title = BrandUI.brandById(landing.id).name + " · Presentation";
    }

    if (target && target !== landing) target.scrollIntoView({ block: "start" });
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

  // ---------- sign-up forms (placeholders, not connected yet) ----------
  function initForms() {
    document.querySelectorAll("[data-signup]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector("button");
        btn.textContent = "Thanks. Not connected yet";
        btn.disabled = true;
      });
    });
    document.querySelectorAll("[data-focus-signup]").forEach(function (link) {
      link.addEventListener("click", function () {
        var input = document.getElementById(link.getAttribute("href").slice(1));
        if (input) setTimeout(function () { input.focus({ preventScroll: true }); }, 0);
      });
    });
  }

  // ---------- init ----------
  function init() {
    buildMenu();
    buildLoops();
    initForms();
    BrandUI.hydrateIcons();
    window.addEventListener("hashchange", route);
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
