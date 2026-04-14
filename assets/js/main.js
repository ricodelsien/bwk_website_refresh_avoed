(function () {
  "use strict";

  var THEME_KEY = "bwk-color-scheme";

  function storedOrDefaultTheme() {
    try {
      var s = localStorage.getItem(THEME_KEY);
      if (s === "light" || s === "dark") return s;
    } catch (e) {}
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";

    var meta = document.getElementById("theme-color-meta");
    if (meta) {
      var cl = meta.getAttribute("data-color-light");
      var cd = meta.getAttribute("data-color-dark");
      if (cl && cd) {
        meta.setAttribute("content", theme === "dark" ? cd : cl);
      }
    }

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Zum Hellmodus wechseln" : "Zum Dunkelmodus wechseln"
      );
      btn.setAttribute("title", theme === "dark" ? "Hellmodus" : "Dunkelmodus");
    }
  }

  function initTheme() {
    applyTheme(storedOrDefaultTheme());

    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", function () {
        var cur = document.documentElement.getAttribute("data-theme") || "light";
        var next = cur === "dark" ? "light" : "dark";
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
        applyTheme(next);
      });
    }

  }

  function initFlyerLazyLoad() {
    var narrow = window.matchMedia("(max-width: 599px)");
    document.querySelectorAll(".flyer-viewer-details .flyer-viewer__frame").forEach(function (iframe) {
      var src = iframe.getAttribute("src");
      if (!src) return;
      var details = iframe.closest(".flyer-viewer-details");
      if (!details) return;
      iframe.removeAttribute("src");
      iframe.setAttribute("data-flyer-src", src);
      /* Schmale Viewports: kein eingebettetes PDF — Link öffnet neuen Tab */
      if (narrow.matches) {
        return;
      }
      details.addEventListener("toggle", function () {
        if (narrow.matches) return;
        if (details.open && iframe.getAttribute("data-flyer-src")) {
          iframe.setAttribute("src", iframe.getAttribute("data-flyer-src"));
          iframe.removeAttribute("data-flyer-src");
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initTheme();
      initFlyerLazyLoad();
    });
  } else {
    initTheme();
    initFlyerLazyLoad();
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  document.documentElement.classList.add("js-motion-ok");

  var reveal = document.querySelectorAll(".reveal");
  if (!reveal.length) return;

  if (!("IntersectionObserver" in window)) {
    reveal.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
  );

  reveal.forEach(function (el) {
    io.observe(el);
  });
})();
