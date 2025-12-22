# 📚 DocuKit: The Ultimate HTML & CSS Reference Platform

**DocuKit** is a comprehensive, feature-rich web application designed to serve as the definitive **interactive reference guide** for **HTML tags** and **CSS Properties**. Built on a secure and modern stack, it provides detailed explanations, attribute data, usage examples, and powerful user-centric features, making it an indispensable tool for developers and learners alike.

---

## ✨ Feature Breakdown

DocuKit is divided into four key functional pillars: Core Documentation, User Management, Internationalization, and Administration.

### 🔍 Core Documentation & Interactivity
* **SPA-like Experience:** Powered by the **View Transitions API**, providing fluid, native-like content fades and slides between pages.
* **Intelligent Search:** Robust search functionality allows users to quickly locate tags/properties based on **name** or **attribute**.
* **Global Command+K Search:** Instant access to all documentation via a global overlay (Ctrl+K/Cmd+K) with **Fuzzy Search** (Fuse.js) to handle typos effortlessly.
* **Attribute Metadata:** Detailed descriptions, compatibility notes, and usage context for every HTML/CSS attribute.
* **Dynamic Theme System:** 
    * **HTML Theme** (Gold): Tailored for HTML element exploration.
    * **CSS Theme** (Blue): Optimized for CSS property discovery.
    * **Persistence Dark Mode:** A full dark theme that saves user preference in `localStorage`.
    * *Managed via **CSS Variables** for instant, across-the-board aesthetic swaps.*

### 👤 Advanced User System
* **Unified Authentication:** Supports both traditional **Email/Password** and **Google OAuth 2.0** login/signup.
* **Secure Sessions:** Utilizes `passport.js` and `express-session` for high-security session management.
* **Smart Favorites:** Separate bookmarking systems for HTML tags and CSS properties, persisting within the user's secure profile.
* **Profile Customization:** Dynamic profile photo uploads with automated folder management for users.

### 🌎 Internationalization (i18n)
* **Real-time Translation:** Integrated Google Translate engine with a **premium custom UI**.
* **Smart Labeling:** Selection persists across sessions and page reloads via cookie-based state management.
* **Visual Polish:** Intelligent layout adjustments that prevent translation UI from interfering with the site's design.

### 🛡️ Administration Module
* **Full CRUD Control:** Administrators have complete authority to:
    * **Create/Update/Delete** tags, properties, and their associated attributes.
    * **Manage Metadata:** Update global attribute definitions.
* **Modern Data Layer:** powered by **Prisma ORM** for type-safe database interactions and streamlined schema management.

---

## 🛠️ Technology Stack

| Category | Technology | Key Features |
| :--- | :--- | :--- |
| **Server** | Node.js & Express.js | Core application and API framework. |
| **ORM** | Prisma | Type-safe database client and schema management. |
| **Database** | SQLite | Lightweight, transactional relational storage. |
| **Auth** | Passport.js & Google OAuth 2.0 | Multi-provider authentication system. |
| **Templating** | EJS | Dynamic server-side rendering. |
| **UI/UX** | Vanilla JS & CSS Variables | High-performance SPA navigation and theme logic. |
| **Animations** | View Transitions API | Native-feel page transitions. |
| **Docs** | JSDoc | Fully documented service and controller layers. |

---

## 📂 Internal Architecture

The codebase follows a clear **Feature-Driven Design** for maximum scalability.

```bash
DocuKit/
├── config/             # Passport, Multer, and Route centralization
├── controllers/        # Request handling (Tags, Properties, Users, Partials)
├── db/                 # Prisma client instance and Seeding logic
├── middleware/         # Auth guards & Validation
├── prisma/             # Prisma schema and database migrations
├── public/             # SPA Logic, Global Styles, and Tools
├── routes/             # Centralized route definitions
├── services/           # Decoupled Business Logic using Prisma Client
├── views/              # Modular EJS templates
└── app.js              # Application entry point & Middleware orchestration
```

---

## ⚡ Installation & Setup

1. **Clone & Install:**
    ```bash
    git clone https://github.com/JnovaSoto/DocuKit.git
    cd DocuKit
    npm install
    ```

2. **Environment Configuration:**
    Create a `.env` file in the root:
    ```env
    PORT=3000
    SESSION_SECRET=your_super_secret_key
    NODE_ENV=development
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret
    DATABASE_URL="file:./db/database.sqlite"
    ```

3. **Initialize Database:**
    ```bash
    # This synchronizes the schema and seeds initial data via Prisma
    npm run create-db
    ```

4. **Database Exploration:**
    ```bash
    # Open Prisma Studio to view and edit your data
    npm run studio
    ```

5. **Run Application:**
    ```bash
    npm start
    ```

---

## 👤 Author

**Juan David Nova Soto**
*Interactive Reference Guide Project*

---
*This project is for educational purposes.*
