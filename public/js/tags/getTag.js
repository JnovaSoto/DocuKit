/**
 * Tag search and retrieval functionality.
 * Handles searching for tags by name or attribute and displaying results.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { generateTable } from '../auto/generateTable.js';
import { dropdown } from '../auto/dropdownAtt.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

/**
 * Initializes the tag search functionality.
 * Sets up form submission handler for tag retrieval using event delegation.
 */
export async function init() {
  logger.tag('GetTag script initialized');

  // Use event delegation on body with 'submit'
  // This is the most robust way to handle dynamic forms without breaking other interactions
  document.body.addEventListener('submit', async (event) => {

    // 1. Check if the submitted form is the #getTag form
    // We use closest() in case the event target is an element inside the form (though submit usually targets the form)
    const formGetTag = event.target.closest('#getTag');

    // If it's not the getTag form, we do nothing and let the event bubble/default happen
    if (!formGetTag) return;

    // If it IS the getTag form, we handle it and prevent default submission
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

    // Check if user is logged in
    if (!await requireLogin()) {
      console.log('⚠️ User not logged in');
      showTemporaryAlert('alert', 'You must log in to search a tag');
      return;
    }

    // Get the tag name from input
    const tagName = input.value.trim();
    logger.network(`Searching for tag: ${tagName}`);
    console.log(`Searching for: ${tagName}`);

    try {
      const table = document.querySelector('.tagTable');

      // Clear previous results
      if (table) {
        table.innerHTML = `
            <th><h3>Tags</h3></th>
            <th><h3>Usability</h3></th>
            <th><h3>Attributes</h3></th>
            <th><h3>Edit</h3></th>
            <th><h3>Delete</h3></th>
        `;
      }

      // Fetch tag(s) by name
      console.log(`Fetching tag by name: ${API.TAGS.BY_NAME(tagName)}`);
      const tagResponse = await fetch(API.TAGS.BY_NAME(tagName));

      if (!await handleResponseError(tagResponse, true)) {
        console.log('✅ Tag found by name');
        // Load tags and attributes
        const rawTag = await tagResponse.json();
        const tags = Array.isArray(rawTag) ? rawTag : [rawTag];

        const attributesResponse = await fetch(API.ATTRIBUTES.BASE);
        if (!attributesResponse.ok) {
          throw new Error('Error fetching attributes list');
        }
        const allAttributes = await attributesResponse.json();

        // For each tag found, create rows and filter attributes by tag id
        if (table) {
          for (const tag of tags) {
            const tagId = Number(tag.id);
            const tagAttrs = allAttributes.filter(att => Number(att.tag) === tagId);
            logger.debug(`Attributes for tag id=${tagId}:`, tagAttrs);

            const row = document.createElement('tr');
            const dropdownRow = document.createElement('tr');
            dropdownRow.classList.add('dropdown-row');
            dropdownRow.style.display = 'none';

            const filled = generateTable(tag, tagAttrs, row, dropdownRow);
            table.appendChild(filled.row);
            table.appendChild(filled.dropdownRow);
          }
          dropdown(table);
        }

        showTemporaryAlert('success', 'Tags retrieved successfully');
        return;
      }

      // If not found by name, search by attribute name (fallback)
      logger.network('Tag not found by name, searching by attribute');
      console.log(`Tag not found, searching by attribute: ${API.ATTRIBUTES.BY_NAME(tagName)}`);
      const attributeResponse = await fetch(API.ATTRIBUTES.BY_NAME(tagName));

      if (await handleResponseError(attributeResponse, true)) {
        console.log('❌ Tag not found by attribute either');
        if (table) table.innerHTML = '';
        if (error) {
          error.style.display = 'block';
        }
        return;
      }

      const attData = await attributeResponse.json();
      const attributesFound = Array.isArray(attData) ? attData : [attData];
      const tagIds = attData.map(attr => attr.tag);

      console.log(`Attributes found, fetching tags by IDs: ${tagIds.join(',')}`);
      const tagsByIdResponse = await fetch(API.TAGS.BY_IDS(tagIds.join(',')));
      const tags = await tagsByIdResponse.json();

      if (await handleResponseError(tagsByIdResponse)) {
        return;
      }

      const tagsArray = Array.isArray(tags) ? tags : [tags];

      if (table) {
        const header = table.querySelector('tr');
        table.innerHTML = '';

        if (header) {
          table.appendChild(header);
        }

        tagsArray.forEach(tag => {
          const row = document.createElement('tr');
          const dropdownRow = document.createElement('tr');
          dropdownRow.classList.add('dropdown-row');
          dropdownRow.style.display = 'none';

          const tagAttrs = attributesFound.filter(att => Number(att.tag) === Number(tag.id));

          const filled = generateTable(tag, tagAttrs, row, dropdownRow);
          table.appendChild(filled.row);
          table.appendChild(filled.dropdownRow);
        });
        dropdown(table);
      }

      showTemporaryAlert('success', 'Tag(s) and attribute(s) found');

    } catch (err) {
      logger.error('Error fetching tag:', err);
      console.error('Error in search:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}