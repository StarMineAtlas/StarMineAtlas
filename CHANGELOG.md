# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-03-28
### Added
- New Radar page: visualization of echo values for each mineral, advanced filters, search by echo number, dynamic sorting, modern and responsive interface.
- New Work Order page for managing mining sessions, refining, minerals, sales, and profit sharing between users. Includes:
	- Automatic calculation and optional inclusion of transfer fees (0.5% on player-to-player transfers).
	- Profit sharing calculator with expense management per user and automatic adjustment to ensure total consistency.
	- Automatic selection of the best selling location based on total price.
	- Display of full selling location name (system, planet, station).
	- Multi-user support with dynamic user and expense lists.

[1.0.0]: https://github.com/StarMineAtlas/StarMineAtlas/releases/tag/1.0.0

## [0.2.0] - 2026-03-25
### Added
- Added page for work order (WIP until CIG add variable pricing based on quality)
- Loadout Select items now have a mobile version
- Tables now can be sorted
- Added radar value on rock card (Data currently being collected)
- Added a different icon and color to the rock card depending on ore type (FPS or Ship)

[0.2.0]: https://github.com/StarMineAtlas/StarMineAtlas/releases/tag/0.2.0

## [0.1.0] - 2026-03-23
### Added
- First public release of StarMineAtlas.
- Advanced rock and mineral search with filters (system, body, primary/secondary mineral, text search).
- Loadout calculator for mining ships (lasers, modules, gadgets, configuration saving).
- Market price comparison table (refined and raw) for minerals.
- Refinery yield analysis by station, mineral, and method.
- Detailed data pages for mining lasers, modules, gadgets, and quality distribution.
- Multilingual interface (English, French).
- Modern UI based on Radix UI, responsive and dark theme.
- Visualizations with Chart.js.
- User preferences management system (localStorage).
- Automatic deployment via Vercel.

[0.1.0]: https://github.com/StarMineAtlas/StarMineAtlas/releases/tag/0.1.0


