# Fadhail Amal (web app / PWA)

The iPhone-friendly version of the Android app *Totolan ko mga Sahaba / Fadhail Amal*.
It is an installable web app (PWA) built with Angular + Ionic, hosted for free on GitHub Pages.

## What is where

| Path | What it is |
| --- | --- |
| `public/books/` | The book pages, CSS and fonts, copied from the Android app's `app/src/main/assets` |
| `public/data/content.json` | Table of contents of every book, converted from `SahabaContent.java` |
| `src/app/pages/` | Screens: home, book (chapter list), reader, favorites, corrections, about |
| `src/app/services/` | Book data, saved settings (favorites, last read, text size, corrections), email |
| `ngsw-config.json` | Offline caching (service worker) |
| `.github/workflows/deploy.yml` | Builds and publishes to GitHub Pages on every push to `main` |

## Run it on your computer

```bash
npm install
npm start          # http://localhost:4200 (no offline caching in this mode)
```

## Publish to GitHub Pages (first time)

1. On github.com, create a new **public** repository, e.g. `fadhail-amal-pwa` (no README).
2. In this folder:
   ```bash
   git init -b main
   git add .
   git commit -m "Fadhail Amal web app"
   git remote add origin https://github.com/<your-username>/fadhail-amal-pwa.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green (about 2 minutes).
   If it ran before step 3 and failed, click it and choose **Re-run all jobs**.
5. The app is at `https://<your-username>.github.io/fadhail-amal-pwa/`

## Update the app later

Change files, then:

```bash
git add .
git commit -m "Describe the change"
git push
```

GitHub rebuilds it. Installed phones pick up the new version the next time the app is
opened (sometimes it takes one more open, because the old version is shown while the new one downloads).

## Install on iPhone

1. Open the link in **Safari** (on iPhone, Safari is the reliable way to add web apps to the Home Screen).
2. Tap **Share** (square with the arrow) → **Add to Home Screen** → **Add**.
3. Open it from the new icon. Pages that have been opened once also work without internet.

## Syncing changes from the Android app

The books are copies. When you fix text in the Android project, copy the changed files again:

```bash
cp -r ../totolankomgasahaba/app/src/main/assets/. public/books/
```

If you add or rename pages in `SahabaContent.java`, regenerate the table of contents:

```bash
python3 scripts/convert-content.py ../totolankomgasahaba/app/src/main/java/com/nzpenterprises/totolankomgasahaba/sahaba/SahabaContent.java public/data/content.json
```

## License

Open source under the [Apache License 2.0](LICENSE). Copyright 2026 Mohammad Rasol Z. Pangcoga (iNZPdev).

You may use, change and republish this app, **as long as you credit the original project**:
keep the [NOTICE](NOTICE) file, show the credit to the original project where users can see it
(for example on an About screen), and mark the files you changed.

The book texts belong to their authors, translators and publishers and are not covered by this license.
