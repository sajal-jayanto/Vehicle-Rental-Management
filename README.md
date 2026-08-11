# Vehicle Rental Management API

A REST API for managing a vehicle rental business — staff accounts, vehicle inventory (with photo uploads), rental bookings, and revenue reporting.

Built with Express, TypeScript, Knex (PostgreSQL), Zod validation, and JWT authentication.

## Tech Stack

- **Runtime**: Node.js + TypeScript (ESM)
- **Framework**: Express 5
- **Database**: PostgreSQL via Knex
- **Validation**: Zod
- **Auth**: JWT (`jsonwebtoken`) + `bcrypt` password hashing
- **File uploads**: Multer
- **Logging**: Pino

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally or accessible remotely

## Installation

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd vehicle-rental-management
   npm install
   ```

2. **Create your environment file**

   ```bash
   cp .env.example .env
   ```

   Then fill in `.env`:

   ```env
   PORT=8000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_USER_NAME=root
   DB_PASSWORD=root
   DB_NAME=vehicle_rent

   JWT_SECRET=your-super-secret-key
   ```

   > `JWT_SECRET` is required — the app refuses to start without it.

3. **Create the database**

   ```bash
   createdb vehicle_rent
   ```

4. **Run migrations**

   ```bash
   npm run db:migration:apply
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   The API is now available at `http://localhost:8000`.

## Available Scripts

| Script                          | Description                               |
| ------------------------------- | ----------------------------------------- |
| `npm run dev`                   | Start the dev server with hot-reload      |
| `npm run build`                 | Compile TypeScript to `dist/`             |
| `npm run start`                 | Run the compiled build (`dist/server.js`) |
| `npm run lint`                  | Run ESLint                                |
| `npm run format`                | Format code with Prettier                 |
| `npm run format:check`          | Check formatting without writing          |
| `npm run db:migration:create`   | Generate a new migration file             |
| `npm run db:migration:apply`    | Run all pending migrations                |
| `npm run db:migration:rollback` | Roll back the last migration batch        |
| `npm run db:migration:status`   | Show migration status                     |

## Authentication

Except for `/health` and `/api/v1/auth/*`, every endpoint requires a JWT bearer token, obtained by logging in.

Include it on every request:

```
Authorization: Bearer <token>
```

Tokens expire after **1 day**.

## Base URL

```
http://localhost:8000
```

All resource endpoints are prefixed with `/api/v1`.

---

## Endpoints

### Health

#### `GET /health`

No auth required. Checks API + database status.

**Response `200 OK`**

```json
{
  "status": "ok",
  "time": "2026-08-11T10:00:00.000Z",
  "uptime": 123.45,
  "database": { "status": "ok" }
}
```

Returns `503 Service Unavailable` with `"status": "error"` if the database is unreachable.

---

### Auth

#### `POST /api/v1/auth/register`

Create a new staff account. No auth required.

**Body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

| Field    | Type   | Rules            |
| -------- | ------ | ---------------- |
| name     | string | min 2 characters |
| email    | string | valid email      |
| password | string | min 8 characters |

**Response `201 Created`**

```json
{
  "status": "success",
  "data": {
    "id": "1",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "created_at": "2026-08-11T10:00:00.000Z",
    "updated_at": "2026-08-11T10:00:00.000Z"
  }
}
```

**Errors**: `409 Conflict` if email already registered · `400 Bad Request` on validation failure.

---

#### `POST /api/v1/auth/login`

No auth required.

**Body**

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "staff": {
      "id": "1",
      "email": "jane@example.com",
      "name": "Jane Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors**: `401 Unauthorized` — `"Invalid email or password"` (returned for both wrong email and wrong password, to avoid leaking which accounts exist).

---

### Vehicles

All vehicle endpoints require `Authorization: Bearer <token>`.

#### `GET /api/v1/vehicle`

List vehicles, paginated.

**Query params**

| Param    | Type   | Default | Notes                          |
| -------- | ------ | ------- | ------------------------------ |
| page     | number | 1       | ≥ 1                            |
| limit    | number | 10      | 1–100                          |
| category | string | —       | exact match                    |
| search   | string | —       | case-insensitive match on name |

**Example**

```
GET /api/v1/vehicle?page=1&limit=10&category=sedan&search=corolla
```

**Response `200 OK`**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "1",
      "name": "Toyota Corolla",
      "plate_number": "DHA-1234",
      "category": "sedan",
      "daily_rate": "50.00",
      "photo_path": "/uploads/vehicles/<uuid>.jpg",
      "deleted_at": null,
      "created_at": "2026-08-11T10:00:00.000Z",
      "updated_at": "2026-08-11T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

#### `GET /api/v1/vehicle/:id`

**Params**: `id` — positive integer.

**Response `200 OK`** — single vehicle object (same shape as above).

**Errors**: `404 Not Found`.

---

#### `POST /api/v1/vehicle`

Create a vehicle. `multipart/form-data` (photo is optional).

**Form fields**

| Field        | Type   | Rules                           |
| ------------ | ------ | ------------------------------- |
| name         | string | required, max 255               |
| plate_number | string | required, max 50, unique        |
| category     | string | required, max 100               |
| daily_rate   | number | > 0                             |
| photo        | file   | optional — JPG/PNG/WebP, ≤ 5 MB |

**Example (curl)**

```bash
curl -X POST http://localhost:8000/api/v1/vehicle \
  -H "Authorization: Bearer <token>" \
  -F "name=Toyota Corolla" \
  -F "plate_number=DHA-1234" \
  -F "category=sedan" \
  -F "daily_rate=50" \
  -F "photo=@corolla.jpg;type=image/jpeg"
```

**Response `201 Created`**

```json
{
  "statusCode": 201,
  "message": "Vehicle created successfully",
  "data": { "id": "1", "name": "Toyota Corolla", "...": "..." }
}
```

**Errors**: `409 Conflict` — plate number already exists · `400 Bad Request` — validation failure or disallowed file type (`"Only JPG, PNG and WebP images are allowed"`).

---

#### `PUT /api/v1/vehicle/:id`

Update a vehicle. `multipart/form-data`, same fields as create (all required — this is a full replace, not a partial patch).

> **Note**: `photo` is optional on the form, but if you omit it the vehicle's `photo_path` is currently cleared to `null` rather than left unchanged — always re-attach the existing photo (or a new one) on update if you want to keep it.

**Params**: `id` — positive integer.

**Response `200 OK`**

```json
{
  "statusCode": 200,
  "message": "Vehicle updated successfully",
  "data": {
    "name": "Toyota Corolla",
    "plate_number": "DHA-1234",
    "category": "sedan",
    "daily_rate": "60.00",
    "photo_path": null
  }
}
```

**Errors**: `404 Not Found` · `400 Bad Request`.

---

#### `DELETE /api/v1/vehicle/:id`

Soft-deletes a vehicle (sets `deleted_at`).

**Params**: `id` — positive integer.

**Response `200 OK`**

```json
{ "statusCode": 200, "message": "Vehicle deleted successfully" }
```

**Errors**: `404 Not Found`.

---

### Rentals

All rental endpoints require `Authorization: Bearer <token>`.

#### `GET /api/v1/rental`

List rentals, paginated, with vehicle info joined in.

**Query params**

| Param      | Type   | Notes                                                           |
| ---------- | ------ | --------------------------------------------------------------- |
| page       | number | optional, ≥ 1                                                   |
| limit      | number | optional, ≥ 1                                                   |
| vehicle_id | string | optional — filter by vehicle                                    |
| status     | string | optional — one of `booked`, `ongoing`, `completed`, `cancelled` |
| start_date | string | optional — `YYYY-MM-DD`, rentals starting on/after              |
| end_date   | string | optional — `YYYY-MM-DD`, rentals ending on/before               |

**Example**

```
GET /api/v1/rental?status=booked&page=1&limit=20
```

**Response `200 OK`**

```json
{
  "statusCode": 200,
  "data": {
    "data": [
      {
        "id": "1",
        "vehicle_id": "1",
        "customer_name": "John Smith",
        "customer_phone": "01700000000",
        "start_date": "2026-08-12",
        "end_date": "2026-08-15",
        "total_amount": "200.00",
        "status": "booked",
        "vehicle_name": "Toyota Corolla",
        "plate_number": "DHA-1234",
        "created_at": "2026-08-11T10:00:00.000Z",
        "updated_at": "2026-08-11T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
  }
}
```

---

#### `GET /api/v1/rental/:id`

**Params**: `id` — positive integer.

**Response `200 OK`** — single rental, joined with vehicle name/plate/category/daily_rate.

**Errors**: `404 Not Found`.

---

#### `POST /api/v1/rental`

Create a booking. `application/json`.

**Body**

```json
{
  "vehicle_id": 1,
  "customer_name": "John Smith",
  "customer_phone": "01700000000",
  "start_date": "2026-08-12",
  "end_date": "2026-08-15"
}
```

| Field          | Type   | Rules                                |
| -------------- | ------ | ------------------------------------ |
| vehicle_id     | number | positive integer                     |
| customer_name  | string | required, max 255                    |
| customer_phone | string | required, max 30                     |
| start_date     | string | `YYYY-MM-DD`                         |
| end_date       | string | `YYYY-MM-DD`, must be ≥ `start_date` |

`total_amount` is computed server-side as `daily_rate × number_of_days` (inclusive of both start and end date). Status defaults to `booked`.

**Response `200 OK`**

```json
{
  "statusCode": 201,
  "message": "Vehicle rented successful",
  "data": {
    "id": "1",
    "vehicle_id": "1",
    "total_amount": "150.00",
    "status": "booked",
    "...": "..."
  }
}
```

**Errors**: `404 Not Found` — vehicle doesn't exist · `409 Conflict` — vehicle already booked/ongoing for overlapping dates · `400 Bad Request` — validation failure.

---

#### `PUT /api/v1/rental/:id`

Update a booking. `application/json`, same body as create, plus `status`.

**Body**

```json
{
  "vehicle_id": 1,
  "customer_name": "John Smith",
  "customer_phone": "01700000000",
  "start_date": "2026-08-12",
  "end_date": "2026-08-16",
  "status": "ongoing"
}
```

`status` — one of `booked`, `ongoing`, `completed`, `cancelled`.

**Response `200 OK`**

```json
{
  "statusCode": 200,
  "message": "Rental updated successfully",
  "data": { "id": "1", "status": "ongoing", "...": "..." }
}
```

**Errors**: `404 Not Found` — rental or vehicle not found · `409 Conflict` — overlapping booking · `400 Bad Request` — start date after end date or validation failure.

---

#### `DELETE /api/v1/rental/:id`

**Params**: `id` — positive integer.

**Response `200 OK`**

```json
{ "statusCode": 200, "message": "Rental record deleted successfully" }
```

**Errors**: `404 Not Found`.

---

### Reports

Requires `Authorization: Bearer <token>`.

#### `GET /api/v1/report/rentals`

Monthly revenue report, grouped by vehicle.

**Query params**

| Param      | Type   | Default       | Notes                                              |
| ---------- | ------ | ------------- | -------------------------------------------------- |
| month      | string | current month | `YYYY-MM`                                          |
| vehicle_id | number | —             | optional, positive integer — filter to one vehicle |

**Example**

```
GET /api/v1/report/rentals?month=2026-08&vehicle_id=1
```

**Response `200 OK`**

```json
{
  "statusCode": 200,
  "message": "Report generated successfully",
  "data": {
    "month": "2026-08",
    "vehicles": [
      { "id": 1, "name": "Toyota Corolla", "total_bookings": 3, "days_rented": 9, "revenue": 450 }
    ],
    "highest_revenue_vehicle": {
      "id": 1,
      "name": "Toyota Corolla",
      "total_bookings": 3,
      "days_rented": 9,
      "revenue": 450
    }
  }
}
```

Only counts rentals that overlap the given month and are not `cancelled`; revenue for rentals spanning multiple months is prorated to days within the month.

**Errors**: `400 Bad Request` — invalid `month` format.

---

## Error Format

All errors follow the same shape:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "details": [{ "path": "email", "message": "Invalid email address" }]
}
```

`details` is only present for validation errors (`400`).

| Status | Meaning                                   |
| ------ | ----------------------------------------- |
| 400    | Validation failure / bad request          |
| 401    | Missing/invalid token, or bad credentials |
| 404    | Resource not found                        |
| 409    | Conflict (duplicate, overlapping booking) |
| 500    | Unexpected server error                   |

## Uploaded Files

Vehicle photos are served statically from:

```
GET /uploads/vehicles/<filename>
```

## Project Structure

```
src/
├── app.ts                 # Express app + middleware wiring
├── server.ts               # Entry point — DB connect + listen
├── config/env.ts            # Environment variable loading
├── db/                      # Knex config, connection, migrations
├── middlewares/              # auth, validation, upload, error handling
├── routes/                   # Route definitions per resource
├── schemas/                  # Zod request validation schemas
├── service/                  # Business logic / DB queries
└── utils/                    # Shared helpers (logger, date math)
```
