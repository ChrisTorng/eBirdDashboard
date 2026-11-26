# eBird Dashboard
Mobile-first personal checklist dashboard. GitHub Pages frontend, same-origin Cloudflare Worker /api/*, D1 and owner-only Access (720h). Source only, no personal data or credentials in Git.

## Development
Node.js 22: npm install, npm test, npm run build. Serve site/ locally and import ZIP/CSV for local preview. Cloud sync requires the authenticated API.

## Deployment
Settings → Pages → GitHub Actions; custom domain ebird-dashboard.christorng.idv.tw. Configure DNS, Worker route, Access and TLS separately. Frontend changes do not deploy the Worker or migrate D1. Worker schema migration is separate. The API validates Access JWT and same-origin POST. Disable alternative Worker endpoints.

## Limitations
Species count uses official eBird taxonomy v2026, scientific-name exact matching, official REPORT_AS parents, and unresolved observations excluded. Original observed taxon names are retained. The annual change workflow requires a fresh full eBird export and explicit version migration; different taxonomy versions cannot be mixed. Taxonomy fetch is version-checked against the published 11,201 species and 2026 changes. Taxon Concept IDs are preserved when the official source includes them. The official source is https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv&locale=zh; Cornell v2026 release: https://www.birds.cornell.edu/clementschecklist/introduction/updateindex/october-2026/. X is excluded from known individual totals; checklists are upserted by ID without automatic deletion. Local preview is temporary. Automatic eBird synchronization not implemented. Real mobile and authenticated production tests are required.


Taxonomy data is fetched during the build and served as a public static reference (not personal data). The Worker separately fetches and verifies the same release before importing data. If official data is unavailable, import fails rather than guessing. Existing checklist observations are archived on change by migration 0002.
