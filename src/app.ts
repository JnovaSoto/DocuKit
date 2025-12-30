// ============================================================================
// Dependencies
// ============================================================================
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import prisma from './db/prisma.js';
import passport from './config/passport.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectSqlite3 from 'connect-sqlite3';

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
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_key_123';
const SESSION_DURATION = 30 * 60 * 1000;

// ============================================================================
// Express App Initialization
// ============================================================================
const app = express();

// ============================================================================
// View Engine Configuration
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));
app.use(expressLayouts);

// ============================================================================
// Middleware Setup
// ============================================================================

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://translate.googleapis.com", "https://translate.google.com", "https://translate-pa.googleapis.com", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://translate.googleapis.com", "https://www.gstatic.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
      imgSrc: ["'self'", "data:", "https:", "http://translate.google.com", "https://www.gstatic.com"],
      connectSrc: ["'self'", "https://translate.googleapis.com", "https://translate-pa.googleapis.com", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "https://translate.googleapis.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null,
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
const SQLiteStore = connectSqlite3(session);

// Session middleware
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: './db'
  }) as any,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax', // Protects against CSRF while allowing OAuth redirects
    maxAge: SESSION_DURATION
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

/**
 * Render the Home page showing the navigation and welcome screen.
 * @name Home Page
 * @route {GET} /
 * @route {GET} /home
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get(['/', '/home'], (_req: Request, res: Response) => {
  res.render('home', { layout: 'layout', title: 'Home' });
});

/**
 * Render the CSS documentation gallery page.
 * @name CSS Properties Page
 * @route {GET} /css
 * @route {GET} /css-properties
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get(['/css', '/css-properties'], (_req: Request, res: Response) => {
  res.render('css', { layout: 'layout', title: 'CSS Properties' });
});

/**
 * Render the creation form for adding new documentation (Admin/Auth protected).
 * @name Create Page
 * @route {GET} /create
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/create', requireAuth, (_req: Request, res: Response) => {
  res.render('create', { layout: 'layout', title: 'Create' });
});

/**
 * Render the user registration page.
 * @name Sign Up Page
 * @route {GET} /signUp
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/signUp', (_req: Request, res: Response) => {
  res.render('signUp', { layout: 'layout', title: 'SignUp' });
});

/**
 * Render the user login page.
 * @name Login Page
 * @route {GET} /logIn
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/logIn', (_req: Request, res: Response) => {
  res.render('logIn', { layout: 'layout', title: 'LogIn' });
});

/**
 * Render the item editing page (Admin/Auth protected).
 * @name Edit Page
 * @route {GET} /edit
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/edit', requireAuth, (_req: Request, res: Response) => {
  res.render('edit', { layout: 'layout', title: 'Edit' });
});

/**
 * Render the user profile management page.
 * @name Profile Page
 * @route {GET} /profile
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/profile', requireAuth, (_req: Request, res: Response) => {
  res.render('profile', { layout: 'layout', title: 'Profile' });
});

/**
 * Render the user's favorite tags and properties page.
 * @name Favorites Page
 * @route {GET} /favorites
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/favorites', requireAuth, (_req: Request, res: Response) => {
  res.render('favorites', { layout: 'layout', title: 'Favorites' });
});

// Static files middleware (comes last to not interfere with routes)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * Render the dedicated 404 - Not Found page.
 * @name Not Found Page
 * @route {GET} /not-found
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 */
app.get('/not-found', (_req: Request, res: Response) => {
  res.render('notFound', { layout: 'layout', title: 'Not Found' });
});


// ============================================================================
// Error Handling Middleware
// ============================================================================

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).render('error', {
    layout: 'layout',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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

// Ensure Prisma is connected before starting the server
prisma.$connect()
  .then(() => {
    // Only start listening for requests after the database is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${NODE_ENV}`);
      console.log('💎 Database: Prisma connected');
    });
  })
  .catch((err: any) => {
    // If database connection fails, log error and exit process
    console.error('🛑 FATAL ERROR: Database connection failed.', err);
    process.exit(1);
  });
