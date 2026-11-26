import { initTheme, initNavigation, initTyping, initReveal, initClipboard, initSpotlight } from "./ui.js";
import { initFlows } from "./flows.js";
import { initTerminal } from "./terminal.js";
import { initContactForm } from "./contact.js";
import { yearsOfExperience } from "./profile.js";

// Fills every [data-years] element; runs before initReveal so counters animate to the live value.
function initExperience() {
  const years = yearsOfExperience();
  document.querySelectorAll("[data-years]").forEach((node) => {
    node.textContent = years;
    if (node.dataset.count) node.dataset.count = years;
  });
}

const features = [
  initExperience,
  initTheme,
  initNavigation,
  initTyping,
  initFlows,
  initReveal,
  initTerminal,
  initContactForm,
  initClipboard,
  initSpotlight,
];

// Each feature is isolated so one failure can't take down the rest of the page.
for (const init of features) {
  try {
    init();
  } catch (error) {
    console.error(`[portfolio] ${init.name} failed`, error);
  }
}
