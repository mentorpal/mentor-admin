# Gatsby → Vite (mentor-admin /client)

Approved in chat on 2026-11-03.

## Intent

Move `/client` off Gatsby 5 onto Vite so the admin UI still builds static files for S3, without depending on Gatsby.

## Goals

- Same in-app routes as `src/pages/**`.
- Same `process.env.*` names as `gatsby-plugin-env-variables` (no `VITE_` rename).
- Same browser shell as `gatsby-browser.js` (MUI, Redux, Sentry, domain redirect, upload warnings, Video.js).
- Refresh/deep links on S3 and Docker nginx keep working via post-build HTML copies.
- Keep `build.outDir` as `public` so existing `s3 sync ./public …/admin` still works.
- `make format` and `make test-all` in `/client` pass.
- Only `/client` is changed.

## Non-goals

- Unit tests, Cypress, other repo directories, unique per-route HTML content, Vike/Next, exposing all env vars into the client.

## Anti-goals

- Renaming env vars to `import.meta.env.VITE_*`.
- A multi-page Vite app with separate JS entries per page.

## Constraints

- React 18, Node 22.
- `base: '/admin/'` and react-router `basename: '/admin'`.
- Explicit env allow-list only (Gatsby allow-list plus `CLIENT_ENDPOINT` and `ACCESS_TOKEN`).
- Do not set Vite `envPrefix` to `""`.
- No extra Hermes skills to install.

## Approaches

1. SPA + pages router + post-build `index.html` copies — **picked**.
2. Full SSG (Vike/prerender) — extra machinery, little gain (pages fill in after login).
3. Multi-page Vite — fights the shared Redux/MUI shell.

## Locked how

- `react-router-dom` v6, routes from `src/pages`.
- After `vite build`, copy `public/index.html` to each page path and `public/404.html`.
- Env via Vite `define` of `process.env.<KEY>` from Node/`loadEnv` with that explicit key list.
- Replace `gatsby` / `gatsby-link` / `@gatsbyjs/reach-router` `navigate`/`Link`/`Location`.
- `navigate("/admin")` and `navigate("/admin/")` become `navigate("/")`.
- Drop Gatsby SSR and `gatsby-node.js` null-loaders.
- Add `query-string` as a direct dependency.
- `@vitejs/plugin-react-swc`.
