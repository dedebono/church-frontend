# Run the Church Frontend App

An existing web app for a church community — member registration, an admin console, a finance dashboard, events, sermons, and birthday reminders. The goal here is simply to get the existing project up and running in this environment, not to add new features.

## Who it's for
- Church members registering and viewing information
- Church admins managing members, events, sermons, groups, and devotions
- Finance staff viewing the finance dashboard

## Core features and experience
The app already contains these areas (they come from the existing code, not new work):
- Public home page with church info, events, and sermons
- Member registration form
- Login via one-time code (OTP)
- Protected admin console (members, events, sermons, gallery, groups, devotion calendar, birthday reminders)
- Protected finance dashboard with charts
- Password reset and a birthday-test page

## How it will run
- The app connects to the existing hosted backend at `church-backend-no8q.onrender.com`. This backend is not part of this project and will not be changed.
- Because that backend is on a free tier, it may be asleep or slow on first use and can return temporary errors until it wakes up. Anything that needs live data (login by OTP, admin console, finance dashboard) depends on that backend being awake.
- Photo/document uploads use Firebase, which will run **without real keys**. Upload features will be present but non-functional for now; the rest of the app is unaffected.
- The README's leftover merge-conflict text will be left as-is (it does not affect running the app).

## What "done" looks like for this phase
- The frontend builds and serves without errors.
- The home page, registration form, and login screen load and are usable.
- The app is pointed at the hosted backend, so live features work whenever that backend is awake.
- Pages that depend on the backend or on Firebase degrade gracefully (clear states/messages) rather than crashing when those services are unavailable.

## Implementation phases

### Phase 1 (built now) — Get it running
- Configure the app to talk to the hosted backend and to start cleanly without real Firebase keys.
- Verify the app serves and the public pages (home, registration, login) load correctly.
- Confirm backend-dependent pages behave sensibly when the backend is asleep or unavailable.

### Phase 2 (later) — Full verification with a live backend
- Wake/confirm the hosted backend and verify OTP login, the admin console, and the finance dashboard end to end.

### Phase 3 (later) — Enable uploads
- Add real Firebase keys so photo/document uploads work.

## Assumptions
- Only the frontend is run here; the backend stays as the existing hosted one and is not modified.
- No new features or redesign are requested — this is strictly getting the existing project running.
- Firebase runs with placeholder config; upload-related actions may show errors or do nothing until real keys are added.
- Temporary backend downtime (sleeping free tier) is expected and is not treated as an app bug.
- The README merge-conflict markers are left untouched.
