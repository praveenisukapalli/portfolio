import { $, el, downloadResume, goToSection } from "./dom.js";
import { experience, profile, projects, sections, skills } from "./profile.js";
import { getTheme, setTheme } from "./ui.js";

const MAX_LINES = 400;

export function initTerminal() {
  const output = $("#terminalOutput");
  const form = $("#terminalForm");
  const input = $("#terminalInput");
  if (!output || !form || !input) return;

  const history = [];
  let historyIndex = 0;

  const span = (text, className) => el("span", { class: className, text });
  const link = (text, href) => {
    const external = /^https?:/.test(href);
    return el("a", { href, text, target: external ? "_blank" : null, rel: external ? "noopener noreferrer" : null });
  };
  const print = (...children) => {
    output.append(el("div", { class: "term-line" }, ...children));
    while (output.childElementCount > MAX_LINES) output.firstElementChild.remove();
  };
  const blank = () => print(" ");
  const sectionIds = sections.map((section) => section.id);

  const findSection = (query = "") => {
    const q = query.toLowerCase().replace(/[#/]/g, "");
    return sections.find((section) => section.id === q || section.label.toLowerCase() === q);
  };

  const commands = {
    help: {
      description: "List available commands",
      run() {
        print(span("Available commands:", "term-muted"));
        Object.entries(commands)
          .filter(([, command]) => !command.hidden)
          .forEach(([name, command]) =>
            print("  ", span((command.usage || name).padEnd(14), "term-accent"), command.description)
          );
      },
    },
    whoami: {
      description: "Name and role",
      run: () => print(`${profile.name} · ${profile.role} @ ${profile.company}`),
    },
    about: {
      description: "A short introduction",
      run: () => print(profile.summary),
    },
    skills: {
      description: "Tech stack by category",
      run() {
        Object.entries(skills).forEach(([group, items]) =>
          print(span(`${group}:`.padEnd(18), "term-key"), span(items.join(", "), "term-string"))
        );
      },
    },
    experience: {
      description: "Where I've worked",
      run() {
        experience.forEach((job) => {
          print(span(job.role, "term-key"));
          print(span(`${job.company} · ${job.client}`, "term-muted"));
          print(span(job.period, "term-number"));
          job.highlights.forEach((item) => print("  ", span("▸ ", "term-accent"), item));
        });
      },
    },
    projects: {
      description: "Things I've built",
      run() {
        projects.forEach((project, index) => {
          if (index) blank();
          print(span(project.name, "term-key"), span(` · ${project.stack}`, "term-muted"));
          print("  ", project.blurb);
          if (project.url) print("  ", link(project.url.replace(/^https:\/\//, ""), project.url));
        });
      },
    },
    contact: {
      description: "How to reach me",
      run() {
        print(span("email    ", "term-key"), link(profile.email, `mailto:${profile.email}`));
        print(span("linkedin ", "term-key"), link("in/praveen-isukapalli", profile.links.linkedin));
        print(span("github   ", "term-key"), link("praveenisukapalli", profile.links.github));
        print(span("Or type ", "term-muted"), span("goto contact", "term-accent"), span(" to use the form.", "term-muted"));
      },
    },
    resume: {
      description: "Download my resume (PDF)",
      run() {
        downloadResume(profile.resume);
        print(span("✔ ", "term-string"), "Downloading Praveen_Isukapalli_Resume.pdf…");
      },
    },
    ls: {
      description: "List page sections",
      run: () => print(span(sectionIds.map((id) => `${id}/`).join("  "), "term-accent")),
    },
    goto: {
      usage: "goto <section>",
      description: "Jump to a section",
      run([target]) {
        const section = findSection(target);
        if (!section) {
          print(span(`No section "${target || ""}". Try: `, "term-error"), span(sectionIds.join(", "), "term-accent"));
          return;
        }
        print(span("→ ", "term-accent"), `Opening ${section.label}…`);
        window.setTimeout(() => goToSection(section.id), 250);
      },
    },
    cd: { hidden: true, run: (args) => commands.goto.run(args) },
    theme: {
      description: "Toggle light / dark mode",
      run() {
        const next = getTheme() === "dark" ? "light" : "dark";
        setTheme(next);
        print(`Switched to ${next} theme.`);
      },
    },
    history: {
      hidden: true,
      run: () => history.forEach((entry, index) => print(span(String(index + 1).padStart(3), "term-muted"), "  ", entry)),
    },
    date: { hidden: true, run: () => print(new Date().toString()) },
    echo: { hidden: true, run: (args) => print(args.join(" ")) },
    sudo: {
      hidden: true,
      run(args) {
        if (args[0] !== "hire") {
          print(span("Permission denied. Try ", "term-error"), span("sudo hire praveen", "term-accent"));
          return;
        }
        print(span("[sudo] password for recruiter: ", "term-muted"), "********");
        print(span("✔ Access granted. ", "term-string"), "Excellent decision. Taking you to the contact form…");
        window.setTimeout(() => goToSection("contact"), 900);
      },
    },
    clear: {
      description: "Clear the screen",
      run: () => output.replaceChildren(),
    },
  };

  function run(raw) {
    const value = raw.trim();
    print(span("❯", "term-prompt"), " ", span(value, "term-cmd"));

    if (value) {
      history.push(value);
      historyIndex = history.length;
      const [name, ...args] = value.split(/\s+/);
      const command = commands[name.toLowerCase()];
      if (command) {
        command.run(args);
      } else {
        print(span(`command not found: ${name}. `, "term-error"), "Type ", span("help", "term-accent"), " to see what I can do.");
      }
    }
    output.scrollTop = output.scrollHeight;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === "ArrowUp" ? -1 : 1)));
      input.value = history[historyIndex] ?? "";
    } else if (event.key === "Tab" && input.value.trim()) {
      const partial = input.value.trim().toLowerCase();
      const matches = Object.keys(commands).filter((name) => !commands[name].hidden && name.startsWith(partial));
      if (matches.length === 1) {
        // Only trap Tab when we can complete, so keyboard navigation still works.
        event.preventDefault();
        input.value = `${matches[0]} `;
      }
    } else if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      commands.clear.run();
    }
  });

  document.querySelectorAll("[data-command]").forEach((button) =>
    button.addEventListener("click", () => run(button.dataset.command))
  );

  output.addEventListener("click", (event) => {
    const selectingText = window.getSelection()?.toString();
    if (!selectingText && !event.target.closest("a") && window.matchMedia("(pointer: fine)").matches) {
      input.focus({ preventScroll: true });
    }
  });
}
