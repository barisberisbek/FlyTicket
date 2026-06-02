# FlyTicket ✈️

A complete full-stack airline ticket booking web application built for the
**CENG-3502 — Dynamic Web Programming** final project.

FlyTicket lets travellers search for flights between any of the 81 provinces
of Türkiye, choose a seat, simulate a payment, and receive an HTML e-ticket by
email. Administrators sign in to a separate panel where they can manage
flights and inspect every booking.

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

- ☑ **Seat selection** — interactive seat-map (rows × A–F), atomic backend booking.
- ☑ **E-ticket email via SMTP** — Nodemailer, fire-and-forget, never blocks booking.
- ☑ **Payment simulation** — dedicated `/payment` page + `/api/payment/simulate` endpoint with Luhn check and artificial delay.
- ☑ **User authentication** — register / login, JWT stored separately from admin token, prefilled passenger info, "My tickets" backed by user account.
- ☑ **Mobile responsive design** — Bootstrap 5 grid + custom breakpoints, hamburger nav, scrollable seat map; verified at 375 / 768 / 1280 px.

---

## Prerequisites

- Node.js **18+**
- MongoDB **6+** running locally on `mongodb://127.0.0.1:27017`
- npm

---

## Setup

```bash
git clone <this-repo>
cd FlyTicket

# 1. Backend
cd backend
npm install
cp .env.example .env          # edit MONGO_URI / JWT_SECRET / SMTP_* if needed
npm run seed                  # seeds 81 cities + default admin
npm run dev                   # http://localhost:5000

# 2. Frontend (in a second terminal, from the project root)
cd frontend
npx live-server --port=3000   # http://localhost:3000
```

### Default admin credentials

```
username: admin
password: Admin123!
```

You can change them via `DEFAULT_ADMIN_USERNAME` / `DEFAULT_ADMIN_PASSWORD`
in `.env` **before** running `npm run seed`.

---

## Folder structure

```
FlyTicket/
├── README.md
├── .gitignore
├── database-export/             # mongodump output goes here
├── backend/                     # Express REST API (port 5000)
│   ├── server.js
│   ├── config/db.js
│   ├── models/                  # City, Flight, Ticket, Admin, User
│   ├── routes/                  # auth, user, city, flight, ticket, payment
│   ├── controllers/
│   ├── middleware/              # auth + central error handler
│   ├── validators/              # express-validator chains
│   ├── services/                # mailService, seatService
│   ├── utils/                   # flightRules, generateId
│   └── seed/                    # 81 cities + seed.js
└── frontend/                    # Static site (port 3000)
    ├── *.html                   # 11 multi-page routes
    ├── css/styles.css
    └── js/
        ├── app.js
        ├── api/ApiClient.js
        ├── components/          # Component base + 17 UI classes
        ├── pages/               # 11 page controllers
        └── utils/               # auth, format, validators
```

Every UI element is a class extending `js/components/Component.js`; pages
compose components inside `<div id="app"></div>`. There is no SPA router — one
HTML file per route, each importing its page controller as an ES module.

---

## REST API reference

Base URL: `http://localhost:5000/api`. All responses are JSON. Protected
routes require `Authorization: Bearer <jwt>`.

### Auth (admin)

| Method | Path | Auth | Body | Description |
| ------ | ---- | ---- | ---- | ----------- |
| POST | `/auth/login` | — | `{ username, password }` | Returns `{ token, admin }` |

### Users (bonus)

| Method | Path | Auth | Body | Description |
| ------ | ---- | ---- | ---- | ----------- |
| POST | `/users/register` | — | `{ name, surname, email, password }` | Returns `{ token, user }` |
| POST | `/users/login`    | — | `{ email, password }` | Returns `{ token, user }` |
| GET  | `/users/me`       | user | — | Current user |

### Cities

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/cities` | Lists all 81 Turkish provinces |

### Flights

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET    | `/flights` | — | List; supports `?from=&to=&date=YYYY-MM-DD` |
| GET    | `/flights/:id` | — | Single flight (cities populated) |
| POST   | `/flights` | admin | Create flight |
| PUT    | `/flights/:id` | admin | Update flight |
| DELETE | `/flights/:id` | admin | Remove flight |

Backend rules enforced on create/update:

1. Both cities must exist.
2. `from_city !== to_city`.
3. **No two flights from the same city may depart in the same hour.**
4. **No two flights may arrive at the same city in the same hour.**
5. `arrival_time > departure_time`.

### Tickets

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/tickets` | optional user | Book a ticket; atomic seat reservation |
| GET  | `/tickets/mine` | user | Tickets owned by the logged-in user |
| GET  | `/tickets/id/:ticketId` | — | Single ticket (used by confirmation page) |
| GET  | `/tickets/:email` | — | All tickets for that email |
| GET  | `/tickets` | admin | All bookings |

### Payment (bonus)

| Method | Path | Body | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/payment/simulate` | `{ amount, cardNumber, expiry, cvv }` | Validates Luhn / format; returns `{ success, transactionId }` after ~1.5s |

Errors are normalized to `{ "error": { "message": "...", "details"?: {...} } }`
with status codes `400 / 401 / 403 / 404 / 409 / 500`.

---

## Database export / import

Run the seed first (`npm run seed`), then export:

**Windows:**
```bat
database-export\generate-export.bat
```

**macOS / Linux:**
```bash
mongodump --db flyticket --out database-export/
```

Restore on another machine:

```bash
mongorestore --db flyticket database-export/flyticket/
```

> The `database-export/` directory ships with a convenience script
> (`generate-export.bat`) that runs `mongodump` for you.

---

## License

Released under the MIT License — see `LICENSE` (or assume MIT) for details.
