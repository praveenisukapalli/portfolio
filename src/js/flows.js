import { $, el, icon } from "./dom.js";
import { flows } from "./profile.js";

/** Interactive "How I build" diagram: tabs pick a flow, nodes reveal stage details. */
export function initFlows() {
  const root = $("#flows");
  if (!root || !flows.length) return;

  const tabList = $(".flow-tabs", root);
  const panel = $("#flowPanel", root);
  let activeFlow = 0;
  let activeNode = 0;

  const tabs = flows.map((flow, index) =>
    el(
      "button",
      {
        class: "flow-tab",
        type: "button",
        role: "tab",
        id: `flow-tab-${flow.id}`,
        "aria-controls": "flowPanel",
        onClick: () => selectFlow(index),
      },
      icon(flow.icon),
      flow.label
    )
  );
  tabList.append(...tabs);

  tabList.addEventListener("keydown", (event) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = null;
    if (event.key in keys) next = (activeFlow + keys[event.key] + flows.length) % flows.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = flows.length - 1;
    if (next === null) return;
    event.preventDefault();
    selectFlow(next);
    tabs[next].focus();
  });

  function renderDetail(flow) {
    const node = flow.nodes[activeNode];
    return el(
      "div",
      { class: "flow-detail", "aria-live": "polite" },
      el("span", { class: "card-icon" }, icon(node.icon)),
      el(
        "div",
        {},
        el("p", { class: "flow-node-index", text: `Stage ${activeNode + 1} of ${flow.nodes.length}` }),
        el("h3", { text: node.title }),
        el("p", { text: node.detail }),
        el("ul", { class: "tag-list" }, node.tech.map((tech) => el("li", { text: tech })))
      )
    );
  }

  function render() {
    const flow = flows[activeFlow];

    tabs.forEach((tab, index) => {
      const selected = index === activeFlow;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tabs[activeFlow].id);

    const pipeline = el(
      "ol",
      { class: "flow-pipeline", "aria-label": `${flow.label} stages` },
      flow.nodes.map((node, index) => {
        const connector = index > 0 ? el("span", { class: "flow-connector", "aria-hidden": "true" }) : null;
        connector?.style.setProperty("--i", String(index - 1));
        return el(
          "li",
          { class: "flow-step" },
          connector,
          el(
            "button",
            {
              class: "flow-node",
              type: "button",
              "aria-pressed": String(index === activeNode),
              onClick: () => selectNode(index),
            },
            el("span", { class: "card-icon" }, icon(node.icon)),
            el(
              "span",
              {},
              el("span", { class: "flow-node-title", text: node.title }),
              el("span", { class: "flow-node-tech", text: node.tech.slice(0, 2).join(" · ") })
            ),
            el("span", { class: "flow-node-index", text: String(index + 1).padStart(2, "0") })
          )
        );
      })
    );
    pipeline.style.setProperty("--steps", String(flow.nodes.length));

    panel.replaceChildren(el("p", { class: "flow-caption", text: flow.caption }), pipeline, renderDetail(flow));
  }

  function selectFlow(index) {
    if (index === activeFlow) return;
    activeFlow = index;
    activeNode = 0;
    render();
  }

  function selectNode(index) {
    activeNode = index;
    const flow = flows[activeFlow];
    panel.querySelectorAll(".flow-node").forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    panel.querySelector(".flow-detail").replaceWith(renderDetail(flow));
  }

  render();
}
