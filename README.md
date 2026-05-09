# ⚡ ExpertConnect – Real-Time Expert Session Booking System

A full-stack web application for booking expert sessions in real-time, built with React, Node.js, Express, MongoDB, and Socket.io.

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Socket.io Client |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Validation | express-validator (backend), custom (frontend) |

---

## 📁 Project Structure

```
expert-booking/
├── backend/
│   ├── controllers/
│   │   ├── expertController.js     # GET /experts, GET /experts/:id
│   │   └── bookingController.js    # POST /bookings, GET /bookings, PATCH /bookings/:id/status
│   ├── models/
│   │   ├── Expert.js               # Expert schema with availability slots
│   │   └── Booking.js              # Booking schema with compound unique index
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/
│   │   ├── validate.js             # express-validator error handler
│   │   └── errorHandler.js         # Global error handler
│   ├── server.js                   # Express + Socket.io entry point
│   ├── seed.js                     # Database seeder (12 experts)
│   └── .env.example
└── frontend/
    └── src/
        ├── pages/
        │   ├── ExpertList.jsx      # Search, filter, pagination
        │   ├── ExpertDetail.jsx    # Expert info + real-time slots
        │   ├── BookingForm.jsx     # Booking form with validation
        │   └── MyBookings.jsx      # View bookings by email
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ExpertCard.jsx
        │   └── Toast.jsx
        ├── context/
        │   └── SocketContext.jsx   # Socket.io React context
        └── utils/
            └── api.js              # Axios API helpers
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd expert-booking

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI

# Frontend
cd ../frontend
cp .env.example .env
# Edit if your backend runs on a different port
```

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expert-booking
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This seeds 12 expert profiles with 2 weeks of availability slots.

### 4. Start the Application

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev   # or: npm start
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/experts` | List experts (pagination, search, filter) |
| GET | `/api/experts/:id` | Get expert details with availability |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?email=` | Get bookings by email |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| GET | `/health` | Health check |

### Query Parameters for GET /api/experts

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 8 | Results per page (max 20) |
| `search` | string | '' | Search by name/bio |
| `category` | string | 'All' | Filter by category |

---

## ⚡ Critical Features

### 🔒 Double-Booking Prevention

Race conditions are handled using **MongoDB transactions + atomic updates**:

1. A MongoDB session is started
2. The expert slot is found AND locked in a single atomic operation using array filters
3. `modifiedCount === 0` means another request got there first → returns 409
4. A **compound unique index** on `{expertId, date, timeSlot}` acts as a safety net

### 📡 Real-Time Slot Updates (Socket.io)

- When a slot is booked → server emits `slot-booked` to room `expert-{id}`
- When a booking is cancelled → server emits `slot-freed`
- All clients viewing the same expert update their UI instantly
- Users join/leave rooms on expert detail page mount/unmount

### ✅ Validation

- **Frontend**: Inline validation before submit with field-level error messages
- **Backend**: `express-validator` on all routes with structured error responses
- Phone regex, email format, date format, past-date check, notes length limit

---

## 📋 Booking Status Flow

```
Pending → Confirmed → Completed
   ↓           ↓
Cancelled   Cancelled
```

Use `PATCH /api/bookings/:id/status` with `{ "status": "Confirmed" }` to update.

---

## 🌐 Deployment Notes

### Backend (Railway / Render / Fly.io)
- Set env vars: `MONGODB_URI`, `CLIENT_URL`, `NODE_ENV=production`
- Start command: `node server.js`

### Frontend (Vercel / Netlify)
- Set env vars: `REACT_APP_API_URL`, `REACT_APP_SOCKET_URL`
- Build command: `npm run build`
- Output directory: `build`

### MongoDB
- Use **MongoDB Atlas** for production
- Enable **transactions** → requires a **replica set** (Atlas free tier supports this)

---

## 🎨 Screenshots

| Screen | Features |
|--------|----------|
| Expert List | Search, category filter, pagination, cards with ratings |
| Expert Detail | Bio, specializations, date selector, live slot grid |
| Booking Form | Validated form, date/time selection, booking summary |
| My Bookings | Email lookup, grouped by status, full history |
