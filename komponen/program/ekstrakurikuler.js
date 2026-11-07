(function () {
  const supabase = window.smansaSupabase || { getExtracurriculars: async () => [] };
  const list = document.getElementById("ekList");
  const dialog = document.getElementById("ekDialog");

  const ICONS = {
    Akademik: '<path d="M12 3 2 8l10 5 10-5-10-5zM6 11v5c3 2.5 9 2.5 12 0v-5"/>',
    Seni: '<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.1-.4-1.1.2-2.4 1.6-2.4H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    Nonakademik: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"/>'
  };

  function esc(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function media(alt, imageUrl) {
    if (!imageUrl) return "";
    return `<img src="${esc(imageUrl)}" alt="${esc(alt)}" width="640" height="480" loading="lazy" decoding="async" data-remove-on-error>`;
  }

  function showMessage(message, type, retry = false) {
    if (!list) return;
    const role = type === "error" ? "alert" : "status";
    const retryButton = retry ? '<button class="ek-retry" type="button" data-ek-retry>Coba lagi</button>' : "";
    list.innerHTML = `<p class="ek-state ek-state--${type}" role="${role}">${esc(message)}${retryButton}</p>`;
  }

  function renderProgramGroup(category, entries) {
    if (!list) return;

    const section = document.createElement("section");
    section.className = "ek-sec";
    section.innerHTML = `
      <h2 class="ek-cat"><span class="ek-cat__ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[category] || ICONS.Akademik}</svg></span><span>${esc(category)}</span></h2>
      <div class="ek-grid"></div>
    `;

    const grid = section.querySelector(".ek-grid");
    if (category === "Akademik") grid.classList.add("ek-grid--logo");
    if (category === "Nonakademik") grid.classList.add("ek-grid--6");
    entries.forEach((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ek-card";
      button.innerHTML = `
        <span class="ek-card__img">${media(entry.title, entry.image_url)}</span>
        <span class="ek-card__body">
          <strong>${esc(entry.title || entry.name)}</strong>
          <span>${esc(entry.description || "")}</span>
          <i class="ek-card__go" aria-hidden="true">→</i>
        </span>
      `;

      button.addEventListener("click", () => {
        const title = document.getElementById("ekDlgTitle");
        const categoryNode = document.getElementById("ekDlgCat");
        const description = document.getElementById("ekDlgDesc");
        const image = document.getElementById("ekDlgImg");
        if (title) title.textContent = entry.title;
        if (categoryNode) categoryNode.textContent = category;
        if (description) description.textContent = entry.description;
        if (image) image.innerHTML = media(entry.title, entry.image_url);
        if (dialog) dialog.showModal();
      });

      grid.appendChild(button);
    });

    list.appendChild(section);
  }

  async function loadPrograms() {
    if (!list) return;
    list.setAttribute("aria-busy", "true");
    showMessage("Memuat data ekstrakurikuler...", "loading");

    let rows;
    try {
      rows = await supabase.getExtracurriculars();
    } catch (error) {
      console.error("Gagal memuat data ekstrakurikuler:", error);
      showMessage("Data ekstrakurikuler belum dapat dimuat.", "error", true);
      list.setAttribute("aria-busy", "false");
      return;
    }

    if (!Array.isArray(rows) || !rows.length) {
      showMessage("Belum ada data ekstrakurikuler", "empty");
      list.setAttribute("aria-busy", "false");
      return;
    }

    const groups = Object.assign(Object.create(null), { Akademik: [], Seni: [], Nonakademik: [] });

    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const category = String(row.category || "Lainnya").trim() || "Lainnya";
      const entry = {
        title: String(row.name || row.title || "Ekstrakurikuler").trim(),
        description: String(row.description || "").trim(),
        image_url: row.image_url || ""
      };

      if (!groups[category]) groups[category] = [];
      groups[category].push(entry);
    });

    const knownCategories = ["Akademik", "Seni", "Nonakademik"];
    const categories = Object.keys(groups).sort((a, b) => {
      const indexA = knownCategories.indexOf(a);
      const indexB = knownCategories.indexOf(b);
      if (indexA !== -1 || indexB !== -1) return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      return a.localeCompare(b, "id");
    });

    list.replaceChildren();
    categories.forEach((category) => {
      if (groups[category].length) renderProgramGroup(category, groups[category]);
    });
    list.setAttribute("aria-busy", "false");
  }

  if (list) list.addEventListener("click", (event) => {
    if (event.target.closest("[data-ek-retry]")) loadPrograms();
  });

  const closeButton = document.getElementById("ekClose");
  if (closeButton) closeButton.addEventListener("click", () => dialog && dialog.close());
  if (dialog) dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

  loadPrograms();
})();
