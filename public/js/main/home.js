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

  /**
   * Fetches user's favorite tags.
   * @returns {Promise<Array>} Array of favorite tag IDs
   */
  async function getUserFavorites() {
    try {
      const response = await fetch(API.USERS.FAVORITES, {
        credentials: 'include'
      });
      if (!response.ok) {
        // User not logged in or error - return empty array
        return [];
      }
      const data = await response.json();
      return data.favorites || [];
    } catch (error) {
      logger.warn('Could not fetch favorites:', error);
      return [];
    }
  }

  try {
    // Fetch data
    const tags = await getTags();
    const attributes = await getAttributes();
    const userFavorites = await getUserFavorites();

    logger.success(`Loaded ${tags.length} tags and ${attributes.length} attributes`);
    logger.info(`User favorites: ${userFavorites}`);

    const table = document.querySelector('.tagTable');
    renderTable(table, tags, attributes, userFavorites);

    // Check for pending search from fuzzy search overlay
    const lastTag = sessionStorage.getItem('lastTag');
    if (lastTag) {
      sessionStorage.removeItem('lastTag');
      const searchForm = document.getElementById('getTag');
      const searchInput = searchForm?.querySelector('input[type="search"]');
      if (searchForm && searchInput) {
        searchInput.value = lastTag;
        // Trigger the search logic
        const event = new Event('submit', { bubbles: true, cancelable: true });
        searchForm.dispatchEvent(event);
      }
    }

  } catch (error) {
    logger.error('Error loading tags:', error);
  }
}

