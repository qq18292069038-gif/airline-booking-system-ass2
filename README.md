# Dairy Flat Air Booking System

Minimal Next.js + MongoDB booking system for Assignment 2.

## Run locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

If `.env.local` is not configured, the app uses a local fallback file at `.data/schedules.json` so it can still run for testing.

## MongoDB Atlas setup

Create `.env.local`:

```txt
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=airline_booking
```

Then seed the database with 12 weeks of scheduled flights:

```bash
npm run seed
```

## Main pages

- `/` landing page
- `/search` search and book flights
- `/invoice/[ref]` booking invoice
- `/manage` cancel a booking by reference
- `/passenger` find all confirmed bookings for a passenger email

## API routes

- `GET /api/schedules?date1=2026-06-10&date2=2026-06-30&orig=NZNE&dest=YSSY`
- `POST /api/bookings`
- `GET /api/bookings?email=passenger@example.com`
- `GET /api/bookings?ref=BK-ABC123`
- `DELETE /api/bookings/BK-ABC123`
