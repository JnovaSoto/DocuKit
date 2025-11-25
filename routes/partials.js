// routes/partials.js
import express from 'express';
const router = express.Router();

// Renders the header and sends the user data if a session exists
router.get('/header', (req, res) => {
  res.render('partials/header', {
    layout: false,
    user: req.session?.user || null
  });
});

router.get('/footer', (req, res) => {
  res.render('partials/footer', {
    layout: false
  });
});

export default router;
