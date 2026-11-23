(() => {
  const root = document.documentElement;

  // ---------- Theme ----------
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    root.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // ---------- Navbar ----------
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  };

  menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // ---------- Active link on scroll ----------
  const links = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => spy.observe(s));

  // ---------- Typing effect ----------
  const typedEl = document.getElementById("typed");
  const phrases = [
    "scalable APIs",
    "GraphQL services",
    "serverless workflows on AWS",
    "event-driven systems",
    "well-tested backends",
  ];
  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let deleting = true;

  const type = () => {
    const current = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    typedEl.textContent = current.slice(0, charIndex);

    let delay = deleting ? 45 : 90;
    if (!deleting && charIndex === current.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 350;
    }
    setTimeout(type, delay);
  };
  setTimeout(type, 2000);

  // ---------- Reveal on scroll + counters ----------
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const revealer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        entry.target.querySelectorAll("[data-count]").forEach(animateCount);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  // ---------- Contact form ----------
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setStatus = (msg, type) => {
    status.textContent = msg;
    status.className = `form-status ${type || ""}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // form.elements avoids clashing with built-in form properties like form.name
    const fields = form.elements;
    const data = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      message: fields.message.value.trim(),
      website: fields.website.value,
    };

    const checks = {
      name: data.name.length > 0,
      email: emailPattern.test(data.email),
      message: data.message.length >= 10,
    };
    Object.entries(checks).forEach(([field, ok]) =>
      fields[field].closest(".field").classList.toggle("invalid", !ok)
    );

    if (!Object.values(checks).every(Boolean)) {
      setStatus("Please fill in all fields. Message must be at least 10 characters.", "error");
      return;
    }

    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setStatus("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong.");

      form.reset();
      setStatus("Thanks! Your message has been sent. I'll get back to you soon.", "success");
    } catch (err) {
      setStatus(err.message || "Could not send message. Please try again later.", "error");
    } finally {
      button.disabled = false;
    }
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();
})();
