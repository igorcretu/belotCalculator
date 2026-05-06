# Belot Calculator

Belot Calculator is a focused score pad for Belot games. It keeps team totals, round deltas, and turn order in one clean, mobile-first UI so you can play without paper.

## Highlights

- Fast round entry with keypad-friendly inputs
- Two or three team mode with per-team colors
- Turn indicator and round counter
- History archive for finished games
- Adjustable target score and density
- Offline-ready, everything stored locally

## Tech stack

- React + TypeScript
- Create React App
- CSS modules-style layout in [src/App.css](src/App.css)

## Local development

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Open `http://localhost:3000`

## Build

- Production build: `npm run build`

## Data storage

All settings and game state are stored in `localStorage` in the browser. No account or backend required.

## Deploying to Netlify

This app is configured for Netlify with a deploy badge.

- Build command: `npm run build`
- Publish directory: `build`
- SPA redirect to `index.html` via [netlify.toml](netlify.toml)

### Quick setup

1. Push this repository to GitHub.
2. In Netlify, select **Add new site** -> **Import an existing project**.
3. Connect this repository.
4. Netlify will detect settings from [netlify.toml](netlify.toml).
5. Deploy the site.



### Automatic deploys from GitHub Actions

This repository includes a workflow at [.github/workflows/netlify-deploy.yml](.github/workflows/netlify-deploy.yml).
It deploys to Netlify on pushes to the `main` branch and can also be run manually.

Add these repository secrets in GitHub: **Settings** -> **Secrets and variables** -> **Actions**:

- `NETLIFY_AUTH_TOKEN`: Personal access token from Netlify (User settings -> Applications -> Personal access tokens).
- `NETLIFY_SITE_ID`: Your Netlify site ID (Site configuration -> General -> Site details).

After adding secrets, push to `main` to trigger a production deployment.
