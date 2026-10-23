/*
  Style guide behaviour. Values shown are read live from the CSS tokens,
  so this page never drifts from brand/tokens.css.
*/
(function () {
  "use strict";

  var root = document.documentElement;

  function tokenValue(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  var SCALE = [
    ["--text-5xl", "display"], ["--text-4xl", "display"], ["--text-3xl", "display"],
    ["--text-2xl", "display"], ["--text-xl", "display"], ["--text-lg", "body"],
    ["--text-md", "body"], ["--text-sm", "body"], ["--text-xs", "body"]
  ];

  var SAMPLE = {
    display: "Per crop. Per stage.",
    body: "Water-soluble fertilizer, formulated for the crop and its growth stage."
  };

  function renderTypeScale() {
    var box = document.getElementById("type-scale");
    SCALE.forEach(function (s) {
      var row = document.createElement("div");
      row.className = "scale-row";
      row.innerHTML = '<div class="scale-row__meta"><span>' + s[0] + "</span><span data-px></span></div>";
      var sample = document.createElement("div");
      sample.className = "scale-row__sample";
      sample.style.fontSize = "var(" + s[0] + ")";
      sample.style.fontFamily = s[1] === "display" ? "var(--font-display)" : "var(--font-body)";
      sample.style.lineHeight = s[1] === "display" ? "var(--leading-tight)" : "var(--leading-normal)";
      sample.textContent = SAMPLE[s[1]];
      row.appendChild(sample);
      box.appendChild(row);
    });
    measureTypeScale();
  }

  function measureTypeScale() {
    document.querySelectorAll("#type-scale .scale-row").forEach(function (row) {
      var px = parseFloat(getComputedStyle(row.querySelector(".scale-row__sample")).fontSize);
      row.querySelector("[data-px]").textContent = Math.round(px) + " px";
    });
  }

  function renderFonts() {
    document.querySelectorAll("[data-font-token]").forEach(function (n) {
      n.textContent = tokenValue(n.getAttribute("data-font-token"));
    });
  }

  function init() {
    renderFonts();
    renderTypeScale();
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(measureTypeScale, 150);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
