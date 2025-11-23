const toggle = document.getElementById("themeToggle");
const label = document.getElementById("theme-label");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const lang = localStorage.getItem("selectedLang") || "en";
  if (typeof translations !== "undefined" && translations[lang]) {
    label.textContent = translations[lang][theme === "dark" ? "theme_dark" : "theme_light"];
  } else {
    label.textContent = theme === "dark" ? "🌙 Dark" : "🌞 Light";
  }

  toggle.checked = theme === "dark";
}

// Load theme on start
const storedTheme = localStorage.getItem("theme");
if (storedTheme) {
  applyTheme(storedTheme);
} else {
  applyTheme(prefersDarkScheme.matches ? "dark" : "light");
}

// Change theme on toggle
toggle.addEventListener("change", () => {
  const newTheme = toggle.checked ? "dark" : "light";
  applyTheme(newTheme);
});
