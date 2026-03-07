# European Travel Dashboard - AI Coding Instructions

## Project Overview
A single-file interactive 3D travel visualization built as `Europedashboard.html` (~6365 lines). This is a self-contained Three.js globe application with embedded CSS, data, and JavaScript—no external JS/CSS files.

**Core Purpose**: Visualize European travel routes from Vancouver on an interactive 3D globe with rich city metadata, dynamic filtering, and custom itinerary building.

## Architecture

### File Structure (Sections marked by `// --- N. SECTION NAME ---`)
1. **CSS Styles** (lines 13-1077): ~600 lines of inline CSS with glassmorphism effects, sidebar/modal layouts
2. **Data Configuration** (lines 1078-4854): `cities` object, `travelTimes` buckets, `legDurations` lookup
3. **Three.js Setup** (lines 4855-5017): Scene, camera, globe geometry, atmosphere shaders, textures
4. **Helpers** (lines 5018-5460): Coordinate conversion, label creation, marker positioning
5. **Interactivity** (lines 5461-5962): Click handlers, modal population, raycasting
6. **Custom Itinerary Builder** (lines 5963-6243): Route building logic with feasibility checks
7. **Multi-Select & Interactive Features** (lines 6244-6286): City comparison, filtering state
8. **Route Animation on Hover** (lines 6287-6328): Mouseover route highlighting
9. **Animation Loop** (lines 6329+): Render loop, controls update

### Key Data Structures

**City Object** (`cities` - starts ~line 3175):
```javascript
"CityName": {
  lat: number, lon: number,        // Required: WGS84 coordinates
  country: "string",               // Required
  desc: "string",                  // Required: Brief description
  weather: "~temp range",          // Optional: e.g. "~12-19°C"
  touristBusyness: "Low|Moderate|High|Very High",
  atmosphere: "description",
  doSee: ["sights"],
  vibe: ["tags"],
  mustTryFoods: ["foods"],
  images: ["https://..."],         // AI-generated or external URLs
  population: number,              // Optional
  costs: {                         // Optional: meal/drink prices
    inexpensiveMeal: { price, range },
    midRangeMeal: { price, range },
    fastFood: { price, range },
    beer: { price, range }
  },
  safety: {                        // Optional: safety metrics (0-100 scale)
    crimeLevel: { value, label },
    crimeIncreasing: { value, label },
    safetyDay: { value, label },
    safetyNight: { value, label }
  }
}
```

**Travel Routes** (`travelTimes` - starts ~line 1087):
- Organized into buckets: `ultraShort`, `veryShort`, `short`, `medium`, `long`
- Each route object: `{ from, to, train, flight, trainHours, flightHours }`
- String durations: `"2h 40m"`, `"1h 15m-1h 30m"` (ranges use first value)
- Numeric hours: Parsed values cached for performance
- **Bidirectional**: Routes must be added in BOTH directions (A→B and B→A)

**Supplemental Routes** (`travelTimesSupplemental` - starts ~line 1948):
- High-priority routes checked before `travelTimes` buckets
- Same structure as `travelTimes` entries

### Critical Functions (Section 3 - HELPERS)

**Route Resolution** (lines 2632-2850):
- `getTravelTime(from, to)`: Searches `travelTimesSupplemental` first, then all `travelTimes` buckets bidirectionally
- `getLegOptions(from, to)`: Returns array of `{ mode, label, hours }` for all available transport options
- `getFastestLegOption(from, to)`: **Source of truth** for route validity—returns fastest option or `null`
- `parseDurationToHours(string)`: Converts "2h 40m" or ranges to numeric hours (handles "1.5h", "45m", etc.)
- `getChosenModeForLeg(from, to)`: Smart mode selection (train preferred if within 2h of flight+layover penalty)

**Duration Parsing Rules**:
- Ranges: Takes first value ("1h 05m-1h 20m" → 1.083)
- Connecting flights: Adds 1.5h penalty to effective duration
- Train preference: Chosen if train time ≤ flight time + 2h (and flight is connecting)

**Itinerary Calculation**:
- `calculateChosenModeItineraryTime(cityPath)`: Intelligently chooses train/flight per leg
- `calculateItineraryTime(cityPath, preferTrain)`: Legacy flight-first calculation
- Returns `{ totalHours, hasIncomplete, segments }` with per-leg breakdown

**City Filtering** (`applyCityFilter(type)` - line 3067):
- Filter types: `cheapest`, `expensive`, `hottest`, `coldest`, `tourism_high`, `tourism_low`, `crime_high`, `crime_low`, `train_routes`
- Sets `activeCityFilterSet` (Set of allowed city names)
- Calls `applyCityVisibilityToGlobe()` to hide/show markers and labels
- Integrates with `customItinerary` and `selectedCities` (always visible)

### Three.js Scene Architecture (Section 2)

**Globe Rendering**:
- Base sphere: 5.0 radius, 256x256 segments
- Dark mode texture: NASA Earth at Night (night lights)
- Light mode texture: High-res day map (8K texture)
- `toggleGlobeMode()`: Switches textures, star visibility, glow colors

**Atmosphere Layers**:
1. Inner atmosphere (5.05 radius): Subtle translucent shell
2. Outer glow (5.25 radius): Shader-based rim lighting (view-dependent intensity)
3. Second glow (5.5 radius): Diffuse secondary glow for depth

**Markers & Labels**:
- Hub cities (`["Amsterdam", "Paris", "Frankfurt", "London"]`): Cyan (#00d4ff)
- Other cities: Orange (#ffaa00)
- Label offsets: Special positioning for overlapping cities (Ghent/Bruges, Ljubljana/Trieste, etc.)
- Canvas-based text sprites with shadow/outline for visibility

**Route Lines**:
- QuadraticBezierCurve3 arcs with height = 5 + (distance * 0.4)
- Opacity: 0.7 for routes matching selected cities, 0.2 otherwise
- Stored in `routeLines` array for hover detection

### State Management

**Global Variables**:
- `customItinerary`: Array of city names for user-built route (always starts with "Vancouver")
- `isCustomBuilderActive`: Boolean for builder mode (click-to-add behavior)
- `selectedCities`: Set for multi-select (Ctrl+Click)
- `activeCityFilterSet`: Set or null—controls globe visibility during filtering
- `cityVisuals`: Map of `cityName → { marker, ring, label }` for visibility toggling
- `trainRoutesFilterActive`: Boolean for train-only filter mode
- `isDarkMode`: Boolean for globe texture mode

**Origin City Logic**:
- `ORIGIN_CITY = "Vancouver"` (constant)
- `DIRECT_AIRPORTS = ["London", "Paris", "Frankfurt", "Amsterdam"]`
- First stop after Vancouver must be a direct airport (auto-corrects with `closestDirectAirport()`)

## Development Workflows

### Adding New Cities
1. Add entry to `cities` object (~line 3175) with required fields: `lat`, `lon`, `country`, `desc`
2. Optional fields: `weather`, `touristBusyness`, `doSee`, `vibe`, `mustTryFoods`, `costs`, `safety`, `images`
3. Images: Use Pollinations AI pattern: `https://image.pollinations.ai/prompt/${encodeURIComponent(description)}`
4. Add travel routes to/from existing cities (see below)

### Adding Travel Routes
**Must specify both directions** (A→B and B→A):
```javascript
{ from: "CityA", to: "CityB", train: "2h 15m", flight: "1h 10m", trainHours: 2.25, flightHours: 1.17 }
{ from: "CityB", to: "CityA", train: "2h 15m", flight: "1h 10m", trainHours: 2.25, flightHours: 1.17 }
```
- String durations: Human-readable ("2h 15m", "1h 10m-1h 30m")
- Numeric hours: Pre-parsed values for performance (use `parseDurationToHours()` to verify)
- Distance buckets: `ultraShort` (<1h), `veryShort` (1-2h), `short` (2-3h), `medium` (3-4h), `long` (4h+)
- Use `travelTimesSupplemental` for special/priority routes

### Testing Route Completeness
```bash
node tools/list-missing-routes.js
```
**What it does**:
- Extracts data from HTML using Node.js `vm` module (no browser needed)
- Tests all city pairs with `getFastestLegOption()` (source of truth)
- Identifies missing routes vs. unparseable durations

**Output files**:
- `missing-routes-report.json`: Full JSON with `{ from, to, reason, travelTime, legDurationLabel }`
- `missing-routes-by-city.txt`: Human-readable grouped by origin city

**Common reasons for "missing"**:
- No entry in `travelTimes` or `travelTimesSupplemental`
- String duration exists but `parseDurationToHours()` returns null (bad format)
- Numeric hours field missing/NaN

### Debugging Route Issues
1. Check if route exists: `getTravelTime("CityA", "CityB")` in browser console
2. Test numeric conversion: `parseDurationToHours("2h 15m")` should return 2.25
3. Verify fastest option: `getFastestLegOption("CityA", "CityB")` should return `{ mode, label, hours }` or null
4. Run analysis tool to find systematic gaps

### Modifying Filters
Filter logic in `applyCityFilter(type)` (line 3067):
- Builds ranked lists using `buildTopList(type, limit)` helper
- Special case: `train_routes` uses `buildTrainRoutesData()` to find cities with train connections
- Sets `activeCityFilterSet` (always includes `ORIGIN_CITY`, `customItinerary`, `selectedCities`)

### UI/Modal Changes
- Modal populated by `showCityModal(cityName)` (not shown in snippets but in Section 4)
- Content sections: travel info, vibe highlights, foods, costs, safety, gallery
- "What If Tool": Suggests nearby cities based on route availability

## Conventions & Patterns

### Code Style
- **No external JS/CSS**: Everything embedded in HTML
- **Section markers**: `// --- N. SECTION NAME ---` format (8 major sections)
- **Data-first**: Configuration defined before functions that consume it
- **Inline CSS**: ~600 lines with BEM-like naming (`.sidebar`, `.city-filter-btn`, `.modal-content`)

### Styling
- Glassmorphism: `rgba()` with low alpha, `backdrop-filter: blur(12px)`
- Color scheme: Cyan/blue gradient (`#4facfe`, `#00f2fe`, `#2277cc`)
- Fixed dimensions: Sidebar `320px`, modals `500px`
- Font: Montserrat (300, 400, 600, 800 weights)

### Route Validation Philosophy
- `getFastestLegOption()` is **single source of truth**—if it returns null, route is invalid
- String metadata can exist without being usable (unparseable durations)
- Itinerary builder won't allow cities without valid routes
- Tool analysis reflects actual runtime behavior (uses same parsing logic)

## Common Tasks

### Update City Metadata
Edit `cities` object directly (line ~3175). All fields except `lat`, `lon`, `country`, `desc` are optional.

### Fix Missing Routes
1. Run `node tools/list-missing-routes.js`
2. Check report: Is route missing entirely or just unparseable?
3. Add/fix entries in `travelTimes.*` or `travelTimesSupplemental`
4. **Always add both directions**
5. Verify numeric hours match parsed string (use `parseDurationToHours()` in console)
6. Retest with tool

### Add Filter Type
1. Modify `applyCityFilter(type)` (line 3067) to handle new type
2. Add filter button in HTML sidebar (line ~165 in city-filter-grid)
3. Implement ranking logic in `buildTopList()` helper
4. Update `renderCityFilterResults()` to display results

### Adjust Globe Appearance
- Textures: `earthNightTexture`, `earthDayTexture` (lines 4902-4909)
- Glow colors: Modify shader uniforms in `toggleGlobeMode()` (line 4957)
- Marker sizes: `SphereGeometry(0.025, ...)`, `RingGeometry(0.027, 0.038, ...)` (lines 5088-5091)
- Label scale: `sprite.scale.set(0.9, 0.24, 1)` (line 5063)

## Testing & Debugging

### Browser Console Helpers
```javascript
// Test route lookup
getTravelTime("Amsterdam", "Paris")

// Parse duration
parseDurationToHours("2h 40m")  // → 2.67

// Check route validity
getFastestLegOption("Berlin", "Copenhagen")  // → {mode, label, hours} or null

// See all routes from a city
getRoutesFromCity("London")
```

### Running the App
Open `Europedashboard.html` directly in a browser (no build step). Uses CDN dependencies:
- Three.js r128
- OrbitControls
- Marked.js
- Font Awesome 6.5.1

### Performance Notes
- High-res textures (8K day map): May load slowly on slow connections
- 256x256 sphere geometry: ~130K triangles (optimized for quality)
- Route line count scales with active filters (use filters to reduce clutter)

## External Dependencies (CDN)
- **Three.js r128**: 3D rendering engine
- **OrbitControls**: Camera interaction (part of Three.js examples)
- **Marked.js**: Markdown parsing (minimal use)
- **Font Awesome 6.5.1**: Icons
- **Google Fonts**: Montserrat family
