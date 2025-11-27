/**
 * Middleware to check if user is logged in
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

/** Middleware to check if user is admin level 1
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export function isAdminLevel1(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized admin level 0' });
  }

  /** Assuming you store the admin level in the session */
  if (req.session.admin === 1) {
    return next(); // user is level 1 admin
  }

  res.status(403).json({ error: 'Forbidden: insufficient privileges' });
}
