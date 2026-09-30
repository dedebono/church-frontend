# MLB Church Frontend — PRD

## Problem statement
Run the existing church community web app (member registration, admin console, finance dashboard, events, sermons, birthday reminders) in this environment. No new features — just get the existing project running.

## Architecture
- Pure React frontend (Create React App, react-scripts) served on port 3000 via supervisor (`yarn start` at /app/frontend → `yarn --cwd /app start`).
- Talks to an EXTERNAL hosted backend: `https://church-backend-no8q.onrender.com` (free tier, may sleep). Not part of this project, not modified.
- API calls route through `src/setupProxy.js` (dev proxy) to bypass CORS. `src/pages/admin/api/API.js` resolves backends; preview host now treated as dev-preview so requests use relative `/api` → proxy.
- Firebase (uploads) runs with placeholder/mock config — upload features present but non-functional until real keys added.

## User personas
- Church members (register, view info)
- Church admins (manage members, events, sermons, groups, devotions)
- Finance staff (finance dashboard)

## Core requirements
- Public home, registration form, OTP login load and are usable.
- Admin console and finance dashboard are protected routes, depend on live backend.

## What's been implemented (2026-06 / this run)
- Installed frontend deps with `yarn install --ignore-engines` (engine mismatch for @testing-library/jest-dom).
- Created `/app/.env` pointing REACT_APP_*_BACKENDS / API / SOCKET to onrender backend.
- Updated `setupProxy.js` default target → onrender backend.
- Updated `API.js` isDevPreview to include emergentagent.com/emergent.host → requests route through proxy.
- Verified: home page and `/login` (OTP "Kirim Kode") render correctly; app serves HTTP 200.

## GMS-style restyle (2026-06)
- Restyled the public HomePage to mirror gms.church: pure-black cinematic theme, grayscale imagery, giant "Welcome Home" signature script (Great Vibes), minimalist wide-tracked uppercase nav (Montserrat) floating over hero, italic-serif logo, scrolling marquee band, monochrome editorial cards/sections with grayscale→color hover.
- Files: new `src/pages/admin/gms-theme.css` (override, scoped to `.home`, imported after HomePageNot.css); JSX additions in `src/pages/HomePage.js` (`.gms-welcome` hero overlay + `.gms-marquee`).
- Hero headline set to "Welcome to this community"; events section converted to a sliding Swiper carousel with arrows/dots (GMS "Acara Kita" style).
- Auth screens restyled to match: new `src/pages/admin/gms-auth.css` imported in `AdminLogin.js` + `RegistrationForm.js` (grayscale backdrop, glass/black cards, script/serif accents, white pill buttons). Scoped to auth wrappers; admin/finance untouched.
- Pastor Spotlight section added to `HomePage.js` (id `pastor`): grayscale portrait (`/public/pastor-ronny.jpg`), name/role/tagline, collapsible height-matched bio, Instagram pill link. Styles in gms-theme.css (`.pastor-*`).
- Brand identity applied: logo (`/public/mlb-logo.png` + on-dark `mlb-logo-ondark.png`) in home nav, login card, registration sidebar. Favicon set generated from the heart+cross mark (favicon.ico, mark_16/32, logo192/512, apple-touch-icon). `index.html` title "Making Life Better Church", theme-color `#000080`; `manifest.json` updated. Brand gold `#d6aa30` used as accent (buttons, title underlines, nav hover, hero subtitle, carousel dots, pastor role, auth CTAs) over the black cinematic base.
- Non-destructive: original HomePageNot.css untouched; admin/finance views unaffected (scoped to `.home`).

## Backlog / next phases
- Phase 2: Wake hosted backend and verify OTP login, admin console, finance dashboard end-to-end.
- Phase 3: Add real Firebase keys to enable photo/document uploads.
- README merge-conflict markers left untouched (intentional).
