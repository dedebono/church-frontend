# PRD — MLB Church Frontend (church-frontend)

## Problem Statement (original)
"Perbaiki tampilannya supaya lebih modern dan seragam, gunakan efek yang sederhana tanpa perlu merubah backend."
User choices: Dark mode, minimalis & clean, no brand color constraints.

## Architecture
- Single CRA React app at /app (package.json at root; symlink /app/frontend -> /app for supervisor `yarn start`, port 3000)
- External backend: https://church-backend-no8q.onrender.com (DO NOT MODIFY). Env: REACT_APP_DEV_BACKENDS / REACT_APP_PROD_BACKENDS / REACT_APP_API_URL in /app/.env
- Firebase storage via REACT_APP_FIREBASE_* env vars (currently placeholders — uploads may not work without real keys)
- Socket.io client connects to API origin
- Routes: / (HomePage), /register, /login (OTP), /admin (protected), /finance (protected), /form, /reset-password/:type/:token, /test-birthday

## Design System (implemented 2026-09-15)
- Dark minimal theme: bg #0a0a0d, surfaces #131318/#1a1a21, border rgba(255,255,255,.08), text #f4f4f6/#9b9ba4, gold accent #d4a24e
- Fonts: Manrope (body) + Fraunces (display headings)
- Tokens in /app/src/index.css `:root` (names preserved so AdminPage.css/Dashboard.css adapt automatically)
- Global normalization layer in index.css scoped to `.admin-layout` and `.finance-dashboard` (cards, tables, inputs, buttons, modals, badges, SweetAlert2, Toastify, react-calendar)
- Homepage CSS fully rewritten, all selectors scoped under `.home` to avoid collisions with unscoped admin CSS (EventsAdmin/SermonCMS etc. define global .btn-primary/.btn-secondary)
- formpage.js root div given className="home" to inherit scoped nav/footer styles
- Effects: simple fadeUp entrances, hover lift, gold focus rings, blur navbar/glass hero card

## Files rewritten
- src/index.css, src/App.css
- src/pages/admin/HomePageNot.css, src/pages/footerPage.css, src/pages/ChurchInfoCard.css
- src/pages/AdminLogin.css, src/pages/AdminPage.css, src/pages/RegistrationForm.css, src/pages/formpage.css, src/pages/FinanceDashboard.css
- src/pages/RegistrationForm.js (Batal button -> btn-secondary-regis), src/pages/formpage.js (root class)

## Testing
- iteration_1.json: dark theme verified on /, /login, /register, /form desktop+mobile; 3 bugs found & fixed (invisible Lanjutkan text, Batal button style, /form horizontal overflow)
- Backend 503 (Render down) during testing — error states verified as graceful; protected pages (/admin, /finance) untested (OTP login needs live backend)

## Backlog
- P1: Verify /admin & /finance visually once backend is up (OTP login)
- P2: Deep-polish admin sub-pages (SermonCMS, EventsAdmin, GalleryAdmin, ManageGroups, DevotionCalendar still have own legacy CSS under the normalization layer)
- P2: Restyle Reset-password page (currently inline styles)
- P2: Replace placeholder Firebase keys with real ones for admin uploads
