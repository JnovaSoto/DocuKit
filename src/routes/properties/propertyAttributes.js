import express from 'express';
import { isAuthenticated } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';
import propertyAttributeController from '../../controllers/properties/propertyAttributeController.js';

const router = express.Router();

/**
 * Get all property attributes.
 * 
 * @name Get All Property Attributes
 * @route {GET} /property-attributes
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BASE, propertyAttributeController.getAllAttributes);

/**
 * Create a new property attribute (Authenticated users).
 * 
 * @name Create Property Attribute
 * @route {POST} /property-attributes/create
 */
router.post(ROUTES.PROPERTY_ATTRIBUTES.CREATE, isAuthenticated, propertyAttributeController.createAttributes);

/**
 * Get all property attributes by property ID.
 * 
 * @name Get Attributes By Property ID
 * @route {GET} /property-attributes/property/:id
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BY_PROPERTY_ID, propertyAttributeController.getAttributesByPropertyId);

/**
 * Get a property attribute by name.
 * 
 * @name Get Property Attribute By Name
 * @route {GET} /property-attributes/name/:name
 */
router.get(ROUTES.PROPERTY_ATTRIBUTES.BY_NAME, propertyAttributeController.getAttributesByName);

export default router;
