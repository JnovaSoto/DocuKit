/**
 * Middleware to check if the user is authenticated.
 * Returns 401 Unauthorized if not logged in.
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 */
export function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

/**
 * Middleware to require authentication for page access.
 * Redirects to /home if not logged in.
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 */
export function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/home');
}

/**
 * Middleware to check if user is admin (level 1).
 * Returns 401 if not logged in, 403 if not admin.
 * 
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 */
export function isAdminLevel1(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized: not logged in' });
  }

  const adminLevel = parseInt(req.session.admin, 10);

  if (adminLevel === 1) {
    return next();
  }

  res.status(403).json({
    error: 'Forbidden: insufficient privileges',
    debug: `Admin level: ${adminLevel}, required: 1`
  });
}
