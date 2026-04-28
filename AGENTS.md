# AGENTS.md

Guidance for AI coding agents working in this repository.

## Scope

- Keep edits focused and minimal.
- Preserve the local-first design (no backend assumptions).
- Prefer updating existing files over adding new architecture layers.

## Runbook

- Install: `npm ci`
- Dev server: `npm run dev`
- Production build check: `npm run build`
- Preview build: `npm run preview`
- Sync app version text: `npm run sync:version`

Release helpers (no git tag created):

- `npm run release:patch`
- `npm run release:minor`
- `npm run release:major`

## Project Map

- `src/main.jsx`: app bootstrap and service worker registration.
- `src/App.jsx`: top-level shell, tabs, theme/locale setup, PWA update banner flow.
- `src/hooks/useBehaviorApp.js`: main state orchestration and action handlers.
- `src/services/behaviorStorage.js`: persistence, normalization, derived-state logic.
- `src/config/appSettings.json`: source of truth for timers/defaults/feature flags.
- `src/config/appSettings.js`: typed accessors and default state factories.
- `src/data/suggestions.js`: suggestion catalog and context filtering.
- `src/i18n/translations.js`: pt/en strings and visible app version label.
- `src/components/SettingsScreen.jsx`: settings UI, backup import/export, suggestion priority drag-and-drop.
- `vite.config.js`: PWA/workbox behavior.
- `nginx.conf`: cache policy and SPA fallback for deployments.

See `README.md` for product overview, Docker usage, and deployment notes.

## Repo-Specific Conventions

- Keep behavior thresholds and timers in `src/config/appSettings.json`; do not hardcode timing values in components.
- If settings/state shape changes, update normalization and defaults in `src/services/behaviorStorage.js` and `src/config/appSettings.js` together.
- Preserve storage compatibility for key `behavior_app_v1` unless a deliberate migration plan is added.
- For UI text, use translation keys and update both `en` and `pt` entries in `src/i18n/translations.js`.
- Keep suggestion IDs stable in `src/data/suggestions.js` to avoid breaking history references.
- For PWA caching/update behavior, coordinate changes across `vite.config.js`, `nginx.conf`, and update messaging in `src/App.jsx`/`src/components/FeedbackBanner.jsx`.
- If package version changes, run `npm run sync:version` so UI version text stays in sync.

## Validation Expectations

- Minimum check after code edits: `npm run build`.
- If behavior/state logic changed, manually verify in `npm run dev`:
  - state transitions (`STOPPED`/`NEUTRAL`/`ACTIVE`)
  - suggestion filtering (period/profession/goal)
  - settings persistence and import/export flow

## Known Gaps

- No lint/test scripts are configured in `package.json`.
- Prefer small, reviewable changes and explicit manual validation notes in PR summaries.