
/* ─────────────────────────────────────────
   1. API CONFIGURATION
   OpenWeatherMap API credentials and endpoint configuration.
   IMPORTANT: Replace API_KEY before production deployment.
   Consider using environment variables for security in production.
───────────────────────────────────────── */
const API_KEY = "ef2cefb22c83edfc57ae77c1da81a21f"; // TODO: insert real API key or use env-based injection for production
const BASE_URL = "https://api.openweathermap.org/data/2.5"; // OpenWeatherMap v2.5 endpoints


/* ─────────────────────────────────────────
   2. DOM SELECTORS
   Cache element references for performance (single query per element on load).
   Organized by functional grouping for maintainability.
───────────────────────────────────────── */
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


/* ─────────────────────────────────────────
   3. APPLICATION STATE
   Global state for tracking UI preferences and cached data.
   lastWeatherData enables fast unit toggling without re-fetching from API.
───────────────────────────────────────── */
let currentUnit = "celsius";   // tracks active temperature unit
let lastWeatherData = null;    // stores last API response for unit switching and re-rendering


/* ─────────────────────────────────────────
   4. THEME TOGGLE
   Persist user's light/dark mode preference to localStorage for seamless experience.
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   5. SEARCH INPUT HANDLING
   Wire keyboard and click events to trigger weather search.
───────────────────────────────────────── */
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


/* ─────────────────────────────────────────
   6. WEATHER DATA FETCHING & ORCHESTRATION
   Fetch current weather and forecast data from OpenWeatherMap API.
───────────────────────────────────────── */
/**
 * Orchestrates the search flow: fetches weather data and renders UI
 * Uses Promise.all for concurrent API requests (performance optimization)
 * Stores fetched data globally to enable temperature unit switching without re-fetching
 * @param {string} city - City name to search
 * @returns {Promise<void>}
 */
async function handleSearch(city) {
  // Reset UI before new search
  hideError();
  showLoader();
  hideWeatherContent();
  hideEmptyState();

  try {
    // Fetch both current weather and forecast at the same time using Promise.all
    // This is faster than sequential requests: saves ~50-100ms depending on network
    const [weatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city)
    ]);

    // Store data globally for temperature unit switching (avoids re-fetching)
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

/**
 * Fetches current weather for a city from OpenWeatherMap API
 * @param {string} city - City name to search
 * @returns {Promise<Object>} Weather data object with temp, humidity, wind, etc.
 * @throws {Error} When city is not found or API request fails
 */
async function fetchCurrentWeather(city) {
  const url = `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("City not found");

  const data = await response.json();
  return data;
}

/**
 * Fetches 5-day forecast for a city from OpenWeatherMap API
 * API returns 3-hour interval readings (40 total). Daily readings are extracted later.
 * @param {string} city - City name to search
 * @returns {Promise<Object>} Forecast object with list of readings every 3 hours
 * @throws {Error} When forecast data unavailable or API request fails
 */
async function fetchForecast(city) {
  const url = `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("Forecast not found");

  const data = await response.json();
  return data;
}


/* ─────────────────────────────────────────
   7. UI STATE HELPERS
   Simple utility functions for showing/hiding UI components based on application state.
───────────────────────────────────────── */
function showLoader()          { loader.classList.remove("hidden"); }
function hideLoader()          { loader.classList.add("hidden"); }

function showWeatherContent()  { weatherContent.classList.remove("hidden"); }
function hideWeatherContent()  { weatherContent.classList.add("hidden"); }

function showEmptyState()      { emptyState.classList.remove("hidden"); }
function hideEmptyState()      { emptyState.classList.add("hidden"); }

function showError()           { errorMsg.classList.remove("hidden"); }
function hideError()           { errorMsg.classList.add("hidden"); }


/* ─────────────────────────────────────────
   8. RENDER FUNCTIONS
   Populate DOM with weather data from OpenWeatherMap API responses.
───────────────────────────────────────── */
/**
 * Renders current weather data to DOM elements
 * Applies temperature unit conversion based on currentUnit state
 * @param {Object} data - OpenWeatherMap current weather response object
 * @property {string} data.name - City name
 * @property {Object} data.sys - Contains country code
 * @property {Array} data.weather - Weather condition array
 * @property {Object} data.main - Contains temp, humidity, feels_like
 * @property {Object} data.wind - Contains wind speed (m/s, converted to km/h)
 * @property {number} data.visibility - In meters, converted to km
 */
function renderCurrentWeather(data) {
  // Location
  cityName.textContent    = data.name;
  countryName.textContent = data.sys.country;
  currentDate.textContent = formatDate(new Date());

  // Icon & description
  const iconCode        = data.weather[0].icon;
  weatherIcon.src       = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt       = data.weather[0].description;
  weatherDesc.textContent = data.weather[0].description;

  // Temperature (API returns Celsius; convert to Fahrenheit if needed)
  const tempC = Math.round(data.main.temp);
  temperature.textContent = currentUnit === "celsius"
    ? `${tempC}°C`
    : `${toFahrenheit(tempC)}°F`;

  // Stats
  humidity.textContent  = `${data.main.humidity}%`;
  windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;

  const feelsC = Math.round(data.main.feels_like);
  feelsLike.textContent = currentUnit === "celsius"
    ? `${feelsC}°C`
    : `${toFahrenheit(feelsC)}°F`;

  visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}


/**
 * Renders 5-day forecast to DOM grid
 * OpenWeatherMap forecast API returns 3-hour interval data (40 readings over 5 days)
 * Filter extracts one reading per day at ~12:00 PM UTC for display consistency
 * Applies temperature unit conversion based on currentUnit state
 * @param {Object} data - OpenWeatherMap forecast response object
 * @property {Array} data.list - Array of 40 forecast readings (3-hour intervals)
 */


function renderForecast(data) {
  // Group all 40 readings by day (YYYY-MM-DD)
  const grouped = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(" ")[0]; // e.g. "2026-06-17"
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  // Clear previous forecast cards
  forecastGrid.innerHTML = "";

  // Take only 5 days
  const days = Object.keys(grouped).slice(0, 5);

  days.forEach((dateKey, index) => {
    const readings  = grouped[dateKey];

    // Get the midday reading for icon & description
    const midday = readings.find(r => r.dt_txt.includes("12:00:00")) || readings[0];

    // Get true high and low across ALL readings for that day
    const highC = Math.round(Math.max(...readings.map(r => r.main.temp_max)));
    const lowC  = Math.round(Math.min(...readings.map(r => r.main.temp_min)));

    const high = currentUnit === "celsius" ? `${highC}°C` : `${toFahrenheit(highC)}°F`;
    const low  = currentUnit === "celsius" ? `${lowC}°C`  : `${toFahrenheit(lowC)}°F`;

    const iconCode = midday.weather[0].icon;
    const desc     = midday.weather[0].description;

    // Label first card "Today", rest get short day name
    const date    = new Date(dateKey + "T12:00:00");
    const dayName = index === 0
      ? "Today"
      : date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();

    const card = document.createElement("div");
    card.classList.add("forecast-card");
    card.innerHTML = `
      <p class="forecast-day">${dayName}</p>
      <img
        src="https://openweathermap.org/img/wn/${iconCode}@2x.png"
        alt="${desc}"
        class="forecast-icon"
      />
      <p class="forecast-desc">${desc}</p>
      <div class="forecast-temps">
        <span class="forecast-high">${high}</span>
        <span class="forecast-low">${low}</span>
      </div>
    `;

    forecastGrid.appendChild(card);
  });
}


/* ─────────────────────────────────────────
   9. UTILITY FUNCTIONS & HELPERS
   Convert between temperature scales and format dates for display.
───────────────────────────────────────── */
/**
 * Converts temperature from Celsius to Fahrenheit
 * Formula: F = (C × 9/5) + 32
 * @param {number} c - Temperature in Celsius
 * @returns {number} Rounded temperature in Fahrenheit
 */
function toFahrenheit(c) {
  return Math.round((c * 9/5) + 32);
}

/**
 * Formats a date object into a readable string
 * Example output: "Monday, 16 June 2026"
 * @param {Date} date - JavaScript Date object to format
 * @returns {string} Formatted date string with weekday, day, month, and year
 */
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric"
  });
}

/* ─────────────────────────────────────────
   10. TEMPERATURE UNIT TOGGLE
   Allow users to switch between Celsius and Fahrenheit without re-fetching data.
───────────────────────────────────────── */
celsiusBtn.addEventListener("click", () => {
  if (currentUnit === "celsius") return; // already active, do nothing

  currentUnit = "celsius";

  // Swap active style between buttons
  celsiusBtn.classList.add("active");
  fahrenheitBtn.classList.remove("active");

  // Re-render with stored data — no new API call needed
  if (lastWeatherData) {
    renderCurrentWeather(lastWeatherData.weatherData);
    renderForecast(lastWeatherData.forecastData);
  }
});

fahrenheitBtn.addEventListener("click", () => {
  if (currentUnit === "fahrenheit") return; // already active, do nothing

  currentUnit = "fahrenheit";

  // Swap active style between buttons
  fahrenheitBtn.classList.add("active");
  celsiusBtn.classList.remove("active");

  // Re-render with stored data — no new API call needed
  if (lastWeatherData) {
    renderCurrentWeather(lastWeatherData.weatherData);
    renderForecast(lastWeatherData.forecastData);
  }
});