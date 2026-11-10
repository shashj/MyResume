(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Theme toggle (preference stored per-browser; page works without storage) */
  var themeBtn = document.getElementById("theme-btn");
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* Mobile menu */
  var menuBtn = document.getElementById("menu-btn");
  var links = document.getElementById("nav-links");
  function setMenu(open) {
    links.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* Scroll-spy */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#nav-links a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Count-up stats */
  var nums = document.querySelectorAll("[data-count]");
  function run(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var pre = el.getAttribute("data-prefix") || "";
    var suf = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = pre + end + suf; return; }
    var t0 = null, dur = 900;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { co.observe(el); });
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
