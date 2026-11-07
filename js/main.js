/* ==========================================================
   SMA NEGERI 1 SINGARAJA — js/main.js
   Optimized: Dead code removed, zero-scroll-listener architecture
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Animasi reveal saat elemen masuk viewport ---------- */
  const animatedEls = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });

    animatedEls.forEach((el) => revealObserver.observe(el));
  } else {
    animatedEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ---------- Informasi terbaru dari sumber data bersama ---------- */
  const homeAnnouncements = document.getElementById('homeAnnouncements');
  const homeNews = document.getElementById('homeNews');
  const homeAchievements = document.getElementById('homeAchievements');

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const textValue = (value) => Array.isArray(value) ? value.join(' ') : String(value || '').trim();
  const dateValue = (record, fields) => {
    const value = fields.map((field) => record[field]).find(Boolean);
    const timestamp = Date.parse(value || '');
    return Number.isNaN(timestamp) ? 0 : timestamp;
  };
  const sortNewest = (rows, fields) => (Array.isArray(rows) ? rows : [])
    .slice()
    .sort((a, b) => dateValue(b, fields) - dateValue(a, fields));
  const setEmptyState = (element, message) => {
    if (!element) return;
    element.innerHTML = `<li class="home-data-empty">${escapeHtml(message)}</li>`;
    element.setAttribute('aria-busy', 'false');
  };

  async function loadHomepageUpdates() {
    if (!homeAnnouncements || !homeNews || !homeAchievements) return;

    const data = window.smansaSupabase;
    if (!data) {
      setEmptyState(homeAnnouncements, 'Pengumuman belum tersedia.');
      setEmptyState(homeNews, 'Berita belum tersedia.');
      setEmptyState(homeAchievements, 'Prestasi belum tersedia.');
      return;
    }

    const results = await Promise.allSettled([
      data.getAnnouncements(),
      data.getNews(),
      data.getAchievements()
    ]);
    const [announcementsResult, newsResult, achievementsResult] = results;
    const announcements = announcementsResult.status === 'fulfilled'
      ? sortNewest(announcementsResult.value, ['start_date', 'published_at', 'created_at'])
      : [];
    const news = newsResult.status === 'fulfilled'
      ? sortNewest(newsResult.value, ['published_at', 'created_at'])
      : [];
    const achievements = achievementsResult.status === 'fulfilled'
      ? sortNewest(achievementsResult.value, ['achievement_date', 'created_at'])
      : [];

    if (announcementsResult.status === 'rejected') console.error('Gagal memuat pengumuman beranda:', announcementsResult.reason);
    if (newsResult.status === 'rejected') console.error('Gagal memuat berita beranda:', newsResult.reason);
    if (achievementsResult.status === 'rejected') console.error('Gagal memuat prestasi beranda:', achievementsResult.reason);

    homeAnnouncements.innerHTML = announcements.length
      ? announcements.slice(0, 2).map((item) => {
        return `<li><a href="pages/informasi/pengumuman.html"><strong>${escapeHtml(item.title || 'Pengumuman')}</strong></a></li>`;
      }).join('')
      : '<li class="home-data-empty">Belum ada pengumuman.</li>';

    homeNews.innerHTML = news.length
      ? news.slice(0, 3).map((item) => {
        const title = item.title || 'Berita sekolah';
        const image = item.image_url || item.thumbnail_url || item.img || 'assets/images/gambar-sekolah.jpeg';
        return `<a class="berita-card" href="pages/informasi/berita.html"><div class="berita-img"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="400" height="286" loading="lazy" decoding="async"></div><p class="berita-caption">${escapeHtml(title)}</p></a>`;
      }).join('')
      : '<p class="home-data-empty">Belum ada berita.</p>';

    homeAchievements.innerHTML = achievements.length
      ? achievements.slice(0, 4).map((item) => {
        const title = item.competition_name || item.title || 'Prestasi';
        const level = item.category || item.level || 'Sekolah';
        const student = item.student_name || item.participant || '';
        const image = item.image_url || item.thumbnail_url || 'assets/info/prestasi/tes.webp';
        const detail = student ? `Tingkat ${level} · ${student}` : `Tingkat ${level}`;
        return `<a class="prestasi-card" href="pages/informasi/prestasi.html"><div class="prestasi-img"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" width="120" height="108" loading="lazy" decoding="async"></div><div class="prestasi-body"><span class="juara">${escapeHtml(item.achievement_level || item.award || 'Prestasi')}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p></div></a>`;
      }).join('')
      : '<p class="home-data-empty">Belum ada prestasi.</p>';

    [homeAnnouncements, homeNews, homeAchievements].forEach((element) => element.setAttribute('aria-busy', 'false'));
  }

  loadHomepageUpdates();

  /* ---------- Animasi counter angka statistik ---------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && statNumbers.length) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach((el) => statObserver.observe(el));
  } else {
    statNumbers.forEach(animateCount);
  }

  /* ---------- Slider universitas mitra ---------- */
  const universitySliderRoot = document.getElementById('uni-slider-root');

  if (universitySliderRoot && !universitySliderRoot.querySelector('.uni-slider')) {
    const universities = [
      ['assets/logo/logo-ui.svg', 'Universitas Indonesia'],
      ['assets/logo/logo-itb.webp', 'Institut Teknologi Bandung'],
      ['assets/logo/logo-ub.webp', 'Universitas Brawijaya'],
      ['assets/logo/logo-ugm.webp', 'Universitas Gadjah Mada'],
      ['assets/logo/logo-its.webp', 'Institut Teknologi Sepuluh Nopember'],
      ['assets/logo/logo-ipb.webp', 'Institut Pertanian Bogor'],
      ['assets/logo/logo-undiksha.webp', 'Universitas Pendidikan Ganesha'],
      ['assets/logo/logo-unud.webp', 'Universitas Udayana'],
      ['assets/logo/logo-unair.webp', 'Universitas Airlangga'],
      ['assets/logo/Logo-uns.webp', 'Universitas Sebelas Maret'],
    ];

    const makeSlide = ([src, name], index, duplicate = false) => `
      <figure class="uni-slide uni-slide--logo"${duplicate ? ' aria-hidden="true"' : ''}>
        <img src="${src}" alt="${duplicate ? '' : name}" width="200" height="200" ${duplicate ? '' : 'loading="lazy"'} decoding="async">
        <figcaption>${name}</figcaption>
      </figure>`;

    const slides = universities.map((item, index) => makeSlide(item, index)).join('')
      + universities.map((item, index) => makeSlide(item, index, true)).join('');

    universitySliderRoot.innerHTML = `
      <div class="uni-slider" role="region" aria-roledescription="carousel" aria-label="Universitas mitra" tabindex="0">
        <div class="uni-track">${slides}</div>
      </div>`;
  }

  /* ---------- Tombol kembali ke atas (IntersectionObserver, no scroll listener) ---------- */
  const backToTop = document.getElementById('backToTop');
  const heroSection = document.getElementById('beranda');

  if (backToTop) {
    if ('IntersectionObserver' in window && heroSection) {
      const topObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          backToTop.classList.toggle('visible', !entry.isIntersecting);
        });
      }, { threshold: 0.1 });
      topObserver.observe(heroSection);
    } else {
      const updateBackToTop = (scrollY) => backToTop.classList.toggle('visible', scrollY > 480);
      if (window.SmansaScroll) {
        window.SmansaScroll.subscribe(updateBackToTop);
      } else {
        window.addEventListener('scroll', () => updateBackToTop(window.scrollY), { passive: true });
      }
    }

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
