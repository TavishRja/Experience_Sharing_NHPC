# NHPC Knowledge Sharing Portal

A web-based knowledge sharing portal where employees can submit solutions, moderators can review them, and approved content becomes publicly viewable.

---

## Features

- Employee login and dashboard
- Create, edit, delete, and submit solution drafts
- Upload image/PDF attachments
- Moderator review flow with approve/reject actions
- Public viewing of approved solutions
- View count and like/dislike reactions

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript (vanilla)

### Backend
- Node.js
- Express.js
- MySQL
- Multer
- JSON Web Tokens

---

## User Roles

### Employee
- Log in to the dashboard
- Create solutions as drafts
- Edit or delete drafts
- Submit solutions for review
- Track statuses such as Draft, Pending, Approved, and Rejected

### Moderator
- View pending submissions
- Approve or reject solutions
- Add rejection reasons
- Filter solutions by status, area, and date

### Public User
- View approved solutions
- Open the viewer
- Download PDFs
- See views and reactions

---

## Application Flow

1. An employee creates a solution and saves it as a draft.
2. The draft can be updated or deleted.
3. The employee confirms/submits it for moderation.
4. The moderator reviews the submission.
   - Approve: it becomes publicly visible.
   - Reject: it is returned with a rejection reason.
5. Public users can browse approved solutions.

---

## Project Structure

- Backend/server.js - main Express server entry point
- Backend/routes - authentication, draft, solution, and moderator routes
- Backend/middleware - auth and access control middleware
- Backend/config/db.js - MySQL connection and database initialization
- frontend/ - static HTML/CSS/JS files for the UI
- Backend/uploads - uploaded files

---

## Database Setup

The application uses MySQL.

1. Create a database named nhpc_db.
2. Update the environment variables in Backend/.env.
3. The backend will automatically create the required tables on startup if they do not exist.

### Main tables

#### solutions
| Column | Description |
|---|---|
| id | Primary key |
| title | Solution title |
| area | Work area |
| description | Solution details |
| employee | Employee ID |
| status | Draft / Pending / Approved / Rejected |
| image | Preview image filename |
| pdf_file | Uploaded PDF filename |
| reject_reason | Moderator remarks |
| views | View count |
| created_at | Creation time |
| updated_at | Last update time |

#### users
| Column | Description |
|---|---|
| id | Primary key |
| employee_id | Employee or moderator identifier |
| role | employee or moderator |

#### solution_reactions
| Column | Description |
|---|---|
| solution_id | Related solution |
| employee_id | User who reacted |
| type | like or dislike |

---

## Environment Variables

Create a Backend/.env file with values like:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nhpc_db
PORT=3000
JWT_SECRET=your_secret_key
```

---

## Running the Project

### Backend

```bash
cd Backend
npm install
node server.js
```

The frontend is served by the Express server, so opening the app at http://localhost:3000 will load the UI.

---

## Notes

- Login supports both hardcoded demo users and the configured external employee auth API.
- Demo users: `emp / 123`, `mod / 123`, `EMP102 / 123`.
- Login also supports employee IDs that already exist in the local `users` table.
- If an `employee_id` exists in `users`, that user can log in as an employee from the same login form.
- Make sure `EMPLOYEE_AUTH_API_URL` is set and reachable if you want employee API-based login.
- Make sure MySQL is running before starting the backend.
