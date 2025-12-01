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

// Flag to prevent duplicate initialization
let isEditButtonListenerAttached = false;
let isInitialized = false;

/**
 * Initializes the edition functionality.
 * Called by navigation.js on page load/navigation.
 */
export async function init() {
    logger.edit('Edit init() called');

    // 1. Attach the global "Edit" button listener ONCE
    if (!isEditButtonListenerAttached) {
        logger.edit('Attaching edit button listener');
        isEditButtonListenerAttached = true;

        document.body.addEventListener("click", async (event) => {
            const editBtn = event.target.closest("#btn-edit-tags");
            if (!editBtn) return;

            // Prevent default behavior (page reload)
            event.preventDefault();

            // Stop event propagation to prevent other handlers from firing
            event.stopPropagation();

            const tagId = editBtn.dataset.id;
            if (!tagId) {
                logger.warn('Edit button missing data-id attribute');
                return;
            }

            // Check login first
            if (!await requireLogin()) {
                showTemporaryAlert('alert', 'You must log in to edit');
                return;
            }

            // Save ID to session storage for the Edit page to use
            sessionStorage.setItem('editTagId', tagId);
            logger.info('Edit button clicked. ID saved:', tagId);

            // Navigate to edit page using history API (SPA navigation)
            history.pushState(null, null, ROUTES.EDIT);

            // Manually fetch and load the edit page content
            try {
                const response = await fetch(ROUTES.EDIT);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('#app');

                if (newContent) {
                    document.querySelector('#app').innerHTML = newContent.innerHTML;
                    // Load the edit form with the saved tag ID
                    await loadEditForm();
                } else {
                    logger.error('Could not find #app in edit page response');
                }
            } catch (error) {
                logger.error('Error navigating to edit page:', error);
                showTemporaryAlert('alert', 'Failed to load edit page');
            }
        });
    }

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
        const tagResponse = await fetch(API.TAGS.BY_ID(tagId), {
            credentials: 'include'
        });
        if (await handleResponseError(tagResponse)) return;
        const tagData = await tagResponse.json();

        // Fetch Attributes Data for this Tag
        const attrResponse = await fetch(API.ATTRIBUTES.BY_TAG_ID(tagId), {
            credentials: 'include'
        });
        let attributesData = [];
        if (attrResponse.ok) {
            attributesData = await attrResponse.json();
        }

        const data = {
            tag: tagData,
            attributes: attributesData
        };

        const mainForm = document.getElementById('form-container');
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
                credentials: 'include', // Important: Send session cookie
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
