# eBird Dashboard
Mobile-first personal checklist dashboard. GitHub Pages frontend, same-origin Cloudflare Worker /api/*, D1 and owner-only Access (720h). Source only, no personal data or credentials in Git.

## Development
Node.js 22: npm install, npm test, npm run build. Serve site/ locally and import ZIP/CSV for local preview. Cloud sync requires the authenticated API.

## Deployment
Settings → Pages → GitHub Actions; custom domain ebird-dashboard.christorng.idv.tw. Configure DNS, Worker route, Access and TLS separately. Frontend changes do not deploy the Worker or migrate D1. Worker schema migration is separate. The API validates Access JWT and same-origin POST. Disable alternative Worker endpoints.

## Limitations
Species count is provisional, based on scientific binomials. X is excluded from known individual totals; checklists are upserted by ID without automatic deletion. Local preview is temporary. Automatic eBird synchronization not implemented. Real mobile and authenticated production tests are required.
