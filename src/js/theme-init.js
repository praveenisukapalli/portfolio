// Loaded synchronously in <head> (not a module) so the theme is applied before first paint.
(function () {
  var root = document.documentElement;
  root.classList.add("js");

  var theme = null;
  try {
    theme = localStorage.getItem("theme");
  } catch (e) {
    // storage can be blocked (privacy mode); fall back to dark
  }
  if (theme !== "light" && theme !== "dark") {
    theme = "dark";
  }
  root.setAttribute("data-theme", theme);
})();
