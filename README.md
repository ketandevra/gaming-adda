# The Gaming Adda

Next.js frontend for booking game console slots, powered by a **Google Apps Script** API backed by Google Sheets.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Sheets API

Set in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Endpoints used

| Action | Method | Parameters | Description |
|--------|--------|------------|-------------|
| `consoleTypes` | GET | — | List all console types |
| `availableSlots` | GET | `consoleTypeId`, `bookingDate` (YYYY-MM-DD) | Hourly slots for a console on a date |
| `myBookings` | GET | `mobile` | List bookings for a user |
| `createBooking` | POST | JSON body | Create booking (set action name via env if different) |

Example console list:

```
GET .../exec?action=consoleTypes
```

Returns:

```json
[
  { "id": 1, "name": "PlayStation 5 Pro Station", "pricePerHour": 300 }
]
```

Example slots:

```
GET .../exec?action=availableSlots&consoleTypeId=1&bookingDate=2026-06-15
```

Browser requests go through `/api/sheets` to avoid CORS issues.

### Create booking

If your script uses a different POST action name, set:

```env
NEXT_PUBLIC_SHEETS_ACTION_CREATE_BOOKING=yourActionName
```

POST body sent to your script:

```json
{
  "action": "createBooking",
  "consoleTypeId": 1,
  "consoleId": 1,
  "date": "2026-06-15",
  "startTime": "18:00",
  "endTime": "19:00",
  "customerName": "...",
  "customerEmail": "...",
  "customerPhone": "...",
  "notes": "optional"
}
```

Share your create-booking action name if it differs and we can wire it in.

### CORS (required for GitHub Pages)

GitHub Pages serves static files only — there is no `/api/sheets` proxy in production. The browser calls your Apps Script URL directly. Your script must allow cross-origin requests from your Pages domain (e.g. `https://ketandevra.github.io`). Add appropriate `Access-Control-Allow-Origin` headers in `doGet` / `doPost` (or deploy the web app with settings that permit browser `fetch`).

Local `npm run dev` still uses `/api/sheets` by default to avoid CORS during development.

## GitHub Pages

Live URL (after deploy): **https://ketandevra.github.io/gaming-adda/**

### One-time repo setup

1. **Settings → Pages → Build and deployment → Source:** GitHub Actions  
2. **Settings → Secrets and variables → Actions → New repository secret**  
   - Name: `NEXT_PUBLIC_API_URL`  
   - Value: your Google Apps Script `/exec` URL  
3. (Optional) **Repository variables** for `NEXT_PUBLIC_PAYMENT_UPI_VPA`, `NEXT_PUBLIC_PAYMENT_UPI_PAYEE_NAME`, etc.

Pushes to `main` run `.github/workflows/deploy-github-pages.yml` and publish the `out/` folder.

### Local static preview (same as Pages)

```bash
npm run build:gh-pages
npx serve out
```

Open `http://localhost:3000/gaming-adda/` (paths use the `/gaming-adda` base).

To test against your API during export, set `NEXT_PUBLIC_API_URL` in `.env.local` before running `build:gh-pages`.

## Scripts

- `npm run dev` — Development server with webpack (stable; uses `/api/sheets` proxy)
- `npm run dev:turbo` — Same with Turbopack (faster, but can break in nested folders — run `npm run clean` if you see errors)
- `npm run clean` — Remove `.next` build cache
- `npm run build` — Standard Next.js build (Node server / Vercel)
- `npm run build:gh-pages` — Static export into `out/` for GitHub Pages
- `npm run start` — Start production server (after `npm run build`)
