# LUXIAL Angular site

This Angular application serves the Portuguese and English LUXIAL pages at their original URLs. Each page type has one Angular standalone component shared by both locales. The original URLs remain separate routes, while `ngx-translate` loads the matching Portuguese or English text from `public/i18n/`. Shared header/navigation and footer components use the same dictionaries. The original stylesheet, fonts, images, and page interactions are preserved.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/`. All original page routes are available directly, including `/sobre/`, `/contactos/`, `/en/about/`, and both property detail pages.

## Build

```bash
npm run build
```

The nine shared page templates and components are under `src/app/pages/`. Translation dictionaries are under `public/i18n/`. Images and the original stylesheet are under `public/_astro/`; fonts are under `public/fonts/`.

The original lead forms and client-side validation are preserved. Form submissions require the original `/api/leads` backend, which is not included in this static-site source.

The Três Castelos availability calendar reads `public/reservations.ics`. Replace that file with the property's iCalendar export to show reservation dates; visitors can also import an `.ics` file locally in the calendar.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys the site on every push to `main`. For the first deployment, set the repository's Pages source to **GitHub Actions** in Settings → Pages. The workflow configures the correct base path for project repositories and publishes a `404.html` fallback for Angular routes.
