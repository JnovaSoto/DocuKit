/**
 * Tag Edit functionality.
 * Handles editing HTML tags from the database.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API, ROUTES, SUCCESS_MESSAGES } from "../config/constants.js";
import logger from '../tools/logger.js';
import { tagForm } from '../auto/tagForm.js';

logger.edit('Edit module loaded');

// 1. Event Delegation for "Edit" button click (Global)
// This runs once when the module is first loaded.
// We use a named function to avoid duplicates if re-imported, though modules are cached.
document.body.addEventListener("click", async (event) => {
    const editBtn = event.target.closest("#btn-edit-tags");
    if (!editBtn) return;

    // Prevent default if it's a link, though it's a button usually
    event.preventDefault();

    const tagId = editBtn.dataset.id;
    if (tagId) {
        if (!await requireLogin()) {
            showTemporaryAlert('alert', 'You must log in to edit');
            return;
        }

        // Save ID to session storage for the Edit page to use
        sessionStorage.setItem('editTagId', tagId);
        logger.info('Edit button clicked. ID saved:', tagId);

        // Navigate to edit page
        // We can use the global changePage if exposed, or just history/location
        // Since navigation.js handles clicks on #btn-edit-tags too, we might have a race condition.
        // But navigation.js only looks for IDs. 
        // If navigation.js also listens to #btn-edit-tags, it will trigger changePage.
        // So we don't need to do anything here except save the ID!
    }
});

/**
 * Initializes the edition functionality.
 * Called by navigation.js on page load/navigation.
 */
export async function init() {
    logger.edit('Edit init() called');

    // 2. Logic for the Edit Page itself
    // This needs to run every time we navigate to /edit
    if (window.location.pathname === ROUTES.EDIT) {
        await loadEditForm();
    }
}

/**
 * Loads the tag data and populates the edit form.
 * This runs when the user is on the /edit page.
 */
async function loadEditForm() {
    const tagId = sessionStorage.getItem('editTagId');

    if (!tagId) {
        logger.warn('No tag ID found in session storage');
        return;
    }

    try {
        if (!await requireLogin()) return;

        logger.info('Fetching data for tag ID:', tagId);

        // Fetch Tag Data
        const tagResponse = await fetch(API.TAGS.BY_ID(tagId));
        if (await handleResponseError(tagResponse)) return;
        const tagData = await tagResponse.json();

        // Fetch Attributes Data for this Tag
        const attrResponse = await fetch(API.ATTRIBUTES.BY_TAG_ID(tagId));
        let attributesData = [];
        if (attrResponse.ok) {
            attributesData = await attrResponse.json();
        }

        const data = {
            tag: tagData,
            attributes: attributesData
        };

        const mainForm = document.getElementById('edit-form');
        if (!mainForm) {
            logger.error('Edit form container not found');
            return;
        }

        // Generate the form element using tagForm
        const newFormElement = tagForm(data);

        // Replace the existing form with the new one to avoid nesting
        mainForm.replaceWith(newFormElement);

        // Attach submit handler to the NEW form element
        setupSubmitHandler(newFormElement, tagId);

    } catch (error) {
        logger.error('Error loading edit form:', error);
        showTemporaryAlert('alert', 'Failed to load tag data');
    }
}

/**
 * Sets up the submit handler for the form
 */
function setupSubmitHandler(formElement, tagId) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formElement);
        const rawData = Object.fromEntries(formData.entries());

        // Extract basic tag info
        const updateBody = {
            tagName: rawData.name,
            usability: rawData.utility,
            attributes: []
        };

        // Extract dynamic attributes
        Object.keys(rawData).forEach(key => {
            if (key.startsWith('attributeName_')) {
                const attrId = key.split('_')[1];
                const infoKey = `attributeInfo_${attrId}`;

                // Only add if name is present
                if (rawData[key]) {
                    updateBody.attributes.push({
                        id: attrId,
                        attribute: rawData[key],
                        info: rawData[infoKey] || ''
                    });
                }
            }
        });

        logger.network('Sending update for tag:', updateBody);

        try {
            const response = await fetch(API.TAGS.UPDATE(tagId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateBody)
            });

            if (await handleResponseError(response)) return;

            showTemporaryAlert('success', SUCCESS_MESSAGES.TAG_UPDATED);

            // Cleanup and redirect
            sessionStorage.removeItem('editTagId');
            setTimeout(() => {
                // Use history API if possible, or window.location
                window.location.href = ROUTES.HOME;
            }, 1000);

        } catch (error) {
            logger.error('Update failed:', error);
            showTemporaryAlert('alert', 'Failed to update tag');
        }
    });
}
