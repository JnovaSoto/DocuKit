// ============================================================================
// Dependencies
// ============================================================================
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';

// Route imports

// Tag routes
import tagsRoutes from './routes/tags/tags.js';

// Attribute routes
import attributesRoutes from './routes/tags/attributes.js';
import attributeMetadataRoutes from './routes/tags/attributeMetadata.js';

// Property routes
import propertiesRoutes from './routes/properties/properties.js';
import propertyAttributesRoutes from './routes/properties/propertyAttributes.js';

// Partial routes
import partialsRouter from './routes/partials.js';

// User routes
import usersRoutes from './routes/users.js';

// ============================================================================
// Configuration
// ============================================================================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// ============================================================================
// Express App Initialization
// ============================================================================
const app = express();

// ============================================================================
// View Engine Configuration
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// ============================================================================
// Middleware Setup
// ============================================================================

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    maxAge: SESSION_DURATION
  }
}));

// ============================================================================
// API Routes (must come before static files)
// ============================================================================

app.use('/partials', partialsRouter);
app.use('/tags', tagsRoutes);
app.use('/attributes', attributesRoutes);
app.use('/attribute-metadata', attributeMetadataRoutes);
app.use('/properties', propertiesRoutes);
app.use('/property-attributes', propertyAttributesRoutes);
app.use('/users', usersRoutes);

// ============================================================================
// Page Routes (must come before static files to avoid conflicts)
// ============================================================================

app.get(['/', '/home'], (req, res) => {
  res.render('home', { layout: 'layout', title: 'Home' });
});

app.get('/css-properties', (req, res) => {
  res.render('css', { layout: 'layout', title: 'CSS Properties' });
});

app.get('/create', requireAuth, (req, res) => {
  res.render('create', { layout: 'layout', title: 'Create' });
});

app.get('/signUp', (req, res) => {
  res.render('signUp', { layout: 'layout', title: 'SignUp' });
});

app.get('/logIn', (req, res) => {
  res.render('logIn', { layout: 'layout', title: 'LogIn' });
});

app.get('/edit', requireAuth, (req, res) => {
  res.render('edit', { layout: 'layout', title: 'Edit' });
});

app.get('/profile', requireAuth, (req, res) => {
  res.render('profile', { layout: 'layout', title: 'Profile' });
});

app.get('/favorites', requireAuth, (req, res) => {
  res.render('favorites', { layout: 'layout', title: 'Favorites' });
});

// Static files middleware (comes last to not interfere with routes)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================================
// Error Handling Middleware
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    layout: 'layout',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  // Handle custom Multer filter errors
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({ error: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;

  res.status(statusCode).render('error', {
    layout: 'layout',
    title: 'Error',
    message,
    statusCode
  });
});

// ============================================================================
// Server Initialization
// ============================================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
});
