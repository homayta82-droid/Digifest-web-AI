/**
 * Supabase Data Client — SMA Negeri 1 Singaraja
 * Optimized: In-memory config caching & Stale-While-Revalidate table caching
 */
(function () {
  const CONFIG_URL = '/api/config';
  let configPromise = null;
  const memoryCache = new Map();
  const CACHE_TTL_MS = 60_000; // 60 detik

  async function loadConfig() {
    if (!configPromise) {
      configPromise = fetch(CONFIG_URL)
        .then((res) => {
          if (!res.ok) throw new Error('Supabase config unavailable');
          return res.json();
        })
        .catch((err) => {
          configPromise = null; // reset if failed so retry is possible
          throw err;
        });
    }
    return configPromise;
  }

  async function fetchRemoteTable(tableName, options, url, key) {
    const params = new URLSearchParams();
    params.set('select', options.select || '*');
    if (options.order) params.set('order', options.order);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.eq) {
      Object.entries(options.eq).forEach(([field, value]) => {
        params.set(field, `eq.${value}`);
      });
    }
    if (options.neq) {
      Object.entries(options.neq).forEach(([field, value]) => {
        params.set(field, `neq.${value}`);
      });
    }

    const requestUrl = new URL(`${url.replace(/\/$/, '')}/rest/v1/${tableName}`);
    requestUrl.search = params.toString();

    const response = await fetch(requestUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase query failed for ${tableName}: ${text}`);
    }

    const payload = await response.json();
    return Array.isArray(payload) ? payload : [];
  }

  async function getTable(tableName, options = {}) {
    const cacheKey = `${tableName}:${JSON.stringify(options)}`;
    const now = Date.now();
    const cached = memoryCache.get(cacheKey);

    // If cache is fresh, return immediately
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const { url, key } = await loadConfig();
    if (!url || !key) return cached ? cached.data : [];

    // If stale cache exists, revalidate in background and return cached
    if (cached) {
      fetchRemoteTable(tableName, options, url, key)
        .then((data) => {
          memoryCache.set(cacheKey, { data, timestamp: Date.now() });
        })
        .catch(() => {});
      return cached.data;
    }

    // Otherwise fetch freshly
    const data = await fetchRemoteTable(tableName, options, url, key);
    memoryCache.set(cacheKey, { data, timestamp: now });
    return data;
  }

  window.smansaSupabase = {
    getTable,
    async getAnnouncements() { return getTable('announcements', { order: 'start_date.desc' }); },
    async getNews() { return getTable('news', { order: 'published_at.desc' }); },
    async getAchievements() { return getTable('achievements', { order: 'achievement_date.desc' }); },
    async getTeachers() { return getTable('teachers', { order: 'sort_order.asc' }); },
    async getFacilities() { return getTable('facilities', { order: 'sort_order.asc' }); },
    async getAlumni() { return getTable('alumni', { order: 'graduation_year.desc' }); },
    async getGalleries() { return getTable('galleries', { order: 'event_date.desc' }); },
    async getPrograms() { return getTable('programs', { order: 'sort_order.asc' }); },
    async getCareerOpenings() { return getTable('career_openings', { order: 'deadline.asc' }); },
    async getExtracurriculars() { return getTable('extracurriculars', { order: 'name.asc' }); },
    async getSCSContents() { return getTable('scs_contents', { eq: { status: 'published' }, order: 'sort_order.asc,event_date.desc' }); }
  };
})();
