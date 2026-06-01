# MediSync Hospital Management System

A modern, role-based Hospital Management System built with Django (Backend) and React + Vite (Frontend).

## Prerequisites
- Node.js installed
- Python 3.x installed

## How to Run the Project

You will need to run the **Backend** and the **Frontend** in two separate terminals.

### 1. Run the Backend (Django)

Open your first terminal, navigate to the backend folder, activate the virtual environment, and start the server:

```powershell
# 1. Navigate to the backend folder
cd medisync_backend

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Apply migrations (if not already done)
python manage.py makemigrations
python manage.py migrate

# 4. Start the development server
python manage.py runserver 8000
```
*The backend will run at `http://127.0.0.1:8000/`*

### 2. Run the Frontend (React + Vite)

Open a **second** terminal, navigate to the frontend folder, and start the Vite development server:

```powershell
# 1. Navigate to the frontend folder
cd medisync_frontend

# 2. Install dependencies (if not already done)
npm install

# 3. Start the development server
npm run dev -- --port 5173
```
*The frontend will run at `http://localhost:5173/`*

### 3. Access the Application
Open your browser and navigate to: **http://localhost:5173**

You can log in using the following demo accounts by clicking their quick-fill buttons on the login page:
- **Admin**: `admin` / `admin123`
- **Doctor**: `sarah.j` / `doctorpassword`
- **Patient**: `maria.garcia` / `patientpassword`
