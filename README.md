# 🌍 European Odyssey

**Interactive 3D travel planning dashboard** — explore 70+ European cities on a WebGL globe, build custom itineraries, estimate trip costs, and export your plans.

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)](https://threejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?logo=github)](https://griffin-hall.github.io/EuropeanTravel/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)](#)

---

<!-- Hero screenshot: globe with routes lit up -->
> **[🚀 View Live Demo](https://griffin-hall.github.io/EuropeanTravel/)** &nbsp;|&nbsp; **[📖 How it works](#architecture)**

---

## ✨ Features

| | |
|---|---|
| 🌐 **Interactive 3D Globe** | Drag, zoom, and click any of 55+ cities on a WebGL globe with atmospheric glow |
| 🗺 **Itinerary Builder** | Build fully custom multi-city routes with real travel-time estimates (flight + train) |
| 💰 **Trip Cost Estimator** | Real price data per city — adjustable accommodation tier, editable nights per city |
| 📄 **PDF / Print Export** | One-click trip export with itinerary, costs, sights, and transport times |
| 🔍 **City Search** | Type any city name to instantly fly the camera there and open its info panel |
| 🎛 **Smart Filters** | Filter cities by cost, weather, safety, tourism level, and population |

---

## 🛠 Built With

- **[Three.js r128](https://threejs.org)** — WebGL 3D globe with custom atmosphere shaders and 8K textures
- **Vanilla JS (ES6)** — No framework overhead; zero build step
- **[GitHub Pages](https://pages.github.com)** — Zero-config static deployment
- **[Pollinations AI](https://pollinations.ai)** — Generative city imagery
- **[Font Awesome 6](https://fontawesome.com)** — Icons
- **[Google Fonts Montserrat](https://fonts.google.com/specimen/Montserrat)** — Typography

---

## 🏗 Architecture

```
index.html   ← App shell: CSS, Three.js scene, UI logic (~5,400 lines)
data.js      ← 55 cities, 500+ travel routes, core helpers (~4,400 lines)
tools/       ← Node.js route-coverage audit script
docs/        ← Design specs and screenshots
```

`data.js` is a dual-mode module: loaded as a plain `<script>` in the browser (globals), and `require()`-able in Node.js for the audit tooling.

---

## 🚀 Usage

```bash
# Clone the repo
git clone https://github.com/Griffin-Hall/EuropeanTravel.git
cd EuropeanTravel

# Open directly in browser — no build step required
open index.html
```

**Tooling** (Node.js required):
```bash
node tools/list-missing-routes.js   # Audit travel route coverage
```

---

## 🕹 Controls

| Input | Action |
|-------|--------|
| Left drag | Rotate globe |
| Scroll wheel | Zoom in / out |
| Click a city dot | Open city info panel |
| Ctrl + click | Multi-select cities |
| Search bar | Fly camera to any city |

---

## 📐 How It Works

1. **Globe rendering** — Three.js `SphereGeometry` with 8K NASA earth texture, custom GLSL atmosphere shader, and a `LoadingManager` that fades out the splash screen when textures are ready.
2. **Route data** — `travelTimes` (bucketed by duration category) + `travelTimesSupplemental` (priority overrides). `getFastestLegOption()` selects the best mode for each leg.
3. **Itinerary builder** — `customItinerary` array (always starts with "Vancouver"). `normalizePathWithDirectEntry()` ensures the first European stop is a direct-flight hub.
4. **Budget estimator** — Reads real `city.costs` data (inexpensive meal × 2 + mid-range meal + beer × 2) converted CAD → EUR, plus the chosen accommodation tier.
5. **City search** — Filters `cities` object keys in real time; on selection lerps `camera.position` toward the city over 60 animation frames, then opens the info modal.

---

## 📸 Screenshots

> *Record a demo GIF with [ScreenToGif](https://www.screentogif.com/) (Windows): globe auto-rotates → click a city → itinerary builder → budget tab. Save as `docs/demo.gif`.*

---

## 📄 License

All rights reserved © Griffin Hall. For portfolio and demonstration purposes only.
