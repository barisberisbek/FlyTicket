# FlyTicket ✈️

A complete full-stack airline ticket booking web application built for the
**CENG-3502 — Dynamic Web Programming** final project.

FlyTicket lets travellers search for flights between any of Turkey's 81 provinces,
choose a seat, simulate a payment, and receive an HTML e-ticket by email.
Administrators sign in to a separate panel where they can manage flights and
inspect every booking.

---

## Tech stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | HTML5, CSS3, **Vanilla JavaScript (ES6 modules, component classes)**, **Bootstrap 5** (CDN) |
| Data fetching | Fetch API (`async/await`), no third-party HTTP client |
| Backend | Node.js + **Express.js** (REST API, JSON only) |
| Database | **MongoDB** + **Mongoose** ODM |
| Auth | **JWT** + **bcryptjs** |
| Email | **Nodemailer** (SMTP) |
| Other | dotenv · cors · morgan · express-validator · nanoid · nodemon (dev) |

> No SPA framework, no SQL database, no server-side templating engine.

---

## Bonus features (all 5 implemented ✅)

- ✅ **Seat selection** — interactive seat-map (rows × A–F), multi-passenger support, atomic backend booking
- ✅ **E-ticket email via SMTP** — Nodemailer, fire-and-forget, never blocks booking
- ✅ **Payment simulation** — Luhn card validation, 1.5s processing delay, saved cards
- ✅ **User authentication** — register / login, JWT, profile page, My Tickets
- ✅ **Mobile responsive design** — Bootstrap 5 grid + dark mode + custom breakpoints

---

## Extra features (beyond requirements)

| Feature | Details |
|---------|---------|
| Dark mode | CSS variable toggle, saved to localStorage |
| Flight status | Scheduled / Delayed / Cancelled badges, admin-updatable |
| Ticket cancellation | Policy: >48h 100%, 24–48h 75%, 12–24h 50%, <12h 0% |
| Round-trip search | One Way / Round Trip toggle + return date |
| Multi-passenger | 1–4 passengers, multiple seat selection, grouped booking_ref |
| Saved cards | Post-payment save, quick-select on next payment |
| User profile page | Edit info, change password, saved cards, travel stats |
| Admin stats dashboard | Total flights, bookings, revenue, avg occupancy |
| Admin bookings filter | Live filter by email / flight ID / status |
| Flight sort | Sort by departure time, price ↑↓ |
| Booking step indicator | Search → Seat → Payment → Confirm progress bar |
| Admin settings page | Admin password change |
| URL pre-fill | `?from=&to=&date=` auto-fills and triggers search |
| CSS animations | slide-up card reveal, shimmer skeleton loading |

---

## Prerequisites

- Node.js **18+**
- MongoDB **6+** running locally on `mongodb://127.0.0.1:27017`
- npm

---

## Setup

```powershell
# 1. Backend — Terminal 1
cd FlyTicket\backend
npm install
# .env already configured; edit SMTP_* if you want email sending
npm run seed     # seeds 81 cities + default admin + 30 sample flights
npm run dev      # API at http://localhost:5000

# 2. Frontend — Terminal 2
cd FlyTicket\frontend
npx live-server --port=3000   # opens http://localhost:3000
```

> **Important:** Open the frontend as `http://localhost:3000` (not `127.0.0.1:3000`)
> to match the CORS configuration.

---

## Default credentials

### Admin
```
URL:      http://localhost:3000/admin-login.html
Username: admin
Password: Admin123!
```

### Demo user (pre-seeded)
```
Email:    ahmet@test.com
Password: test123
```

You can register a new user at `http://localhost:3000/register.html`.

---

## Pages

| URL | Description |
|-----|-------------|
| `/index.html` | Flight search + results |
| `/flight-detail.html?id=` | Seat map + booking form |
| `/payment.html` | Payment simulation |
| `/booking-confirmation.html?ticket=` | E-ticket + print |
| `/my-tickets.html` | Email lookup + ticket list + cancel |
| `/profile.html` | User profile (edit, cards, stats) |
| `/login.html` | User login |
| `/register.html` | User registration |
| `/admin-login.html` | Admin login |
| `/admin-dashboard.html` | Flight management + stats |
| `/admin-bookings.html` | All bookings + filter |
| `/admin-flight-form.html` | Create / edit flight |
| `/admin-settings.html` | Admin password change |

---

## REST API reference

Base URL: `http://localhost:5000/api`. All responses are JSON.
Protected routes require `Authorization: Bearer <token>`.

### Auth (admin)

| Method | Path | Auth | Body | Description |
| ------ | ---- | ---- | ---- | ----------- |
| POST | `/auth/login` | — | `{ username, password }` | Returns `{ token, admin }` |
| PUT  | `/auth/password` | admin | `{ currentPassword, newPassword }` | Change admin password |

### Users

| Method | Path | Auth | Body | Description |
| ------ | ---- | ---- | ---- | ----------- |
| POST | `/users/register` | — | `{ name, surname, email, password }` | Register |
| POST | `/users/login`    | — | `{ email, password }` | Login |
| GET  | `/users/me`       | user | — | Current user |
| PUT  | `/users/me`       | user | `{ name, surname }` | Update profile |
| PUT  | `/users/me/password` | user | `{ currentPassword, newPassword }` | Change password |

### Cities

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/cities` | All 81 Turkish provinces |

### Flights

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET    | `/flights` | — | List; supports `?from=&to=&date=YYYY-MM-DD` |
| GET    | `/flights/:id` | — | Single flight |
| POST   | `/flights` | admin | Create (rules enforced) |
| PUT    | `/flights/:id` | admin | Update |
| PATCH  | `/flights/:id/status` | admin | Set `scheduled\|delayed\|cancelled` |
| DELETE | `/flights/:id` | admin | Remove |

**Backend rules enforced on create/update:**
1. Both cities must exist
2. `from_city !== to_city`
3. No two flights from the same city may depart in the same hour
4. No two flights may arrive at the same city in the same hour
5. `arrival_time > departure_time`

### Tickets

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/tickets` | optional | Book ticket(s); pass `seats: [...]` for multi-passenger |
| GET  | `/tickets/mine` | user | My tickets |
| GET  | `/tickets/id/:ticketId` | — | Single ticket |
| PATCH | `/tickets/:ticketId/cancel` | user | Cancel with refund policy |
| GET  | `/tickets/:email` | — | Tickets by email |
| GET  | `/tickets` | admin | All bookings |

**Cancellation policy:**
| Hours to departure | Refund |
|-------------------|--------|
| > 48 h | 100% |
| 24–48 h | 75% |
| 12–24 h | 50% |
| < 12 h | 0% |
| Departed | Not cancellable |

### Payment

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/payment/simulate` | `{ amount, cardNumber, expiry, cvv }` | Luhn check + 1.5s delay → `{ success, transactionId }` |

### Saved Cards (user)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET    | `/cards` | user | List saved cards |
| POST   | `/cards` | user | Save card metadata (last 4 digits only) |
| DELETE | `/cards/:cardId` | user | Remove card |

### Admin

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/admin/stats` | admin | Dashboard metrics |

---

## Database export / import

The `database-export/` folder contains JSON snapshots exported with:

```powershell
cd backend
npm run export
```

Files: `cities.json` (81), `flights.json` (30), `tickets.json`, `admins.json`, `users.json`

To restore manually, use `mongoimport` or re-run `npm run seed`.

---

## npm scripts (backend)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon server.js` | Start with auto-reload |
| `npm start` | `node server.js` | Production start |
| `npm run seed` | `node seed/seed.js` | Seed cities + admin + 30 sample flights |
| `npm run export` | `node seed/export.js` | Export DB to JSON |

---

## Test card

```
Card number:  4111 1111 1111 1111
Expiry:       12/29
CVV:          123
```

---

*CENG-3502 Dynamic Web Programming — Final Project*
