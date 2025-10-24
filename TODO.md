# TODO: Fix AdminBirthdayReminder to use dateHelpers for correct birthday display

## Steps to Complete

- [x] Update API.js: Modify getTodaysBirthdays function to accept an optional date parameter and use query param for date-specific birthdays
- [x] Update AdminBirthdayReminder.js: Import dateHelpers, calculate today's date in Makassar time (YYYY-MM-DD format), and pass it to getTodaysBirthdays
- [x] Test the birthday reminder to ensure it shows today's birthdays correctly in Makassar time
