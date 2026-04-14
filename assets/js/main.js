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

  /* ─── Mobile Navigation Drawer ────────────────────────────────── */
  function initMobileNav() {
    var headerActions = document.querySelector(".header-actions");
    var sourceNav = document.querySelector(".site-header .nav-main");
    if (!headerActions || !sourceNav) return;

    // Hamburger toggle button
    var navToggle = document.createElement("button");
    navToggle.type = "button";
    navToggle.className = "nav-toggle";
    navToggle.id = "nav-toggle";
    navToggle.setAttribute("aria-label", "Navigation öffnen");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-controls", "nav-drawer");
    navToggle.innerHTML =
      '<span class="nav-toggle__bar" aria-hidden="true"></span>' +
      '<span class="nav-toggle__bar" aria-hidden="true"></span>' +
      '<span class="nav-toggle__bar" aria-hidden="true"></span>';

    // Insert before theme-toggle
    var themeToggle = headerActions.querySelector(".theme-toggle");
    headerActions.insertBefore(navToggle, themeToggle || null);

    // Backdrop
    var backdrop = document.createElement("div");
    backdrop.className = "nav-drawer-backdrop";
    backdrop.id = "nav-drawer-backdrop";
    document.body.appendChild(backdrop);

    // Drawer with cloned nav
    var drawer = document.createElement("nav");
    drawer.className = "nav-drawer";
    drawer.id = "nav-drawer";
    drawer.setAttribute("aria-label", "Hauptnavigation (Mobil)");
    drawer.setAttribute("aria-hidden", "true");

    var drawerInner = document.createElement("div");
    drawerInner.className = "nav-main";
    sourceNav.querySelectorAll("a").forEach(function (a) {
      var clone = a.cloneNode(true);
      drawerInner.appendChild(clone);
    });
    drawer.appendChild(drawerInner);
    document.body.appendChild(drawer);

    function openNav() {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
      document.body.classList.add("nav-is-open");
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Navigation schließen");
      drawer.setAttribute("aria-hidden", "false");
    }

    function closeNav() {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.classList.remove("nav-is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Navigation öffnen");
      drawer.setAttribute("aria-hidden", "true");
    }

    navToggle.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    backdrop.addEventListener("click", closeNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // Close drawer on link click (navigation)
    drawerInner.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initTheme();
      initFlyerLazyLoad();
      initMobileNav();
    });
  } else {
    initTheme();
    initFlyerLazyLoad();
    initMobileNav();
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

  /* ─── Scroll Progress Bar ──────────────────────────────────────── */
  var progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.insertBefore(progressBar, document.body.firstChild);

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = "scaleX(" + Math.min(1, Math.max(0, progress)) + ")";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ─── Aurora Background ────────────────────────────────────────── */
  var aurora = document.createElement("div");
  aurora.className = "aurora";
  aurora.setAttribute("aria-hidden", "true");
  for (var ai = 1; ai <= 3; ai++) {
    var orb = document.createElement("div");
    orb.className = "aurora__orb aurora__orb--" + ai;
    aurora.appendChild(orb);
  }
  document.body.insertBefore(aurora, document.body.firstChild);

  /* ─── Cursor Spotlight (nur auf Hover-Geräten) ─────────────────── */
  if (window.matchMedia("(hover: hover)").matches) {
    var spotlight = document.createElement("div");
    spotlight.className = "cursor-spotlight";
    spotlight.setAttribute("aria-hidden", "true");
    document.body.appendChild(spotlight);

    var spX = window.innerWidth / 2;
    var spY = window.innerHeight / 3;
    var spRaf = false;

    document.addEventListener("mousemove", function (e) {
      spX = e.clientX;
      spY = e.clientY;
      if (!spRaf) {
        spRaf = true;
        requestAnimationFrame(function () {
          spotlight.style.left = spX + "px";
          spotlight.style.top  = spY + "px";
          spRaf = false;
        });
      }
    }, { passive: true });

    spotlight.style.left = spX + "px";
    spotlight.style.top  = spY + "px";
  }

})();
