/**
 * Home page functionality.
 * Loads and displays all HTML tags with their attributes in a table.
 */

import { renderTable } from '../auto/renderTable.js';
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
    renderTable(table, tags, attributes);

  } catch (error) {
    logger.error('Error loading tags:', error);
  }
}
