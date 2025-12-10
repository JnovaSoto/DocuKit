# 📚 DocuKit: The Ultimate HTML & CSS Reference Platform

**DocuKit** is a comprehensive, feature-rich web application designed to serve as the definitive **interactive reference guide** for **HTML tags** and their associated metadata. Built on a secure and modern stack, it provides detailed explanations, attribute data, usage examples, and powerful user-centric features, making it an indispensable tool for developers and learners alike.

---

## ✨ Feature Breakdown

DocuKit is divided into three key functional pillars: Core Documentation, User Management, and Administration.

### 🔍 Core Documentation & Interactivity
* **Intelligent Tag Search:** Robust search functionality allows users to quickly locate tags based on **name** or **attribute**.
* **Attribute Metadata:** Provides detailed descriptions, compatibility notes, and usage context for every HTML attribute.
* **Interactive Table View:** A clean, responsive table displays tags, their **usability status**, and associated attributes for rapid reference.
* **Dynamic Theme Switcher:** Personalize the experience with a **Theme Switcher** toggling between the:
    * **HTML Theme** (`#cca31e` - Yellow/Gold)
    * **CSS Theme** (`#1c7ed6` - Blue)
    * *Styling is managed efficiently using **CSS Variables** for real-time updates.*

### 👤 Secure User System
* **Authentication:** Secure **Sign Up** and **Log In** system utilizing `bcrypt` for password hashing and `express-session` for session management.
* **Profile Management:** Users can manage their profiles, including **profile photo uploads** (handled by `multer`).
* **Favorites System:** Logged-in users can **"favorite"** essential tags for quick and easy access.

### 🛡️ Administration Module
* **Full CRUD Access:** Admin-level users (Admin Level 1) have complete control over the documentation content:
    * **Create** new tags and attributes.
    * **Edit** existing documentation.
    * **Delete** outdated or incorrect entries.

---

## 🛠️ Technology Stack

DocuKit is powered by a reliable Node.js backend and a modern, maintainable frontend built primarily on Vanilla JavaScript and CSS.

### 💻 Backend & Server
| Technology | Role | Key Package(s) |
| :--- | :--- | :--- |
| **Server** | **Node.js** & **Express.js** | Provides the core application framework. |
| **Database** | **SQLite3** | Lightweight, file-based relational data storage. |
| **Security** | **Bcrypt** & **express-session** | Password hashing and secure user session management. |
| **File Handling** | **Multer** | Middleware for processing profile photo uploads. |

### 🖼️ Frontend & Styling
| Technology | Role | Key Feature(s) |
| :--- | :--- | :--- |
| **Templating** | **EJS** | Embedded JavaScript for dynamic HTML rendering. |
| **Styling** | **Vanilla CSS** | Custom, maintainable styling with extensive use of **CSS Variables**. |
| **Interactivity** | **Vanilla JavaScript** | Client-side logic for search, navigation, and theme switching (SPA-like experience). |
| **Layout** | **Responsive Design** | Optimized for Desktop, Tablet, and Mobile devices. |

---

## 📂 Project Structure

The codebase is organized following a clear, feature-separated structure for maintainability.

```bash
DocuKit/
├── app.js              # Main application entry point
├── database.js         # Database connection and initialization
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables configuration
│
├── config/             # Configuration files
├── db/                 # Database scripts and schema
├── middleware/         # Express middleware (e.g., auth.js)
│
├── public/             # Static assets
│   ├── css/            # Stylesheets (index.css, header.css, variables.css)
│   ├── js/             # Client-side scripts (organized by feature)
│   └── img/            # Images and icons
│
├── routes/             # Express route definitions
│   ├── tags.js         # Tag API routes
│   ├── users.js        # User API routes
│   └── ...
│
├── uploads/            # User uploaded content (profile photos)
└── views/              # EJS templates
    ├── partials/       # Reusable UI components (header, footer)
    └── ...             # Page templates (home, login, profile, etc.)
```
## ⚡ Installation & Setup Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

1. **Excecute this in the powershell if the commands are not working**

    ```bash
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
    ```

2. **Clone the repository:**

    ```bash
    git clone https://github.com/JnovaSoto/DocuKit.git
    cd DocuKit
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Configure Environment:**

    Create a `.env` file in the root directory and add your session secret:

    ```env
    SESSION_SECRET=your_secret_key_here
    PORT=3000
    NODE_ENV=development
    ```

    Then copy and execute the scriptExample.txt Script to create the database. (Only for the first time)

    ```bash
    npm run create-db
    ```

5. **Start the application:**

    ```bash
    npm start
    ```

6. **Access the app:**

    Open your browser and navigate to `http://localhost:3000`.

---


## 🎨 Themes



The application features a unique theme switcher located in the header:

*   **HTML Tags (Button):** Activates the "HTML" theme (Primary Color: `#cca31e`).

*   **CSS Properties (Button):** Activates the "CSS" theme (Primary Color: `#1c7ed6`).



## 👤 Author



**Juan David Nova Soto**



---

*This project is for educational purposes.*





