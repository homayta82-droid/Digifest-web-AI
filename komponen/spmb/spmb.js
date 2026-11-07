/* =========================================================
   SMA NEGERI 1 SINGARAJA — Halaman SPMB
   Ringan: satu IntersectionObserver, satu scroll listener (rAF + passive).
   ========================================================= */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Reveal saat masuk layar ---------- */
  function initReveal() {
    const items = $$(".sp-reveal, .sp-bar");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Status pendaftaran & penanda tahap jadwal (WITA, UTC+8) ---------- */
  function initSchedule() {
    const DAY = 86400000;
    const wita = (iso, end) => Date.parse(iso + (end ? "T23:59:59+08:00" : "T00:00:00+08:00"));
    const now = Date.now();
    const rows = $$(".sp-timeline li[data-start]");
    if (!rows.length) return;

    let current = null;
    rows.forEach((li) => {
      const start = wita(li.dataset.start, false);
      const end = wita(li.dataset.end, true);
      if (now > end) li.classList.add("is-done");
      else if (now >= start) { li.classList.add("is-active"); current = li; }
    });

    const status = $("#spStatus");
    if (!status) return;
    const open = wita(rows[0].dataset.start, false);
    const last = wita(rows[rows.length - 1].dataset.end, true);
    if (now > last) return;

    if (current) {
      status.textContent = "Tahap berlangsung: " + $("h3", current).textContent;
      status.classList.add("is-open");
    } else if (now < open) {
      const days = Math.ceil((open - now) / DAY);
      status.textContent = "Pendaftaran dibuka " + days + " hari lagi";
    } else {
      status.textContent = "Menunggu tahap berikutnya";
    }
    status.hidden = false;
  }

  /* ---------- Tombol kembali ke atas ---------- */
  function initFab() {
    const fab = $("#spFab");
    if (!fab) return;
    window.SmansaScroll.subscribe((scrollY) => fab.classList.toggle("is-show", scrollY > 500));
    fab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- FAQ: hanya satu terbuka ---------- */
  function initFaq() {
    const items = $$(".sp-faq");
    items.forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    }));
  }

  initReveal();
  initSchedule();
  initFab();
  initFaq();
})();
