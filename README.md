# 🗳️ MyVoice – Mangalore Civic Issue Tracker

A full-stack React + Node.js/Express + MongoDB application for citizens of Mangalore to file, view, and support civic complaints, and for authorities to manage and update them.

---

## Project Structure

```
civicissuetracker/
├── backend/          ← Node.js/Express REST API
│   ├── models/       ← Mongoose models (User, Complaint)
│   ├── routes/       ← Express route handlers
│   ├── middleware/   ← JWT auth, file upload (multer)
│   ├── server.js     ← Main entry point
│   ├── seed.js       ← Creates initial admin user
│   └── .env.example  ← Environment variable template
└── frontend/         ← React SPA
    └── src/
        ├── api/      ← Axios client + all API calls
        ├── context/  ← AuthContext (global auth state)
        ├── components/ ← Navbar, ProtectedRoute
        └── pages/    ← Home, Login, Signup, Complaints, Admin
```

---

## Setup & Run

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # Edit with your values
node seed.js           # Creates admin user (run once)
npm run dev            # Starts on http://localhost:5000
```

**`.env` values to configure:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/civicissuetracker
JWT_SECRET=change_this_to_a_random_secret
ADMIN_EMAIL=admin@mcc.gov.in
ADMIN_PASSWORD=admin123
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start    # Starts on http://localhost:3000
```

---

## Features

### Citizen (User)
- **Sign Up / Login** with JWT authentication
- **File a Complaint** with title, description, category, location, and optional image upload
- **View all complaints** with filters (category, status, search), sorting, and pagination
- **Support (upvote)** complaints — toggle support, logged in users only
- **My Complaints** tracking

### Authority (Admin)
- **Dedicated admin login** at `/admin/login`  
  Default: `admin@mcc.gov.in` / `admin123`
- **Dashboard statistics**: total, pending, in-progress, resolved counts
- **Manage all complaints**: update status, add admin notes, delete
- **User management**: view registered users

---

## API Endpoints

### Auth  `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | User login → JWT |
| POST | `/admin/login` | Admin login → JWT |
| GET | `/me` | Get current user (auth required) |

### Complaints  `/api/complaints`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List complaints (filters: category, status, search, page, sort) |
| GET | `/:id` | Get single complaint |
| POST | `/` | File new complaint (auth + image upload) |
| POST | `/:id/support` | Toggle support/upvote (auth required) |
| GET | `/user/my` | Get my complaints (auth required) |

### Admin  `/api/admin`  *(admin auth required)*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/complaints` | All complaints with filters |
| PATCH | `/complaints/:id/status` | Update status + admin note |
| DELETE | `/complaints/:id` | Delete complaint |
| GET | `/users` | List all users |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File Upload | Multer |

---

## Security
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT tokens expire in 7 days
- Admin routes protected by role-based middleware
- File uploads validated for image types only (max 5MB)
- CORS configured for frontend origin
