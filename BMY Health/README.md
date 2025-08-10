# BMY Health Pakistan Web Portal

*A centralized digital platform for managing healthcare research, ethical reviews, and team collaboration—tailored for Pakistan’s evolving research ecosystem.*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Installation & Setup](#installation--setup)
5. [Usage Guide](#usage-guide)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Configuration](#configuration)
9. [Contributing](#contributing)
10. [License](#license)

---

## Introduction

The **BMY Health Pakistan Web Portal** is a role-based, modular platform developed using vanilla JavaScript, PHP, and MySQL. It facilitates user registration, ethical review workflows (Exempt, Expedited, Full), role management, reviewer assignment, and team collaboration—without relying on frontend frameworks. The system is lightweight, fast, and easy to deploy on any LAMP/WAMP stack.

---

## Features

### 🧑‍⚕️ User Management

* Self-registration via email/username with validation
* Progressive profile completion (after registration)
* Default role assigned on signup; additional roles via admin control
* Navbar-based role switcher for multi-role users
* Roles include: Researcher, Research Lead, Supervisor, ERC Head, ERC Member, Admin, External Collaborator

### 👥 Teams & Collaboration

* Create and manage teams internally
* Invite collaborators (internal usernames or external via email)
* Assign roles/tasks to members within teams
* Document upload with versioning & compliance
* Team linking for cross-project collaboration

### 📄 Proposal Submission & Reviews

* **Three Review Types**:

  * Exempt (minimal fields)
  * Expedited (standard + multiple reviewers)
  * Full (same as expedited + meeting notes + detailed approvals)
* Dynamic form fields based on review type
* Reviewer assignment based on expertise matching
* ERC Head portal for member assignment & oversight
* Review stages, comments, and audit trail per proposal

### 🧠 Reviewer Guidance & Workflow

* Reviewer guidance area: timelines, conflict of interest, confidentiality
* ERC meeting minutes include researcher names
* Alternate auditor signature supported
* Feedback links in approval letters

### 🔔 Notifications & Dashboards

* In-app and email notifications for assignments, comments, and deadlines
* Dashboard cards for: proposals, tasks, deadlines, team activity
* Real-time activity feed and deadline reminders

---

## Tech Stack

* **Frontend**: HTML5, CSS3 (BEM, Flexbox, Grid), Vanilla JS (ES6+)
* **Backend**: PHP (Procedural)
* **Database**: MySQL
* **Environment**: LAMP/WAMP (Apache, PHP, MySQL)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourorg/bmy-health-pakistan.git
cd bmy-health-pakistan
```

### 2. Setup MySQL Database

* Create a database:

  ```sql
  CREATE DATABASE bmy_health;
  ```
* Import schema:

  ```bash
  mysql -u youruser -p bmy_health < database/schema.sql
  ```

### 3. Configure Environment Variables

* Duplicate `.env.example` and rename to `.env`
* Set your configuration values:

```ini
DB_HOST=localhost
DB_NAME=bmy_health
DB_USER=root
DB_PASS=yourpassword
SMTP_HOST=smtp.example.com
SMTP_USER=user@example.com
SMTP_PASS=securepassword
```

### 4. Deploy on Local Server

* Place folder in `htdocs/` (WAMP) or `www/` (LAMP)
* Make sure `uploads/` directory is writable:

  ```bash
  chmod -R 775 uploads/
  ```

---

## Usage Guide

1. Navigate to `http://localhost/bmy-health-pakistan/index.php`
2. Register a new account
3. Default role: Researcher
   Admin/Super Admin can assign other roles in **Admin Dashboard**
4. Use the top navbar to:

   * Switch roles
   * Access Proposals, Teams, or Review Panels

---

## Project Structure

```
/ (root)
├── index.php             # Entry point & router
├── assets/
│   ├── css/              # Stylesheets (BEM-based)
│   └── js/               # Modular JS scripts (ES6+)
├── templates/            # Shared UI components (header, nav, footer)
├── api/                  # PHP API endpoints for AJAX
├── includes/             # DB connection, mailers, auth helpers
├── uploads/              # Uploaded documents
├── database/
│   └── schema.sql        # MySQL schema
```
