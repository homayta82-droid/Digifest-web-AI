(() => {
  "use strict";

  const grid = document.querySelector("#ikGallery");
  const supabase = window.smansaSupabase || { getGalleries: async () => [] };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }

  async function renderGallery() {
    if (!grid) return;

    const rows = await supabase.getGalleries().catch(() => []);
    const items = (Array.isArray(rows) ? rows : []).filter((row) => row.image_url || row.img);
    if (!items.length) {
      grid.innerHTML = '<p class="ik-gallery__empty">Belum ada dokumentasi kegiatan. Foto kegiatan akan ditampilkan di sini.</p>';
      grid.setAttribute("aria-busy", "false");
      return;
    }

    grid.innerHTML = items.map((item) => {
      const title = item.title || item.name || "Kegiatan alumni";
      const description = item.description || item.detail || "";
      const date = formatDate(item.event_date || item.date);
      return `
        <figure class="ik-gallery__item">
          <div class="ik-gallery__image"><img src="${esc(item.image_url || item.img)}" alt="${esc(title)}" loading="lazy" decoding="async"></div>
          <figcaption>
            <h3>${esc(title)}</h3>
            ${description ? `<p>${esc(description)}</p>` : ""}
            ${date ? `<time datetime="${esc(item.event_date || item.date)}">${esc(date)}</time>` : ""}
          </figcaption>
        </figure>
      `;
    }).join("");
    grid.setAttribute("aria-busy", "false");
  }

  renderGallery();
})();
