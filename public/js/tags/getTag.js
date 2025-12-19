import { showTemporaryAlert } from '../tools/alerts.js';
import { renderTable } from '../auto/renderTable.js';
import { handleResponseError } from '../tools/caseState.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

let isInitialized = false;

export async function init() {
  if (isInitialized) {
    logger.debug('GetTag module already initialized, skipping');
    return;
  }

  logger.tag('GetTag script initialized');
  isInitialized = true;

  document.body.addEventListener('submit', async (event) => {
    const formGetTag = event.target.closest('#getTag');
    if (!formGetTag) return;

    // Do nothing if we are on the CSS properties page (let getProperty.js handle it)
    const currentPath = window.location.pathname;
    if (currentPath === '/css' || currentPath === '/css-properties') {
      return;
    }

    event.preventDefault();

    const error = document.getElementById('error');
    if (error) error.style.display = 'none';

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    const tagName = input.value.trim();

    // Special case: redirect to home if searching for "Tag"
    if (tagName.toLowerCase() === 'tag') {
      logger.navigation('Redirecting to home for "Tag" search');
      const { changePage } = await import('../navigation.js');
      changePage('/home');
      return;
    }

    // Always navigate to home first before performing search
    // Always navigate to home first before performing search
    // const currentPath = window.location.pathname; // Already declared above
    if (currentPath !== '/home' && currentPath !== '/') {
      logger.navigation('Redirecting to home before tag search');
      const { changePage } = await import('../navigation.js');
      await changePage('/home');
      // Wait for navigation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    logger.network(`Searching for tag: ${tagName}`);

    try {
      const table = document.querySelector('.tagTable');
      if (table) table.innerHTML = '';

      // Remove any existing attribute metadata display
      const existingMetadata = document.querySelector('.attribute-metadata');
      if (existingMetadata) {
        existingMetadata.remove();
      }

      // Fetch user favorites (only if logged in)
      let userFavorites = [];
      try {
        const sessionResponse = await fetch(API.USERS.ME);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData.loggedIn) {
            const favResponse = await fetch(API.USERS.FAVORITES);
            if (favResponse.ok) {
              const favData = await favResponse.json();
              userFavorites = favData.favorites || [];
            }
          }
        }
      } catch (err) {
        logger.debug('Could not fetch favorites:', err);
      }

      // Search by tag name
      const tagResponse = await fetch(API.TAGS.BY_NAME(tagName));

      if (!await handleResponseError(tagResponse, true)) {
        const rawTag = await tagResponse.json();
        const tags = Array.isArray(rawTag) ? rawTag : [rawTag];

        const attributesResponse = await fetch(API.ATTRIBUTES.BASE);
        if (!attributesResponse.ok) throw new Error('Error fetching attributes list');

        const allAttributes = await attributesResponse.json();

        // Try to fetch attribute metadata (in case the tag name is also an attribute name)
        try {
          logger.info(`Fetching metadata for possible attribute: ${tagName}`);
          const metadataResponse = await fetch(API.ATTRIBUTE_METADATA.BY_NAME(tagName));
          if (metadataResponse.ok) {
            const metadata = await metadataResponse.json();
            logger.success('Metadata received:', metadata);
            displayAttributeMetadata(metadata);
          } else {
            logger.debug(`No metadata found for: ${tagName}`);
          }
        } catch (err) {
          logger.debug('No metadata available:', err);
        }

        if (table) {
          await renderTable(table, tags, allAttributes, userFavorites);
        }

        showTemporaryAlert('success', 'Tags retrieved successfully');
        return;
      }

      // Fallback: search by attribute name
      logger.network('Tag not found by name, searching by attribute');
      const attributeResponse = await fetch(API.ATTRIBUTES.BY_NAME(tagName));

      if (await handleResponseError(attributeResponse, true)) {
        sessionStorage.setItem('lastSearchTerm', tagName);
        const { changePage } = await import('../navigation.js');
        changePage('/not-found');
        return;
      }

      const attData = await attributeResponse.json();
      const attributesFound = Array.isArray(attData) ? attData : [attData];
      const tagIds = attData.map(attr => attr.tagId);

      const tagsByIdResponse = await fetch(API.TAGS.BY_IDS(tagIds.join(',')));
      const tags = await tagsByIdResponse.json();

      if (await handleResponseError(tagsByIdResponse)) return;

      const tagsArray = Array.isArray(tags) ? tags : [tags];

      // Try to fetch attribute metadata for general description
      try {
        logger.info(`Fetching metadata for attribute: ${tagName}`);
        const metadataResponse = await fetch(API.ATTRIBUTE_METADATA.BY_NAME(tagName));
        logger.info(`Metadata response status: ${metadataResponse.status}`);
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json();
          logger.success('Metadata received:', metadata);
          displayAttributeMetadata(metadata);
        } else {
          logger.warn(`Metadata not found for attribute: ${tagName}, status: ${metadataResponse.status}`);
        }
      } catch (err) {
        logger.error('Error fetching metadata:', err);
      }

      if (table) {
        await renderTable(table, tagsArray, attributesFound, userFavorites);
      }

      showTemporaryAlert('success', 'Tag(s) and attribute(s) found');

    } catch (err) {
      logger.error('Error fetching tag:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}

/**
 * Displays attribute metadata (general description) above the table
 * @param {Object} metadata - Attribute metadata object
 */
function displayAttributeMetadata(metadata) {
  logger.info('Displaying attribute metadata:', metadata);

  // Remove any existing metadata display
  const existingMetadata = document.querySelector('.attribute-metadata');
  if (existingMetadata) {
    existingMetadata.remove();
  }

  // Create metadata display element
  const metadataDiv = document.createElement('div');
  metadataDiv.className = 'attribute-metadata';
  metadataDiv.innerHTML = `
    <div class="metadata-content">
      <h3>Attribute: <strong>${metadata.attributeName}</strong></h3>
      <p>${metadata.generalDescription}</p>
    </div>
  `;

  // Insert before the table
  const table = document.querySelector('.tagTable');
  if (table && table.parentElement) {
    logger.success('Inserting metadata before table');
    table.parentElement.insertBefore(metadataDiv, table);
  } else {
    logger.error('Could not find table or table parent');
  }
}