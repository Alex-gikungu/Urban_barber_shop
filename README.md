# 🔐 React + Flask Role-Based Authentication System

This is a full-stack **Role-Based Authentication System** built using **React (with Vite)** for the frontend and **Flask (Python)** for the backend. It supports user authentication, JWT-based session management, and dynamic route access depending on user roles (`admin`, `user`, etc.).

---

## 🚀 Features

- 🧾 User Registration and Login
- 🔐 JWT Authentication (with token stored in localStorage)
- 🧠 Role-Based Access (e.g., `admin`, `user`)
- 🛡️ Protected Routes with React Router
- 🌍 Google OAuth Login (optional)
- 🧰 Global AuthContext using React Context API
- 🔁 Persistent Sessions
- 🖥️ Responsive Navigation with Conditional Links
- 📂 Structured codebase with clean separation of concerns


## 🛠️ Installation & Setup

### 🔃 Clone the Repository


git clone https://github.com/Alex-gikungu/Urban_barber_shop.git

cd Urban_barber_shop

---

🧩 Frontend (React + Vite)

Navigate to the frontend directory:

```bash

cd frontend


## Install dependencies:

``` bash

npm install


##  Start the frontend server:

``` bash

npm run dev
🐍 Backend (Flask + Python)


##  Navigate to the backend directory:

``` bash

cd backend

## Create a virtual environment and activate it:

``` bash

python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate


##  Install required packages:

``` bash
pip install -r requirements.txt


## Run the Flask server:

``` bash

flask run


📝 Make sure your backend runs at: http://localhost:5000
Update API base URL in AuthContext.jsx if different.

## 🗂️ Project Structure
Frontend (React + Vite)

frontend/
├── components/
│   └── Navbar.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   └── AdminDashboard.jsx
├── App.jsx
├── main.jsx
└── vite.config.js


## Backend (Flask + Python)

backend/
├── app.py
├── auth/
│   └── routes.py
├── models/
│   └── user.py
├── config.py
└── requirements.txt


## 🧪 How to Test
Register a new user via /register

Log in via /login

Inspect localStorage to see the saved JWT and user info

Access routes like /profile or /admin/dashboard

Try accessing admin routes with non-admin users to verify role protection

## 🌱 Future Plans
✅ Add password reset functionality

✅ Email verification upon registration

🔄 Integrate profile editing

⚙️ Add role management from the admin panel

🔐 Refresh tokens for better session handling

📱 Mobile responsiveness improvements

## 🏅 Certificate of Completion
This project was developed as part of the full-stack software development learning path by Alexa Gikungu.

✅ Certificate available upon request or at your-portfolio-link.com/certificate

##  👤 Author
Alexa Gikungu
Full Stack Web Developer
📧 alexigikungu.012@gmail.com
🌐 Portfolio Website
📱 WhatsApp Business

