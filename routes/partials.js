// routes/partials.js
import express from 'express';
import partialController from '../controllers/partials/partialController.js';

const router = express.Router();

/**
 * Route to render the header partial.
 * 
 * @name Get Header
 * @route {GET} /partials/header
 */
router.get('/header', partialController.getHeader);

/**
 * Route to render the footer partial.
 * 
 * @name Get Footer
 * @route {GET} /partials/footer
 */
router.get('/footer', partialController.getFooter);

export default router;
