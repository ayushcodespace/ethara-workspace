<div align="center">
  <h1>🌌 Ethara Workspace</h1>
  <p><em>Where elite teams execute with precision.</em></p>

  <h3><a href="https://ethara-workspace.up.railway.app/">🚀 View Live Demo Here 🚀</a></h3>
</div>

---

Ethara Workspace is a high-fidelity, full-stack project management application engineered to handle complex team workflows. Built with a focus on high-performance architecture and a cinematic user experience, Ethara bridges the gap between secure backend role management and a deeply immersive, glassmorphism frontend.

[![Ethara Preview](https://via.placeholder.com/1200x600/030303/FFFFFF/?text=Click+Here+to+View+Live+Site)](https://ethara-workspace.up.railway.app/)

---

## ⚡ Tech Stack

This application was built utilizing the complete **MERN** architecture:

* **Frontend:** React.js (Vite), Context API, Axios, Custom Glassmorphism CSS
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Security:** JSON Web Tokens (JWT), bcryptjs, Role-Based Access Control (RBAC)

---

## 🚀 Core Architecture & Features

* **🛡️ Enterprise-Grade RBAC:** Strict data isolation. `Admins` maintain full control over project creation and task assignment, while `Members` focus strictly on execution and status updates within their assigned domains.
* **🎯 Dynamic Task Orchestration:** Full CRUD functionality for tasks with advanced filtering by status (Pending/Completed) and real-time search capabilities.
* **✨ Cinematic User Interface:** A custom-built, ultra-premium UI featuring spatial dynamic backgrounds, infinite ambient grids, holographic card hovers, and strict adherence to dark-mode design principles.
* **📊 Live Dashboard Summary:** Real-time calculation of total, completed, pending, and overdue tasks.

### Professional Project Structure
```text
.
├── server.js
├── config/
│   └── db.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── frontend/
│   ├── src/
│   │   ├── services/api.js
│   │   ├── Landing.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── .env.example
├── .env.example
└── README.md
```

---

## 📡 API Reference

**Auth Core:**
* `POST /api/auth/register`
* `POST /api/auth/login/:role`

**Project Engine:**
* `GET /api/projects` *(Admin: All owned | Member: Assigned only)*
* `POST /api/projects` *(Admin only)*
* `POST /api/projects/:id/members` *(Admin only)*

**Task Pipeline:**
* `GET /api/tasks`
* `POST /api/tasks` *(Admin assignment flow)*
* `PUT /api/tasks/:id`
* `DELETE /api/tasks/:id` *(Admin only)*

**Analytics:**
* `GET /api/dashboard/summary`

---

## 💻 Local Environment Setup

### 1. Backend Initialization
Create a `.env` in the root directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
```
Install and run:
```bash
npm install
npm run dev
```

### 2. Frontend Initialization
Create a `.env` in the `/frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```
Install and run:
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Recommended Demo Flow
To fully experience the application's capabilities:
1. Register two distinct accounts: one `Admin`, one `Member`.
2. Login as the `Admin` and generate a new Project.
3. Utilize the "Team and project access" panel to assign the Member to the Project.
4. Create and dispatch tasks specifically to that Member.
5. Logout, then log back in as the `Member`.
6. Observe data isolation: the Member can only view and update their specific assigned tasks.
7. Mark tasks as complete and watch the Dashboard analytics update in real-time.

---
<div align="center">
  <p>Engineered by <strong>Ayush Srivastava</strong> for the future of work.</p>
</div>