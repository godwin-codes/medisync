# 🏥 MediSync — Modern Hospital Management System

A high-performance, role-based Hospital Management System engineered with **Django (Backend)** and **React + Vite + Tailwind CSS v4 (Frontend)**.

---

## 🚀 Key Features

### 👤 Role-Based Portals & RBAC
- **Admin Dashboard**: Manage complete medicine inventory, view real-time patient queue, handle payments/billing, and inspect feedback.
- **Doctor Portal**: Manage daily appointments, prescribe medicines with automatic dosage and duration, track patient records.
- **Patient Portal**: Access personalized profile, book new appointments, track live queue status, download bills & prescriptions, submit feedback.

### ⚡ Intelligent Systems
- **Automated Billing**: Generates patient bills instantly when a doctor prescribes medicine, factoring in medicine cost and consulting fees.
- **Smart Queue Management**: Calculates real-time estimated wait times and positions for active patients.
- **Inventory Sync**: Deducts medicines from stock automatically when a prescription is issued.
- **JWT-Based Authentication**: Secure token-based auth with auto-refresh mechanism on both backend and frontend layers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router 7, Axios, Recharts |
| **Backend** | Django 6.0, Django REST Framework, SimpleJWT, SQLite, CORS Middleware |

---

## 📦 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)

---

### 1. Backend Setup (Django)

1. Navigate to the backend folder:
   ```bash
   cd medisync_backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations to initialize the database:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Seed the database with sample data:
   ```bash
   python seed_db.py
   ```
6. Generate user credentials for doctors and patients:
   ```bash
   python create_users.py
   ```
7. Start the development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will run at `http://127.0.0.1:8000/`*

---

### 2. Frontend Setup (React)

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd medisync_frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```
   *The frontend will run at `http://localhost:5173/`*

---

## 🔑 Demo Access Credentials

To explore the application easily, you can use the quick-fill buttons on the login page or enter these demo credentials:

| Role | Username | Password |
|---|---|---|
| **Administrator** | `admin` | `admin123` |
| **Doctor** | `sarah.j` | `doctorpassword` |
| **Patient** | `maria.garcia` | `patientpassword` |

---

## 📂 Project Architecture

```text
medisync/
├── medisync_backend/         # Django REST API Backend
│   ├── hospital/             # Core models, views, and serialization logic
│   ├── medisync_backend/     # Main settings and routing configurations
│   ├── seed_db.py            # SQLite raw data seeding script
│   ├── create_users.py       # Linked login profile generation script
│   └── requirements.txt      # Python dependencies file
│
└── medisync_frontend/        # React + Vite Frontend
    ├── src/
    │   ├── assets/           # Visual and static assets
    │   ├── components/       # Reusable layout and custom UI components
    │   ├── context/          # Global AuthContext provider
    │   ├── services/         # Axios API interceptor configurations
    │   └── App.jsx           # Main routing & application gateway
    └── package.json          # Node dependency configurations
```
