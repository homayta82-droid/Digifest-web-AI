/* =========================================================
   SMAN 1 Singaraja — Penanganan gambar yang gagal dimuat.
   Mengganti ikon gambar rusak dengan placeholder navy yang ringan
   (SVG inline) agar tata letak tetap rapi. Berlaku juga untuk gambar
   yang dibuat lewat JavaScript. Dimuat di <head>, tanpa dependensi.
   ========================================================= */
(() => {
  "use strict";
  const PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0a2e68"/><stop offset="1" stop-color="#001b4c"/></linearGradient></defs>' +
    '<rect width="400" height="300" fill="url(#g)"/>' +
    '<circle cx="200" cy="150" r="34" fill="none" stroke="#fecb00" stroke-opacity=".55" stroke-width="3"/>' +
    '<path d="M186 158l10-12 8 9 6-7 14 18z" fill="#fecb00" fill-opacity=".55"/></svg>'
  );

  function swap(img) {
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
    if (img.hasAttribute("data-remove-on-error")) {
      img.remove();
      return;
    }
    img.dataset.fallback = "1";
    img.removeAttribute("srcset");
    img.src = PLACEHOLDER;
  }

  // Error tidak bubbling, jadi dipasang pada fase capture sedini mungkin.
  document.addEventListener("error", (e) => swap(e.target), true);

  // Gambar yang sudah gagal sebelum listener aktif.
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img[data-local-placeholder]").forEach((img) => {
      img.dataset.fallback = "1";
      img.src = PLACEHOLDER;
    });
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap(img);
    });
  });
})();
