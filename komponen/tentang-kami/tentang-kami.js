(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>\"']/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char]));
  const norm = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const supabaseData = window.smansaSupabase || {
    getTeachers: async () => [],
    getFacilities: async () => [],
    getGalleries: async () => []
  };

  let teachers = [];
  let facilities = [];
  let tours = [];

  const avatarColors = ["#173e6d", "#24558a", "#002157", "#3b5f8f", "#4a6a99", "#0a2e68"];
  const initialFrom = (name) => {
    const cleaned = name.replace(/\b(Drs?|Dra|Prof|S\.[A-Za-z]+|M\.[A-Za-z]+|[A-Z]\.)\.?\s*/g, "").trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    const picks = words.length > 1 ? [words[0], words[words.length - 1]] : words;
    return picks.map((word) => word[0]).join("").toUpperCase().slice(0, 2) || "?";
  };
  const colorFor = (name) => avatarColors[Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0) % avatarColors.length];

  function normalizeTeachers(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      nama: row.name || row.nama || "Guru",
      mapel: row.subject || row.mapel || row.position || "Guru",
      foto: row.photo_url || row.avatar_url || row.foto || ""
    }));
  }

  function isVicePrincipal(row) {
    return /wakil\s+kepala/i.test(String(row.position || ""));
  }

  function renderVicePrincipals(rows) {
    const list = $("#vicePrincipalGrid");
    const vicePrincipals = (Array.isArray(rows) ? rows : []).filter(isVicePrincipal);
    if (!list) return;
    if (!vicePrincipals.length) {
      list.innerHTML = '<li class="mj-empty">Data Wakil Kepala Sekolah belum tersedia.</li>';
      list.setAttribute("aria-busy", "false");
      return;
    }

    list.innerHTML = vicePrincipals.map((row, index) => {
      const name = row.name || row.nama || "Wakil Kepala Sekolah";
      const role = row.position || row.jabatan || "Wakil Kepala Sekolah";
      const photo = row.photo_url || row.avatar_url || row.foto || "";
      const photoMarkup = photo
        ? `<img src="${esc(photo)}" alt="${esc(name)}" width="400" height="440" loading="lazy" decoding="async">`
        : `<span class="mj-wakil__placeholder" aria-label="Foto belum tersedia">${esc(initialFrom(name))}</span>`;

      return `
        <li class="mj-wakil__card rv in" style="--d:${index % 4}">
          <div class="mj-wakil__photo">${photoMarkup}</div>
          <div class="mj-wakil__info">
            <h3 class="mj-wakil__name">${esc(name)}</h3>
            <p class="mj-wakil__role">${esc(role)}</p>
          </div>
        </li>
      `;
    }).join("");
    list.setAttribute("aria-busy", "false");
  }

  function normalizeFacilities(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      icon: row.icon || "book",
      judul: row.name || row.title || row.judul || "Fasilitas",
      img: row.image_url || row.img || row.image || "../../assets/images/gambar-sekolah.jpeg",
      desc: row.description || row.desc || row.detail || "Fasilitas sekolah."
    }));
  }

  function normalizeTours(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      judul: row.title || row.name || row.judul || "Lokasi sekolah",
      src: row.image_url || row.img || row.src || "../../assets/images/gambar-sekolah.jpeg"
    }));
  }

  function initReveal() {
    const items = document.querySelectorAll(".rv, .reveal");
    if (!items.length) return;

    const reveal = (element) => {
      element.classList.add(element.classList.contains("reveal") ? "is-visible" : "in");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

    items.forEach((element) => observer.observe(element));
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-counter][data-target]");
    if (!counters.length) return;

    const animate = (element) => {
      const target = Number.parseInt(element.dataset.target, 10);
      if (!Number.isFinite(target)) return;
      if (reduceMotion) {
        element.textContent = String(target);
        return;
      }

      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach((element) => observer.observe(element));
  }

  function initPhilosophyAccordion() {
    document.querySelectorAll("[data-accordion] .philosophy-item__trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".philosophy-item");
        const isOpen = item.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
    });
  }

  function initHistoryGallery() {
    const gallery = $(`[data-history-gallery]`);
    if (!gallery) return;

    const track = $(`[data-gallery-track]`, gallery);
    const previous = $(`[data-gallery-prev]`, gallery);
    const next = $(`[data-gallery-next]`, gallery);
    if (!track.querySelector(".history-gallery__item")) {
      previous.hidden = true;
      next.hidden = true;
      track.setAttribute("aria-busy", "false");
      return;
    }

    const getStep = () => {
      const item = $(".history-gallery__item", track);
      if (!item) return track.clientWidth;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      return item.getBoundingClientRect().width + gap;
    };
    const updateButtons = () => {
      previous.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };

    previous.addEventListener("click", () => track.scrollBy({ left: -getStep(), behavior: reduceMotion ? "auto" : "smooth" }));
    next.addEventListener("click", () => track.scrollBy({ left: getStep(), behavior: reduceMotion ? "auto" : "smooth" }));
    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    updateButtons();
  }

  function renderHistoryGallery(rows, unavailable = false) {
    const gallery = $("[data-history-gallery]");
    if (!gallery) return;
    const track = $("[data-gallery-track]", gallery);
    if (!track) return;

    const items = (Array.isArray(rows) ? rows : []).filter((row) => row.image_url || row.img);
    if (!items.length) {
      const message = unavailable
        ? "Galeri sekolah belum dapat dimuat. Silakan coba beberapa saat lagi."
        : "Belum ada foto galeri sekolah. Foto dapat ditambahkan melalui panel admin.";
      track.innerHTML = `<p class="history-gallery__empty">${esc(message)}</p>`;
      gallery.querySelectorAll("[data-gallery-prev], [data-gallery-next]").forEach((button) => { button.hidden = true; });
      track.setAttribute("aria-busy", "false");
      return;
    }

    track.innerHTML = items.map((item) => {
      const title = item.title || item.name || "Kegiatan sekolah";
      const image = item.image_url || item.img;
      return `
        <figure class="history-gallery__item">
          <img src="${esc(image)}" alt="${esc(title)}" width="600" height="400" loading="lazy" decoding="async">
          <figcaption>${esc(title)}</figcaption>
        </figure>
      `;
    }).join("");
    track.setAttribute("aria-busy", "false");
    gallery.querySelectorAll("[data-gallery-prev], [data-gallery-next]").forEach((button) => { button.hidden = false; });
    initHistoryGallery();
  }

  function initToTop() {
    const button = $("#toTop");
    if (!button) return;

    window.SmansaScroll.subscribe((scrollY) => button.classList.toggle("show", scrollY > 480));

    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  function initStaff() {
    const grid = $("#staffGrid");
    const input = $("#staffSearch");
    const select = $("#staffSubject");
    const more = $("#staffMore");
    const count = $("#staffCount");
    if (!grid || !input || !select || !more || !count) return;

    const subjects = [...new Set(teachers.map((teacher) => teacher.mapel))].sort((a, b) => a.localeCompare(b, "id"));
    subjects.forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      select.appendChild(option);
    });

    let filtered = [...teachers];
    let shown = 0;
    const pageSize = 10;

    function cardMarkup(teacher) {
      const avatar = teacher.foto
        ? `<img src="${esc(teacher.foto)}" alt="${esc(teacher.nama)}" loading="lazy" decoding="async" width="68" height="68">`
        : `<span>${initialFrom(teacher.nama)}</span>`;

      return `
        <li class="mj-teacher rv">
          <span class="mj-avatar" style="--av:${colorFor(teacher.nama)}">${avatar}</span>
          <h3 class="mj-teacher__name">${esc(teacher.nama)}</h3>
          <p class="mj-teacher__subject">${esc(teacher.mapel)}</p>
        </li>
      `;
    }

    function updateMeta() {
      count.textContent = filtered.length ? `Menampilkan ${Math.min(shown, filtered.length)} dari ${filtered.length} guru & staf` : "";
      more.hidden = shown >= filtered.length;
    }

    function appendNext() {
      const next = filtered.slice(shown, shown + pageSize);
      if (!next.length) return;
      const template = document.createElement("template");
      template.innerHTML = next.map((teacher) => cardMarkup(teacher)).join("");
      grid.appendChild(template.content);
      shown += next.length;
      updateMeta();
    }

    function rebuild() {
      const query = norm(input.value.trim());
      const subject = select.value;
      filtered = teachers.filter((teacher) => {
        const matchesSubject = !subject || teacher.mapel === subject;
        const matchesText = !query || norm(teacher.nama).includes(query) || norm(teacher.mapel).includes(query);
        return matchesSubject && matchesText;
      });
      grid.textContent = "";
      shown = 0;

      if (!filtered.length) {
        grid.innerHTML = '<li class="mj-empty">Tidak ada guru yang cocok. Coba kata kunci lain atau pilih “Semua Mata Pelajaran”.</li>';
        updateMeta();
        return;
      }

      appendNext();
    }

    input.addEventListener("input", () => rebuild());
    select.addEventListener("change", rebuild);
    more.addEventListener("click", appendNext);
    rebuild();
  }

  function renderFacilities() {
    const list = $("#facilityGrid");
    if (!list) return;

    const source = facilities.length ? facilities : [];
    list.innerHTML = source.map((facility, index) => `
      <li class="fs-card rv" style="--d:${index % 4};">
        <div class="fs-card__media"><img src="${esc(facility.img)}" alt="${esc(facility.judul)}" loading="lazy" decoding="async" width="640" height="480"></div>
        <div class="fs-card__body">
          <h3 class="fs-card__title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18V6l9-4 9 4v12"/><path d="M3 18h18"/><path d="M8 9h8v9H8z"/></svg>${esc(facility.judul)}</h3>
          <p class="fs-card__desc">${esc(facility.desc)}</p>
        </div>
      </li>
    `).join("");
  }

  function renderTours() {
    const list = $("#tourGrid");
    if (!list) return;

    const source = tours.length ? tours : [];
    list.innerHTML = source.map((tour, index) => `
      <li class="rv" style="--d:${index % 3};">
        <button class="fs-spot" type="button" data-index="${index}" aria-label="Buka virtual tour 360°: ${esc(tour.judul)}">
          <img src="${esc(tour.src)}" alt="${esc(tour.judul)}" loading="lazy" decoding="async" width="640" height="400">
          <span class="fs-spot__chip">360°</span>
          <span class="fs-spot__label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${esc(tour.judul)}</span>
        </button>
      </li>
    `).join("");
  }

  async function boot() {
    initReveal();
    initCounters();
    initPhilosophyAccordion();
    const [teacherRows, facilityRows, tourRows] = await Promise.all([
      supabaseData.getTeachers().catch(() => []),
      supabaseData.getFacilities().catch(() => []),
      supabaseData.getGalleries().catch((error) => {
        console.error("Gagal memuat galeri sekolah:", error);
        return null;
      })
    ]);

    const teacherRecords = Array.isArray(teacherRows) ? teacherRows : [];
    renderHistoryGallery(tourRows || [], tourRows === null);
    renderVicePrincipals(teacherRecords);
    teachers = normalizeTeachers(teacherRecords.filter((row) => !isVicePrincipal(row)));
    facilities = normalizeFacilities(facilityRows);
    tours = normalizeTours(tourRows);

    initStaff();
    renderFacilities();
    renderTours();
    initToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
