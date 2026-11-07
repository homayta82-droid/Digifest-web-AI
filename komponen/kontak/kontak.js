/* =========================================================
   SMA NEGERI 1 SINGARAJA — Halaman Kontak
   Interaksi: reveal on scroll, parallax hero, ripple tombol,
   validasi form + kirim, hitung karakter, status jam buka,
   peta lazy-load, tombol kembali ke atas, toast.
   Semua animasi memakai transform/opacity dan requestAnimationFrame
   agar tetap mulus (tidak lag).
   ========================================================= */

(() => {
  "use strict";

  /* -------------------------------------------------------
     KONFIGURASI
     Isi FORM_ENDPOINT dengan URL layanan form (mis. Formspree:
     "https://formspree.io/f/xxxxxxx") agar pesan benar-benar terkirim.
     Jika dikosongkan, form hanya mensimulasikan pengiriman (mode demo).
  ------------------------------------------------------- */
  const FORM_ENDPOINT = "";

  /* Jam operasional (WITA, UTC+8): Senin–Jumat 07.00–16.00 */
  const OPEN_HOUR = 7;
  const CLOSE_HOUR = 16;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initHeroParallax();
    initRipple();
    initScrollToForm();
    initForm();
    initOpenStatus();
    initSocialGlow();
    initMapLazy();
    initFab();
  });

  /* -------------------------------------------------------
     1. Reveal saat masuk viewport
  ------------------------------------------------------- */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    const show = (el) => {
      el.classList.add("is-visible");
      // lepas delay setelah animasi masuk selesai agar hover tidak tertahan
      const d = parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 0;
      setTimeout(() => el.classList.add("is-done"), 750 + d * 100);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible", "is-done"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* -------------------------------------------------------
     2. Parallax halus pada foto hero (hanya saat hero terlihat)
  ------------------------------------------------------- */
  function initHeroParallax() {
    const hero = $(".kt-hero");
    const img = $(".kt-hero__img");
    if (!hero || !img || reduceMotion) return;

    let visible = true;

    const update = () => {
      if (!visible) return;
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, rect.top / window.innerHeight));
      img.style.setProperty("--py", `${(progress * -26).toFixed(1)}px`);
    };

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
    }

    window.SmansaScroll.subscribe(update);
  }

  /* -------------------------------------------------------
     3. Efek ripple pada tombol
  ------------------------------------------------------- */
  function initRipple() {
    if (reduceMotion) return;
    $$(".kt-btn").forEach((btn) => {
      btn.addEventListener("pointerdown", (e) => {
        const rect = btn.getBoundingClientRect();
        const dot = document.createElement("span");
        dot.className = "kt-ripple";
        dot.style.left = `${e.clientX - rect.left}px`;
        dot.style.top = `${e.clientY - rect.top}px`;
        btn.appendChild(dot);
        dot.addEventListener("animationend", () => dot.remove(), { once: true });
      });
    });
  }

  /* -------------------------------------------------------
     4. Tombol "Mari Berdiskusi" → gulir halus + fokus ke form
  ------------------------------------------------------- */
  function initScrollToForm() {
    const trigger = $("[data-scroll-form]");
    const card = $("#kirim-pesan");
    const first = $("#nama");
    if (!trigger || !card) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const top = card.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
      // fokus setelah gulir hampir selesai, tanpa membuat halaman melompat
      setTimeout(() => first && first.focus({ preventScroll: true }), reduceMotion ? 0 : 650);
    });
  }

  /* -------------------------------------------------------
     5. Form: validasi, hitung karakter, kirim
  ------------------------------------------------------- */
  function initForm() {
    const form = $("#kontakForm");
    if (!form) return;

    const btn = $("#kirimBtn");
    const counter = $("#pesanCount");
    const counterWrap = counter ? counter.parentElement : null;
    const fields = ["nama", "email", "subjek", "pesan"].map((id) => $("#" + id));

    const rules = {
      nama: (v) => {
        if (!v) return "Nama lengkap wajib diisi.";
        if (v.length < 3) return "Nama minimal 3 karakter.";
        return "";
      },
      email: (v) => {
        if (!v) return "Email wajib diisi.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Format email belum valid.";
        return "";
      },
      subjek: (v) => {
        if (!v) return "Subjek wajib diisi.";
        if (v.length < 3) return "Subjek minimal 3 karakter.";
        return "";
      },
      pesan: (v) => {
        if (!v) return "Pesan wajib diisi.";
        if (v.length < 10) return "Pesan minimal 10 karakter.";
        return "";
      },
    };

    function setState(input, message) {
      const field = input.closest(".kt-field");
      const err = $(`[data-error-for="${input.id}"]`, field);
      field.classList.toggle("has-error", !!message);
      field.classList.toggle("is-valid", !message && input.value.trim().length > 0);
      if (err) err.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
      return !message;
    }

    function validate(input) {
      return setState(input, rules[input.id](input.value.trim()));
    }

    fields.forEach((input) => {
      // validasi saat selesai mengisi, lalu langsung saat mengetik jika sudah ada error
      input.addEventListener("blur", () => { if (input.value.trim()) validate(input); });
      input.addEventListener("input", () => {
        if (input.closest(".kt-field").classList.contains("has-error")) validate(input);
      });
    });

    // hitung karakter
    const pesan = $("#pesan");
    if (pesan && counter) {
      const updateCount = () => {
        const n = pesan.value.length;
        counter.textContent = n;
        counterWrap.classList.toggle("is-near", n > 450);
      };
      pesan.addEventListener("input", updateCount);
      updateCount();
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // honeypot: bot biasanya mengisi kolom tersembunyi
      if (form.elements.website && form.elements.website.value) return;

      let firstInvalid = null;
      fields.forEach((input) => {
        if (!validate(input)) {
          if (!firstInvalid) firstInvalid = input;
          const f = input.closest(".kt-field");
          f.classList.remove("shake");
          void f.offsetWidth; // restart animasi
          f.classList.add("shake");
        }
      });

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
        toast("Mohon lengkapi data dengan benar.", true);
        return;
      }

      const payload = {
        nama: $("#nama").value.trim(),
        email: $("#email").value.trim(),
        subjek: $("#subjek").value.trim(),
        pesan: $("#pesan").value.trim(),
      };

      btn.classList.add("is-loading");
      btn.disabled = true;

      try {
        await sendMessage(payload);
        form.reset();
        fields.forEach((i) => i.closest(".kt-field").classList.remove("is-valid", "has-error"));
        if (counter) { counter.textContent = "0"; counterWrap.classList.remove("is-near"); }
        toast("Pesan terkirim. Terima kasih telah menghubungi kami!");
      } catch (err) {
        toast("Pesan gagal terkirim. Silakan coba lagi nanti.", true);
      } finally {
        btn.classList.remove("is-loading");
        btn.disabled = false;
      }
    });
  }

  function sendMessage(data) {
    if (!FORM_ENDPOINT) {
      // mode demo: simulasi pengiriman
      return new Promise((resolve) => setTimeout(resolve, 1100));
    }
    return fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    }).then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
    });
  }

  /* -------------------------------------------------------
     6. Toast notifikasi
  ------------------------------------------------------- */
  let toastTimer;
  function toast(message, isError = false) {
    const el = $("#ktToast");
    if (!el) return;
    clearTimeout(toastTimer);
    el.textContent = message;
    el.classList.toggle("is-error", isError);
    el.classList.add("is-show");
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 3800);
  }

  /* -------------------------------------------------------
     7. Status "Buka / Tutup" berdasarkan waktu WITA
  ------------------------------------------------------- */
  function initOpenStatus() {
    const el = $("#statusBuka");
    if (!el) return;

    const render = () => {
      // ubah waktu sekarang ke WITA (UTC+8) tanpa bergantung zona waktu perangkat
      const now = new Date();
      const wita = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 8 * 3600000);
      const day = wita.getDay(); // 0 Minggu ... 6 Sabtu
      const hour = wita.getHours() + wita.getMinutes() / 60;
      const open = day >= 1 && day <= 5 && hour >= OPEN_HOUR && hour < CLOSE_HOUR;

      el.hidden = false;
      el.classList.toggle("is-open", open);
      el.textContent = open ? "Sedang Buka" : "Sedang Tutup";
    };

    render();
    setInterval(render, 60000);
  }

  /* -------------------------------------------------------
     8. Cahaya mengikuti kursor pada kartu sosial media
  ------------------------------------------------------- */
  function initSocialGlow() {
    if (!finePointer || reduceMotion) return;

    $$(".kt-social__card").forEach((card) => {
      let raf = 0;
      card.addEventListener("pointermove", (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
      });
    });
  }

  /* -------------------------------------------------------
     9. Peta Google Maps dimuat saat hampir terlihat (lazy)
  ------------------------------------------------------- */
  function initMapLazy() {
    const frame = $("#mapFrame");
    if (!frame) return;

    const load = () => {
      if (frame.querySelector("iframe")) return;
      const iframe = document.createElement("iframe");
      iframe.src = frame.dataset.src;
      iframe.title = "Lokasi SMA Negeri 1 Singaraja";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      iframe.addEventListener("load", () => frame.classList.add("is-loaded"), { once: true });
      frame.appendChild(iframe);
    };

    if (!("IntersectionObserver" in window)) { load(); return; }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          load();
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    io.observe(frame);
  }

  /* -------------------------------------------------------
     10. Tombol melayang (logo) → kembali ke atas
  ------------------------------------------------------- */
  function initFab() {
    const fab = $("#ktFab");
    if (!fab) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      fab.classList.toggle("is-show", window.scrollY > 500);
    };

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );

    fab.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    update();
  }
})();