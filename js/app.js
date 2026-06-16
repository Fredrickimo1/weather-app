
const API_KEY = "YOUR_API_KEY_HERE"; // TODO: insert real API key or use env-based injection for production
const BASE_URL = "https://api.openweathermap.org/data/2.5"; // OpenWeatherMap v2.5 endpoints



// Search
const cityInput     = document.getElementById("cityInput");
const searchBtn     = document.getElementById("searchBtn");
const errorMsg      = document.getElementById("errorMsg");

// UI States
const loader        = document.getElementById("loader");
const weatherContent = document.getElementById("weatherContent");
const emptyState    = document.getElementById("emptyState");

// Current Weather
const cityName      = document.getElementById("cityName");
const countryName   = document.getElementById("countryName");
const currentDate   = document.getElementById("currentDate");
const weatherIcon   = document.getElementById("weatherIcon");
const weatherDesc   = document.getElementById("weatherDesc");
const temperature   = document.getElementById("temperature");
const humidity      = document.getElementById("humidity");
const windSpeed     = document.getElementById("windSpeed");
const feelsLike     = document.getElementById("feelsLike");
const visibility    = document.getElementById("visibility");

// Unit Toggle
const celsiusBtn    = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

// Forecast
const forecastGrid  = document.getElementById("forecastGrid");

// Theme
const themeToggle   = document.getElementById("themeToggle");
const themeIcon     = document.getElementById("themeIcon");


let currentUnit = "celsius";   // tracks active temperature unit
let lastWeatherData = null;    // stores last API response for unit switching and re-rendering


// Check if the user previously selected a theme and apply it on page load.
const savedTheme = localStorage.getItem("weatherTheme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

// Toggle between light and dark mode and persist the choice for future visits.
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next    = current === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("weatherTheme", next);
  updateThemeIcon(next);
});

// Swap the moon/sun icon based on current theme
function updateThemeIcon(theme) {
  if (theme === "dark") {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}