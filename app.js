import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import partialsRouter from './routes/partials.js';
import tagsRoutes from './routes/tags.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Create Express App
const app = express();
const PORT = 3000;

// Required to obtain __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware 
app.use(express.json()); // Allow manage JSON in petitions
app.use('/partials', partialsRouter); // Customize paths for inyect the partials
app.use('/tags', tagsRoutes); // Customize paths in /tags
app.use(express.static(path.join(__dirname, 'public'))); // Statistical files


// EJS view engine configuration
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Paths
app.get(['/', '/home'], (req, res) => {
  res.render('home', { layout: 'layout', title: 'Home'});
});

app.get('/create', (req, res) => {
  res.render('create', { layout: 'layout', title: 'Create' });
});

app.get('/signUp', (req, res) => {
  res.render('signUp', { layout: 'layout', title: 'SignUp' });
});


// Start the Server
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
