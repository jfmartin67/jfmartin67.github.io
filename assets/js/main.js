/* ============================================================
   The Numeric Citizen Dashboard — interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Matrix rain ---------- */
  (function matrix() {
    var canvas = document.getElementById("matrix");
    if (!canvas || reduceMotion) { if (canvas) canvas.style.display = "none"; return; }
    var ctx = canvas.getContext("2d");
    var glyphs = "アカサタナハマヤラワ0123456789ABCDEFｦｧｨｩｪｫ<>{}[]=/\\$#*".split("");
    var fontSize = 16, cols = 0, drops = [], dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(window.innerWidth / fontSize);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    }
    resize();
    window.addEventListener("resize", resize);

    var rgb = getComputedStyle(document.documentElement).getPropertyValue("--matrix").trim() || "130,170,220";
    var running = true, last = 0;

    function draw(ts) {
      if (!running) return;
      requestAnimationFrame(draw);
      if (ts - last < 55) return;          // ~18fps, calm and cheap
      last = ts;
      rgb = getComputedStyle(document.documentElement).getPropertyValue("--matrix").trim() || rgb;
      ctx.fillStyle = "rgba(7,11,20,0.10)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = fontSize + "px 'JetBrains Mono', monospace";
      for (var i = 0; i < drops.length; i++) {
        var ch = glyphs[(Math.random() * glyphs.length) | 0];
        var x = i * fontSize, y = drops[i] * fontSize;
        ctx.fillStyle = "rgba(" + rgb + ",0.06)";
        if (Math.random() > 0.975) ctx.fillStyle = "rgba(" + rgb + ",0.5)"; // occasional bright head
        ctx.fillText(ch, x, y);
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 1;
      }
    }
    requestAnimationFrame(draw);
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });
  })();

  /* ---------- Live clock + "as of" line ---------- */
  (function clock() {
    var clockEl = document.getElementById("clock");
    var asOf = document.getElementById("as-of");
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function tick() {
      var d = new Date();
      var h = d.getHours(), m = d.getMinutes();
      if (clockEl) clockEl.textContent = h + ":" + pad(m);
      if (asOf) {
        var opts = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" };
        asOf.textContent = "as of " + d.toLocaleString("en-US", opts);
      }
    }
    tick();
    setInterval(tick, 1000 * 20);
  })();

  /* ---------- Relative time ---------- */
  function relTime(iso) {
    var then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    var s = Math.max(1, Math.floor((Date.now() - then) / 1000));
    var units = [["year", 31536000], ["month", 2592000], ["week", 604800],
                 ["day", 86400], ["hour", 3600], ["minute", 60]];
    for (var i = 0; i < units.length; i++) {
      var v = Math.floor(s / units[i][1]);
      if (v >= 1) return v + " " + units[i][0] + (v > 1 ? "s" : "") + " ago";
    }
    return "just now";
  }

  var NEW_WINDOW = 12 * 86400 * 1000; // 12 days

  document.querySelectorAll("[data-updated]").forEach(function (el) {
    var iso = el.getAttribute("data-updated");
    var label = relTime(iso);
    if (label && !el.hasAttribute("data-new")) el.textContent = label;
    if (el.hasAttribute("data-new")) {
      if (Date.now() - new Date(iso).getTime() < NEW_WINDOW) el.hidden = false;
    }
  });

  /* ---------- Section freshness ---------- */
  document.querySelectorAll("[data-sec]").forEach(function (sec) {
    var times = [].map.call(sec.querySelectorAll(".repo [data-updated]:not([data-new])"),
      function (el) { return new Date(el.getAttribute("data-updated")).getTime(); })
      .filter(function (t) { return !isNaN(t); });
    var out = sec.querySelector("[data-sec-latest]");
    if (out && times.length) out.textContent = relTime(new Date(Math.max.apply(null, times)).toISOString());
  });

  /* ---------- Collapsibles ---------- */
  function setOpen(sec, open) {
    sec.classList.toggle("is-open", open);
    var head = sec.querySelector(".sec-head");
    if (head) head.setAttribute("aria-expanded", String(open));
  }
  document.querySelectorAll(".sec-head").forEach(function (head) {
    head.addEventListener("click", function () {
      var sec = head.closest(".sec");
      setOpen(sec, !sec.classList.contains("is-open"));
    });
  });

  var toggleAll = document.getElementById("toggle-all");
  if (toggleAll) {
    toggleAll.addEventListener("click", function () {
      var secs = [].slice.call(document.querySelectorAll(".sec"));
      var anyOpen = secs.some(function (s) { return s.classList.contains("is-open"); });
      secs.forEach(function (s) { setOpen(s, !anyOpen); });
      toggleAll.textContent = anyOpen ? "Expand all" : "Collapse all";
    });
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = cur === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("nc-theme", next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "light" ? "#eef1f7" : "#070b14");
    });
  }

  /* ---------- Menu ---------- */
  var menuBtn = document.getElementById("menu-toggle");
  var menu = document.getElementById("menu");
  if (menuBtn && menu) {
    function closeMenu() { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) closeMenu();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  }

  /* ---------- Stats ---------- */
  var repos = [].slice.call(document.querySelectorAll("[data-repo]"));
  var total = document.getElementById("stat-total");
  var priv = document.getElementById("stat-private");
  if (total) total.textContent = repos.length;
  if (priv) priv.textContent = repos.filter(function (r) { return r.querySelector(".badge-private"); }).length;

  /* ---------- Filter ---------- */
  var filter = document.getElementById("filter");
  var noResults = document.getElementById("no-results");
  if (filter) {
    // Remember each section's full repo count so we can restore it when cleared.
    document.querySelectorAll("[data-sec]").forEach(function (sec) {
      var cnt = sec.querySelector("[data-count]");
      if (cnt) cnt.setAttribute("data-base", cnt.textContent.trim());
    });

    filter.addEventListener("input", function () {
      var q = filter.value.trim().toLowerCase();
      var anyVisible = false;
      document.querySelectorAll("[data-sec]").forEach(function (sec) {
        var shown = 0;
        sec.querySelectorAll("[data-repo]").forEach(function (r) {
          var match = !q || r.getAttribute("data-name").indexOf(q) > -1 ||
                      r.getAttribute("data-desc").indexOf(q) > -1;
          r.hidden = !match;
          if (match) shown++;
        });
        sec.hidden = shown === 0;
        if (shown > 0) anyVisible = true;
        if (q && shown > 0) setOpen(sec, true);
        var cnt = sec.querySelector("[data-count]");
        if (cnt) cnt.textContent = q ? shown : cnt.getAttribute("data-base");
      });
      if (noResults) noResults.hidden = anyVisible;
    });
  }
})();
