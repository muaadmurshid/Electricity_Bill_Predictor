# Electricity Bill Predictor — Frontend

React + Vite frontend for the Spring Boot backend. This is stage 1 of the
build order: project setup, Axios, AuthContext, login, registration,
route protection, the app layout, and a dashboard shell.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173

The backend URL comes from `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

It is read once, in `src/api/axios.js`. No component hard-codes a URL.

### If the browser blocks the requests

Spring Boot needs to allow the Vite origin. Either add
`@CrossOrigin(origins = "http://localhost:5173")` or, better, a global CORS
config allowing that origin with credentials and the `Authorization` header.

## What works right now

| Screen | Status |
| --- | --- |
| `/` landing | Done |
| `/login` | Live — `POST /api/auth/login` |
| `/register` | Live — `POST /api/auth/register` |
| `/dashboard` | Layout and empty states; figures not wired |
| `/profile` | Shows the session from AuthContext |
| Everything else | Labelled shell + a service file ready to use |

The module pages are shells on purpose. Each one names the Java files
needed to finish it, so no field name or endpoint is guessed.

## Testing auth first

1. Register a new account. You should land on `/dashboard`.
2. Refresh — you should stay signed in.
3. Open DevTools → Application → Local Storage. `mfp_auth` holds the token.
4. Open Network on any protected call and confirm the request carries
   `Authorization: Bearer <token>`.
5. Corrupt the stored token and reload — you should be sent to
   `/login?expired=1` with a message.
6. Sign out and try `/dashboard` directly — you should be redirected.

Only move on to the household module once all six pass.

## Folder structure

```
src/
├── api/axios.js            Axios instance + JWT interceptors
├── context/AuthContext.jsx Session state, login/register/logout
├── routes/                 ProtectedRoute, PublicOnlyRoute
├── services/               One file per backend route group
├── components/
│   ├── common/             Button, Card, Field, Modal, StatCard,
│   │                       BlockMeter, StatusBadge, EmptyState…
│   └── layout/             Sidebar, Navbar, MainLayout, AuthPanel
├── pages/                  One file per route
├── styles/                 theme.css, base.css, components.css
├── utils/                  format.js, apiError.js
├── App.jsx                 Routes
└── main.jsx                Entry point
```

## The theme

All design tokens live in `src/styles/theme.css`. Change a value there and
it updates everywhere.

**Colour**

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary` | `#620000` | Buttons, links, filled meter steps, avatar |
| `--color-deep` | `#2A0707` | Sidebar, auth panel |
| `--color-accent` | `#D9A441` | Gold highlight on the deep panels only |
| `--color-bg` | `#F7F4F3` | Page background |
| `--color-success` | `#276B4C` | `WITHIN_BUDGET`, `ON_TRACK` |
| `--color-warning` | `#A76300` | `WARNING`, `AT_RISK` |
| `--color-danger` | `#C0392B` | `OVER_BUDGET`, `MISSED` |

Two rules keep the red readable. Gold appears only on the dark maroon
panels — never on white, where it fails contrast. And success is green
rather than the brand colour, so "within budget" is not the same red as
every button on the page.

**Type**

- **Sora** — headings
- **Inter** — body text
- **IBM Plex Mono** — every number, unit, and small uppercase label, so
  kWh and LKR figures line up in columns

Fonts load from Google Fonts in `index.html`. For an offline demo,
download them into `src/assets/fonts/` and swap the link for `@font-face`.

**The block meter**

`<BlockMeter />` is the recurring visual idea. A Sri Lankan bill is not one
rate, it is a ladder of blocks, so progress is drawn as discrete rising
steps rather than a smooth bar. The same motif is the logo mark, the
empty-state mark, and the illustration on the auth screens.

It takes a `percent` and a `tone`, both of which come from the backend.
It never decides whether you are over budget.

## House rules this code follows

- No bill calculation, tariff logic, or ML in React. Formatting only.
- React calls Spring Boot only, never the FastAPI service on port 8000.
- No `userId` input anywhere — the backend reads the owner from the JWT.
- Backend statuses (`WITHIN_BUDGET`, `ON_TRACK`, …) are displayed, never
  re-derived.
- Errors go through `getErrorMessage()`. A user sees "Email already
  exists", never "Error 400" or a stack trace.

## Adding the next module

1. Paste the Controller, Entity and DTO into the chat.
2. Correct the `ENDPOINTS` object in that module's service file.
3. Replace the `<ModulePlaceholder />` in the page with the real screen.
4. Give it four states: loading, empty, error, and content.

## Notes

- React 18 and React Router 6 are pinned for stability. Both are fine to
  bump, but Router 7 changes some APIs.
- `chart.js` and `react-chartjs-2` are installed but unused until the
  analytics module — the chart components need the real response shape.
- Admin routes have a commented-out slot in `App.jsx`. Add an `AdminRoute`
  guard once the backend exposes the role.
