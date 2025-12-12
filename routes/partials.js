// routes/partials.js
import express from 'express';
const router = express.Router();

/**
 * Route to render the header partial.
 * 
 * @name Get Header
 * @route {GET} /partials/header
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get('/header', (req, res) => {
  res.render('partials/header', {
    layout: false,
    user: req.session?.user || null
  });
});

/**
 * Route to render the footer partial.
 * 
 * @name Get Footer
 * @route {GET} /partials/footer
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 */
router.get('/footer', (req, res) => {
  res.render('partials/footer', {
    layout: false
  });
});

export default router;
