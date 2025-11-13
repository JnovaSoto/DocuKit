// routes/partials.js
import express from 'express';
const router = express.Router();

// Renders the header and sends the user data if a session exists
router.get('/header', (req, res) => {
  res.render('partials/header', {
     user: req.session?.user || null 
    });
});
router.get('/footer', (req, res) => {
  res.render('partials/footer');
});

export default router;
