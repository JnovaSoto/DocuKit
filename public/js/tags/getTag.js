/**
 * Tag search and retrieval functionality.
 * Handles searching for tags by name or attribute and displaying results.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { renderTable } from '../auto/renderTable.js';
import { handleResponseError } from '../tools/caseState.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the tag search functionality.
 * Sets up form submission handler for tag retrieval using event delegation.
 */
export async function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug('GetTag module already initialized, skipping');
    return;
  }

  logger.tag('GetTag script initialized');
  isInitialized = true;

  // Use event delegation on body with 'submit'
  document.body.addEventListener('submit', async (event) => {

    const formGetTag = event.target.closest('#getTag');
    if (!formGetTag) return;

    event.preventDefault();
    console.log('✅ getTag form submitted');

    const error = document.getElementById('error');
    if (error) {
      error.style.display = 'none';
    }

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      console.log('⚠️ Input empty');
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    const tagName = input.value.trim();
    logger.network(`Searching for tag: ${tagName}`);
    console.log(`Searching for: ${tagName}`);

    try {
      const table = document.querySelector('.tagTable');

      // Clear previous results (optional, renderTable handles it, but good for feedback)
      if (table) {
        // We let renderTable handle the header
        table.innerHTML = '';
      }

      // Fetch user favorites once for both search paths
      let userFavorites = [];
      try {
        const favResponse = await fetch(API.USERS.FAVORITES);
        if (favResponse.ok) {
          const favData = await favResponse.json();
          userFavorites = favData.favorites || [];
        }
      } catch (err) {
        console.log('Could not fetch favorites:', err);
      }

      // 1. Search by Tag Name
      console.log(`Fetching tag by name: ${API.TAGS.BY_NAME(tagName)}`);
      const tagResponse = await fetch(API.TAGS.BY_NAME(tagName));

      if (!await handleResponseError(tagResponse, true)) {
        console.log('✅ Tag found by name');
        const rawTag = await tagResponse.json();
        const tags = Array.isArray(rawTag) ? rawTag : [rawTag];

        const attributesResponse = await fetch(API.ATTRIBUTES.BASE);

        if (!attributesResponse.ok) {
          throw new Error('Error fetching attributes list');
        }
        const allAttributes = await attributesResponse.json();

        if (table) {
          await renderTable(table, tags, allAttributes, userFavorites);
        }

        showTemporaryAlert('success', 'Tags retrieved successfully');
        return;
      }

      // 2. Fallback: Search by Attribute Name
      logger.network('Tag not found by name, searching by attribute');
      console.log(`Tag not found, searching by attribute: ${API.ATTRIBUTES.BY_NAME(tagName)}`);
      const attributeResponse = await fetch(API.ATTRIBUTES.BY_NAME(tagName));

      if (await handleResponseError(attributeResponse, true)) {
        console.log('❌ Tag not found by attribute either');
        if (table) table.innerHTML = '';
        if (error) error.style.display = 'block';
        return;
      }

      const attData = await attributeResponse.json();
      const attributesFound = Array.isArray(attData) ? attData : [attData];
      const tagIds = attData.map(attr => attr.tagId);

      console.log(`Attributes found, fetching tags by IDs: ${tagIds.join(',')}`);
      const tagsByIdResponse = await fetch(API.TAGS.BY_IDS(tagIds.join(',')));
      const tags = await tagsByIdResponse.json();

      if (await handleResponseError(tagsByIdResponse)) {
        return;
      }

      const tagsArray = Array.isArray(tags) ? tags : [tags];

      if (table) {
        await renderTable(table, tagsArray, attributesFound, userFavorites);
      }

      showTemporaryAlert('success', 'Tag(s) and attribute(s) found');

    } catch (err) {
      logger.error('Error fetching tag:', err);
      console.error('Error in search:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}