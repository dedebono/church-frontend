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

## Backlog / next phases
- Phase 2: Wake hosted backend and verify OTP login, admin console, finance dashboard end-to-end.
- Phase 3: Add real Firebase keys to enable photo/document uploads.
- README merge-conflict markers left untouched (intentional).
