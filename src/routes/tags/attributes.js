import express from 'express';
import { isAuthenticated } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';
import attributeController from '../../controllers/tags/attributeController.js';

const router = express.Router();

/**
 * Get all attributes.
 * 
 * @name Get All Attributes
 * @route {GET} /attributes
 */
router.get(ROUTES.ATTRIBUTES.BASE, attributeController.getAllAttributes);

/**
 * Create new attributes (Authenticated users).
 * 
 * @name Create Attributes
 * @route {POST} /attributes/create
 */
router.post(ROUTES.ATTRIBUTES.CREATE, isAuthenticated, attributeController.createAttributes);

/**
 * Get attributes by tag ID.
 * 
 * @name Get Attributes By Tag ID
 * @route {GET} /attributes/tag/:id
 */
router.get(ROUTES.ATTRIBUTES.BY_TAG_ID, attributeController.getAttributesByTagId);

/**
 * Get attributes by name.
 * 
 * @name Get Attribute By Name
 * @route {GET} /attributes/name/:name
 */
router.get(ROUTES.ATTRIBUTES.BY_NAME, attributeController.getAttributesByName);

export default router;
