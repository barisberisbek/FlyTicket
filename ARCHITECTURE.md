# FlyTicket — System Architecture

**CENG-3502 Dynamic Web Programming — Final Project**

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  Vanilla JS ES6 Modules · Bootstrap 5 · Fetch API          │
│  http://localhost:3000  (live-server)                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/JSON (REST API)
                         │ Authorization: Bearer <jwt>
┌────────────────────────▼────────────────────────────────────┐
│                     BACKEND API                             │
│                                                             │
│  Node.js · Express.js · JWT · bcryptjs · Nodemailer        │
│  http://localhost:5000  (nodemon)                           │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────┐
│                      DATABASE                               │
│                                                             │
│  MongoDB 8.x Community (standalone)                        │
│  mongodb://127.0.0.1:27017/flyticket                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Pattern

Every UI element is a class that extends the base `Component`:

```
frontend/js/components/Component.js
├── constructor(props)    — stores props, initializes state
├── setState(patch)       — merges patch into state, triggers update
├── template()            — returns HTML string (override this)
├── bindEvents()          — attaches DOM listeners (override this)
├── mount(parent)         — renders HTML, appends to DOM, binds events
├── update()              — replaces DOM element in-place, re-binds
└── unmount()             — removes element from DOM
```

**Rendering cycle:**
```
setState(patch)
  → state = { ...state, ...patch }
  → update()
      → wrap.innerHTML = template()
      → el.replaceWith(wrap.firstElementChild)
      → bindEvents()
```

### Page–Component Mapping

```
index.html              → HomePage.js
  └── FlightSearchForm  (trip toggle, passengers, city selects, dates)
  └── FlightList        (sort bar + FlightCard × N)
      └── FlightCard    (airline-style card with route visualization)

flight-detail.html      → FlightDetailPage.js
  └── StepIndicator     (step 2 of 4)
  └── SeatMap           (multi-select, business class rows 1-3)
  └── BookingForm       (lead passenger details)

payment.html            → PaymentPage.js
  └── StepIndicator     (step 3 of 4)
  └── SavedCardPicker   (quick-select saved cards, optional)
  └── PaymentForm       (Luhn card validation)

booking-confirmation.html → ConfirmationPage.js
  └── StepIndicator     (step 4 of 4)
  └── ConfirmationCard  (animated checkmark)
  └── ETicket           (boarding pass with barcode simulation)

my-tickets.html         → MyTicketsPage.js
  └── ETicket × N       (boarding pass per ticket)
  └── CancelModal       (refund policy preview)

profile.html            → ProfilePage.js
  ├── tab: Profile      (edit name/surname)
  ├── tab: Security     (change password)
  ├── tab: My Cards     (SavedCard list)
  └── tab: Stats        (trip count, total spent, favourite city)

login.html              → LoginPage.js
  └── AuthForm          (mode=login)

register.html           → RegisterPage.js
  └── AuthForm          (mode=register)

admin-login.html        → AdminLoginPage.js
  └── AdminLoginForm

admin-dashboard.html    → AdminDashboardPage.js
  └── StatCard × 4      (flights, bookings, revenue, occupancy)
  └── AdminFlightTable  (CRUD table with status badges)

admin-bookings.html     → AdminBookingsPage.js
  └── AdminBookingsTable (live filter by email/flight/status)

admin-flight-form.html  → AdminFlightFormPage.js
  └── AdminFlightForm   (create/edit with status dropdown on edit)

admin-settings.html     → AdminSettingsPage.js
  (change admin password)
```

### Routing

No SPA router. Each HTML file is a separate route loaded directly by the browser. JavaScript modules are imported as `type="module"` at the bottom of each HTML file.

```
/ (index.html)           → public
/flight-detail.html      → public
/payment.html            → public (needs sessionStorage draft)
/booking-confirmation.html → public (needs ?ticket= param)
/my-tickets.html         → public
/profile.html            → user JWT required (client-side guard)
/login.html              → public
/register.html           → public
/admin-login.html        → public
/admin-dashboard.html    → admin JWT required (requireAdmin() guard)
/admin-bookings.html     → admin JWT required
/admin-flight-form.html  → admin JWT required
/admin-settings.html     → admin JWT required
```

### State Management

```
localStorage
├── flyticket_user_token   — user JWT
├── flyticket_user_data    — { name, surname, email }
├── flyticket_admin_token  — admin JWT
├── flyticket_admin_data   — { username }
└── ft_theme               — 'light' | 'dark'

sessionStorage
├── ft_booking_draft       — { flight_id, seats[], passengerCount, amount, ... }
├── ft_passengers          — number of passengers selected in search
├── ft_trip_type           — 'oneway' | 'round'
└── ft_return_date         — YYYY-MM-DD return date for round trips
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── server.js                 # Express app entry — registers middleware + routes
├── config/
│   └── db.js                 # Mongoose connection (MONGO_URI from .env)
├── models/
│   ├── City.js               # { city_id, city_name }
│   ├── Flight.js             # { flight_id, from_city, to_city, times, price, seats, status }
│   ├── Ticket.js             # { ticket_id, passenger, flight_id, seat, status, booking_ref }
│   ├── Admin.js              # { username, password } — bcrypt hashed
│   ├── User.js               # { name, surname, email, password } — bcrypt hashed
│   └── SavedCard.js          # { card_id, user_id, last_four, expiry, card_type }
├── controllers/
│   ├── auth.controller.js    # admin login, admin changePassword
│   ├── user.controller.js    # register, login, me, updateProfile, changePassword
│   ├── city.controller.js    # list 81 cities
│   ├── flight.controller.js  # list, getOne, create, update, remove, updateStatus
│   ├── ticket.controller.js  # create (single+multi), cancel, listByEmail, listAll, getById, listMine
│   ├── payment.controller.js # simulate (Luhn check, 1.5s delay)
│   ├── card.controller.js    # listCards, saveCard, deleteCard
│   └── adminStats.controller.js # getStats (aggregation)
├── middleware/
│   ├── auth.middleware.js    # requireAuth, requireAdmin, optionalAuth
│   └── error.middleware.js   # central error handler → { error: { message, details? } }
├── validators/
│   ├── user.validator.js     # express-validator chains for register/login
│   ├── flight.validator.js   # from/to (MongoId), dates (ISO8601), price, seats
│   └── ticket.validator.js   # flight_id, passenger fields, seat_number
├── utils/
│   ├── flightRules.js        # validateFlightRules: city existence + same-hour conflicts
│   ├── cancellationPolicy.js # calcRefund: >48h=100%, 24-48h=75%, 12-24h=50%, <12h=0%
│   └── generateId.js         # nanoid-based prefix IDs (FL, TK, CC, BK, TX)
├── services/
│   └── mailService.js        # sendETicket via Nodemailer (async, non-blocking)
└── seed/
    ├── cities.json           # 81 Turkish provinces (plate number + city name)
    ├── seed.js               # upsert cities + admin + 30 sample flights (idempotent)
    └── export.js             # export all collections to database-export/ as JSON
```

### Middleware Pipeline

```
Request
  → cors({ origin: [localhost:3000, 127.0.0.1:3000] })
  → express.json()
  → morgan('dev')
  → Route handlers
      → [optionalAuth | requireAuth | requireAdmin]
      → [express-validator chains]
      → Controller function
  → 404 handler
  → errorMiddleware (normalises to { error: { message, details? } })
Response
```

### Authentication Flow

```
Admin login:
  POST /api/auth/login { username, password }
  → bcrypt.compare → JWT sign { sub, role:'admin', username }
  → localStorage: flyticket_admin_token

User login:
  POST /api/users/login { email, password }
  → bcrypt.compare → JWT sign { sub, role:'user', email }
  → localStorage: flyticket_user_token

Protected request:
  Authorization: Bearer <token>
  → jwt.verify(token, JWT_SECRET) → req.user = { sub, role, ... }
  → requireAdmin: role === 'admin' → 403 if not
  → requireAuth: any valid token → 401 if missing
  → optionalAuth: sets req.user if token valid, proceeds regardless
```

---

## Database Schema

### Collections

```
cities          — 81 Turkish provinces
┌─────────────────────────────────────┐
│ city_id    String  unique  "34"     │
│ city_name  String  unique  "İstanbul"│
└─────────────────────────────────────┘

flights         — airline schedule
┌────────────────────────────────────────────────┐
│ flight_id      String   unique  "FL..."        │
│ from_city      ObjectId → cities               │
│ to_city        ObjectId → cities               │
│ departure_time Date                            │
│ arrival_time   Date                            │
│ price          Number   min:0                  │
│ seats_total    Number   min:1                  │
│ seats_available Number  min:0                  │
│ booked_seats   [String] e.g. ["1A","2B"]       │
│ status         String   scheduled|delayed|cancelled │
│ createdAt, updatedAt                           │
└────────────────────────────────────────────────┘

tickets         — passenger reservations
┌────────────────────────────────────────────────┐
│ ticket_id        String   unique  "TK..."      │
│ passenger_name   String                        │
│ passenger_surname String                       │
│ passenger_email  String   (lowercase)          │
│ flight_id        ObjectId → flights            │
│ seat_number      String   e.g. "2B"            │
│ payment_status   String   pending|paid         │
│ status           String   active|cancelled     │
│ cancelled_at     Date     (nullable)           │
│ booking_ref      String   "BK..." (nullable)   │
│ user_id          ObjectId → users (nullable)   │
│ createdAt                                      │
└────────────────────────────────────────────────┘

users           — registered passengers (bonus)
┌────────────────────────────────────────────────┐
│ name     String                                │
│ surname  String                                │
│ email    String  unique  lowercase             │
│ password String  bcrypt-hashed                 │
│ createdAt                                      │
└────────────────────────────────────────────────┘

admins          — admin accounts
┌────────────────────────────────────────────────┐
│ username  String  unique                       │
│ password  String  bcrypt-hashed                │
│ createdAt, updatedAt                           │
└────────────────────────────────────────────────┘

savedcards      — user's saved payment cards (bonus)
┌────────────────────────────────────────────────┐
│ card_id    String   unique  "CC..."            │
│ user_id    ObjectId → users                    │
│ label      String   e.g. "My Visa"             │
│ last_four  String   4 digits only              │
│ expiry     String   "MM/YY"                    │
│ card_type  String   visa|mastercard|amex|other │
│ is_default Boolean                             │
│ createdAt                                      │
└────────────────────────────────────────────────┘
```

### Relationships

```
flights.from_city  → cities._id
flights.to_city    → cities._id
tickets.flight_id  → flights._id
tickets.user_id    → users._id   (nullable — anonymous bookings allowed)
savedcards.user_id → users._id
```

---

## API Reference

Base URL: `http://localhost:5000/api`

```
POST   /auth/login                  public    admin login
PUT    /auth/password               admin     change admin password

POST   /users/register              public    register user
POST   /users/login                 public    user login
GET    /users/me                    user      current user profile
PUT    /users/me                    user      update name/surname
PUT    /users/me/password           user      change password

GET    /cities                      public    list 81 provinces

GET    /flights?from=&to=&date=     public    search/list flights
GET    /flights/:id                 public    single flight
POST   /flights                     admin     create (rules enforced)
PUT    /flights/:id                 admin     update
PATCH  /flights/:id/status          admin     set scheduled|delayed|cancelled
DELETE /flights/:id                 admin     remove

POST   /tickets                     optional  book (single or multi-seat)
GET    /tickets/mine                user      user's own tickets
GET    /tickets/id/:ticketId        public    single ticket by ticket_id
PATCH  /tickets/:ticketId/cancel    user      cancel with refund calculation
GET    /tickets/:email              public    tickets by email
GET    /tickets                     admin     all bookings

POST   /payment/simulate            public    Luhn check + 1.5s delay

GET    /cards                       user      list saved cards
POST   /cards                       user      save card (metadata only)
DELETE /cards/:cardId               user      remove saved card

GET    /admin/stats                 admin     dashboard metrics
```

---

## Booking Flow (Data Flow)

```
1. HomePage
   Search form → GET /api/flights?from=&to=&date=
   SessionStorage: ft_passengers, ft_trip_type, ft_return_date

2. FlightDetailPage  (?id=<MongoDB _id>)
   GET /api/flights/:id
   SeatMap: multi-select up to N seats
   BookingForm: lead passenger details
   → sessionStorage: ft_booking_draft = {
       flight_id, seats[], passengerCount,
       passenger_name/surname/email, amount,
       flight_summary: { from, to, departure_time, flight_id }
     }

3. PaymentPage
   (optional) GET /api/cards → SavedCardPicker
   POST /api/payment/simulate { amount, cardNumber, expiry, cvv }
   POST /api/tickets { flight_id, seats[], passenger_* }
     → atomic Flight.findOneAndUpdate per seat
     → Ticket.create × N with shared booking_ref
     → sendETicket async (fire-and-forget)
   → redirect booking-confirmation.html?ticket=TK...&ref=BK...

4. ConfirmationPage  (?ticket=TK...&ref=BK...)
   GET /api/tickets/id/:ticketId
   Boarding pass display + print
   (optional) POST /api/cards  { lastFour, expiry, ... }
   (round-trip) → return flight search CTA
```

---

## Flight Scheduling Rules

All enforced server-side in `backend/utils/flightRules.js`:

| Rule | Description |
|------|-------------|
| 1 | `from_city` and `to_city` must both exist in the cities collection |
| 2 | `from_city !== to_city` |
| 3 | No two flights from the **same city** may depart in the **same clock hour** |
| 4 | No two flights may arrive at the **same city** in the **same clock hour** |
| 5 | `arrival_time > departure_time` |

---

## Cancellation Policy

Implemented in `backend/utils/cancellationPolicy.js` (mirrored in `frontend/js/utils/cancellationPolicy.js`):

| Hours to departure | Refund rate |
|-------------------|-------------|
| > 48 h | 100% |
| 24 – 48 h | 75% |
| 12 – 24 h | 50% |
| < 12 h | 0% |
| Departed | Not cancellable |

---

## npm Scripts

```bash
# Backend
npm run dev      # nodemon server.js
npm start        # node server.js
npm run seed     # seed 81 cities + admin + 30 sample flights (idempotent)
npm run export   # export all collections to database-export/ as JSON
```

---

## Environment Variables (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Express port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/flyticket` | Database connection |
| `JWT_SECRET` | — | **Required** — secret for token signing |
| `JWT_EXPIRES_IN` | 7d | Token lifetime |
| `SMTP_HOST` | — | Optional — leave blank to skip email |
| `SMTP_PORT` | 587 | SMTP port |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password |
| `DEFAULT_ADMIN_USERNAME` | admin | Seed admin username |
| `DEFAULT_ADMIN_PASSWORD` | Admin123! | Seed admin password |
| `CORS_ORIGIN` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed origins |
