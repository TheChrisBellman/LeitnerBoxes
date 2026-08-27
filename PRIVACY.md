# Privacy and local data

LeitnerBoxes is a client-side app. It does not create accounts, collect names or email addresses, or send learning data to an application backend.

## What is stored

The app uses one browser `localStorage` entry named `leitner-boxes:state:v5`. It contains:

- Appearance preference: light or dark mode.
- Practice preference: mixed, vocabulary, or conjugation.
- Missed-answer preference: step back one box or return to Box 1.
- Correct-answer continuation preference: advance automatically or wait for a manual action.
- Cards-per-session goal.
- Selected curriculum unit IDs.
- For each reviewed card: its Leitner box and next due date. Box 5 cards may also include a small maintenance-step number.
- The current streak count and the date it was last completed.

The current quiz, answer choices, and session summary are held in memory only. They are not written to storage.

## Retention and visibility

This data is retained until the user resets it, clears site data in the browser, or the browser removes the site's storage. There is no automatic expiry. Data is scoped to this site's origin and browser profile: another device or browser starts clean, while another person using the same browser profile may see the existing progress.

The app does not use cookies, IndexedDB, a service-worker cache, analytics, telemetry, or runtime network submission of learning data. Hosting-provider access logs are outside the app and this repository's control.

## Delete local data

Open the app menu and choose **Reset all local data**, then confirm. This removes the app's `leitner-boxes:state:v5` entry, earlier `leitner-boxes:state:v4` and `leitner-boxes:state:v3` data, and any legacy `leitner-v1` entry. It resets progress, streak, curriculum selection, and preferences. Browser site-data settings can also remove it. If browser storage is unavailable, the app will direct you to those settings instead.
