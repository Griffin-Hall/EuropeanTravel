# European Travel Dashboard — Project Instructions

## What This Is
A self-contained single-file 3D interactive travel visualization. No build step. No framework. Open `index.html` in a browser or push to GitHub Pages.

**Live site**: https://griffin-hall.github.io/EuropeanTravel

## Tech Stack
| Layer | Technology |
|-------|-----------|
| 3D rendering | Three.js r128 (CDN) |
| Camera | OrbitControls (CDN) |
| Markdown | Marked.js (CDN) |
| Icons | Font Awesome 6.5.1 (CDN) |
| Font | Montserrat via Google Fonts |
| Hosting | GitHub Pages |

## File Structure
```
index.html            ← THE app (9210 lines, all-in-one)
tools/
  list-missing-routes.js  ← Node.js audit script (finds route gaps)
missing-routes-report.json   ← Output of audit tool
missing-routes-by-city.txt   ← Human-readable audit output
docs.md               ← Feature overview / README
.github/
  copilot-instructions.md  ← Deep architecture reference
```

> **Note**: The main file is `index.html`. The `.github/copilot-instructions.md` and `tools/list-missing-routes.js` still reference `Europedashboard.html` — that is the old filename. Always use `index.html`.

## Code Sections (marked by `// --- N. SECTION NAME ---`)
| # | Section | Approx Lines |
|---|---------|-------------|
| 1 | DATA CONFIGURATION (cities, travelTimes, travelTimesSupplemental) | 1978–6254 |
| 2 | THREE.JS SETUP | 6255–6417 |
| 3 | HELPERS (route resolution, coordinate math) | 6418–6875 |
| 4 | INTERACTIVITY (click handlers, modal, raycasting) | 6876–7405 |
| 5 | CUSTOM ITINERARY BUILDER | 7406–7698 |
| 6 | MULTI-SELECT & INTERACTIVE FEATURES | 7699–7741 |
| 7 | ROUTE ANIMATION ON HOVER | 7742–7783 |
| 9 | ANIMATION LOOP | 7784–7816 |
| 10 | TRIP PLANNER FUNCTIONALITY | 7817+ |

## Key Functions (never touch without understanding)
- `getTravelTime(from, to)` — looks up supplemental first, then all buckets, bidirectionally
- `getFastestLegOption(from, to)` — **source of truth** for route validity; returns `null` = invalid
- `parseDurationToHours(str)` — converts "2h 40m" → 2.67; ranges take first value
- `applyCityFilter(type)` — sets `activeCityFilterSet`, updates globe visibility

## Data Rules
- All travel routes must be added **both directions** (A→B and B→A)
- Distance buckets: `ultraShort` (<1h), `veryShort` (1–2h), `short` (2–3h), `medium` (3–4h), `long` (4h+)
- Use `travelTimesSupplemental` for priority/override routes
- Images: use Pollinations AI pattern `https://image.pollinations.ai/prompt/${encodeURIComponent(desc)}`
- Hub cities (cyan markers): Amsterdam, Paris, Frankfurt, London
- Origin city: `ORIGIN_CITY = "Vancouver"` — hardcoded constant

## Running / Testing
```bash
# Open locally — no server needed
start index.html

# Audit route coverage (finds missing/unparseable routes)
node tools/list-missing-routes.js
# → writes missing-routes-report.json and missing-routes-by-city.txt
```

> **Known issue**: `list-missing-routes.js` hardcodes `Europedashboard.html`. Fix before running:
> Change `const HTML_PATH = path.join(ROOT, 'Europedashboard.html')` → `'index.html'`

## Browser Console Helpers
```javascript
getTravelTime("Amsterdam", "Paris")
getFastestLegOption("Berlin", "Copenhagen")  // null = no valid route
parseDurationToHours("2h 40m")              // → 2.67
```

## Conventions
- No external JS/CSS files — everything embedded in `index.html`
- Section markers `// --- N. SECTION NAME ---` are structural — don't remove them
- Glassmorphism styling: `rgba()` low-alpha backgrounds + `backdrop-filter: blur(12px)`
- Colors: cyan/blue gradient (`#4facfe`, `#00f2fe`, `#2277cc`); hub markers cyan, others orange
- Sidebar: 320px fixed width; modals: 500px fixed width
- Font weights: 300 (light), 400 (body), 600 (labels), 800 (headings)
- Git: single commit history (clean recommit); commit directly to master; deploy via GitHub Pages
