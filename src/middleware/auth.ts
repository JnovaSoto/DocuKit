import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to check if the user is authenticated for API requests.
 * Returns a 401 Unauthorized JSON response if no session exists.
 * 
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Unauthorized: No active session' });
}

/**
 * Middleware to require authentication for page navigation.
 * Redirects the user to the Home page if they are not logged in.
 * 
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) return next();
  res.redirect('/home');
}

/**
 * Middleware to verify if the authenticated user has Admin privileges (level 1).
 * Returns 401 if unauthenticated, or 403 Forbidden if the user is not an admin.
 * 
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
export function isAdminLevel1(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized: not logged in' });
  }

  const adminLevel = req.session.admin;

  if (adminLevel === 1) {
    return next();
  }

  res.status(403).json({
    error: 'Forbidden: Admin access required',
    debug: `Admin level: ${adminLevel}, required: 1`
  });
}

