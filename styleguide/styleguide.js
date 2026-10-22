/*
  Style guide behaviour. Every value shown is read live from the CSS tokens,
  so this page never drifts from brand/tokens.css.
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };

  function tokenValue(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function currentBrand() {
    return BrandUI.brandById(root.getAttribute("data-brand")) || BrandUI.brands()[0];
  }

  // ---------- sticky header offset + active section ----------
  function syncHeaderHeight() {
    root.style.setProperty("--sg-header-h", $("sg-header").offsetHeight + "px");
  }

  function initNav() {
    var nav = $("sg-nav");
    var links = nav.querySelectorAll("a");
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var a = byId[e.target.id];
        if (!a) return;
        a.setAttribute("aria-current", "true");
        var left = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
        nav.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    document.querySelectorAll(".sg-section").forEach(function (s) { io.observe(s); });
  }

  // ---------- brand names ----------
  function fillCurrentBrandName() {
    var name = currentBrand().name;
    document.querySelectorAll("[data-current-brand-name]").forEach(function (n) { n.textContent = name; });
  }

  // ---------- colour ----------
  var NEUTRALS = [
    ["--color-paper-0", "Paper 0", "Page background"],
    ["--color-paper-1", "Paper 1", "Sunken surfaces"],
    ["--color-paper-2", "Paper 2", "Strong surfaces, placeholders"],
    ["--color-line", "Line", "Hairlines and borders"],
    ["--color-ink-300", "Ink 300", "Decorative only, not for text"],
    ["--color-ink-500", "Ink 500", "Secondary text"],
    ["--color-ink-700", "Ink 700", "Strong secondary text"],
    ["--color-ink-900", "Ink 900", "Primary text, inverse backgrounds"],
    ["--color-white", "White", "Raised surfaces, text on accents"]
  ];
  var STATUS = [
    ["--color-success", "Success", "Positive status, passed checks"],
    ["--color-warning", "Warning", "Caution, draft markers"],
    ["--color-danger", "Danger", "Errors, destructive actions"],
    ["--color-info", "Info", "Neutral information"]
  ];
  var BRAND_ROLES = [
    ["--brand-accent", "Accent", "Buttons, links, key highlights"],
    ["--brand-accent-strong", "Accent strong", "Pressed and hover states"],
    ["--brand-accent-soft", "Accent soft", "Tinted backgrounds, selection"],
    ["--brand-on-accent", "On accent", "Text and icons on the accent"]
  ];

  function copyButton(value, label) {
    var b = el("button", "copy-btn", '<span class="icon icon--sm" data-icon="copy"></span>');
    b.type = "button";
    b.appendChild(document.createTextNode(value));
    b.setAttribute("aria-label", "Copy " + label + " " + value);
    b.addEventListener("click", function () { BrandUI.copy(value, label); });
    return b;
  }

  function swatch(token, name, role) {
    var rgb = BrandUI.resolveColor("var(" + token + ")");
    var hex = BrandUI.toHex(rgb);
    var card = el("div", "swatch");
    var chip = el("div", "swatch__chip");
    chip.style.background = "var(" + token + ")";
    card.appendChild(chip);
    card.appendChild(el("div", "swatch__body",
      '<span class="swatch__name">' + name + '</span><span class="caption">' + role + "</span>"));
    var copies = el("div", "swatch__copies");
    copies.appendChild(copyButton(hex, "HEX"));
    copies.appendChild(copyButton("rgb(" + rgb.join(", ") + ")", "RGB"));
    copies.appendChild(copyButton("var(" + token + ")", "Token"));
    card.appendChild(copies);
    return card;
  }

  function renderSwatches(id, list) {
    var box = $(id);
    box.innerHTML = "";
    list.forEach(function (s) { box.appendChild(swatch(s[0], s[1], s[2])); });
    BrandUI.hydrateIcons(box);
  }

  function renderAllBrands() {
    renderSwatches("swatches-all", BrandUI.brands().map(function (b) {
      return ["--color-" + b.id + "-600", b.name, b.descriptor + " · accent (placeholder)"];
    }));
  }

  var PAIRS = [
    ["Body text on background", "--color-text", "--color-bg"],
    ["Muted text on background", "--color-text-muted", "--color-bg"],
    ["Subtle text on background (decorative only)", "--color-text-subtle", "--color-bg"],
    ["Text on raised surface", "--color-text", "--color-surface"],
    ["On-accent on accent", "--brand-on-accent", "--brand-accent"],
    ["Accent on background", "--brand-accent", "--color-bg"],
    ["Accent strong on accent soft", "--brand-accent-strong", "--brand-accent-soft"],
    ["Error text on background", "--color-danger", "--color-bg"],
    ["Inverse text on inverse", "--color-inverse-text", "--color-inverse-bg"]
  ];

  function verdict(ok) {
    return '<span class="verdict verdict--' + (ok ? "pass" : "fail") + '"><span class="icon icon--sm" data-icon="' +
      (ok ? "check" : "close") + '"></span>' + (ok ? "Pass" : "Fail") + "</span>";
  }

  function renderContrast() {
    var body = $("contrast-body");
    body.innerHTML = "";
    PAIRS.forEach(function (p) {
      var ratio = BrandUI.contrast(BrandUI.resolveColor("var(" + p[1] + ")"), BrandUI.resolveColor("var(" + p[2] + ")"));
      var tr = el("tr");
      tr.appendChild(el("td", null, p[0] + '<br><span class="caption mono">' + p[1] + " / " + p[2] + "</span>"));
      var sample = el("span", "pair", "Aa");
      sample.style.color = "var(" + p[1] + ")";
      sample.style.background = "var(" + p[2] + ")";
      var td = el("td");
      td.appendChild(sample);
      tr.appendChild(td);
      tr.appendChild(el("td", "mono", ratio.toFixed(2) + ":1"));
      tr.appendChild(el("td", null, verdict(ratio >= 4.5)));
      tr.appendChild(el("td", null, verdict(ratio >= 3)));
      body.appendChild(tr);
    });
    BrandUI.hydrateIcons(body);
  }

  // ---------- typography ----------
  var SCALE = [
    ["--text-5xl", "display"], ["--text-4xl", "display"], ["--text-3xl", "display"],
    ["--text-2xl", "display"], ["--text-xl", "display"], ["--text-lg", "body"],
    ["--text-md", "body"], ["--text-sm", "body"], ["--text-xs", "body"]
  ];

  function renderTypeScale() {
    var box = $("type-scale");
    box.innerHTML = "";
    SCALE.forEach(function (s) {
      var row = el("div", "scale-row");
      var meta = el("div", "scale-row__meta", "<span>" + s[0] + "</span><span data-px></span>");
      var sample = el("div", "scale-row__sample");
      sample.style.fontSize = "var(" + s[0] + ")";
      sample.style.fontFamily = s[1] === "display" ? "var(--font-display)" : "var(--font-body)";
      sample.style.lineHeight = s[1] === "display" ? "var(--leading-tight)" : "var(--leading-normal)";
      sample.textContent = s[1] === "display" ? "Land, product, person, space" : "Water-soluble fertilizer, formulated per crop and growth stage.";
      row.appendChild(meta);
      row.appendChild(sample);
      box.appendChild(row);
    });
    measureTypeScale();
  }

  function measureTypeScale() {
    $("type-scale").querySelectorAll(".scale-row").forEach(function (row) {
      var px = parseFloat(getComputedStyle(row.querySelector(".scale-row__sample")).fontSize);
      row.querySelector("[data-px]").textContent = Math.round(px) + " px";
    });
  }

  function renderFonts() {
    document.querySelectorAll("[data-font-token]").forEach(function (n) {
      n.textContent = tokenValue(n.getAttribute("data-font-token"));
    });
  }

  // ---------- space & grid ----------
  function renderSpace() {
    var box = $("space-scale");
    box.innerHTML = "";
    for (var i = 1; i <= 10; i++) {
      var name = "--space-" + i;
      var row = el("div", "space-row", "<span>" + name + "</span>");
      var bar = el("div", "space-row__bar");
      bar.style.width = "var(" + name + ")";
      var wrap = el("div");
      wrap.appendChild(bar);
      row.appendChild(wrap);
      var value = el("span", null, tokenValue(name));
      row.appendChild(value);
      box.appendChild(row);
      value.textContent += " · " + Math.round(bar.getBoundingClientRect().width) + " px";
    }
    var grid = $("grid-demo");
    var cols = parseInt(tokenValue("--grid-columns"), 10) || 12;
    grid.innerHTML = new Array(cols + 1).join("<span></span>");
  }

  // ---------- icons ----------
  function renderIcons() {
    var box = $("icon-grid");
    BrandUI.iconNames.forEach(function (name) {
      var b = el("button", "icon-cell", '<span class="icon icon--lg" data-icon="' + name + '"></span>' + name);
      b.type = "button";
      b.setAttribute("aria-label", "Copy icon name " + name);
      b.addEventListener("click", function () { BrandUI.copy(name, "Icon"); });
      box.appendChild(b);
    });
    BrandUI.hydrateIcons(box);
  }

  // ---------- components ----------
  function renderButtons() {
    var variants = [["Primary", "btn"], ["Secondary", "btn btn--secondary"], ["Ghost", "btn btn--ghost"]];
    var states = [["Default", ""], ["Hover", "is-hover"], ["Pressed", "is-active"], ["Focus", "is-focus"], ["Disabled", "is-disabled"]];
    var box = $("button-matrix");
    variants.forEach(function (v) {
      var group = el("div", "stack stack--sm", '<span class="label">' + v[0] + "</span>");
      var grid = el("div", "state-grid");
      states.forEach(function (s) {
        var state = el("div", "state", '<span class="eyebrow">' + s[0] + "</span>");
        var b = el("button", (v[1] + " " + s[1]).trim(), "Request a call");
        b.type = "button";
        if (s[1] === "is-disabled") b.disabled = true;
        state.appendChild(b);
        grid.appendChild(state);
      });
      group.appendChild(grid);
      box.appendChild(group);
    });
  }

  // ---------- motion ----------
  var DURATIONS = [
    ["--duration-instant", "Press feedback"],
    ["--duration-fast", "Hover, colour changes"],
    ["--duration-base", "Toasts, small moves"],
    ["--duration-slow", "Slide transitions, panels"],
    ["--duration-slower", "Large reveals"]
  ];
  var EASINGS = [
    ["--ease-standard", "Most UI transitions"],
    ["--ease-enter", "Things arriving on screen"],
    ["--ease-exit", "Things leaving the screen"],
    ["--ease-emphasized", "Slide changes, hero moments"]
  ];

  function curveSvg(value) {
    var n = (value.match(/-?[\d.]+/g) || [0, 0, 1, 1]).map(Number);
    var s = 40;
    var d = "M0 " + s + " C" + n[0] * s + " " + (s - n[1] * s) + " " + n[2] * s + " " + (s - n[3] * s) + " " + s + " 0";
    return '<svg class="curve" viewBox="-2 -2 44 44" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '<path d="M0 40 L40 0" stroke-opacity="0.2" stroke-width="1"/><path d="' + d + '"/></svg>';
  }

  function motionRow(token, use, durationToken, easingToken, extra) {
    var b = el("button", "motion-row");
    b.type = "button";
    b.setAttribute("aria-label", "Play " + token);
    b.appendChild(el("span", "motion-row__meta", "<span>" + token + " · " + tokenValue(token) + "</span><span>" + use + "</span>"));
    var track = el("span", "motion-track", '<span class="motion-dot"></span>');
    b.style.setProperty("--d", "var(" + durationToken + ")");
    b.style.setProperty("--e", "var(" + easingToken + ")");
    b.appendChild(track);
    b.appendChild(el("span", null, extra || ""));
    b.addEventListener("click", function () { b.classList.toggle("is-end"); });
    return b;
  }

  function renderMotion() {
    var d = $("motion-durations");
    DURATIONS.forEach(function (t) { d.appendChild(motionRow(t[0], t[1], t[0], "--ease-standard")); });
    var e = $("motion-easings");
    EASINGS.forEach(function (t) { e.appendChild(motionRow(t[0], t[1], "--duration-slower", t[0], curveSvg(tokenValue(t[0])))); });
  }

  // ---------- init ----------
  function renderBrandDependent() {
    fillCurrentBrandName();
    renderSwatches("swatches-brand", BRAND_ROLES);
    renderContrast();
  }

  function init() {
    syncHeaderHeight();
    initNav();
    renderSwatches("swatches-neutral", NEUTRALS);
    renderSwatches("swatches-status", STATUS);
    renderAllBrands();
    renderFonts();
    renderTypeScale();
    renderSpace();
    renderIcons();
    renderButtons();
    renderMotion();
    renderBrandDependent();
    root.addEventListener("brandchange", renderBrandDependent);
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { syncHeaderHeight(); measureTypeScale(); }, 150);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
