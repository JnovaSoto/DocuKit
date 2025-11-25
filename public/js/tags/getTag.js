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

/**
 * Initializes the tag search functionality.
 * Sets up form submission handler for tag retrieval.
 */
export async function init() {
  logger.tag('GetTag script initialized');

  const formGetTag = document.getElementById('getTag');
  if (!formGetTag) {
    logger.warn('GetTag form not found');
    return;
  }

  formGetTag.addEventListener('submit', async (event) => {
    event.preventDefault();

    const error = document.getElementById('error');
    if (error) {
      error.style.display = 'none';
    }

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    // Check if user is logged in
    if (!await requireLogin()) {
      showTemporaryAlert('alert', 'You must log in to search a tag');
      return;
    }

    // Get the tag name from input
    const tagName = input.value.trim();
    logger.network(`Searching for tag: ${tagName}`);

    try {
      const table = document.querySelector('.tagTable');

      // Clear previous results
      table.innerHTML = `
        <th><h3>Tags</h3></th>
        <th><h3>Usability</h3></th>
        <th><h3>Attributes</h3></th>
        <th><h3>Edit</h3></th>
        <th><h3>Delete</h3></th>
      `;

      // Fetch tag(s) by name
      const tagResponse = await fetch(`/tags/tagName/${encodeURIComponent(tagName)}`);

      if (!handleResponseError(tagResponse, true)) {
        // Load tags and attributes
        const rawTag = await tagResponse.json();
        const tags = Array.isArray(rawTag) ? rawTag : [rawTag];

        const attributesResponse = await fetch('/attributes/attributes');
        if (!attributesResponse.ok) {
          throw new Error('Error fetching attributes list');
        }
        const allAttributes = await attributesResponse.json();

        // For each tag found, create rows and filter attributes by tag id
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

        showTemporaryAlert('success', 'Tags retrieved successfully');
        return;
      }

      // If not found by name, search by attribute name (fallback)
      logger.network('Tag not found by name, searching by attribute');
      const attributeResponse = await fetch(`/attributes/attribute/attributeName/${encodeURIComponent(tagName)}`);

      if (handleResponseError(attributeResponse, true)) {
        document.querySelector('.tagTable').innerHTML = '';
        if (error) {
          error.style.display = 'block';
        }
        return;
      }

      const attData = await attributeResponse.json();
      const attributesFound = Array.isArray(attData) ? attData : [attData];
      const tagIds = attData.map(attr => attr.tag);

      const tagsByIdResponse = await fetch(`/tags/idTag/${tagIds.join(',')}`);
      const tags = await tagsByIdResponse.json();

      if (handleResponseError(tagsByIdResponse)) {
        return;
      }

      const tagsArray = Array.isArray(tags) ? tags : [tags];
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
      showTemporaryAlert('success', 'Tag(s) and attribute(s) found');

    } catch (err) {
      logger.error('Error fetching tag:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}