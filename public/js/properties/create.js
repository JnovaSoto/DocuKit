/**
 * Property creation page functionality.
 * Handles creating new CSS properties with their attributes.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API } from '../config/constants.js';
import logger from '../tools/logger.js';

import { generateAttributeBlock } from '../auto/attributeBlock.js';

let isInitialized = false;

export function init() {
    if (isInitialized) {
        logger.debug('Create property module already initialized, skipping');
        return;
    }

    logger.create('Create property script initialized');
    isInitialized = true;

    const attributesContainer = document.getElementById('attributesContainer');
    const addAttributeBtn = document.getElementById('addAttributeBtn');
    const form = document.getElementById('myForm');

    if (!form || !attributesContainer || !addAttributeBtn) {
        logger.warn('Create form elements not found');
        isInitialized = false;
        return;
    }

    // Update UI for Properties
    updateLabels();

    // Add attribute block dynamically
    addAttributeBtn.addEventListener('click', () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = generateAttributeBlock('property', true);
        const newAttribute = tempDiv.firstElementChild;

        attributesContainer.appendChild(newAttribute);

        newAttribute.querySelector('.removeBtn').addEventListener('click', () => {
            newAttribute.remove();
        });
    });

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!await requireLogin()) {
            showTemporaryAlert('alert', 'You must log in to create a property');
            return;
        }

        // Map existing IDs (tagName) to Property fields
        const propertyName = document.getElementById('tagName').value;
        const usability = document.getElementById('usability').value;
        const content = document.getElementById('content').value;

        const attributeNames = Array.from(document.getElementsByName('attributeName[]')).map(input => input.value);
        const attributeInfos = Array.from(document.getElementsByName('attributeInfo[]')).map(input => input.value);

        const attributes = attributeNames.map((attribute, index) => ({
            attribute,
            info: attributeInfos[index]
        }));

        const propertyBody = { propertyName, usability, content };

        try {
            logger.network('Creating new property');

            const propResponse = await fetch(API.PROPERTIES.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyBody)
            });

            if (await handleResponseError(propResponse)) return;

            const propResult = await propResponse.json();
            const propertyId = propResult.id;

            logger.success(`Property created with ID: ${propertyId}`);

            const attributesBody = { propertyId, attributes };
            const attributesResponse = await fetch(API.PROPERTY_ATTRIBUTES.CREATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attributesBody)
            });

            if (await handleResponseError(attributesResponse)) return;

            showTemporaryAlert('success', 'Property created successfully');
            logger.success('Property and attributes created successfully');

            form.reset();
            // Reset attributes to initial state (Property specific label)
            attributesContainer.innerHTML = generateAttributeBlock('property', false);

        } catch (error) {
            logger.error('Property creation failed:', error);
            showTemporaryAlert('alert', 'Something went wrong');
        }
    });
}

function updateLabels() {
    const nameLabel = document.querySelector('label[for="tagName"]');
    if (nameLabel) nameLabel.innerHTML = 'Property Name <span class="req">*</span>';

    const useLabel = document.querySelector('label[for="usability"]');
    if (useLabel) useLabel.innerHTML = 'Usability of the Property <span class="req">*</span>';

    const attributesContainer = document.getElementById('attributesContainer');
    if (attributesContainer) {
        attributesContainer.innerHTML = generateAttributeBlock('property', false);
    }
}
