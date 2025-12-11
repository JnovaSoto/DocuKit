/**
 * Property deletion functionality.
 * Handles removing CSS properties from the database.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API } from '../config/constants.js';
import logger from '../tools/logger.js';

let isInitialized = false;

export async function init() {
    if (isInitialized) {
        logger.debug('Property delete module already initialized, skipping');
        return;
    }

    logger.delete('Delete property script initialized');
    isInitialized = true;

    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');

        if (!deleteBtn) return;

        const type = deleteBtn.dataset.type;
        if (type !== 'property') return;

        e.preventDefault();

        const id = deleteBtn.dataset.id;
        if (!id) {
            logger.warn('Delete button missing data-id attribute');
            return;
        }

        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            if (!await requireLogin()) {
                showTemporaryAlert('alert', 'You must log in to delete a property');
                return;
            }

            logger.network(`Deleting property with ID: ${id}`);

            const response = await fetch(API.PROPERTIES.DELETE(id), {
                method: 'DELETE',
                credentials: 'include'
            });

            if (await handleResponseError(response)) {
                return;
            }

            const row = deleteBtn.closest('tr');
            if (row) {
                row.remove();
            }

            showTemporaryAlert('success', 'Property deleted successfully');
            logger.success(`Property ${id} deleted successfully`);

        } catch (error) {
            logger.error('Property deletion failed:', error);
            showTemporaryAlert('alert', 'Something went wrong');
        }
    });
}
