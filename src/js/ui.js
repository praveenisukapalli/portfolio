// Small page-wide features: toasts, clipboard, theme, navigation and visual effects.
import { $, $$, el, icon, prefersReducedMotion } from "./dom.js";
import { typingPhrases } from "./profile.js";

// ---------- Toasts ----------
const DEFAULT_DURATION = 3200;

export function toast(message, { type = "success", duration = DEFAULT_DURATION } = {}) {
  const region = $("#toastRegion");
  if (!region) return;

  const node = el(
    "div",
    { class: `toast${type === "error" ? " is-error" : ""}` },
    icon(type === "error" ? "i-alert" : "i-check-circle"),
    el("span", { text: message })
  );
  region.append(node);

  window.setTimeout(() => {
    node.classList.add("is-leaving");
    node.addEventListener("animationend", () => node.remove(), { once: true });
  }, duration);
}

// ---------- Copy to clipboard ----------
async function copyText(text, label = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast(label);
    return true;
  } catch {
    toast("Couldn't access the clipboard. Please copy it manually.", { type: "error" });
    return false;
  }
}

export function initClipboard() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (button) copyText(button.dataset.copy, "Email copied to clipboard");
  });
}

// ---------- Theme ----------
const STORAGE_KEY = "theme";
const THEME_COLORS = { dark: "#07090e", light: "#f7f8fc" };
const root = document.documentElement;

export const getTheme = () => (root.dataset.theme === "light" ? "light" : "dark");

function applyTheme(theme) {
  root.dataset.theme = theme;
  $('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  const toggle = $("#themeToggle");
  if (toggle) toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
}

/**
 * Switches theme with a circular reveal from `origin` when the View Transitions API
 * is available, otherwise falls back to a short color crossfade.
 */
export function setTheme(theme, origin) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore: theme still applies for this visit
  }

  if (!document.startViewTransition || prefersReducedMotion()) {
    root.classList.add("theme-transition");
    applyTheme(theme);
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(() => applyTheme(theme));

  transition.ready
    .then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    )
    .catch(() => {});
}

function toggleTheme(origin) {
  setTheme(getTheme() === "dark" ? "light" : "dark", origin);
}

export function initTheme() {
  applyTheme(getTheme());

  $("#themeToggle")?.addEventListener("click", (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    toggleTheme({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  });
}

// ---------- Navigation ----------
const MOBILE_QUERY = window.matchMedia("(max-width: 960px)");

function initScrollEffects() {
  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  const backToTop = $("#backToTop");
  let ticking = false;

  const update = () => {
    const { scrollY, innerHeight } = window;
    const max = document.documentElement.scrollHeight - innerHeight;
    navbar?.classList.toggle("is-scrolled", scrollY > 12);
    backToTop?.classList.toggle("is-visible", scrollY > innerHeight);
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", update, { passive: true });
  update();
}

function initMobileMenu() {
  const toggle = $("#menuToggle");
  const menu = $("#navLinks");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("is-locked", open);
  };
  const isOpen = () => menu.classList.contains("is-open");

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  MOBILE_QUERY.addEventListener("change", (event) => {
    if (!event.matches) setOpen(false);
  });
}

function initScrollSpy() {
  const links = $$(".nav-link");
  const sections = $$("main section[id]");
  if (!("IntersectionObserver" in window) || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

export function initNavigation() {
  initScrollEffects();
  initMobileMenu();
  initScrollSpy();

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
}

// ---------- Typing effect ----------
const TYPE_DELAY = 85;
const DELETE_DELAY = 40;
const HOLD_DELAY = 1900;
const NEXT_DELAY = 350;

export function initTyping() {
  const target = $("#typed");
  if (!target || typingPhrases.length < 2) return;

  if (prefersReducedMotion()) {
    // Swap whole phrases instead of animating characters.
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % typingPhrases.length;
      target.textContent = typingPhrases[index];
    }, 3000);
    return;
  }

  let phraseIndex = 0;
  let charIndex = typingPhrases[0].length;
  let deleting = true;

  const tick = () => {
    const phrase = typingPhrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    target.textContent = phrase.slice(0, charIndex);

    let delay = deleting ? DELETE_DELAY : TYPE_DELAY;
    if (!deleting && charIndex === phrase.length) {
      deleting = true;
      delay = HOLD_DELAY;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % typingPhrases.length;
      delay = NEXT_DELAY;
    }
    window.setTimeout(tick, delay);
  };

  window.setTimeout(tick, HOLD_DELAY);
}

// ---------- Scroll reveal & counters ----------
const COUNT_DURATION = 1400;

function animateCount(node) {
  const target = parseFloat(node.dataset.count);
  const decimals = parseInt(node.dataset.decimals || "0", 10);
  if (Number.isNaN(target) || prefersReducedMotion()) return;

  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / COUNT_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = (target * eased).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initReveal() {
  const items = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  // Stagger siblings that enter together (e.g. grid cards) for a smoother cascade.
  items.forEach((item) => {
    const siblings = [...item.parentElement.children].filter((child) => child.classList.contains("reveal"));
    const index = siblings.indexOf(item);
    if (index > 0) item.style.setProperty("--delay", `${Math.min(index, 6) * 70}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

// ---------- Card spotlight ----------
const HOVER_QUERY = window.matchMedia("(hover: hover) and (pointer: fine)");

/** Feeds the pointer position into --mx / --my so `.spotlight` cards can draw a glow under the cursor. */
export function initSpotlight() {
  if (!HOVER_QUERY.matches) return;

  document.addEventListener(
    "pointermove",
    (event) => {
      const card = event.target.closest?.(".spotlight");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    },
    { passive: true }
  );
}
