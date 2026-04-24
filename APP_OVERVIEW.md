# 6ASkillcity - Educational Management Ecosystem

6ASkillcity is a robust, full-stack enterprise application designed to streamline the admission lifecycle, university management, and partner collaborations in the education sector. It provides a centralized platform for administrators, partners (admission points), and students to interact seamlessly.

## 🚀 Core Features

### 🏢 University & Program Management
- **Centralized Catalog**: Manage universities, academic programs, and detailed fee structures.
- **Dynamic Fee Logic**: Support for various fee types (tuition, registration, etc.) associated with specific programs.

### 🤝 Partner (Admission Point) Management
- **Granular Permissions**: Secure access control for partners to specific universities and programs.
- **Status Tracking**: Monitor partner activity, verify credentials, and manage active/inactive statuses.
- **Partner Dashboard**: Dedicated interface for partners to track their student submissions and performance.

### 🎓 Student Application Lifecycle
- **AI Document Autofill**: Integrated OCR (Tesseract.js) to automatically extract demographic data (Name, DOB, Phone) from identity documents like Aadhar/PAN.
- **Eligibility Verification**: Automated and manual checks for student eligibility based on program requirements.
- **Application Workflow**: Track student applications from initial registration to final admission.
- **Follow-up System**: Integrated timeline for tracking interactions, notes, and follow-ups for each student.

### 🎫 Real-time Ticketing & Support
- **Support System**: Live chat interface for partners to communicate with the administrative team.
- **Socket.io Integration**: Real-time notifications and message updates for instant resolution.
- **Automated Management**: Background cron jobs to handle postponed or stale tickets.

### 📜 System Governance
- **Activity Logging**: Comprehensive audit trails for sensitive operations (permission changes, status updates).
- **Secure Authentication**: Multi-role support (Admin, Partner, User) with JWT-based authorization.

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Vite)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & Redux Persist
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Forms**: React Hook Form with Yup validation
- **Real-time**: Socket.io Client

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) with [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Communication**: Socket.io for bi-directional real-time communication
- **Scheduling**: Node-cron for background task automation
- **Security**: JWT, BcryptJS, Helmet, and Express Rate Limit

---

## 📂 Project Structure

```text
6ASkillcity/
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Feature-based page components
│   │   ├── store/         # Redux state management
│   │   └── services/      # API and Socket integrations
├── server/                # Node.js Backend
│   ├── models/            # Mongoose Schemas
│   ├── controllers/       # Business Logic
│   ├── routes/            # API Endpoints
│   ├── services/          # Core logic (Socket, Email, etc.)
│   └── cron/              # Background jobs
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance

### Installation

1. **Backend Setup**:
   ```bash
   cd server
   npm install
   # Configure .env with MONGO_URI, JWT_SECRET, etc.
   npm run dev
   ```

2. **Frontend Setup**:
   ```bash
   cd client
   npm install
   # Configure .env with VITE_API_URL
   npm run dev
   ```

---
© 2024 6ASkillcity. All rights reserved.
