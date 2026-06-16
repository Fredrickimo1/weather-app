
const API_KEY = "ef2cefb22c83edfc57ae77c1da81a21f"; // TODO: insert real API key or use env-based injection for production
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

// Click the Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) handleSearch(city);
});

// Press Enter key in the input field
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) handleSearch(city);
  }
});


async function handleSearch(city) {
  // Reset UI before new search
  hideError();
  showLoader();
  hideWeatherContent();
  hideEmptyState();

  try {
    // Fetch both current weather and forecast at the same time
    const [weatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city)
    ]);

    // Store data globally for unit switching later
    lastWeatherData = { weatherData, forecastData };

    // Render everything on screen
    renderCurrentWeather(weatherData);
    renderForecast(forecastData);

    hideLoader();
    showWeatherContent();

  } catch (error) {
    hideLoader();
    showEmptyState();
    showError();
  }
}

// Fetch current weather for a city
async function fetchCurrentWeather(city) {
  const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("City not found");

  const data = await response.json();
  return data;
}

// Fetch 5-day forecast for a city
async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("Forecast not found");

  const data = await response.json();
  return data;
}


function showLoader()          { loader.classList.remove("hidden"); }
function hideLoader()          { loader.classList.add("hidden"); }

function showWeatherContent()  { weatherContent.classList.remove("hidden"); }
function hideWeatherContent()  { weatherContent.classList.add("hidden"); }

function showEmptyState()      { emptyState.classList.remove("hidden"); }
function hideEmptyState()      { emptyState.classList.add("hidden"); }

function showError()           { errorMsg.classList.remove("hidden"); }
function hideError()           { errorMsg.classList.add("hidden"); }
