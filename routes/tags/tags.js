import express from 'express';
import { isAuthenticated, isAdminLevel1 } from '../../middleware/auth.js';
import ROUTES from '../../config/routes.js';
import tagController from '../../controllers/tags/tagController.js';

const router = express.Router();

/**
 * Get all tags.
 * 
 * @name Get All Tags
 * @route {GET} /tags
 */
router.get(ROUTES.TAGS.BASE, tagController.getAllTags);

/**
 * Create a new tag (Authenticated users).
 * 
 * @name Create Tag
 * @route {POST} /tags/create
 */
router.post(ROUTES.TAGS.CREATE, isAuthenticated, tagController.createTag);

/**
 * Get a tag by ID.
 * 
 * @name Get Tag By ID
 * @route {GET} /tags/:id
 */
router.get(ROUTES.TAGS.BY_ID, tagController.getTagById);

/**
 * Get multiple tags by a comma-separated list of IDs.
 * 
 * @name Get Tags By IDs
 * @route {GET} /tags/by-ids/:ids
 */
router.get(ROUTES.TAGS.BY_IDS, tagController.getTagsByIds);

/**
 * Get a tag by name.
 * 
 * @name Get Tag By Name
 * @route {GET} /tags/name/:name
 */
router.get(ROUTES.TAGS.BY_NAME, tagController.getTagByName);

/**
 * Update tag and its attributes (Admin only).
 * Deletes existing attributes and inserts new ones in a transaction-like manner.
 * 
 * @name Update Tag
 * @route {PUT} /tags/:id
 */
router.put('/:id', isAdminLevel1, tagController.updateTag);

/**
 * Delete tag and all related attributes (Admin only).
 * 
 * @name Delete Tag
 * @route {DELETE} /tags/delete/:id
 */
router.delete(ROUTES.TAGS.DELETE, isAdminLevel1, tagController.deleteTag);

export default router;
