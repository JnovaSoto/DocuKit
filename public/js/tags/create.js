/**
 * Tag creation page functionality.
 * Handles creating new HTML tags with their attributes.
 */

import { showTemporaryAlert } from '../tools/alerts.js';
import { handleResponseError } from '../tools/caseState.js';
import { requireLogin } from '../tools/session.js';
import { API, SUCCESS_MESSAGES } from '../config/constants.js';
import logger from '../tools/logger.js';
import { generateAttributeBlock } from '../auto/attributeBlock.js';

// Flag to prevent duplicate initialization
let isInitialized = false;

/**
 * Initializes the tag creation page.
 * Sets up dynamic attribute addition and form submission.
 */
export function init() {
  // Prevent duplicate initialization
  if (isInitialized) {
    logger.debug('Create module already initialized, skipping');
    return;
  }

  logger.create('Create tag script initialized');
  isInitialized = true;

  const attributesContainer = document.getElementById('attributesContainer');
  const addAttributeBtn = document.getElementById('addAttributeBtn');
  const form = document.getElementById('myForm');

  if (!form || !attributesContainer || !addAttributeBtn) {
    logger.warn('Create form elements not found');
    isInitialized = false; // Reset flag if elements not found
    return;
  }

  // Ensure labels are for Tags
  updateLabels();

  // Add attribute block dynamically
  addAttributeBtn.addEventListener('click', () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateAttributeBlock('tag', true);
    const newAttribute = tempDiv.firstElementChild;

    attributesContainer.appendChild(newAttribute);

    newAttribute.querySelector('.removeBtn').addEventListener('click', () => {
      newAttribute.remove();
    });
  });

  // Handle form submission
  form.addEventListener('submit', async (event) => {
    // Stop page reload
    event.preventDefault();

    // Check if user is logged in
    if (!await requireLogin()) {
      showTemporaryAlert('alert', 'You must log in to create a tag');
      return;
    }

    // Get latest form values
    const tagName = document.getElementById('tagName').value;
    const usability = document.getElementById('usability').value;
    const content = document.getElementById('content').value;

    // Get all attributes from inputs
    const attributeNames = Array.from(document.getElementsByName('attributeName[]')).map(input => input.value);
    const attributeInfos = Array.from(document.getElementsByName('attributeInfo[]')).map(input => input.value);

    const attributes = attributeNames.map((attribute, index) => ({
      attribute,
      info: attributeInfos[index]
    }));

    // Make the body for the database request for the tag
    const tagBody = { tagName, usability, content };

    try {
      logger.network('Creating new tag');

      // Create the tag first
      const tagResponse = await fetch(API.TAGS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tagBody)
      });

      if (await handleResponseError(tagResponse)) {
        return;
      }

      // Backend gives us the id of the last tag created
      const tagResult = await tagResponse.json();
      const tagId = tagResult.id;

      logger.success(`Tag created with ID: ${tagId}`);

      // Send all attributes linked to that tag
      const attributesBody = { tagId, attributes };
      const attributesResponse = await fetch(API.ATTRIBUTES.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(attributesBody)
      });

      if (await handleResponseError(attributesResponse)) {
        return;
      }

      showTemporaryAlert('success', SUCCESS_MESSAGES.TAG_CREATED);
      logger.success('Tag and attributes created successfully');

      // Reset form for next input
      form.reset();
      attributesContainer.innerHTML = generateAttributeBlock('tag', false);

    } catch (error) {
      logger.error('Tag creation failed:', error);
      showTemporaryAlert('alert', 'Something went wrong');
    }
  });
}

function updateLabels() {
  const nameLabel = document.querySelector('label[for="tagName"]');
  if (nameLabel) nameLabel.innerHTML = 'Tag Name <span class="req">*</span>';

  const useLabel = document.querySelector('label[for="usability"]');
  if (useLabel) useLabel.innerHTML = 'Usability of the Tag <span class="req">*</span>';

  const attributesContainer = document.getElementById('attributesContainer');
  if (attributesContainer) {
    // Reset to initial single block without remove button
    attributesContainer.innerHTML = generateAttributeBlock('tag', false);
  }
}
