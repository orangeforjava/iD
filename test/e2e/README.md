# Browser E2E Testing

This repository now includes a Playwright-based browser test path for visually inspecting iD in a real browser.

## Install

```bash
npm run test:e2e:install
```

## Run

```bash
npm run test:e2e
```

Useful variants:

```bash
npm run test:e2e:headed
npm run test:e2e:debug
```

## What this gives us

- A real Chromium browser session
- A local Vite server with the SVG sprites prepared first
- Local request stubs for CDN/schema data and missing `dist/data` files
- Stable screenshots saved under `test/e2e/artifacts/`

## Current smoke coverage

- Load the app shell
- Seed a deterministic entity into history from the browser context
- Open the left inspector/entity editor
- Capture sidebar screenshots that can be inspected after the run

This setup is intended as the first browser-visible debugging path for left-panel migration regressions.
