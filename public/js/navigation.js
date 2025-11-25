/**
 * SPA (Single Page Application) navigation handler.
 * Manages client-side routing, page transitions, and dynamic content loading.
 */

import logger from './tools/logger.js';

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
 */
async function loadHeaderAndFooter() {
  const header = document.querySelector('#header');
  const footer = document.querySelector('#footer');

  if (header && header.innerHTML.trim() === '') {
    try {
      const response = await fetch('/partials/header');
      const html = await response.text();
      header.innerHTML = html;

      // Initialize header scripts AFTER insertion
      import('/js/main/header.js').then(mod => mod.init && mod.init());
      import('/js/tags/getTag.js').then(mod => mod.init && mod.init());

    } catch (err) {
      logger.error('Error loading header:', err);
    }
  }

  if (footer && footer.innerHTML.trim() === '') {
    try {
      const response = await fetch('/partials/footer');
      const html = await response.text();
      footer.innerHTML = html;
    } catch (err) {
      logger.error('Error loading footer:', err);
    }
  }
}

/**
 * Sets up global SPA navigation using event delegation.
 * Listens for clicks on navigation buttons and triggers page changes.
 */
function initNavigation() {
  // Event delegation: any click inside body
  document.body.addEventListener('click', e => {
    if (e.target.matches('#btn-go-create')) changePage('/create');
    if (e.target.matches('#btn-go-home')) changePage('/home');
    if (e.target.matches('#btn-sign-up')) changePage('/signUp');
    if (e.target.matches('#btn-log-in')) changePage('/logIn');
    if (e.target.matches('#btn-go-profile')) changePage('/profile');
    if (e.target.matches('#btn-edit-tags')) changePage('/edit');
  });
}

/**
 * Changes the current page without full page reload.
 * Updates browser history and loads new content dynamically.
 * 
 * @param {string} path - The path to navigate to
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
      document.querySelector('#app').innerHTML = newContent;

      // Run page-specific scripts only
      executePageScript();
    })
    .catch(err => logger.error('Page navigation error:', err));
}

/**
 * Executes page-specific JavaScript based on the current route.
 * Dynamically imports and initializes the appropriate module.
 */
function executePageScript() {
  const path = window.location.pathname;
  logger.debug(`Executing scripts for path: ${path}`);

  switch (path) {
    case '/':
    case '/home':
      import('/js/main/home.js').then(mod => mod.init && mod.init());
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      import('/js/tags/delete.js').then(mod => mod.init && mod.init());
      break;
    case '/create':
      import('/js/tags/create.js').then(mod => mod.init && mod.init());
      break;
    case '/edit':
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      break;
    case '/signUp':
      import('/js/user/signUp.js').then(mod => mod.init && mod.init());
      break;
    case '/logIn':
      import('/js/user/logIn.js').then(mod => mod.init && mod.init());
      break;
    case '/profile':
      import('/js/user/profile.js').then(mod => mod.init && mod.init());
      break;
  }
}

/**
 * Handles browser back/forward button navigation.
 * Ensures page content updates when user uses browser navigation.
 */
function handlePopState() {
  window.addEventListener('popstate', () => {
    logger.navigation('Browser back/forward button used');
    changePage(location.pathname);
  });
}
