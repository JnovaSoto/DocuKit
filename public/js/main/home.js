/**
 * Home page functionality.
 * Loads and displays all HTML tags with their attributes in a table.
 */

import { generateTable } from '../auto/generateTable.js';
import { dropdown } from '../auto/dropdownAtt.js';
import logger from '../tools/logger.js';
import { API } from '../config/constants.js';

/**
 * Initializes the home page.
 * Fetches tags and attributes, then populates the table.
 */
export async function init() {
  logger.info('Home script initialized');

  /**
   * Fetches all tags from the server.
   * @returns {Promise<Array>} Array of tag objects
   */
  async function getTags() {
    const response = await fetch(API.TAGS.BASE);
    if (!response.ok) {
      throw new Error('Error fetching tags');
    }
    return await response.json();
  }

  /**
   * Fetches all attributes from the server.
   * @returns {Promise<Array>} Array of attribute objects
   */
  async function getAttributes() {
    const response = await fetch(API.ATTRIBUTES.BASE);
    if (!response.ok) {
      throw new Error('Error fetching attributes');
    }
    return await response.json();
  }

  try {
    // Fetch data
    const tags = await getTags();
    const attributes = await getAttributes();

    logger.success(`Loaded ${tags.length} tags and ${attributes.length} attributes`);

    const table = document.querySelector('.tagTable');
    const header = table.querySelector('tr');
    table.innerHTML = '';

    if (header) {
      table.appendChild(header);
    }

    // Generate table rows for each tag
    tags.forEach(tag => {
      const row = document.createElement('tr');
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none';

      // Filter attributes for this tag
      const tagAttributes = attributes.filter(att => Number(att.tag) === Number(tag.id));

      const filledRows = generateTable(tag, tagAttributes, row, dropdownRow);
      table.appendChild(filledRows.row);
      table.appendChild(filledRows.dropdownRow);
    });

    // Initialize dropdown functionality
    dropdown(table);

  } catch (error) {
    logger.error('Error loading tags:', error);
  }
}