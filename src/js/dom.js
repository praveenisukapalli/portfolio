const SVG_NS = "http://www.w3.org/2000/svg";
const ICON_SPRITE = new URL("../assets/icons.svg", import.meta.url).href;

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Small hyperscript helper. Text is always set via textContent, never innerHTML. */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  node.append(...children.flat().filter((child) => child != null && child !== false));
  return node;
}

export function icon(name, className = "icon") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `${ICON_SPRITE}#${name}`);
  svg.append(use);
  return svg;
}

/** Scrolls to a section and moves focus there so keyboard users land in the right place. */
export function goToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
  history.replaceState(null, "", id === "home" ? location.pathname : `#${id}`);
}

export function downloadResume(href) {
  const link = el("a", { href, download: "" });
  document.body.append(link);
  link.click();
  link.remove();
}
