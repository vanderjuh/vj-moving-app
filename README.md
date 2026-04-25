# TinyPush

A **local-first** web app for behavior activation focused on small actions, history, and personal settings.

Built with **React + Vite** and shipped as a **PWA** (installable, with offline support).

## Features

- Current user state (`STOPPED`, `NEUTRAL`, `ACTIVE`) derived from action history.
- Contextual small-action suggestions (with configurable priority ordering).
- Completed action log and state transition timeline.
- History list with item archiving.
- Settings screen with:
  - language (`pt` / `en`)
  - appearance (`system`, `light`, `dark`)
  - UI density (`compact`, `comfortable`)
  - notifications (`soft` / `direct`)
  - goal and profession
  - work hours
  - JSON backup import/export
  - local data reset
- Native browser notifications (when supported).
- PWA with service worker and auto-update.

## Stack

- React 19
- Vite 7
- vite-plugin-pwa
- lucide-react
- dnd-kit
- Nginx (container deployment)

## Requirements

- Node.js 22+ (recommended to match the `Dockerfile`)
- npm 10+

## Run locally

```bash
npm ci
npm run dev
```

App available at `http://localhost:5173` (Vite default port).

## Production build

```bash
npm run build
npm run preview
```

## Useful scripts

- `npm run dev` — starts the development server.
- `npm run build` — creates a production build in `dist/`.
- `npm run preview` — serves the production build locally.
- `npm run sync:version` — syncs the app version.
- `npm run release:patch|minor|major` — bumps version + sync + build.

## Environment variables

- `VITE_BASE_PATH` (optional): sets Vite `base` for subpath deployments.
  - Example: `VITE_BASE_PATH=/tinypush/`

## Data persistence

Data is stored in browser `localStorage` using this key:

- `behavior_app_v1`

If local storage is unavailable, the app falls back to in-memory state for the current session.

## PWA

- Manifest configured for `standalone` display mode.
- Service worker generated with Workbox.
- `registerType: "autoUpdate"` for automatic updates.
- Long cache for hashed assets and `no-cache` for `sw.js`/manifest (via Nginx).

## Docker

Build and run:

```bash
docker build -t tinypush:latest .
docker run --rm -p 8080:80 tinypush:latest
```

Open: `http://localhost:8080`

## Static deploy / SPA

The `nginx.conf` includes SPA fallback:

- non-matching route → `index.html`

This allows client-side routing without 404 errors on page refresh.

## Project structure

```text
src/
  components/      # Screen UI and reusable blocks
  config/          # App settings and defaults
  data/            # States, suggestions, and base rules
  hooks/           # useBehaviorApp (state and actions orchestration)
  i18n/            # Translations and locale detection
  services/        # Persistence and notifications
  App.jsx          # Main shell and tab navigation
  styles.css       # Global styles
```

## Notes

- Mobile-first project.
- Installable on iOS/Android as a PWA.
- No backend dependency (data stays local on device).
