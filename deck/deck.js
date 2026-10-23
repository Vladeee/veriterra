/*
  Brand deck controller.
  - Swipe left/right, or tap the outer quarter of the screen (iPad)
  - Arrow keys, Space / Shift+Space, Page Up/Down, Home/End, F for full screen
  - Slide number lives in the URL: deck/#5 opens slide 5
*/
(function () {
  "use strict";

  var deck = document.getElementById("deck");
  var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
  var total = slides.length;
  var current = -1;

  var countEl = document.getElementById("count");
  var progressEl = document.getElementById("progress");
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  var fsBtn = document.getElementById("fullscreen");

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // ---------- navigation ----------
  function go(index) {
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current) return;
    current = index;
    slides.forEach(function (s, i) {
      s.classList.toggle("is-active", i === index);
      s.classList.toggle("is-past", i < index);
      s.setAttribute("aria-hidden", String(i !== index));
    });
    var active = slides[index];
    active.scrollTop = 0;
    deck.classList.toggle("is-inverse", active.classList.contains("slide--inverse"));
    countEl.textContent = pad(index + 1) + " / " + pad(total);
    progressEl.style.setProperty("--progress", String(total > 1 ? index / (total - 1) : 1));
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    if (location.hash !== "#" + (index + 1)) {
      history.replaceState(null, "", "#" + (index + 1));
    }
  }

  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function indexFromHash() {
    var n = parseInt(location.hash.replace("#", ""), 10);
    return isNaN(n) ? 0 : n - 1;
  }

  // ---------- input: keys ----------
  function isTyping(el) {
    return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
        e.preventDefault(); next(); break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault(); prev(); break;
      case " ":
        // Let Space activate a focused button or link.
        if (e.target.closest && e.target.closest("button, a")) return;
        e.preventDefault(); e.shiftKey ? prev() : next(); break;
      case "Home":
        e.preventDefault(); go(0); break;
      case "End":
        e.preventDefault(); go(total - 1); break;
      case "f":
      case "F":
        toggleFullscreen(); break;
    }
  });

  // ---------- input: swipe + edge taps ----------
  var INTERACTIVE = "a, button, input, textarea, select, label, [data-no-swipe]";
  var start = null;
  var suppressClick = false;

  deck.addEventListener("pointerdown", function (e) {
    if (!e.isPrimary || (e.target.closest && e.target.closest(INTERACTIVE))) { start = null; return; }
    start = { x: e.clientX, y: e.clientY };
  });

  deck.addEventListener("pointerup", function (e) {
    if (!start) return;
    var dx = e.clientX - start.x;
    var dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 300);
      if (dx < 0) next(); else prev();
    }
  });

  deck.addEventListener("pointercancel", function () { start = null; });

  deck.addEventListener("click", function (e) {
    if (suppressClick || (e.target.closest && e.target.closest(INTERACTIVE))) return;
    var x = e.clientX / window.innerWidth;
    if (x < 0.25) prev();
    else if (x > 0.75) next();
  });

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  window.addEventListener("hashchange", function () { go(indexFromHash()); });

  // ---------- full screen ----------
  var docEl = document.documentElement;
  var requestFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
  var exitFs = document.exitFullscreen || document.webkitExitFullscreen;
  var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone;

  function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function toggleFullscreen() {
    if (!requestFs || standalone) return;
    try {
      var r = isFullscreen() ? exitFs.call(document) : requestFs.call(docEl);
      if (r && r.catch) r.catch(function () { /* user gesture or policy refused */ });
    } catch (err) { /* unsupported */ }
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

  // ---------- init ----------
  function init() {
    go(indexFromHash());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
