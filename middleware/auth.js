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
    console.log('❌ Admin check failed: No userId in session');
    return res.status(401).json({ error: 'Unauthorized: not logged in' });
  }

  // Convert to number to handle both string and number types
  const adminLevel = parseInt(req.session.admin, 10);

  console.log('🔍 Admin check:', {
    userId: req.session.userId,
    adminValue: req.session.admin,
    adminType: typeof req.session.admin,
    parsedAdmin: adminLevel
  });

  if (adminLevel === 1) {
    console.log('✅ Admin check passed');
    return next(); // user is level 1 admin
  }

  console.log('❌ Admin check failed: insufficient privileges');
  res.status(403).json({
    error: 'Forbidden: insufficient privileges',
    debug: `Admin level: ${adminLevel}, required: 1`
  });
}
