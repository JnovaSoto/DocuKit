import express from 'express';
import { isAuthenticated, isAdminLevel1 } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';
import propertyController from '../../controllers/properties/propertyController.js';

const router = express.Router();

/**
 * Get all properties.
 * 
 * @name Get All Properties
 * @route {GET} /properties
 */
router.get(ROUTES.PROPERTIES.BASE, propertyController.getAllProperties);

/**
 * Create a new property (Authenticated users).
 * 
 * @name Create Property
 * @route {POST} /properties/create
 */
router.post(ROUTES.PROPERTIES.CREATE, isAuthenticated, propertyController.createProperty);

/**
 * Get a property by ID.
 * 
 * @name Get Property By ID
 * @route {GET} /properties/:id
 */
router.get(ROUTES.PROPERTIES.BY_ID, propertyController.getPropertyById);

/**
 * Get properties by multiple IDs.
 * 
 * @name Get Properties By IDs
 * @route {GET} /properties/by-ids/:ids
 */
router.get(ROUTES.PROPERTIES.BY_IDS, propertyController.getPropertiesByIds);

/**
 * Get properties by name.
 * 
 * @name Get Property By Name
 * @route {GET} /properties/name/:name
 */
router.get(ROUTES.PROPERTIES.BY_NAME, propertyController.getPropertyByName);

/**
 * Update property and its attributes (Admin only).
 * Deletes existing attributes and inserts new ones in a transaction-like manner.
 * 
 * @name Update Property
 * @route {PUT} /properties/:id
 */
router.put('/:id', isAdminLevel1, propertyController.updateProperty);

/**
 * Delete property and all related attributes (Admin only).
 * 
 * @name Delete Property
 * @route {DELETE} /properties/delete/:id
 */
router.delete(ROUTES.PROPERTIES.DELETE, isAdminLevel1, propertyController.deleteProperty);

export default router;
