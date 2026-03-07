# European Travel Dashboard

An interactive 3D travel visualization built with Three.js that displays European travel routes from Vancouver on a beautiful globe interface.

## Features

- **Interactive 3D Globe**: Navigate an Earth globe with smooth controls
- **70+ European Cities**: Comprehensive travel network with detailed city information
- **Route Planning**: Build custom itineraries with automatic route optimization
- **Travel Time Calculator**: See train and flight options between cities
- **Rich City Data**: Weather, costs, safety ratings, tourist busyness, and more
- **Dynamic Filtering**: Filter cities by cost, weather, tourism level, and crime rates
- **Dark/Light Mode**: Toggle between night and day globe textures
- **Photo Galleries**: AI-generated city images for visual exploration

## Live Demo

Visit the live dashboard: [https://griffin-hall.github.io/EuropeanTravel](https://griffin-hall.github.io/EuropeanTravel)

## Usage

Simply open `index.html` in a modern web browser. No build process or installation required!

**Or visit the live site:** [https://griffin-hall.github.io/EuropeanTravel](https://griffin-hall.github.io/EuropeanTravel)

### Controls

- **Left Click + Drag**: Rotate the globe
- **Mouse Wheel**: Zoom in/out
- **Click City**: View detailed information
- **Ctrl + Click**: Multi-select cities for comparison
- **Custom Builder**: Click "Start Custom Builder" to create your own itinerary

## Technology

- Three.js r128 (3D rendering)
- OrbitControls (camera interaction)
- Self-contained single HTML file (~6365 lines)
- No external dependencies (all CDN-based)

## Data Sources

- Travel times: Manual research and compilation
- City coordinates: WGS84 standard
- Safety/cost data: Numbeo and other public sources
- Images: AI-generated via Pollinations.ai

## Development

See the `.github/copilot-instructions.md` file for detailed development guidelines and architecture documentation.

## License

© 2026 Griffin Hall. All rights reserved.
