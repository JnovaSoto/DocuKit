import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import partialsRouter from './routes/partials.js';
import tagsRoutes from './routes/tags.js';
import usersRoutes from './routes/users.js';
import attributesRoutes from './routes/attributes.js';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Create Express App
const app = express();
const PORT = 3000;

// Required to obtain __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware 
dotenv.config();
app.use(session({
  secret: process.env.SESSION_SECRET,//Signed Cokkie 
  resave: false,// Dont save the Session if nothing has changed
  saveUninitialized: false, //Dont save a empty Session
  cookie: {
    httpOnly: true,//JavaScript is prohibited from reading it; only the server and the browser can read it.
    secure: process.env.NODE_ENV === 'production',// The cookie is sent via http if the project is in the development phase.
    maxAge: 1000 * 60 * 30 // 30 minutes is the session time before expired
  }
}));
app.use(express.json()); // Allow manage JSON in petitions
app.use('/partials', partialsRouter); // Customize paths for inyect the partials
app.use('/tags', tagsRoutes); // Customize paths in /tags
app.use('/attributes', attributesRoutes); // Customize paths in /attributes
app.use('/users', usersRoutes); // Customize paths in /tags
app.use(express.static(path.join(__dirname, 'public'))); // Statistical files
app.use(expressLayouts); //Layout for EJS view



// EJS view engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Paths
app.get(['/', '/home'], (req, res) => {
  res.render('home', { layout: 'layout', title: 'Home'});
});
//Create
app.get('/create', (req, res) => {
  res.render('create', { layout: 'layout', title: 'Create' });
});
//Sign up
app.get('/signUp', (req, res) => {
  res.render('signUp', { layout: 'layout', title: 'SignUp' });
});
//Log In
app.get('/logIn', (req, res) => {
  res.render('logIn', { layout: 'layout', title: 'LogIn' });
});
//Edit
app.get('/edit', (req, res) => {
  res.render('edit', { layout: 'layout', title: 'Edit' });
});




// Start the Server
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
