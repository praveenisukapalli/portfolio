import { $, el } from "./dom.js";
import { profile } from "./profile.js";
import { toast } from "./ui.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN = 10;

const RULES = {
  name: (value) => (value.length > 0 ? "" : "Please enter your name."),
  email: (value) => (EMAIL_PATTERN.test(value) ? "" : "Please enter a valid email address."),
  message: (value) => (value.length >= MESSAGE_MIN ? "" : `Message must be at least ${MESSAGE_MIN} characters.`),
};

export function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  const fields = form.elements;
  const status = $("#formStatus");
  const counter = $("#messageCount");
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector(".btn-label");
  const touched = new Set();

  const setStatus = (message, type = "") => {
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  };

  const validateField = (name) => {
    const input = fields[name];
    const error = RULES[name](input.value.trim());
    input.closest(".field").classList.toggle("is-invalid", Boolean(error));
    input.setAttribute("aria-invalid", String(Boolean(error)));
    $(`#${name}Error`).textContent = error;
    return !error;
  };

  const updateCounter = () => {
    counter.textContent = `${fields.message.value.length} / ${fields.message.maxLength}`;
  };

  Object.keys(RULES).forEach((name) => {
    fields[name].addEventListener("blur", () => {
      touched.add(name);
      validateField(name);
    });
    fields[name].addEventListener("input", () => {
      if (touched.has(name)) validateField(name);
    });
  });
  fields.message.addEventListener("input", updateCounter);

  const setLoading = (loading) => {
    button.disabled = loading;
    buttonLabel.textContent = loading ? "Sending…" : "Send message";
    const spinner = button.querySelector(".spinner");
    if (loading && !spinner) button.prepend(el("span", { class: "spinner", "aria-hidden": "true" }));
    if (!loading) spinner?.remove();
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    Object.keys(RULES).forEach((name) => touched.add(name));
    const results = Object.keys(RULES).map(validateField);
    if (!results.every(Boolean)) {
      setStatus("Please fix the highlighted fields.", "error");
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      if (profile.contactEndpoint.includes("YOUR_FORM_ID")) {
        throw new Error(`The contact form isn't set up yet. Please email me at ${profile.email}.`);
      }
      const response = await fetch(profile.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fields.name.value.trim(),
          email: fields.email.value.trim(),
          message: fields.message.value.trim(),
          _subject: `Portfolio message from ${fields.name.value.trim()}`,
          // Formspree silently drops submissions where this honeypot is filled
          _gotcha: fields.website.value,
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.errors?.map((e) => e.message).join(" ") || "Something went wrong. Please try again.");
      }

      form.reset();
      touched.clear();
      updateCounter();
      setStatus("Thanks! Your message has been sent. I'll get back to you soon.", "success");
      toast("Message sent successfully");
    } catch (error) {
      const message =
        error instanceof TypeError ? "Network error. Please check your connection and try again." : error.message;
      setStatus(message, "error");
    } finally {
      setLoading(false);
    }
  });
}
