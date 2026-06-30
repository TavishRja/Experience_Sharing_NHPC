# NHPC Knowledge Sharing Portal

A web-based knowledge sharing system for employees to submit problem-solving
solutions, reviewed by moderators and published for public access.

---

## 🔧 Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (Vanilla)

### Backend
- Node.js
- Express.js
- MySQL
- Multer (File Upload)

---

## 👥 User Roles

### 1️⃣ Employee
- Login to dashboard
- Create solution as **Draft**
- Edit/Delete Draft
- Submit solution for review
- Track status (Pending / Approved / Rejected)
- View own submissions

### 2️⃣ Moderator
- View Pending / Approved / Rejected solutions
- Filter by Area and Date
- Read solution (Image + PDF)
- Approve or Reject with reason

### 3️⃣ Public User
- View approved solutions
- Search and filter
- Read solution in viewer
- View count, like, dislike
- Download PDF

---

## 🔁 Application Flow

1. Employee creates a solution → saved as **Draft**
2. Draft is edited and **Confirmed**
3. Solution moves to **Pending**
4. Moderator reviews:
   - Approves → Publicly visible
   - Rejects → Sent back with reason
5. Public users can view approved solutions

---

## 📁 Project Structure




---

## 🗄️ Database Schema (solutions table)

| Column | Description |
|------|------------|
| id | Primary key |
| title | Problem title |
| area | Work area |
| description | Solution description |
| employee | Employee ID |
| status | Draft / Pending / Approved / Rejected |
| image | Preview image |
| pdf_file | Solution document |
| views | View count |
| likes | Likes |
| dislikes | Dislikes |
| reject_reason | Moderator remarks |
| created_at | Created date |
| updated_at | Last update |

---

## ▶️ How to Run the Project

### Backend
```bash
cd backend
npm install
nodemon server.js
npm run dev


## 🔐 Demo Login Credentials

> ⚠️ Note: Ye credentials **demo / testing purpose** ke liye hardcoded hain.

### 👨‍💼 Employee Login
- **Employee ID:** `emp`
- **Password:** `123`
- **Redirects to:** Employee Dashboard

> Internally employee code used: `EMP102`

---

### 🧑‍⚖️ Moderator Login
- **Moderator ID:** `mod`
- **Password:** `123`
- **Redirects to:** Moderator Dashboard

---

### 🌐 Public User
- No login required
- Can view only **Approved** solutions
- View, Download PDF, Like / Dislike available

---

### 🔄 Redirect Logic
- If a user clicks **View** without login:
  - Redirected to Login Page
  - After login, user is redirected back to the requested page
