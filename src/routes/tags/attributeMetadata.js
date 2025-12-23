import express from 'express';
import { isAdminLevel1 } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';
import attributeMetadataController from '../../controllers/tags/attributeMetadataController.js';

const router = express.Router();

/**
 * Get all attribute metadata.
 * 
 * @name Get All Attribute Metadata
 * @route {GET} /attribute-metadata
 */
router.get(ROUTES.ATTRIBUTE_METADATA.BASE, attributeMetadataController.getAllMetadata);

/**
 * Get attribute metadata by name.
 * 
 * @name Get Attribute Metadata By Name
 * @route {GET} /attribute-metadata/:name
 */
router.get(ROUTES.ATTRIBUTE_METADATA.BY_NAME, attributeMetadataController.getMetadataByName);

/**
 * Create new attribute metadata (Admin only).
 * 
 * @name Create Attribute Metadata
 * @route {POST} /attribute-metadata/create
 */
router.post(ROUTES.ATTRIBUTE_METADATA.CREATE, isAdminLevel1, attributeMetadataController.createMetadata);

export default router;
