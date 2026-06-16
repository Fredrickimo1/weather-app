
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

  // Temperature
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


function renderForecast(data) {
  // OWM forecast returns readings every 3 hours (40 total)
  // We filter to get one reading per day at around midday (12:00)
  const dailyList = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  // Clear previous forecast cards
  forecastGrid.innerHTML = "";

  // Build one card per day
  dailyList.slice(0, 5).forEach(day => {
    const date     = new Date(day.dt * 1000);
    const dayName  = date.toLocaleDateString("en-US", { weekday: "short" });
    const iconCode = day.weather[0].icon;
    const desc     = day.weather[0].description;
    const highC    = Math.round(day.main.temp_max);
    const lowC     = Math.round(day.main.temp_min);

    const high = currentUnit === "celsius" ? `${highC}°C` : `${toFahrenheit(highC)}°F`;
    const low  = currentUnit === "celsius" ? `${lowC}°C`  : `${toFahrenheit(lowC)}°F`;

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


// Convert Celsius to Fahrenheit
function toFahrenheit(c) {
  return Math.round((c * 9/5) + 32);
}

// Format date as: Monday, 16 June 2026
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric"
  });
}

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