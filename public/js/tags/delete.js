/**
 * Tag deletion functionality.
 * Handles removing HTML tags from the database.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API, SUCCESS_MESSAGES } from '../config/constants.js';
import logger from '../tools/logger.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the tag deletion functionality.
 * Sets up event delegation for delete button clicks.
 */
export async function init() {
    // Prevent duplicate initialization
    if (isInitialized) {
        logger.debug('Delete module already initialized, skipping');
        return;
    }

    logger.delete('Delete tag script initialized');
    isInitialized = true;

    // Handle delete button clicks using event delegation
    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');

        // Click wasn't on a delete button
        if (!deleteBtn) return;

        // Prevent default behavior (page reload)
        e.preventDefault();

        // Take the id provided through the button's data attributes
        const id = deleteBtn.dataset.id;
        const type = deleteBtn.dataset.type;

        // Only handle tag deletions
        if (type && type !== 'tag') return;

        if (!id) {
            logger.warn('Delete button missing data-id attribute');
            return;
        }

        // Confirm deletion
        if (!confirm('Are you sure you want to delete this tag?')) {
            return;
        }

        try {
            // Check if user is logged in
            if (!await requireLogin()) {
                showTemporaryAlert('alert', 'You must log in to delete a tag');
                return;
            }

            logger.network(`Deleting tag with ID: ${id}`);

            const response = await fetch(API.TAGS.DELETE(id), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (await handleResponseError(response)) {
                return;
            }

            // Remove the row from the table
            const row = deleteBtn.closest('tr');
            if (row) {
                row.remove();
            }

            showTemporaryAlert('success', SUCCESS_MESSAGES.TAG_DELETED);
            logger.success(`Tag ${id} deleted successfully`);

        } catch (error) {
            logger.error('Tag deletion failed:', error);
            showTemporaryAlert('alert', 'Something went wrong');
        }
    });
}
