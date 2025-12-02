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

    event.preventDefault();

    const error = document.getElementById('error');
    if (error) error.style.display = 'none';

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    const tagName = input.value.trim();
    logger.network(`Searching for tag: ${tagName}`);

    try {
      const table = document.querySelector('.tagTable');
      if (table) table.innerHTML = '';

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
        if (table) table.innerHTML = '';
        if (error) error.style.display = 'block';
        return;
      }

      const attData = await attributeResponse.json();
      const attributesFound = Array.isArray(attData) ? attData : [attData];
      const tagIds = attData.map(attr => attr.tagId);

      const tagsByIdResponse = await fetch(API.TAGS.BY_IDS(tagIds.join(',')));
      const tags = await tagsByIdResponse.json();

      if (await handleResponseError(tagsByIdResponse)) return;

      const tagsArray = Array.isArray(tags) ? tags : [tags];

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