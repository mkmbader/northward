# Northward

A workout and hike log that runs in the browser and is installed on the phone's home screen. Production: https://mkmbader.github.io/northward/ (deployed by GitHub Pages from `main`).

## Run locally for testing

You need Python 3, which macOS already includes. There is no build step.

```sh
cd northward
python3 -m http.server 8000
```

- **On the laptop:** open http://localhost:8000
- **On the phone** (same Wi-Fi as the laptop):
  1. Get the laptop's address with `ipconfig getifaddr en0`, e.g. `192.168.1.23`.
  2. Open `http://192.168.1.23:8000` in Safari.

Stop the server with `Ctrl+C`.

A red **TEST** badge in the top-right corner means you are not on production. Open the app through the server; double-clicking `index.html` (a `file://` address) won't load it properly.

### Testing does not touch production data

- **Storage:** the browser keeps data per address. `localhost:8000` and `192.168.x.x:8000` each have their own storage and can't read the data in the home-screen app.
- **GitHub backup:** in Setup → Backup to GitHub, enter the test repo (`mkmbader/northward-data-test`), not the real one.
- **Realistic data:** in the production app, tap **Back up**, move the file to the laptop, and use **Restore from backup** in the local copy.

### If a change doesn't show up

The browser may be using a cached file. Reload with `Cmd+Shift+R`. On the phone, close the tab and open it again.

## Project layout

```
index.html        markup + the list of CSS/JS files
css/app.css       all styles
js/helpers.js     small shared helpers, production check (IS_PROD)
js/seed.js        default training plan
js/storage.js     load/save of workout data (localStorage)
js/sync.js        GitHub backup settings and API calls
js/model.js       data model helpers + UI state
js/theme.js       themes, day/dusk (Amsterdam sunset), landscapes, Norwegian greetings + sayings
js/train.js       Train + Hikes screens
js/progress.js    Progress screen + charts
js/history.js     History screen
js/setup.js       Setup screen, welcome screen, backup card, export/import
js/celebrate.js   workout-complete and hike celebrations
js/actions.js     button/input handlers + startup
```

The files are plain scripts that share one global scope, so **the order of the `<script>` tags in `index.html` matters**. A file may only use code from earlier files when it is loaded (e.g. `storage.js` calls `seedDays()` from `seed.js`). Inside functions that run later, such as screens and button handlers, the order doesn't matter.

## Releasing a change

1. Work on a branch, never directly on `main` (it's protected).
2. Raise the version in `index.html` on every CSS/JS file, e.g. replace `?v=1` with `?v=2` everywhere. This makes phones download the new files instead of combining new and cached old ones.
3. Push the branch, open a pull request, and merge it. GitHub Pages updates in about a minute.
4. Reopen the home-screen app to pick up the update.
