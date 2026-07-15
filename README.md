# NHPC Knowledge Sharing Portal

This project is a simple knowledge-sharing web app for NHPC employees. Employees can create solution drafts, submit them for review, moderators can approve or reject them, and approved solutions become visible to public users.

---

## App Flow

1. An employee logs in.
2. The employee creates a solution draft and saves it.
3. The employee submits the draft for moderation.
4. A moderator reviews the submission.
   - If approved, the solution becomes public.
   - If rejected, the employee sees the rejection reason.
5. Public users can browse and view approved solutions.

---

## Main Roles

### Employee
- Log in to the dashboard
- Create, edit, or delete drafts
- Submit solutions for review

### Moderator
- Review pending submissions
- Approve or reject solutions
- Add rejection reasons

### Public User
- View approved solutions
- Open attached PDFs
- See views and reactions

---

## Project Structure

- Backend/ - Node.js and Express backend
  - server.js - main server entry point
  - routes/ - API routes for auth, drafts, solutions, and moderator actions
  - controllers/ - logic for handling requests
  - middleware/ - authentication and access control
  - config/ - database connection setup
  - uploads/ - uploaded files
- frontend/ - HTML, CSS, and JavaScript UI files
- Database.sql - SQL script for the database structure

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MySQL
- Multer
- JWT

---

## Setup Instructions

### 1. Install dependencies

Open the terminal and run:

```bash
cd Backend
npm install
```

### 2. Create the database

Make sure MySQL is running, then create a database named:

```sql
nhpc_db
```

### 3. Create environment variables

Create a file named Backend/.env with values like:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nhpc_db
PORT=3000
JWT_SECRET=your_secret_key
```

### 4. Start the application

Run:

```bash
cd Backend
node server.js
```

Then open:

```text
http://localhost:3000
```

The backend serves the frontend pages, so you do not need to run a separate frontend server.

---

## Demo Login

The app supports demo users such as:

- Username: emp | Password: 123
- Username: mod | Password: 123
- Username: EMP102 | Password: 123

---

## Notes

- The backend automatically creates the required tables on startup if they do not already exist.
- Make sure MySQL is running before starting the app.
- If the employee authentication API is configured, the login page can also use that external service.
