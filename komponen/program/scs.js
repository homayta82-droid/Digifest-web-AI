(function () {
  const supabase = window.smansaSupabase || { getSCSContents: async () => [] };
  const root = document.getElementById("scSlider");
  const slidesRoot = document.getElementById("scSlides");
  const sliderState = document.getElementById("scSliderState");
  const projectsRoot = document.getElementById("scProjects");
  const infoList = document.getElementById("scInfoList");
  const spotlightsRoot = document.getElementById("scSpotlights");
  const gallery = document.getElementById("scGallery");
  const stage = document.getElementById("scStage");
  const ring = document.getElementById("scRing");
  const caption = document.getElementById("scCap");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EMPTY_MESSAGE = "Data belum ditambahkan.";

  if (!root && !gallery && !ring && !caption) return;

  let items = [];
  let currentIndex = 0;
  let angle = 0;
  let rotationVelocity = 0;
  let previousTime = 0;
  let rafId = null;
  let dragMode = false;
  let stageVisible = false;
  let reduceMotion = motionPreference.matches;
  let pointerLastX = 0;

  function normalizeContent(rows) {
    return (Array.isArray(rows) ? rows : []).map((row) => ({
      title: String(row.title || "Karya siswa").trim(),
      section: row.section || "spotlight",
      category: String(row.category || "Kegiatan").trim(),
      description: String(row.description || "").trim(),
      imageUrl: row.image_url || "",
      eventDate: row.event_date || ""
    })).filter((item) => ["hero", "project", "information", "spotlight"].includes(item.section));
  }

  function makeImage(src, alt, placeholderClass) {
    if (!src) {
      const placeholder = document.createElement("span");
      placeholder.className = placeholderClass;
      placeholder.setAttribute("aria-hidden", "true");
      return placeholder;
    }
    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once: true });
    return image;
  }

  function setEmptyState(container, tagName, message) {
    if (!container) return;
    const state = document.createElement(tagName);
    state.className = "sc-empty";
    state.textContent = message;
    container.replaceChildren(state);
  }

  function updateStats(data, projects, spotlights, information) {
    const counts = {
      works: data.filter((item) => item.section !== "information").length,
      projects: projects.length,
      spotlights: spotlights.length,
      information: information.length
    };
    Object.entries(counts).forEach(([name, count]) => {
      const node = document.querySelector(`[data-scs-count="${name}"]`);
      if (node) node.textContent = String(count);
    });
  }

  function buildRing(data) {
    if (!ring) return;
    ring.innerHTML = "";
    items = data;
    items.forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "sc-item";
      figure.style.transform = `rotateY(${index * (360 / items.length)}deg) translateZ(var(--r))`;
      figure.appendChild(makeImage(item.imageUrl, item.title, "sc-item__placeholder"));
      const caption = document.createElement("figcaption");
      caption.textContent = item.title;
      figure.appendChild(caption);
      ring.appendChild(figure);
    });
  }

  function makeTag(label, className = "sc-tag") {
    const tag = document.createElement("span");
    tag.className = className;
    tag.textContent = label;
    return tag;
  }

  function renderSlides(data) {
    if (!slidesRoot || !sliderState) return;
    slidesRoot.replaceChildren();
    if (!data.length) {
      sliderState.hidden = false;
      sliderState.textContent = EMPTY_MESSAGE;
      return;
    }
    sliderState.hidden = true;
    data.slice(0, 5).forEach((item, index) => {
      const slide = document.createElement("article");
      slide.className = `sc-slide${index === 0 ? " is-on" : ""}`;
      slide.appendChild(makeImage(item.imageUrl, item.title, "sc-slide__placeholder"));
      const body = document.createElement("div");
      body.className = "sc-slide__cap";
      body.appendChild(makeTag(item.category));
      const title = document.createElement("h2");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      body.append(title, description);
      slide.appendChild(body);
      slidesRoot.appendChild(slide);
    });
  }

  function renderProjects(data) {
    if (!projectsRoot) return;
    projectsRoot.replaceChildren();
    if (!data.length) {
      setEmptyState(projectsRoot, "p", EMPTY_MESSAGE);
      return;
    }
    data.slice(0, 2).forEach((item) => {
      const project = document.createElement("article");
      project.className = "sc-proj";
      project.appendChild(makeImage(item.imageUrl, item.title, "sc-proj__placeholder"));
      project.appendChild(makeTag(item.category, "sc-tag sc-tag--blue sc-proj__tag"));
      const body = document.createElement("div");
      body.className = "sc-proj__body";
      const title = document.createElement("h3");
      title.textContent = item.title;
      const description = document.createElement("p");
      description.textContent = item.description;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sc-btn sc-btn--gold sc-btn--sm";
      button.textContent = "Lihat Karya →";
      button.addEventListener("click", () => gallery && gallery.showModal());
      body.append(title, description, button);
      project.appendChild(body);
      projectsRoot.appendChild(project);
    });
  }

  function renderInformation(data) {
    if (!infoList) return;
    infoList.replaceChildren();
    if (!data.length) {
      setEmptyState(infoList, "li", EMPTY_MESSAGE);
      return;
    }
    data.slice(0, 3).forEach((item) => {
      const entry = document.createElement("li");
      const date = document.createElement("time");
      date.className = "sc-date";
      if (item.eventDate) {
        const parsedDate = new Date(`${item.eventDate}T00:00:00`);
        if (!Number.isNaN(parsedDate.getTime())) {
          date.dateTime = item.eventDate;
          const day = document.createElement("b");
          day.textContent = new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(parsedDate);
          date.append(day, document.createTextNode(new Intl.DateTimeFormat("id-ID", { month: "short" }).format(parsedDate).toUpperCase()));
        }
      }
      const content = document.createElement("div");
      const title = document.createElement("strong");
      title.textContent = item.title;
      const category = document.createElement("span");
      category.className = "sc-chip";
      category.textContent = item.category;
      content.append(title, category);
      if (date.childNodes.length) entry.appendChild(date);
      entry.appendChild(content);
      infoList.appendChild(entry);
    });
  }

  function renderSpotlights(data) {
    if (!spotlightsRoot) return;
    spotlightsRoot.replaceChildren();
    if (!data.length) {
      setEmptyState(spotlightsRoot, "p", EMPTY_MESSAGE);
      return;
    }
    data.slice(0, 4).forEach((item) => {
      const card = document.createElement("article");
      card.className = "sc-news";
      card.appendChild(makeImage(item.imageUrl, item.title, "sc-news__placeholder"));
      card.appendChild(makeTag(item.category, "sc-tag sc-tag--blue"));
      const title = document.createElement("strong");
      title.textContent = item.title;
      const date = document.createElement("time");
      date.textContent = item.eventDate ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${item.eventDate}T00:00:00`)) : "";
      card.append(title, date);
      spotlightsRoot.appendChild(card);
    });
  }

  function renderCaption() {
    if (caption && items.length) {
      caption.textContent = items[currentIndex].title;
    }
  }

  function renderRotation() {
    if (!ring || !items.length) return;
    ring.style.transform = `rotateY(${angle}deg)`;
    const index = ((Math.round(-angle / (360 / items.length)) % items.length) + items.length) % items.length;
    if (index !== currentIndex) {
      currentIndex = index;
      renderCaption();
    }
  }

  function canAnimate() {
    return Boolean(stageVisible && !document.hidden && !reduceMotion && items.length);
  }

  function syncAnimation() {
    if (canAnimate() && !rafId) {
      previousTime = performance.now();
      rafId = requestAnimationFrame(animationLoop);
    } else if (!canAnimate() && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function animationLoop(timestamp) {
    rafId = null;
    if (!canAnimate()) return;
    if (!items.length) return;
    const delta = Math.min((timestamp - previousTime) / 1000 || 0.016, 0.05);
    previousTime = timestamp;
    if (!dragMode) {
      rotationVelocity += (0.4 - rotationVelocity) * (1 - Math.exp(-delta * 2.2));
      angle += rotationVelocity * 60 * delta;
    }
    renderRotation();
    if (canAnimate()) rafId = requestAnimationFrame(animationLoop);
  }

  function goTo(index) {
    if (!items.length) return;
    currentIndex = (index + items.length) % items.length;
    angle = currentIndex * -(360 / items.length);
    renderRotation();
  }

  function attachSlider() {
    if (!root) return;
    const slides = root.querySelectorAll(".sc-slide");
    if (!slides.length) return;

    let currentSlide = 0;
    const dots = document.getElementById("scDots");
    if (dots) {
      dots.innerHTML = "";
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Slide ${index + 1}`);
        dot.addEventListener("click", () => {
          currentSlide = index;
          slides.forEach((slide, slideIndex) => slide.classList.toggle("is-on", slideIndex === currentSlide));
          Array.from(dots.children).forEach((dotNode, dotIndex) => dotNode.classList.toggle("is-on", dotIndex === currentSlide));
        });
        dots.appendChild(dot);
      });
    }

    function showSlide(index) {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("is-on", slideIndex === currentSlide));
      if (dots) Array.from(dots.children).forEach((dot, dotIndex) => dot.classList.toggle("is-on", dotIndex === currentSlide));
    }

    showSlide(0);
    let timer = setInterval(() => showSlide(currentSlide + 1), 5000);
    root.querySelectorAll(".sc-arrow").forEach((btn) => {
      btn.addEventListener("click", () => {
        showSlide(currentSlide + (btn.classList.contains("sc-arrow--next") ? 1 : -1));
        clearInterval(timer);
        timer = setInterval(() => showSlide(currentSlide + 1), 5000);
      });
    });
  }

  async function loadData() {
    try {
      const rows = await supabase.getSCSContents();
      const data = normalizeContent(rows);
      const hero = data.filter((item) => item.section === "hero");
      const projects = data.filter((item) => item.section === "project");
      const information = data.filter((item) => item.section === "information");
      const spotlights = data.filter((item) => item.section === "spotlight");

      updateStats(data, projects, spotlights, information);
      renderSlides(hero);
      renderProjects(projects);
      renderInformation(information);
      renderSpotlights(spotlights);
      buildRing(data.filter((item) => item.imageUrl));
      renderCaption();
      if (caption && !items.length) caption.textContent = EMPTY_MESSAGE;
      attachSlider();
      syncAnimation();
    } catch (error) {
      console.error("Gagal memuat konten SCS:", error);
      const message = EMPTY_MESSAGE;
      if (sliderState) {
        sliderState.hidden = false;
        sliderState.textContent = message;
        sliderState.setAttribute("role", "alert");
      }
      setEmptyState(projectsRoot, "p", message);
      setEmptyState(infoList, "li", message);
      setEmptyState(spotlightsRoot, "p", message);
      updateStats([], [], [], []);
      buildRing([]);
    }
  }

  if (gallery) {
    gallery.addEventListener("close", () => {
      stageVisible = false;
      syncAnimation();
    });
    const closeButton = document.getElementById("scGalClose");
    if (closeButton) closeButton.addEventListener("click", () => gallery.close());
    gallery.addEventListener("click", (event) => { if (event.target === gallery) gallery.close(); });
    document.querySelectorAll("[data-open-gallery]").forEach((button) => {
      button.addEventListener("click", () => gallery.showModal());
    });
  }

  if (stage && "IntersectionObserver" in window) {
    const stageObserver = new IntersectionObserver(([entry]) => {
      stageVisible = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0.1 });
    stageObserver.observe(stage);
  } else if (gallery) {
    const syncDialogVisibility = () => {
      stageVisible = gallery.open;
      syncAnimation();
    };
    const dialogObserver = new MutationObserver(syncDialogVisibility);
    dialogObserver.observe(gallery, { attributes: true, attributeFilter: ["open"] });
  }

  document.addEventListener("visibilitychange", syncAnimation);
  motionPreference.addEventListener?.("change", (event) => {
    reduceMotion = event.matches;
    syncAnimation();
  });

  if (ring) {
    ring.addEventListener("pointerdown", (event) => {
      dragMode = true;
      pointerLastX = event.clientX;
      rotationVelocity = 0;
      ring.setPointerCapture(event.pointerId);
    });

    ring.addEventListener("pointermove", (event) => {
      if (!dragMode) return;
      const deltaX = event.clientX - pointerLastX;
      pointerLastX = event.clientX;
      angle += deltaX * 0.45;
      rotationVelocity = deltaX * 0.12;
      renderRotation();
    });

    ring.addEventListener("pointerup", () => { dragMode = false; });
    ring.addEventListener("pointercancel", () => { dragMode = false; });
  }

  loadData();
})();
