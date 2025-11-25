/**
 * SPA (Single Page Application) navigation handler.
 * Manages client-side routing, page transitions, and dynamic content loading.
 */

import logger from './tools/logger.js';
import { API, ROUTES } from './config/constants.js';

/**
 * Initializes the SPA navigation system on page load.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderAndFooter();
  initNavigation();       // global SPA navigation buttons
  executePageScript();    // page-specific scripts
  handlePopState();       // handle back/forward
});

/**
 * Loads header and footer partials once on initial page load.
 * @returns {Promise<void>} A promise that resolves when the header and footer are loaded.
 * @async
 */
async function loadHeaderAndFooter() {
  const header = document.querySelector('#header');
  const footer = document.querySelector('#footer');

  if (header && header.innerHTML.trim() === '') {
    try {
      const response = await fetch(API.PARTIALS.HEADER);
      const html = await response.text();

      // Remove any meta tags from the header content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const metaTags = tempDiv.querySelectorAll('meta');
      metaTags.forEach(meta => meta.remove());

      header.innerHTML = tempDiv.innerHTML;

      // Initialize header scripts AFTER insertion
      import('/js/main/header.js').then(mod => mod.init && mod.init());
      import('/js/tags/getTag.js').then(mod => mod.init && mod.init());

    } catch (err) {
      logger.error('Error loading header:', err);
    }
  }

  if (footer && footer.innerHTML.trim() === '') {
    try {
      const response = await fetch(API.PARTIALS.FOOTER);
      const html = await response.text();

      // Remove any meta tags from the footer content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const metaTags = tempDiv.querySelectorAll('meta');
      metaTags.forEach(meta => meta.remove());

      footer.innerHTML = tempDiv.innerHTML;
    } catch (err) {
      logger.error('Error loading footer:', err);
    }
  }
}

/**
 * Sets up global SPA navigation using event delegation.
 * Listens for clicks on navigation buttons and triggers page changes.
 * @fires {changePage} changePage
 */
function initNavigation() {
  // Event delegation: any click inside body
  document.body.addEventListener('click', e => {
    if (e.target.matches('#btn-go-create')) changePage(ROUTES.CREATE);
    if (e.target.matches('#btn-go-home')) changePage(ROUTES.HOME);
    if (e.target.matches('#btn-sign-up')) changePage(ROUTES.SIGNUP);
    if (e.target.matches('#btn-log-in')) changePage(ROUTES.LOGIN);
    if (e.target.matches('#btn-go-profile')) changePage(ROUTES.PROFILE);
    if (e.target.matches('#btn-edit-tags')) changePage(ROUTES.EDIT);
  });
}

/**
 * Changes the current page without full page reload.
 * Updates browser history and loads new content dynamically.
 * @async
 * @param {string} path - The path to navigate to
 * @fires {changePage} changePage
 */
function changePage(path) {
  logger.navigation(`Navigating to: ${path}`);
  history.pushState(null, null, path);

  fetch(path)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#app').innerHTML;

      // Remove any meta tags that might have been included in the content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      const metaTags = tempDiv.querySelectorAll('meta');
      metaTags.forEach(meta => meta.remove());

      document.querySelector('#app').innerHTML = tempDiv.innerHTML;

      // Run page-specific scripts only
      executePageScript();
    })
    .catch(err => logger.error('Page navigation error:', err));
}

/**
 * Executes page-specific JavaScript based on the current route.
 * Dynamically imports and initializes the appropriate module.
 * @async
 */
function executePageScript() {
  const path = window.location.pathname;
  logger.debug(`Executing scripts for path: ${path}`);

  switch (path) {
    case '/':
    case ROUTES.HOME:
      import('/js/main/home.js').then(mod => mod.init && mod.init());
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      import('/js/tags/delete.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.CREATE:
      import('/js/tags/create.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.EDIT:
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.SIGNUP:
      import('/js/user/signUp.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.LOGIN:
      import('/js/user/logIn.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.PROFILE:
      import('/js/user/profile.js').then(mod => mod.init && mod.init());
      break;
  }
}

/**
 * Handles browser back/forward button navigation.
 * Ensures page content updates when user uses browser navigation.
 * @fires {changePage} changePage
 */
function handlePopState() {
  window.addEventListener('popstate', () => {
    logger.navigation('Browser back/forward button used');
    changePage(location.pathname);
  });
}
