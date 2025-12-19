/**
 * Property Edit functionality.
 * Handles editing CSS properties from the database.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API, ROUTES } from "../config/constants.js";
import logger from '../tools/logger.js';
import { propertyForm } from '../auto/propertyForm.js';
import { changePage } from '../navigation.js';

logger.edit('Property Edit module loaded');

let isEditButtonListenerAttached = false;

export async function init() {
    logger.edit('Property Edit init() called');

    if (!isEditButtonListenerAttached) {
        logger.edit('Attaching property edit button listener');
        isEditButtonListenerAttached = true;

        document.body.addEventListener("click", async (event) => {
            const editBtn = event.target.closest(".edit-btn");
            if (!editBtn) return;

            const type = editBtn.dataset.type;
            if (type !== 'property') return;

            event.preventDefault();
            event.stopPropagation();

            const propertyId = editBtn.dataset.id;
            if (!propertyId) {
                logger.warn('Edit button missing data-id attribute');
                return;
            }

            if (!await requireLogin()) {
                showTemporaryAlert('alert', 'You must log in to edit');
                return;
            }

            sessionStorage.setItem('editPropertyId', propertyId);
            logger.info('Property Edit button clicked. ID saved:', propertyId);

            // Navigate to edit page using SPA navigation
            changePage(ROUTES.EDIT).then(() => {
                loadEditForm();
            });
        });
    }

    if (window.location.pathname === ROUTES.EDIT) {
        await loadEditForm();
    }
}

async function loadEditForm() {
    const propertyId = sessionStorage.getItem('editPropertyId');

    // If no property ID, return (maybe tag edit is active)
    if (!propertyId) {
        return;
    }

    try {
        if (!await requireLogin()) return;

        logger.info('Fetching data for property ID:', propertyId);

        const propResponse = await fetch(API.PROPERTIES.BY_ID(propertyId), {
            credentials: 'include'
        });
        if (await handleResponseError(propResponse)) return;
        const propData = await propResponse.json();

        const attrResponse = await fetch(API.PROPERTY_ATTRIBUTES.BY_PROPERTY_ID(propertyId), {
            credentials: 'include'
        });
        let attributesData = [];
        if (attrResponse.ok) {
            attributesData = await attrResponse.json();
        }

        const data = {
            property: propData,
            attributes: attributesData
        };

        const mainForm = document.getElementById('form-container');
        if (!mainForm) {
            logger.error('Edit form container not found');
            return;
        }

        const newFormElement = propertyForm(data);
        mainForm.replaceWith(newFormElement);

        setupSubmitHandler(newFormElement, propertyId);

    } catch (error) {
        logger.error('Error loading property edit form:', error);
        showTemporaryAlert('alert', 'Failed to load property data');
    }
}

function setupSubmitHandler(formElement, propertyId) {
    formElement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formElement);
        const rawData = Object.fromEntries(formData.entries());

        const updateBody = {
            propertyName: rawData.name,
            usability: rawData.utility,
            attributes: []
        };

        Object.keys(rawData).forEach(key => {
            if (key.startsWith('attributeName_')) {
                const attrId = key.split('_')[1];
                const infoKey = `attributeInfo_${attrId}`;

                if (rawData[key]) {
                    updateBody.attributes.push({
                        id: attrId,
                        attribute: rawData[key],
                        info: rawData[infoKey] || ''
                    });
                }
            }
        });

        logger.network('Sending update for property:', updateBody);

        try {
            const response = await fetch(API.PROPERTIES.UPDATE(propertyId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updateBody)
            });

            if (await handleResponseError(response)) return;

            showTemporaryAlert('success', 'Property updated successfully');

            sessionStorage.removeItem('editPropertyId');
            setTimeout(() => {
                changePage(ROUTES.CSS);
            }, 1000);

        } catch (error) {
            logger.error('Update failed:', error);
            showTemporaryAlert('alert', 'Failed to update property');
        }
    });
}
