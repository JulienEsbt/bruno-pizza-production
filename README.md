[English](README.md) · [Français](README.fr.md)

<div align="center">
  <img src="docs/assets/brand/logo-bruno-pizzaiolo.png" alt="Bruno Pizzaiolo logo" width="260" />

  # Bruno Pizza — Production

  **A local-first desktop application that turns Excel production plans into a clear, practical manufacturing workflow.**

  React · TypeScript · Electron · Express · SQLite
</div>

## V2 in preparation — unreleased

As of **1 October 2026**, local V2 includes quantity editing with **E**, derived
totals and change markers; permanent dark mode; kit exclusion; a more visible
next-pizza panel; and galleries of **up to 20 photos per pizza** with automatic
playback, pause and eight timing options from **1 to 15 seconds**.

64 tests, linting, type checks and builds have passed locally. Business feedback,
official assembly photos and Windows acceptance testing remain pending. Package
versions still refer to V1; no V2 installer is available yet. See the
[current status and acceptance checklist](docs/V2_PREPARATION.md) and
[dated verification journal](docs/JOURNAL_V2.md), in French.

## Overview

Bruno Pizza was built for a real operational need and is installed in an active
production environment. It helps prepare production across several distributors
and guides operators through the manufacturing process one pizza at a time.

The application imports an Excel production plan, validates it against a local
business catalog and provides three complementary workspaces:

- a **production dashboard** with quantities by product and distributor;
- a **workshop workflow** with recipes, photos, progress tracking and keyboard
  navigation;
- **business settings** for pizzas, ingredients and distributors.

Version 1.1.4 runs entirely on the user's computer. Excel remains the only
production source; direct Adial integration is not part of the current scope.

## Product highlights

- imports and validates `.xlsx` and `.xls` production plans;
- checks headers, duplicates, quantities and totals before displaying data;
- provides an editable SQLite catalog with ordered recipes and product photos;
- uses a permanent dark theme, keyboard controls and interface zoom;
- opens in fullscreen workshop mode with larger primary figures and labels for
  easier reading at a distance;
- keeps user data separate from installed application files;
- binds the Express server to `127.0.0.1` and selects a free desktop port;
- uses a stable internal Electron origin to preserve the local session;
- runs frontend, backend and desktop tests in GitHub Actions;
- is documented and packaged for Windows and macOS.

## V2 preview — local demonstration

![Assembly playback and larger next-pizza panel](docs/assets/screenshots/v2-production-demo.jpg)

![Editable production dashboard with E shortcut](docs/assets/screenshots/v2-edition-demo.jpg)

Local test captures from 1 October 2026. Generated assembly photos are fictional
test assets, not the official recipe. Playback now starts automatically even
when a screenshot shows a temporarily paused state.

## V1 screenshot archive

The screenshots show V1 using local demonstration data. The upcoming V2 uses
a permanent dark theme; light screenshots are retained as a record of the
released version.

| Production dashboard | Manufacturing workflow |
| --- | --- |
| ![Production dashboard showing quantities by distributor](docs/assets/screenshots/dashboard-dark.png) | ![Manufacturing workflow showing a pizza recipe and photo](docs/assets/screenshots/production-dark.png) |

| Pizza catalog | Distributor settings |
| --- | --- |
| ![Pizza configuration with its recipe and visual](docs/assets/screenshots/settings-pizzas-dark.png) | ![Distributor settings and color configuration](docs/assets/screenshots/settings-distributors-light.png) |

<details>
  <summary>View the complete gallery</summary>

| Excel import | Light dashboard |
| --- | --- |
| ![Dashboard before importing an Excel file](docs/assets/screenshots/dashboard-empty-dark.png) | ![Production dashboard in the light theme](docs/assets/screenshots/dashboard-light.png) |

| Light Excel import | Light workflow |
| --- | --- |
| ![Dashboard before import in the light theme](docs/assets/screenshots/dashboard-empty-light.png) | ![Manufacturing workflow in the light theme](docs/assets/screenshots/production-light.png) |

| Completed production | Completed production in light mode |
| --- | --- |
| ![Completed production summary in the dark theme](docs/assets/screenshots/production-complete-dark.png) | ![Completed production summary in the light theme](docs/assets/screenshots/production-complete-light.png) |

| Light pizza settings | Ingredient settings |
| --- | --- |
| ![Pizza configuration in the light theme](docs/assets/screenshots/settings-pizzas-light.png) | ![Ingredient settings in the dark theme](docs/assets/screenshots/settings-ingredients-dark.png) |

| Light ingredient settings | Distributor settings |
| --- | --- |
| ![Ingredient settings in the light theme](docs/assets/screenshots/settings-ingredients-light.png) | ![Distributor settings in the dark theme](docs/assets/screenshots/settings-distributors-dark.png) |
</details>

## Architecture

```mermaid
flowchart LR
    Excel["Excel production plan"] -->|"local parsing and validation"| UI["React + TypeScript"]
    UI -->|"local API"| API["Express"]
    UI --> Session["localStorage: production, corrections, position, timing"]
    API --> DB["SQLite"]
    API --> Images["Pizza photos"]
    Electron["Electron window"] --> UI
    Electron -->|"starts on a free port"| API
```

During web development, Vite and Express run separately. In the packaged
desktop application, Electron starts the local backend and serves the compiled
frontend through the internal `bruno-pizza://app` origin.

## Download

The [Releases](https://github.com/JulienEsbt/bruno-pizza-production/releases)
page lists published builds. The documented historical Windows reference is
V1 1.1.4, validated on the 43-inch production display:

- `Appli-Montage-Setup-1.1.4.exe` for 64-bit Intel/AMD Windows systems.

The documented historical macOS Apple Silicon build is
`Appli-Montage-1.1.3-macOS-Apple-Silicon.zip`.

The current builds are not code-signed. Windows SmartScreen or macOS Gatekeeper
may therefore ask for confirmation on first launch.

## Run from source

Requirements: Git, Node.js 22.5 or later and npm 10 or later.

```bash
git clone https://github.com/JulienEsbt/bruno-pizza-production.git
cd bruno-pizza-production
npm ci
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Web development

Start the backend and frontend in separate terminals:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

The interface is available at `http://localhost:5173` and the API at
`http://127.0.0.1:3001`.

### Desktop development

Build and open the Electron application from source:

```bash
npm run desktop:start
```

## Quality and packaging

| Command | Purpose |
| --- | --- |
| `npm run check` | Run linting, type checks and tests |
| `npm run build` | Build the frontend and backend |
| `npm run release:check` | Validate a complete release candidate |
| `npm run desktop:package` | Package the application for the current system |
| `npm run make:windows` | Build the Windows installer on Windows |
| `npm start` | Serve the compiled frontend and local API together |

The continuous integration workflow runs the full release check on pushes and
pull requests targeting `main`.

## Local data

The repository contains no user database, imported Excel production plan,
production photo or real environment variable. The initial business catalog is
versioned intentionally so a fresh installation is usable immediately.

| Mode | Data location |
| --- | --- |
| Source project | `backend/data/` |
| Windows | `%APPDATA%\Bruno Pizza\data\` |
| macOS | `~/Library/Application Support/Bruno Pizza/data/` |

The application creates a new database from the initial catalog on first
launch. Program updates reuse existing data and do not include it in the
installer.

The locations above store SQLite and photos. Imported production, manual
corrections, workflow position and slideshow timing belong to browser storage,
separately for each origin. A `data` folder backup does not include them.
Local demonstration photos are not included in a fresh clone.

## Documentation

- [User guide — French](docs/GUIDE_UTILISATEUR.md)
- [Excel format — French](docs/FORMAT_EXCEL.md)
- [Installation and operations — French](docs/INSTALLATION_ET_EXPLOITATION.md)
- [Technical architecture — French](docs/ARCHITECTURE_TECHNIQUE.md)
- [Changelog](CHANGELOG.md)
- [V2 status and acceptance checklist — French](docs/V2_PREPARATION.md)
- [V2 decisions and verification journal — French](docs/JOURNAL_V2.md)
- [V2 acceptance checklist — French](docs/RECETTE_V2.md)

## Security scope

This application is designed for trusted local use. Its Express server must not
be exposed directly to the Internet or to an untrusted network without adding
authentication, HTTPS and appropriate network controls.

## License

This project is available under the [MIT License](LICENSE).

© 2026 Julien Esterbet
