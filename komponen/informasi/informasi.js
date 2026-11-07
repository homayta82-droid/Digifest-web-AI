(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = (value) => String(value).replace(/[&<>\"']/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char]));
  const norm = (value) => String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const FALLBACK_IMG = [
    "../../assets/info/prestasi/tes.webp",
    "../../assets/images/gambar-sekolah.jpeg",
    "../../assets/images/sejarah-smansa.webp",
    "../../assets/images/header-home-1600.webp"
  ];

  const smansaData = window.smansaSupabase || {
    getAnnouncements: async () => [],
    getNews: async () => [],
    getAchievements: async () => []
  };

  const fmtLong = (iso) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T00:00:00`));

  const imgTag = (src, index, alt = "") =>
    `<img src="${esc(src || FALLBACK_IMG[index % FALLBACK_IMG.length])}" data-fb="${index}" alt="${esc(alt)}" loading="lazy" decoding="async" width="640" height="400">`;

  document.addEventListener("error", (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fb === undefined || image.dataset.fbDone) return;
    image.dataset.fbDone = "1";
    image.src = FALLBACK_IMG[Number(image.dataset.fb) % FALLBACK_IMG.length];
  }, true);

  function parseText(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(" ");
    return String(value).trim();
  }

  function toDateString(value) {
    if (!value) return new Date().toISOString().slice(0, 10);
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
  }

  function toParagraphs(value) {
    const text = parseText(value).replace(/\r/g, "\n");
    if (!text) return [];
    return text.split(/\n{2,}|\n/).map((item) => item.trim()).filter(Boolean);
  }

  function normalizeAnnouncements(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => {
      const content = toParagraphs(row.content);
      const summaryField = row.summary || row.excerpt;
      const summary = summaryField || content[0] || parseText(row.details).slice(0, 180);
      const detailSource = row.details
        ? toParagraphs(row.details)
        : summaryField
          ? content
          : content.slice(1);
      const comparableSummary = norm(summary).replace(/\s+/g, " ").trim();

      return {
        tgl: toDateString(row.start_date || row.published_at || row.created_at),
        kat: row.category || row.type || "Umum",
        pin: Boolean(row.is_featured || row.is_pinned),
        judul: row.title || "Judul belum tersedia",
        ringkas: summary,
        detail: detailSource.filter((entry) => norm(entry).replace(/\s+/g, " ").trim() !== comparableSummary)
      };
    });
  }

  function normalizeNews(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      tgl: toDateString(row.published_at || row.created_at),
      kat: row.category || row.type || "Kegiatan",
      img: row.image_url || row.thumbnail_url || row.img || "../../assets/images/gambar-sekolah.jpeg",
      judul: row.title || "Berita belum tersedia",
      ringkas: row.summary || row.excerpt || parseText(row.content).slice(0, 180),
      isi: toParagraphs(row.content || row.summary)
    }));
  }

  function normalizeAchievements(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      juara: row.achievement_level || row.award || "Juara",
      lomba: row.competition_name || row.title || "Prestasi",
      tingkat: row.category || row.level || "Nasional",
      siswa: row.student_name || row.participant || "Siswa SMANSA",
      tahun: Number(String(row.achievement_date || row.created_at || new Date().getFullYear()).slice(0, 4)) || new Date().getFullYear(),
      penyelenggara: row.organizer || row.event_name || "Sekolah",
      img: row.image_url || row.thumbnail_url || "../../assets/info/prestasi/tes.webp"
    }));
  }

  function collection(options) {
    const list = $(options.list);
    if (!list) return;
    list.removeAttribute("aria-busy");

    const count = $("#infCount");
    const search = $("#infSearch");
    const more = $("#infMore");
    const chipsEl = $("#infChips");
    const select = $("#infSelect");

    let cat = "";
    let extra = "";
    let filtered = [...options.data];
    let shown = 0;
    const pageSize = options.pageSize || 100;

    function updateMeta() {
      if (count) {
        count.textContent = filtered.length
          ? `Menampilkan ${Math.min(shown, filtered.length)} dari ${filtered.length} ${options.noun}`
          : "";
      }
      if (more) more.hidden = shown >= filtered.length;
    }

    function appendNext() {
      const next = filtered.slice(shown, shown + pageSize);
      if (!next.length) return;
      const fragment = document.createElement("template");
      fragment.innerHTML = next.map((item, i) => options.render(item, i, shown + i)).join("");
      list.appendChild(fragment.content);
      shown += next.length;
      updateMeta();
    }

    function rebuild() {
      const query = norm(search ? search.value.trim() : "");
      filtered = options.data.filter((item) => {
        if (cat && item[options.catKey] !== cat) return false;
        if (extra && String(item[options.extraKey]) !== String(extra)) return false;
        return !query || norm(options.haystack(item)).includes(query);
      });
      list.textContent = "";
      shown = 0;

      if (!filtered.length) {
        list.innerHTML = `<li class="inf-empty">Tidak ada ${options.noun} yang cocok. Coba kata kunci lain atau ubah filter.</li>`;
        updateMeta();
        return;
      }

      appendNext();
    }

    if (chipsEl && options.catKey) {
      const categories = ["", ...new Set(options.data.map((item) => item[options.catKey]))];
      chipsEl.innerHTML = categories
        .map((entry) => `<button class="inf-chip" type="button" data-cat="${esc(entry)}" aria-pressed="${entry === ""}">${entry || "Semua"}</button>`)
        .join("");

      chipsEl.addEventListener("click", (event) => {
        const button = event.target.closest(".inf-chip");
        if (!button) return;
        cat = button.dataset.cat || "";
        chipsEl.querySelectorAll(".inf-chip").forEach((chip) => chip.setAttribute("aria-pressed", String(chip === button)));
        rebuild();
      });
    }

    if (select && options.extraKey) {
      const values = [...new Set(options.data.map((item) => item[options.extraKey]))].sort((a, b) => String(b).localeCompare(String(a)));
      values.forEach((value) => select.appendChild(new Option(value, value)));
      select.addEventListener("change", () => {
        extra = select.value;
        rebuild();
      });
    }

    if (search) {
      let timerId;
      search.addEventListener("input", () => {
        clearTimeout(timerId);
        timerId = setTimeout(rebuild, 160);
      });
    }

    if (more) more.addEventListener("click", appendNext);
    rebuild();
  }

  function showListSkeleton() {
    const list = $("#infList");
    if (!list) return;
    list.setAttribute("aria-busy", "true");
    list.innerHTML = Array.from({ length: 3 }, () =>
      '<li class="inf-skeleton" aria-hidden="true"><span></span><i></i><b></b></li>'
    ).join("");
  }

  function accordion(listEl, itemSelector) {
    if (!listEl) return;

    listEl.addEventListener("click", (event) => {
      const button = event.target.closest(".inf-toggle");
      if (!button) return;
      const item = button.closest(itemSelector);
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
      const label = button.querySelector("span");
      if (label) label.textContent = isOpen ? button.dataset.close : button.dataset.open;
    });
  }

  async function pagePengumuman() {
    showListSkeleton();
    const data = normalizeAnnouncements(await smansaData.getAnnouncements())
      .sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.tgl.localeCompare(a.tgl));

    collection({
      data,
      list: "#infList",
      noun: "pengumuman",
      catKey: "kat",
      pageSize: 5,
      haystack: (item) => `${item.judul} ${item.ringkas} ${item.kat}`.toLowerCase(),
      render: (item, index, startIndex) => {
        const date = new Date(`${item.tgl}T00:00:00`);
        const hasDetails = Array.isArray(item.detail) && item.detail.length > 0;
        const detailPanel = hasDetails
          ? `<div class="inf-panel" id="ann-${startIndex}"><div><ul>${item.detail.map((entry) => `<li>${esc(entry)}</li>`).join("")}</ul></div></div><button class="inf-toggle" type="button" aria-expanded="false" aria-controls="ann-${startIndex}" data-open="Baca selengkapnya" data-close="Tutup"><span>Baca selengkapnya</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`
          : "";

        return (`
          <li class="inf-ann inf-in${item.pin ? " inf-ann--pin" : ""}" style="--i:${index}">
            <div class="inf-date" aria-label="${esc(fmtLong(item.tgl))}"><b>${date.getDate()}</b><span>${MONTHS[date.getMonth()]} ${date.getFullYear()}</span></div>
            <div>
              <div class="inf-ann__meta"><span class="inf-tag${item.pin ? " inf-tag--gold" : ""}">${esc(item.kat)}</span>${item.pin ? '<span class="inf-ann__pin">Disematkan</span>' : ""}</div>
              <h2 class="inf-ann__title">${esc(item.judul)}</h2>
              <p class="inf-ann__sum">${esc(item.ringkas)}</p>
              ${detailPanel}
            </div>
          </li>
        `);
      }
    });

    accordion($("#infList"), ".inf-ann");
  }

  async function pageBerita() {
    showListSkeleton();
    const sorted = normalizeNews(await smansaData.getNews()).sort((a, b) => b.tgl.localeCompare(a.tgl));
    const [top, ...rest] = sorted;
    const feature = $("#infFeatured");

    if (feature && top) {
      feature.innerHTML = `
        <div class="inf-feature__media">${imgTag(top.img, 0, top.judul)}</div>
        <div class="inf-feature__body">
          <span class="inf-tag inf-tag--gold">Berita Utama &middot; ${esc(top.kat)}</span>
          <h2 class="inf-feature__title">${esc(top.judul)}</h2>
          <p class="inf-feature__sum">${esc(top.ringkas)}</p>
          <p class="inf-meta">${esc(fmtLong(top.tgl))}</p>
        </div>
      `;
    }

    const all = [top, ...rest].filter(Boolean);
    const listData = rest.length ? rest.map((item, index) => ({ ...item, _idx: index + 1 })) : (top ? [{ ...top, _idx: 0 }] : []);
    const reader = $("#infReader");

    function openReader(index) {
      const item = all[index];
      if (!item || !reader) return;
      $("#rdImg").src = item.img || FALLBACK_IMG[0];
      $("#rdImg").dataset.fb = String(index);
      delete $("#rdImg").dataset.fbDone;
      $("#rdTag").textContent = item.kat;
      $("#rdTitle").textContent = item.judul;
      $("#rdMeta").textContent = fmtLong(item.tgl);
      $("#rdText").innerHTML = (item.isi && item.isi.length ? item.isi : [item.ringkas]).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
      if (!reader.open) reader.showModal();
      document.documentElement.classList.add("no-scroll");
      $(".inf-reader__scroll", reader).scrollTop = 0;
    }

    if (reader) {
      reader.addEventListener("close", () => document.documentElement.classList.remove("no-scroll"));
      $("#rdClose").addEventListener("click", () => reader.close());
      reader.addEventListener("click", (event) => { if (event.target === reader) reader.close(); });
    }

    if (feature && top) feature.addEventListener("click", () => openReader(0));

    collection({
      data: listData,
      list: "#infList",
      noun: "berita",
      catKey: "kat",
      pageSize: 6,
      haystack: (item) => `${item.judul} ${item.ringkas} ${item.kat}`.toLowerCase(),
      render: (item) => `
        <li class="inf-in"><button class="inf-card" type="button" data-idx="${item._idx}" style="width:100%;height:100%">
          <span class="inf-card__media">${imgTag(item.img, item._idx, item.judul)}</span>
          <span class="inf-card__body">
            <span><span class="inf-tag">${esc(item.kat)}</span></span>
            <span class="inf-card__title">${esc(item.judul)}</span>
            <span class="inf-card__sum">${esc(item.ringkas)}</span>
            <span class="inf-meta">${esc(fmtLong(item.tgl))}</span>
          </span>
        </button></li>
      `
    });

    const list = $("#infList");
    if (list) {
      list.addEventListener("click", (event) => {
        const card = event.target.closest(".inf-card");
        if (card) openReader(Number(card.dataset.idx));
      });
    }
  }

  function countUp(element, target) {
    if (reduceMotion) {
      element.textContent = String(target);
      return;
    }

    const start = performance.now();
    const duration = 1200;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  async function pagePrestasi() {
    showListSkeleton();
    const items = normalizeAchievements(await smansaData.getAchievements());
    const stats = [
      { n: items.length, label: "Total prestasi" },
      { n: items.filter((item) => String(item.juara).toLowerCase().includes("juara 1")).length, label: "Juara 1" },
      { n: items.filter((item) => ["Nasional", "Internasional"].includes(String(item.tingkat))).length, label: "Tingkat nasional & internasional" },
      { n: new Set(items.map((item) => item.lomba)).size, label: "Bidang lomba" }
    ];

    const statsBox = $("#infStats");
    if (statsBox) {
      statsBox.innerHTML = stats.map((stat) => `<div class="inf-stat rv"><b data-n="${stat.n}">0</b><span>${esc(stat.label)}</span></div>`).join("");

      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            countUp($("b", entry.target), Number($("b", entry.target).dataset.n));
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.4 });

        statsBox.querySelectorAll(".inf-stat").forEach((element) => observer.observe(element));
      } else {
        statsBox.querySelectorAll(".inf-stat").forEach((element) => countUp($("b", element), Number($("b", element).dataset.n)));
      }
    }

    const data = items.slice().sort((a, b) => b.tahun - a.tahun);
    collection({
      data,
      list: "#infList",
      noun: "prestasi",
      catKey: "tingkat",
      extraKey: "tahun",
      pageSize: 6,
      haystack: (item) => `${item.lomba} ${item.siswa} ${item.juara} ${item.penyelenggara} ${item.tingkat} ${item.tahun}`.toLowerCase(),
      render: (item, index, startIndex) => `
        <li class="inf-card inf-prs inf-in" style="--i:${index}">
          <div class="inf-card__media"><span class="inf-medal">${esc(item.juara)}</span>${imgTag(item.img, startIndex, item.lomba)}</div>
          <div class="inf-card__body">
            <h3 class="inf-card__title">${esc(item.lomba)}</h3>
            <p class="inf-prs__who">${esc(item.siswa)}</p>
            <p class="inf-card__sum">Diselenggarakan oleh ${esc(item.penyelenggara)}</p>
            <div class="inf-prs__foot"><span class="inf-tag">${esc(item.tingkat)}</span><span class="inf-tag">${item.tahun}</span></div>
          </div>
        </li>
      `
    });
  }

  function pageKarier() {
    const cards = [...document.querySelectorAll("[data-scholarship-category]")];
    const panel = $("#scholarshipResults");
    const heading = $("#scholarshipResultsTitle");
    const list = $("#scholarshipList");
    if (!cards.length || !panel || !heading || !list) return;

    const categoryLabels = new Map(cards.map((card) => [card.dataset.scholarshipCategory, $("h3", card).textContent]));
    let scholarships = [];
    let loadFailed = false;

    smansaData.getCareerOpenings()
      .then((rows) => { scholarships = Array.isArray(rows) ? rows : []; })
      .catch(() => { loadFailed = true; });

    cards.forEach((card) => card.addEventListener("click", async () => {
      const category = card.dataset.scholarshipCategory;
      cards.forEach((item) => item.setAttribute("aria-pressed", String(item === card)));
      heading.textContent = categoryLabels.get(category) || "Daftar Beasiswa";
      panel.hidden = false;
      list.innerHTML = '<p class="inf-empty">Memuat daftar beasiswa...</p>';

      if (!scholarships.length && !loadFailed) {
        try {
          const rows = await smansaData.getCareerOpenings();
          scholarships = Array.isArray(rows) ? rows : [];
        } catch {
          loadFailed = true;
        }
      }

      const matching = scholarships.filter((item) => item.category === category && (item.status || "published") === "published");
      if (!matching.length) {
        list.innerHTML = `<p class="inf-empty">${loadFailed ? "Data beasiswa belum tersedia. Hubungi pengelola website untuk menyiapkan daftar beasiswa." : "Belum ada beasiswa pada kategori ini."}</p>`;
        return;
      }

      list.innerHTML = matching.map((item) => {
        const title = item.title || "Beasiswa";
        const image = item.image_url
          ? `<img src="${esc(item.image_url)}" alt="${esc(title)}" loading="lazy" decoding="async" width="720" height="480">`
          : '<div class="inf-scholarship-item__no-image">Foto belum tersedia</div>';
        const deadline = item.deadline ? esc(fmtLong(String(item.deadline).slice(0, 10))) : "Belum ditentukan";
        const counseling = item.counseling_schedule
          ? `<div class="inf-scholarship-item__counseling"><h4>Jadwal konseling</h4><p>${esc(item.counseling_schedule)}</p><a href="../kontak/kontak.html">Tanyakan atau minta jadwal konseling</a></div>`
          : `<div class="inf-scholarship-item__counseling"><h4>Butuh konseling?</h4><p>Siswa dapat menghubungi sekolah untuk meminta jadwal konseling.</p><a href="../kontak/kontak.html">Hubungi sekolah</a></div>`;

        return `<article class="inf-scholarship-item"><div class="inf-scholarship-item__image">${image}</div><div class="inf-scholarship-item__body"><h3>${esc(title)}</h3><p class="inf-scholarship-item__description">${esc(item.description || "Informasi beasiswa belum ditambahkan.")}</p><dl><div><dt>Penyelenggara</dt><dd>${esc(item.organizer || "Belum tersedia")}</dd></div><div><dt>Tenggat pendaftaran</dt><dd>${deadline}</dd></div></dl>${counseling}</div></article>`;
      }).join("");
    }));
  }

  function initReveal() {
    const items = document.querySelectorAll(".rv");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((element) => element.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

    items.forEach((element) => observer.observe(element));
  }

  function initToTop() {
    const button = $("#toTop");
    if (!button) return;

    window.SmansaScroll.subscribe((scrollY) => button.classList.toggle("show", scrollY > 480));

    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }

  const pages = {
    pengumuman: pagePengumuman,
    berita: pageBerita,
    prestasi: pagePrestasi,
    karier: pageKarier
  };

  const pageName = document.body?.dataset?.page;
  const run = pageName && pages[pageName];
  if (run) run();
  initReveal();
  initToTop();
})();
