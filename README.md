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

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Start production server
