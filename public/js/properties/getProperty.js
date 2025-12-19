
import { showTemporaryAlert } from '../tools/alerts.js';
import { renderTable } from '../auto/renderTable.js';
import { handleResponseError } from '../tools/caseState.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

let isInitialized = false;

export async function init() {
    if (isInitialized) {
        logger.debug('GetProperty script already initialized, skipping');
        return;
    }

    logger.tag('GetProperty script initialized');
    isInitialized = true;

    document.body.addEventListener('submit', async (event) => {
        const formSearch = event.target.closest('#getTag');
        if (!formSearch) return;

        const currentPath = window.location.pathname;
        if (currentPath !== '/css' && currentPath !== '/css-properties') {
            return;
        }

        event.preventDefault();

        const error = document.getElementById('error');
        if (error) error.style.display = 'none';

        const input = formSearch.querySelector('input[type="search"]');
        if (!input || !input.value.trim()) {
            showTemporaryAlert('alert', 'Please enter a property name to search');
            return;
        }

        const propertyName = input.value.trim();
        logger.network(`Searching for property: ${propertyName}`);

        try {
            const table = document.querySelector('.propertyTable');
            if (table) table.innerHTML = '';

            // Remove any existing attribute metadata display
            // Reuse the same class .attribute-metadata or create a new one?
            // getTag uses .attribute-metadata. We can reuse it.
            const existingMetadata = document.querySelector('.attribute-metadata');
            if (existingMetadata) {
                existingMetadata.remove();
            }

            // Fetch user favorites (CSS)
            let userFavorites = [];
            try {
                const sessionResponse = await fetch(API.USERS.ME);
                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json();
                    if (sessionData.loggedIn) {
                        const favResponse = await fetch(API.USERS.FAVORITES_CSS);
                        if (favResponse.ok) {
                            const favData = await favResponse.json();
                            userFavorites = favData.favorites || [];
                        }
                    }
                }
            } catch (err) {
                logger.debug('Could not fetch CSS favorites:', err);
            }

            // Search by property name
            const propertyResponse = await fetch(API.PROPERTIES.BY_NAME(propertyName));

            if (!await handleResponseError(propertyResponse, true)) {
                const rawProperty = await propertyResponse.json();
                const properties = Array.isArray(rawProperty) ? rawProperty : [rawProperty];

                const attributesResponse = await fetch(API.PROPERTY_ATTRIBUTES.BASE);
                if (!attributesResponse.ok) throw new Error('Error fetching property attributes list');

                const allAttributes = await attributesResponse.json();

                if (table) {
                    await renderTable(table, properties, allAttributes, userFavorites);
                }

                showTemporaryAlert('success', 'Properties retrieved successfully');
                return;
            }

            // Fallback: search by attribute name (property attribute)
            logger.network('Property not found by name, searching by attribute');
            const attributeResponse = await fetch(API.PROPERTY_ATTRIBUTES.BY_NAME(propertyName));

            if (await handleResponseError(attributeResponse, true)) {
                sessionStorage.setItem('lastSearchTerm', propertyName);
                const { changePage } = await import('../navigation.js');
                changePage('/not-found');
                return;
            }

            const attData = await attributeResponse.json();
            const attributesFound = Array.isArray(attData) ? attData : [attData];
            const propertyIds = attData.map(attr => attr.propertyId);

            const propertiesByIdResponse = await fetch(API.PROPERTIES.BY_IDS(propertyIds.join(',')));
            const properties = await propertiesByIdResponse.json();

            if (await handleResponseError(propertiesByIdResponse)) return;

            const propertiesArray = Array.isArray(properties) ? properties : [properties];

            if (table) {
                await renderTable(table, propertiesArray, attributesFound, userFavorites);
            }

            showTemporaryAlert('success', 'Property(s) and attribute(s) found');

        } catch (err) {
            logger.error('Error fetching property:', err);
            showTemporaryAlert('alert', 'An unexpected error occurred');
        }
    });
}
