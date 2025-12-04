# 🎨 Docukit: Your HTML & CSS Documentation Forge

**Docukit** is a dynamic, interactive Single Page Application (SPA) designed to make learning and referencing **HTML tags** and their corresponding **CSS properties** engaging, visual, and fast. Go beyond static documentation and explore the core building blocks of the web in a functional context.

---

## ✨ Key Features

* **Dual Documentation:** Access clear, concise explanations for **HTML tags** (usage, attributes, nesting rules) alongside their directly related **CSS properties** (syntax, values, and rendering effects).
* **SPA Performance:** Experience a lightning-fast, seamless user experience without constant page reloads.
* **Element Manager:** **Create, view, and delete** custom HTML element documentation dynamically within the app.
* **Robust Stack:** Built on a reliable Node.js/Express backend and modern frontend tools.
* **Responsive by Design:** A clean, responsive layout powered by **Bootstrap 5** and **Core UI**.

---

## 🛠️ The Tech Stack

Docukit utilizes a focused MERN-like stack approach for efficiency and performance.

### 🌐 Frontend (The Visual Layer)

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Structure** | HTML5 | Semantics and application layout. |
| **Style** | CSS3, **Bootstrap 5**, **Core UI** | Modern, responsive styling and component library. |
| **Interactivity** | JavaScript | Driving the dynamic, single-page experience. |

### ⚙️ Backend (The Application Engine)

| Technology | Role | Key Packages |
| :--- | :--- | :--- |
| **Runtime** | **Node.js** | Provides the JavaScript environment. |
| **Framework** | **Express** | Fast, minimal web application framework. |
| **Templating** | **EJS** | Rendering dynamic content for the views. |
| **Security** | **Bcrypt**, **Validator** | Hashing passwords and input validation. |
| **Utilities** | **dotenv**, **Multer** | Managing environment variables and file uploads. |

### 💾 Database

* **System:** **SQLite3**
* **Rationale:** Chosen for its lightweight footprint and ease of setup, perfect for quick development and deployment.
* **Script:** The project has a txt file where you can get an example of data to view the page.
---

## ✨ Features
- Interactive and dynamic SPA experience  
- Clear explanations for each HTML tag and its attributes
- Create, view, and delete tags dynamically  
- Responsive layout powered by Bootstrap  
- Alerts and notifications for user actions  

---

## 🚀 Installation
```bash
# Clone the repository
git clone https://github.com/your-username/html-tags-explanation.git

# Navigate into the project directory
cd html-tags-explanation

# Install dependencies
npm install sqlite3
npm install bcrypt
npm install validator
npm install dotenv
npm install multer

# Package JSON
npm init -y

# Start the server
npm start
