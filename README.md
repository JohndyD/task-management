# Task Management System

A web-based task management and student assignment submission system built with React, PHP, and MySQL. The platform allows administrators to create and manage tasks while enabling students to submit assignments, monitor deadlines, and track submission status.

---

## Features

### Administrator

- Create tasks
- Edit task information
- Delete tasks
- Configure submission settings
  - Allow or disable resubmissions
  - Set maximum submission attempts
  - Allow or disable late submissions
- View task details
- View student submissions
- Grade submitted assignments
- Dashboard overview of tasks and submissions

### Student

- Login securely
- View available tasks
- View task details
- Submit assignments
- Monitor submission status

---

## Technologies Used

### Frontend

- React
- React Router DOM
- Axios
- Bootstrap
- DataTables
- Vite

### Backend

- PHP
- Session-based Authentication
- REST-style PHP API Endpoints

### Database

- MySQL

### Credentials on users

- student
- email: john@gmail.com
- password: student123

- admin
- email: admin@gmail.com
- password: admin123

### Development Environment

- XAMPP (Apache + MySQL)

---

## Prerequisites

Before running the project, install:

- Node.js
- npm
- XAMPP (Apache and MySQL)

Commands

npm install
npm install react-router-dom axios bootstrap
npm install datatables.net datatables.net-bs5

---

## Project Structure

task-management/
│
├── php/
│   ├── admin/
│   │   ├── add_task.php
│   │   ├── admin_dashboard.php
│   │   ├── delete_task.php
│   │   ├── edit_task.php
│   │   ├── get_submissions.php
│   │   ├── get_tasks.php
│   │   ├── grade_submission.php
│   │   ├── view_submission.php
│   │   └── view_tasks.php
│   │
│   ├── config/
│   │   ├── cors.php
│   │   └── db.php
│   │
│   ├── student/
│   │   ├── student_dashboard.php
│   │   ├── student_tasks.php
│   │   └── submit_task.php
│   │
│   ├── check_session.php
│   ├── create_password.php
│   ├── login.php
│   ├── logout.php
│   └── test_login.php
│
├── src/
│   ├── components/
│   ├── css/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
│
├── uploads/
│   └── submissions/
├── public/
│
