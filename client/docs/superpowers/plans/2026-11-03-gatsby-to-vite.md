# Gatsby to Vite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Gatsby 5 in `/client` with Vite so the mentor-admin SPA still builds static files under `public/` for `/admin` on S3.

**Architecture:** One Vite SPA (`base: '/admin/'`) with `react-router-dom` `basename: '/admin'` and an explicit route table generated from `src/pages`. The Gatsby browser shell becomes `src/app.tsx`. After `vite build`, a script copies `public/index.html` to each page path (and `404.html`) so S3/nginx refreshes keep working. Env names stay `process.env.*` via Vite `define` of an explicit allow-list.

**Tech Stack:** Vite 6, `@vitejs/plugin-react-swc`, `vite-tsconfig-paths`, React 18, `react-router-dom` v6, TypeScript 4.9, existing MUI/Redux.

**Spec:** `client/docs/superpowers/specs/2026-11-03-gatsby-to-vite-design.md`

## Global Constraints

- Only modify `/client` (this directory). Do not edit cicd, docker, cypress, or repo-root package files except if a client Makefile already shells out to them (leave that as-is).
- No new unit tests. Do not run Cypress.
- Do not rename env vars to `VITE_*`. Do not set `envPrefix: ""` or `loadEnv(mode, root, "")`.
- `build.outDir` is `public`. Vite `publicDir` must be `static` so it does not collide with `outDir`.
- React 18, Node 22. Use `@vitejs/plugin-react-swc`.
- New files under `src/*.ts(x)` / `src/*/*.ts(x)` / `src/*/*/*.ts(x)` must use the existing USC `LICENSE_HEADER` block comment (license-check only includes those globs).
- User forbade extra Hermes skill downloads.
- Verification is `make format` and `make test-all` from `/client`, plus `npm run build` checking HTML copies. Do not add a test runner.

## Review Focus

- Refresh of `/admin/users` (and nested `/admin/author/subject/importquestions`) must resolve to copied `index.html`, not only in-app `navigate`.
- `process.env.GRAPHQL_ENDPOINT` (and the rest of the allow-list) must remain valid identifiers in source; missing keys must stay falsy so `||` defaults still work.
- `navigate("/admin")` / `navigate("/admin/")` must not become `/admin/admin` under `basename: '/admin'`.
- Nav highlight compares `location.pathname === "/users"` (no prefix, no required trailing slash).
- `tsc --noEmit` after removing Gatsby must still see `@types/react` / `@types/react-dom` (today they are transitive).

---

## File map

**Create:**

- `index.html` — SPA shell, mounts `#root`, favicon, module entry `/src/main.tsx`
- `vite.config.ts` — plugins, `base`, `define`, `publicDir: "static"`, `build.outDir: "public"`, dev port 3000
- `static/favicon.png` — copy of `src/images/favicon.png`
- `src/main.tsx` — CSS/side-effect imports, optional Sentry, `createRoot`, `BrowserRouter`
- `src/app.tsx` — MUI + Redux + upload-warning wrappers from `gatsby-browser.js`; renders `Routes`
- `src/app-routes.tsx` — explicit `{ path, Component }[]` from each `src/pages` file
- `src/vite-env.d.ts` — `/// <reference types="vite/client" />`
- `scripts/copy-spa-html.mjs` — post-build HTML copies

**Modify:**

- `package.json` — scripts and dependencies
- `Makefile` — develop/clean/install hooks off Gatsby onto Vite
- `.gitignore` — drop Gatsby `.cache` notes as needed; keep `public`
- `.eslintignore` — ignore `scripts` if eslint would lint the mjs; keep `public`
- `src/wrap-with-location.jsx` — react-router `useLocation` / `useNavigate`
- Every file that imports `gatsby`, `gatsby-link`, or `@gatsbyjs/reach-router` (list in Task 3)

**Delete after the app boots on Vite:**

- `gatsby-browser.js`, `gatsby-config.js`, `gatsby-node.js`, `gatsby-ssr.js`

**Do not add:** unit test files, `VITE_` prefixes, HTML files by hand in git.

---

### Task 1: Vite tooling

**Files:**

- Create: `vite.config.ts`
- Create: `index.html`
- Create: `static/favicon.png` (binary copy from `src/images/favicon.png`)
- Modify: `package.json`
- Modify: `Makefile`
- Modify: `.gitignore`

**Interfaces:**

- Consumes: nothing
- Produces:
  - `ENV_KEYS` (in `vite.config.ts`): `GRAPHQL_ENDPOINT`, `STAGE`, `IS_SENTRY_ENABLED`, `SBERT_ENDPOINT`, `LRS_USERNAME`, `LRS_PASSWORD`, `LRS_ENDPOINT`, `GOOGLE_CLIENT_ID`, `CLIENT_ENDPOINT`, `ACCESS_TOKEN`
  - `define` map: each `process.env.<KEY>` → `JSON.stringify(env[KEY] ?? "")`
  - npm scripts `develop` / `start` / `build` / `serve` / `clean` as below

- [ ] **Step 1: Add dependencies and scripts in `package.json`**

Add (do not put Gatsby back):

- dependencies: `react-router-dom@^6.28.0`, `query-string@^6.14.1`
- devDependencies: `vite@^6.0.0`, `@vitejs/plugin-react-swc@^3.7.0`, `vite-tsconfig-paths@^5.0.0`, `@types/react@^18.2.0`, `@types/react-dom@^18.2.0`

Replace scripts:

```json
"develop": "vite --port 3000",
"start": "vite --port 3000",
"build": "NODE_OPTIONS=--max_old_space_size=4096 vite build && node scripts/copy-spa-html.mjs",
"serve": "vite preview --port 3000 --base /admin/",
"clean": "rm -rf public"
```

Keep `format`, `test:audit`, `test:lint`, `test:types` unchanged. Change `"keywords"` from `gatsby` to `vite`.

Leave `build` calling `copy-spa-html.mjs` even before Task 4 exists; Task 4 adds the file before a full build is required. Until then, `develop` is the check.

- [ ] **Step 2: Write `vite.config.ts`**

`defineConfig(({ mode }) => { ... })` with:

- `loadEnv(mode, process.cwd(), ENV_KEYS)` merged under `process.env` (process.env wins)
- `plugins: [react(), tsconfigPaths()]`
- `base: "/admin/"`
- `publicDir: "static"`
- `server.port: 3000`
- `build.outDir: "public"`, `build.emptyOutDir: true`, `build.sourcemap: false`
- `define` as in Interfaces
- `optimizeDeps.include`: `["recordrtc", "videojs-record", "danfojs"]`

- [ ] **Step 3: Write `index.html` at `/client/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <title>Chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Copy `src/images/favicon.png` → `static/favicon.png`.

- [ ] **Step 4: Point Makefile at Vite**

- `clean`: `rm -rf public` (drop `.cache`)
- `develop`: depend on `node_modules/vite`, run `npx vite --port 3000`
- Replace `node_modules/gatsby` prereq with `node_modules/vite`
- Leave `format` / `test-*` / `build-deploy` structure; `build-deploy` already calls `npm run build` then `aws s3 sync ./public/`

`.gitignore`: keep `public`; remove the “gatsby files” `.cache/` comment or keep `.cache/` ignored. Do not gitignore `static/`.

- [ ] **Step 5: Install and typecheck config**

Run from `/client`: `npm install`

Expected: lockfile updates; `vite.config.ts` exists; `npx tsc --noEmit` may still fail until Task 2 (no `main.tsx` yet). Do not treat that as Task 1 failure.

- [ ] **Step 6: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.ts client/index.html client/static/favicon.png client/Makefile client/.gitignore
git commit -m "chore(client): add Vite tooling alongside Gatsby"
```

---

### Task 2: App shell and page router

**Files:**

- Create: `src/vite-env.d.ts`
- Create: `src/main.tsx`
- Create: `src/app.tsx`
- Create: `src/app-routes.tsx`

**Interfaces:**

- Consumes: `ENV_KEYS` / `define` from Task 1; default exports of every file under `src/pages`
- Produces:
  - `export const appRoutes: { path: string; Component: React.ComponentType }[]`
  - `export function App(): JSX.Element`
  - `BrowserRouter basename="/admin"` wrapping `App` in `main.tsx`

- [ ] **Step 1: Write `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

Include the USC license header.

- [ ] **Step 2: Write `src/app-routes.tsx`**

Import each page default export and export `appRoutes` with these paths (Gatsby file-to-route, no trailing slash, `index` → `/`):

| file | path |
|---|---|
| `pages/index` | `/` |
| `pages/config` | `/config` |
| `pages/feedback` | `/feedback` |
| `pages/followups` | `/followups` |
| `pages/importexport` | `/importexport` |
| `pages/lrsreports` | `/lrsreports` |
| `pages/organizations` | `/organizations` |
| `pages/record` | `/record` |
| `pages/setup` | `/setup` |
| `pages/signup` | `/signup` |
| `pages/subjects` | `/subjects` |
| `pages/users` | `/users` |
| `pages/author/subjects` | `/author/subjects` |
| `pages/author/subject` | `/author/subject` |
| `pages/author/subject/importquestions` | `/author/subject/importquestions` |

- [ ] **Step 3: Write `src/app.tsx`**

Move the component tree from `gatsby-browser.js` (`theme` with `palette.primary.main: "#1b6a9c"` and `spacing: 8`, `allowedAdminDomains`, `WarnFailedUpload`, `WarnExitPageDuringUpload`, `StyledEngineProvider` + `ThemeProvider` + `Provider store={store}`).

Render children as:

```tsx
<Routes>
  {appRoutes.map(({ path, Component }) => (
    <Route key={path} path={path} element={<Component />} />
  ))}
</Routes>
```

Do not keep `wrapRootElement` or an `element` prop.

- [ ] **Step 4: Write `src/main.tsx`**

Side-effect imports currently at the top of `gatsby-browser.js` (video.js CSS, videojs, webrtc-adapter, RecordRTC, videojs-record CSS/JS, `styles/layout.css`). Then:

```ts
if (process.env.IS_SENTRY_ENABLED === "true") {
  loadSentry();
}
```

Mount:

```tsx
createRoot(document.getElementById("root")!).render(
  <BrowserRouter basename="/admin">
    <App />
  </BrowserRouter>
);
```

- [ ] **Step 5: Confirm the dev server can boot**

Run: `npx vite --port 3000`

Expected: server starts; `/admin/` returns HTML. Pages that still `import { navigate } from "gatsby"` may explode on navigation; that is Task 3. If boot fails on missing `query-string` types, add `@types/query-string` rather than changing imports.

- [ ] **Step 6: Commit**

```bash
git add client/src/main.tsx client/src/app.tsx client/src/app-routes.tsx client/src/vite-env.d.ts
git commit -m "feat(client): mount Vite SPA shell and page routes"
```

---

### Task 3: Replace Gatsby routing APIs

**Files:**

- Modify: `src/wrap-with-location.jsx`
- Modify (replace `gatsby` / `gatsby-link` / `@gatsbyjs/reach-router` imports only; keep call sites as string `navigate(...)` / `<Link to>`):
  - `src/pages/organizations.tsx`
  - `src/pages/record.tsx`
  - `src/pages/author/subject.tsx`
  - `src/pages/author/subject/importquestions.tsx`
  - `src/pages/author/subjects.tsx` (`Link` + `navigate`)
  - `src/pages/subjects.tsx`
  - `src/hooks/wrap-with-authorization-only.jsx`
  - `src/hooks/mentor-recommender/use-with-mentor-recommender.tsx`
  - `src/hooks/graphql/use-with-review-answer-state.tsx`
  - `src/hooks/graphql/use-with-followups.tsx`
  - `src/hooks/graphql/use-with-record-state.tsx`
  - `src/hooks/graphql/use-with-setup.tsx`
  - `src/components/login.tsx`
  - `src/components/nav-bar.tsx`
  - `src/components/setup/record-subject-slide.tsx`
  - `src/components/setup/select-subjects-slide.tsx`
  - `src/components/setup/final-setup-slide.tsx`
  - `src/components/author/questions-list.tsx`
  - `src/components/record/uploading-widget.tsx`
  - `src/components/home/record-queue-block.tsx`
  - `src/components/home/index.tsx`
  - `src/components/users/user-item.tsx`
  - `src/components/import-export/import-in-progress.tsx`

**Interfaces:**

- Consumes: `BrowserRouter` from Task 2
- Produces: `withLocation` injects `{ location, navigate, search }` where `search` is `queryString.parse(location.search)` or `{}`

- [ ] **Step 1: Rewrite `withLocation` in `src/wrap-with-location.jsx`**

Use `useLocation` and `useNavigate` from `react-router-dom` and `query-string`. Drop `@gatsbyjs/reach-router` `Location`. Keep the HOC public API (`location`, `navigate`, `search`).

- [ ] **Step 2: Replace imports**

- `import { navigate } from "gatsby"` → `import { navigate } from "react-router-dom"` is **wrong**. Use `import { useNavigate }` only inside components/hooks, **or** keep calling the `navigate` function already passed by `withLocation` where that exists.

Locked rule: in modules that are React function components or hooks, switch to `const navigate = useNavigate()` from `react-router-dom` and delete the Gatsby import. In HOCs already under `withLocation`, either `useNavigate()` or the injected `props.navigate` is fine; pick `useNavigate()` for consistency.

- `import { Link, navigate } from "gatsby"` in `author/subjects.tsx` → `Link` from `react-router-dom` (`to` prop unchanged) plus `useNavigate()`.
- `import { navigate } from "gatsby-link"` → `useNavigate()`.
- `import { navigate } from "@gatsbyjs/reach-router"` → `useNavigate()`.

- [ ] **Step 3: Fix prefix-aware `/admin` targets**

In `src/components/setup/final-setup-slide.tsx`, `navigate("/admin")` → `navigate("/")`.

In `src/components/import-export/import-in-progress.tsx`, `navigate("/admin/")` → `navigate("/")`.

Leave other `navigate("/…")` paths unchanged (`/`, `/setup`, `/subjects`, etc.).

- [ ] **Step 4: Grep that Gatsby routing is gone**

Run from `/client`:

```bash
grep -R "from \"gatsby\"\\|from \"gatsby-link\"\\|from \"@gatsbyjs" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" src
```

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add client/src
git commit -m "refactor(client): replace Gatsby navigate/Link with react-router"
```

---

### Task 4: Post-build SPA HTML copies

**Files:**

- Create: `scripts/copy-spa-html.mjs`

**Interfaces:**

- Consumes: `src/pages/**/*.{tsx,jsx}` and `public/index.html` from `vite build`
- Produces: for every page file except `index.tsx`/`index.jsx`, `public/<route>/index.html` equal to `public/index.html`; also `public/404.html`

- [ ] **Step 1: Write `scripts/copy-spa-html.mjs`**

Algorithm: walk `src/pages` recursively; for each `.tsx`/`.jsx` file, convert the relative path to a route by stripping the extension and stripping a trailing `/index`; skip the route `""` (home, already `public/index.html`); `fs.mkdirSync(public/<route>, { recursive: true })` and copy `public/index.html` to `public/<route>/index.html`. Then copy `public/index.html` to `public/404.html`. If `public/index.html` is missing, `process.exit(1)`.

- [ ] **Step 2: Run build**

Run from `/client`: `npm run build`

Expected: `public/index.html`, `public/users/index.html`, `public/author/subject/importquestions/index.html`, `public/404.html` exist and are identical shells. Asset URLs under `/admin/assets/…`.

- [ ] **Step 3: Commit**

```bash
git add client/scripts/copy-spa-html.mjs client/package.json
git commit -m "feat(client): copy SPA index.html to each page path"
```

---

### Task 5: Remove Gatsby

**Files:**

- Delete: `gatsby-browser.js`, `gatsby-config.js`, `gatsby-node.js`, `gatsby-ssr.js`
- Modify: `package.json` (remove Gatsby packages)

**Interfaces:**

- Consumes: Tasks 2–3 (app no longer imports those files)
- Produces: no `gatsby` / `gatsby-*` / `@gatsbyjs/*` dependencies

- [ ] **Step 1: Remove packages**

Uninstall:

- `gatsby`
- `@gatsbyjs/reach-router`
- `@iostindex/gatsby-plugin-material-ui`
- `@types/gatsbyjs__reach-router`
- `gatsby-plugin-env-variables`
- `gatsby-plugin-manifest`
- `gatsby-plugin-sitemap`
- `gatsby-plugin-typescript`

- [ ] **Step 2: Delete the four Gatsby root files**

- [ ] **Step 3: Confirm no remaining Gatsby imports in `/client` except lockfile history**

```bash
grep -R "gatsby" --include="package.json" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="Makefile" .
```

Expected: no runtime references. `bin/gatsby_wait_for_ready.sh` may remain (Cypress, out of scope); do not delete it unless it is the only leftover and you are sure nothing invokes it from `/client`.

- [ ] **Step 4: Commit**

```bash
git add -u client
git commit -m "chore(client): remove Gatsby"
```

---

### Task 6: Format, types, lint

**Files:** any prettier/eslint/license fixes required by the new sources.

**Interfaces:**

- Consumes: Tasks 1–5
- Produces: `make format` and `make test-all` exit 0 from `/client`

- [ ] **Step 1: Format**

Run from `/client`: `make format`

Expected: license headers on new `src/*` files; prettier lf/width 80.

- [ ] **Step 2: test-all**

Run from `/client`: `make test-all`

Expected: test-format, test-lint, test-license, test-types pass. If `test:types` fails on missing DOM types, set `tsconfig.json` `"jsx"` only if required; prefer adding `"types": ["vite/client", "node"]` over loosening `strict`.

- [ ] **Step 3: Rebuild**

Run: `npm run build`

Expected: same HTML copy set as Task 4. `grep -R "from \"gatsby\"" src` still empty.

- [ ] **Step 4: Commit leftover format/type fixes if any**

```bash
git add client
git commit -m "chore(client): format and typecheck Vite migration"
```

Skip this commit if the working tree is clean.

---

## Self-review

1. **Spec coverage:** Vite SPA, pages router, HTML copies, `process.env` allow-list, browser shell, `/admin` basename, client-only, no unit tests, `make format` / `make test-all` — each has a task.
2. **Steps:** no unit-test RED/GREEN (user forbade tests). Verification is grep, vite boot, `npm run build`, `make format`, `make test-all`.
3. **Types:** `appRoutes`, `ENV_KEYS`, `withLocation` props, `basename="/admin"` are consistent across tasks.
4. **Review Focus:** HTML copies (Task 4), env define (Task 1), `/admin` navigate (Task 3), nav pathname (Task 2/3), `@types/react` (Task 1).
5. **Proportion:** plan lists files, signatures, and commands; it does not transcribe `gatsby-browser.js` bodies.
