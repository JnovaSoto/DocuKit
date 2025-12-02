export function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

export function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/home');
}

/**
 * Check if user is admin (level 1).
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
