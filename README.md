# WeatherNow 🌤️

A clean, responsive weather application built with vanilla HTML, CSS, and JavaScript. Search any city to get current weather conditions and a 5-day forecast, with support for both light and dark themes.

> **Live Demo:** Not deployed yet, coming soon
>
> **Repository:** [github.com/Fredrickimo1/weather-app](https://github.com/Fredrickimo1/weather-app)

---

## Screenshots

> Screenshots coming soon (light mode and dark mode)

---

## Features

- **Search by city:** look up weather for any city worldwide
- **Current conditions:** temperature, humidity, wind speed, "feels like" temperature, and visibility
- **Weather icons:** dynamic icons matching real-time conditions
- **5-day forecast:** daily high/low temperatures with weather summary
- **Unit toggle:** switch instantly between °C and °F with no extra API calls
- **Dark/light mode:** theme preference saved in the browser via `localStorage`
- **Fully responsive:** works smoothly on mobile, tablet, and desktop

---

## Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Markup      | HTML5                                |
| Styling     | CSS3 (custom properties / CSS variables) |
| Logic       | Vanilla JavaScript (ES6+, async/await) |
| Data Source | [OpenWeatherMap API](https://openweathermap.org/api) |
| Icons       | Font Awesome                         |

No frameworks, no build tools, just the fundamentals.

---

## Project Structure

weather-app/

├── index.html

├── .gitignore

├── css/

│   └── style.css

└── js/

├── config.js     # API key (gitignored, not in repo)

└── app.js
  

## Setup & Installation

This project requires a free OpenWeatherMap API key, which is kept out of the repository for security.

1. **Clone the repository**

```bash
   git clone https://github.com/Fredrickimo1/weather-app.git
   cd weather-app
```

2. **Get a free API key**

   - Sign up at [openweathermap.org](https://openweathermap.org)
   - Go to your account, then **API Keys**
   - Copy your key (new keys can take a few minutes to activate)

3. **Create your config file**

   Inside the `js/` folder, create a file named `config.js`:

```javascript
   const CONFIG = {
     API_KEY: "your_api_key_here"
   };
```

4. **Run the app**

   Simply open `index.html` in your browser, no server or build step required.

   For live-reload during development, you can use the VS Code **Live Server** extension.

---

## What I Learned

Building this project helped strengthen my understanding of:

- Working with REST APIs using `fetch()` and `async/await`
- Using `Promise.all()` to run multiple API calls concurrently for better performance
- DOM manipulation: dynamically creating and updating elements without a framework
- State management in vanilla JS (tracking current unit, storing API responses for reuse)
- CSS custom properties (variables) to build a theme system without JS-heavy logic
- `localStorage` for persisting user preferences across sessions
- API key security: what happens when a key leaks, and how to properly gitignore secrets after a real GitGuardian alert on this repo

---

## Features to Improve

Known limitations and planned enhancements for this vanilla JS version:

- [ ] **Debounce search input:** add live city suggestions/autocomplete instead of requiring a full search submit
- [ ] **Geolocation support:** auto-detect user's location on first load using the browser's Geolocation API
- [ ] **Better error handling:** distinguish between "city not found", "network error", and "API limit reached" with specific messages
- [ ] **Loading skeleton:** replace the spinner with a skeleton UI that matches the final layout for a smoother feel
- [ ] **Recent searches:** store last 3-5 searched cities in `localStorage` for quick access
- [ ] **Hourly forecast view:** add an hourly breakdown alongside the 5-day forecast
- [ ] **Accessibility audit:** improve keyboard navigation and ARIA labels throughout
- [ ] **Unit tests:** add basic tests for helper functions (`toFahrenheit`, `formatDate`, forecast grouping logic)
- [ ] **Animated weather backgrounds:** subtle background changes based on current conditions (sunny, rainy, cloudy, etc.)

---

## Roadmap

This vanilla JS version is the foundation for a planned full-stack rebuild:

- [ ] React frontend with Tailwind CSS
- [ ] Node.js + Express backend (API key secured server-side)
- [ ] MongoDB for saved/favourite locations
- [ ] User authentication
- [ ] Deployment on Vercel

---

## License

This project is open source and available for learning purposes.