# European Travel Dashboard — Enhancement Design

**Date:** 2026-05-29  
**Approach:** Strategic Hybrid  
**Audience:** Recruiters / Hiring Managers  
**Role target:** General Software Engineer  

---

## Overview

Five coordinated improvements to turn the European Travel Dashboard into a standout portfolio piece. The strategy is recruiter-first: every change either adds visible wow-factor or removes something that would make a technical reviewer wince.

**Build order matters.** Data extraction comes first because it reduces risk for every subsequent edit. Data completeness comes second because a broken core feature undermines everything else. Features third, UX polish fourth, README last (screenshots need the finished app).

---

## 1. Architecture — Data Extraction

### Problem
`index.html` is 9,210 lines. Lines 1,978–6,254 (~4,276 lines) are pure data: the `cities` object, `travelTimes` buckets, and `travelTimesSupplemental`. An engineer who opens the file sees a wall of JSON embedded in HTML.

### Change
Extract all data into a standalone `data.js` file loaded before the app script:

```html
<!-- in index.html <head>, before Three.js -->
<script src="data.js"></script>
```

`data.js` assigns globals exactly as they exist today inside the script block:
```js
const cities = { ... };
const travelTimes = { ... };
const travelTimesSupplemental = [ ... ];
```

No module system. No build step. Zero breaking risk — the variables are already globals.

### Result
- `index.html`: ~5,000 lines (app shell, CSS, Three.js logic)
- `data.js`: ~4,300 lines (pure data, easy to navigate and edit)

### Also: Fix Audit Tool
After extraction, `tools/list-missing-routes.js` must read from `data.js` instead of parsing a block out of `index.html`. Two changes required:

1. Add a conditional export at the end of `data.js` so Node can `require()` it:
   ```js
   if (typeof module !== 'undefined') module.exports = { cities, travelTimes, travelTimesSupplemental, legDurations };
   ```
2. Update `list-missing-routes.js` to `require('../data.js')` instead of extracting a VM block from HTML. Remove the `extractBetween` / `vm.runInNewContext` logic entirely — the data is now a plain require.

This makes `data.js` dual-mode: a plain `<script>` tag in the browser (globals), and a Node module for tooling.

---

## 2. Data Completeness

### Problem
The audit tool (`tools/list-missing-routes.js`) was built specifically because route gaps exist. Missing routes cause `getFastestLegOption()` to return `null`, silently blocking cities from the itinerary builder.

### Change
1. Run `node tools/list-missing-routes.js` (after the filename fix above)
2. Review `missing-routes-report.json` — identify gaps vs unparseable durations
3. Add missing entries to `travelTimes` buckets in `data.js`, always bidirectional:
   ```js
   { from: "CityA", to: "CityB", train: "2h 15m", trainHours: 2.25, flight: "1h 10m", flightHours: 1.17 },
   { from: "CityB", to: "CityA", train: "2h 15m", trainHours: 2.25, flight: "1h 10m", flightHours: 1.17 },
   ```
4. Verify numeric `trainHours`/`flightHours` match parsed string (use `parseDurationToHours()` in browser console)
5. Re-run audit tool to confirm zero missing pairs

### Success Criteria
`missingDirectedPairs: 0` in `missing-routes-report.json`.

---

## 3. Trip Cost Estimator

### What It Does
A **Budget tab** added to the itinerary builder panel. Uses cost data already present in ~60% of city objects. Cities without data fall back to a regional average with an "estimate" badge.

### UI
- Tab switcher at top of itinerary panel: **Itinerary | 💰 Budget**
- Accommodation tier selector: **Budget €50 / Mid €90 / Comfort €150** per night
- Per-city row: city name, editable days input, calculated cost
- International flight row: fixed estimate (€900 Vancouver→Europe round trip)
- Intra-Europe flight rows: €120 per flight leg
- **Estimated Total** card pinned at bottom of list

### Calculation Logic
```
dailyFoodCost  = (city.costs.inexpensiveMeal.price × 2) + (city.costs.midRangeMeal.price × 1) + (city.costs.beer.price × 2)
dailyTotal     = dailyFoodCost + accommodationTier
cityTotal      = dailyTotal × daysInCity
grandTotal     = sum(cityTotals) + flightCosts
```

Cities missing `costs` field use a flat fallback of **€45/day food** with an "estimate" badge. This avoids needing a region classification system and is clearly labelled so users aren't misled.

### State
- `budgetTier`: `'budget' | 'mid' | 'comfort'` (default `'mid'`)
- `cityDays`: `Map<cityName, number>` (default 2 days per city, mirrors itinerary order)
- Updates reactively when itinerary cities change

### Integration with PDF Export
`cityDays` and `grandTotal` are read directly by the PDF export function — no extra wiring needed.

---

## 4. PDF Export

### Approach
`window.print()` with `@media print` CSS. No external library. No CDN dependency. Works in all browsers. The Three.js WebGL canvas does not capture cleanly with screenshot libraries, making this the only reliable approach.

### Implementation
1. A hidden `<div id="print-view">` is built dynamically when the user clicks "Export Trip"
2. It contains the formatted itinerary (city list, travel times, cost breakdown)
3. `@media print` CSS: hides everything except `#print-view`, applies white background and black text
4. `window.print()` is called — browser shows native Save as PDF dialog
5. After print dialog closes, `#print-view` is cleared

### PDF Content
- **Header**: "My European Odyssey" · date generated · summary (N cities, N days, €X total)
- **Per city block**: numbered stop, city name + nights, estimated cost, top 3 sights, vibe tags, transport to next city (mode + duration)
- **Footer**: total budget breakdown · "Generated with European Odyssey dashboard"

### Button
"Export Trip 📄" button in the itinerary builder panel, enabled only when `customItinerary.length >= 2`. Sits beside the existing Clear button.

---

## 5. UX Polish

### 5a — Loading Screen
**Problem:** App opens to a black screen for several seconds while Three.js initialises and 8K textures download over CDN.

**Solution:**
- `#loading-screen` full-viewport overlay (`z-index: 9999`) with:
  - App name ("European Odyssey") in the existing cyan gradient
  - Subtitle: "Interactive Travel Dashboard"
  - Thin animated progress bar
  - Status text: "Loading globe textures..."
- Three.js `LoadingManager.onLoad` callback triggers CSS transition: `opacity: 0` → `display: none`
- ~20 lines of code

### 5b — City Search Bar
**Problem:** Finding a specific city requires visually scanning the globe.

**Solution:**
- `<input placeholder="Search cities...">` at the top of the sidebar, above all other controls
- Filters `Object.keys(cities)` as user types (case-insensitive)
- Dropdown shows up to 5 matches with city name + country + hub/standard indicator
- On selection:
  1. Calculate 3D position with existing `latLonToVector3(lat, lon, radius)` helper
  2. Animate `camera.position` toward target over ~60 animation frames (lerp)
  3. Fire `showCityModal(cityName)` on arrival
- ~40 lines of code

---

## 6. GitHub README

### Structure
```
[Hero GIF — globe spinning, click city, panel opens]
[Live Demo button] [How it works button]

## Features (2×3 grid of feature cards)
## Built With (inline tech list)
## Architecture (3-line file map)
## Usage (open index.html — no build step)
## Controls (keyboard/mouse reference)
## License
```

### Hero GIF
Record with **ScreenToGif** (free, Windows):
1. Open live demo at full width
2. Record ~5 seconds: globe auto-rotates → click a city → panel slides open → click "Start Custom Builder" → add 2 cities → budget tab appears
3. Export at 15fps, ~800px wide, <5MB
4. Save as `docs/demo.gif`, reference in README: `![Demo](docs/demo.gif)`

### Badges (shields.io)
```markdown
![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)
![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-blue?logo=github)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red)
```

---

## Build Order

| # | Task | Why first |
|---|------|-----------|
| 1 | Extract data to `data.js` | Reduces file size, lower risk on all future edits |
| 2 | Fix audit tool filename | Unblocks data completeness work |
| 3 | Fix missing routes | Core feature must work before we add features on top |
| 4 | Trip Cost Estimator | New headline feature; PDF depends on it |
| 5 | PDF Export | Reads from cost estimator state |
| 6 | Loading screen | Low effort, high first-impression value |
| 7 | City search bar | UX improvement, self-contained |
| 8 | README + GIF | Written last so screenshots show the finished product |

---

## Success Criteria

- [ ] `index.html` under 5,500 lines
- [ ] `data.js` loads cleanly; app behaviour unchanged
- [ ] `node tools/list-missing-routes.js` reports `missingDirectedPairs: 0`
- [ ] Budget tab visible and calculating correctly for a 3-city itinerary
- [ ] "Export Trip" button produces a clean PDF with city list and cost total
- [ ] Loading screen appears on first load and fades out smoothly
- [ ] City search finds and flies to any of the 70+ cities
- [ ] README hero GIF is under 5MB and plays on GitHub
- [ ] Live demo link in README resolves and loads
