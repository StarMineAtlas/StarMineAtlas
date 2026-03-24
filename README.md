

# StarMineAtlas

**StarMineAtlas** is a modern Next.js application dedicated to mining optimization in the Star Citizen universe. It offers interactive tools to explore resources, compare prices, configure loadouts, and maximize mining profitability.

---

## ✨ Main Features

- **Rock and mineral search**: Advanced filtering by system, celestial body, primary/secondary mineral, and text search.
- **Loadout calculator**: Simulate and save mining ship configurations (lasers, modules, gadgets).
- **Market price analysis**: View refined and raw mineral prices, with profitability ranking.
- **Refinery data**: Compare yields by station, mineral, and refining method.
- **Multilingual support**: Interface available in English and French.
- **Modern UI**: Radix UI components, dark theme, responsive design.

---

## 🗺️ Site Structure

- **/** (Home): Search and explore rocks/minerals.
- **/calculators/loadout**: Mining ship loadout calculator.
- **/calculators/mining-profit**: (WIP) Mining profitability calculator.
- **/data/market-prices**: Market price comparison table (WIP).
- **/data/refinery**: Refinery yield analysis.
- **/data/mining-lasers, /data/modules-gadgets, /data/quality-distribution**: Detailed equipment and quality data.

---

## 🧩 Technologies & Stack

- **Next.js** (React, SSR, API routes)
- **TypeScript**
- **Radix UI** (UI components)
- **Chart.js** (visualization)
- **i18next** (internationalization)
- **PostCSS, TailwindCSS**
- **Vercel** (auto deployment)
- **v0.app** (project initialisation)

---

## 📁 Project Structure

- `app/`: Main pages and subpages (calculators, data…)
- `components/`: UI components, filters, header/footer, loadout, etc.
- `models/`: TypeScript types for entities (Rock, Mineral, Loadout…)
- `lib/`: Utilities, API endpoints, i18n
- `locales/`: Translation files
- `public/`: Static assets
- `styles/`: Global and specific stylesheets

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 📝 Contributing

1. Fork & clone the repo
2. Create a branch (`feat/my-feature`)
3. Code, commit, push, PR!

---

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [Star Citizen Wiki](https://starcitizen.tools/)
- [Regolith](https://regolith.rocks/)
- [UEX](https://uexcorp.space/api/documentation)

---
