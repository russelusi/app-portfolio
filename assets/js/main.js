(() => {
  const root = document.documentElement;

  // Theme toggle: follows the system until the visitor picks one.
  const THEME_KEY = "portfolio-theme";
  const readTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  };
  const saveTheme = (value) => {
    try { localStorage.setItem(THEME_KEY, value); } catch { /* storage blocked */ }
  };
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches;
  const syncThemeColor = () => {
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute("content", isDark() ? "#0d0f12" : "#f7f7f5");
    });
  };

  const saved = readTheme();
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  syncThemeColor();

  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    saveTheme(next);
    syncThemeColor();
  });
  systemDark.addEventListener?.("change", syncThemeColor);

  // Mobile menu
  const nav = document.getElementById("site-nav");
  const menuBtn = document.getElementById("menu-toggle");
  const setMenu = (open) => {
    nav?.classList.toggle("is-open", open);
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Header border once scrolled
  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Highlight the nav link for the section in view
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  // Reveal cards as they scroll into view
  const revealTargets = document.querySelectorAll(
    ".project, .mini-card, .timeline > li, .skill-card, .contact-card"
  );
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el) => { el.classList.add("reveal"); reveal.observe(el); });
  }

  // Lightbox: groups screenshots by data-gallery
  const box = document.getElementById("lightbox");
  if (!box || typeof box.showModal !== "function") return;
  const img = box.querySelector(".lb-img");
  const caption = box.querySelector(".lb-caption");
  let group = [];
  let index = 0;

  const render = () => {
    const source = group[index].querySelector("img");
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    caption.textContent = group.length > 1
      ? `${source.alt} · ${index + 1} / ${group.length}`
      : source.alt;
  };
  const step = (delta) => {
    if (group.length < 2) return;
    index = (index + delta + group.length) % group.length;
    render();
  };

  document.querySelectorAll(".shot[data-gallery]").forEach((shot) => {
    shot.addEventListener("click", () => {
      group = [...document.querySelectorAll(`.shot[data-gallery="${shot.dataset.gallery}"]`)];
      index = group.indexOf(shot);
      box.classList.toggle("is-single", group.length < 2);
      render();
      box.showModal();
      document.body.style.overflow = "hidden";
    });
  });

  box.addEventListener("close", () => { document.body.style.overflow = ""; });
  box.querySelector(".lb-close").addEventListener("click", () => box.close());
  box.querySelector(".lb-prev").addEventListener("click", () => step(-1));
  box.querySelector(".lb-next").addEventListener("click", () => step(1));
  box.addEventListener("click", (e) => {
    if (e.target === box || e.target.classList.contains("lb-figure")) box.close();
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });

  // Swipe between screenshots on touch screens
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    startX = null;
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
