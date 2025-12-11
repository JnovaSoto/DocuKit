/**
 * SPA (Single Page Application) navigation handler.
 * Manages client-side routing, page transitions, and dynamic content loading.
 */

import logger from './tools/logger.js';

import { API, ROUTES } from './config/constants.js';
import { applyTheme, getCurrentTheme } from './tools/themeSwitch.js';

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
      import('/js/properties/getProperty.js').then(mod => mod.init && mod.init());

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
 * Note: #btn-edit-tags is handled by edit.js to save tag ID before navigation
 * @fires {changePage} changePage
 */
function initNavigation() {
  // Event delegation: any click inside body
  document.body.addEventListener('click', e => {
    // Note: #btn-edit-tags is NOT handled here - it's handled by edit.js
    // to ensure the tag ID is saved to sessionStorage before navigation

    if (e.target.matches('#btn-go-create') || e.target.matches('#btn-create-tags')) {
      e.preventDefault();
      // Only navigate if not disabled (though disabled attribute usually prevents click, standard a tags not always)
      if (!e.target.classList.contains('disabled')) {
        changePage(ROUTES.CREATE);
      }
    }
    if (e.target.matches('#btn-go-home')) {
      e.preventDefault();
      changePage(ROUTES.HOME);
    }
    if (e.target.matches('#btn-sign-up')) {
      e.preventDefault();
      changePage(ROUTES.SIGNUP);
    }
    if (e.target.matches('#btn-log-in')) {
      e.preventDefault();
      // Save current path to return after login
      sessionStorage.setItem('returnPath', window.location.pathname);
      changePage(ROUTES.LOGIN);
    }
    if (e.target.matches('#btn-go-profile')) {
      e.preventDefault();
      changePage(ROUTES.PROFILE);
    }
    if (e.target.matches('#btn-go-favorites')) {
      e.preventDefault();
      changePage(ROUTES.FAVORITES);
    }
  });
}

/**
 * Changes the current page without full page reload.
 * Updates browser history and loads new content dynamically.
 * @async
 * @param {string} path - The path to navigate to
 * @fires {changePage} changePage
 */
import { requireLogin } from './tools/session.js';
import { showTemporaryAlert } from './tools/alerts.js';

// ... (existing imports)

export async function changePage(path) {
  logger.navigation(`Navigating to: ${path}`);

  // Check if the route is protected
  const protectedRoutes = [ROUTES.CREATE, ROUTES.EDIT, ROUTES.PROFILE, ROUTES.FAVORITES];
  if (protectedRoutes.includes(path)) {
    if (!await requireLogin()) {
      showTemporaryAlert('alert', 'You must log in to access this page');
      // Optionally redirect to login if not already there
      if (window.location.pathname !== ROUTES.LOGIN) {
        changePage(ROUTES.LOGIN);
      }
      return;
    }
  }

  history.pushState(null, null, path);

  fetch(path)
    .then(async response => {
      // Handle server-side redirects (e.g. if session expired during fetch)
      if (response.redirected) {
        const newUrl = new URL(response.url);
        const newPath = newUrl.pathname;
        logger.navigation(`Redirected to: ${newPath}`);
        history.replaceState(null, null, newPath);
        if (newPath === ROUTES.LOGIN) {
          showTemporaryAlert('alert', 'Session expired, please log in again');
        }
        return response.text();
      }
      return response.text();
    })
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newContent = doc.querySelector('#app') ? doc.querySelector('#app').innerHTML : null;

      if (!newContent) {
        logger.error('Could not find #app content in response');
        return;
      }

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

  // Helper to update header button text based on theme
  const updateHeaderButton = () => {
    const btnCreate = document.getElementById('btn-create-tags');
    if (btnCreate) {
      const currentTheme = getCurrentTheme();
      if (currentTheme === 'css') {
        btnCreate.textContent = 'Create property';
      } else {
        btnCreate.textContent = 'Create tags';
      }
    }
  };

  switch (path) {
    case '/':
    case ROUTES.HOME:
      // Force HTML theme on home page
      applyTheme('html');
      updateHeaderButton();
      import('/js/main/home.js').then(mod => mod.init && mod.init());
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      import('/js/tags/delete.js').then(mod => mod.init && mod.init());
      import('/js/tags/favorites.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.CSS:
    case '/css-properties':
      // Force CSS theme on CSS properties page
      applyTheme('css');
      updateHeaderButton();
      import('/js/main/css.js').then(mod => mod.init && mod.init());
      import('/js/properties/edit.js').then(mod => mod.init && mod.init());
      import('/js/properties/delete.js').then(mod => mod.init && mod.init());
      import('/js/properties/favorites.js').then(mod => mod.init && mod.init());
      break;
    case ROUTES.CREATE:
      updateHeaderButton();
      if (getCurrentTheme() === 'css') {
        import('/js/properties/create.js').then(mod => mod.init && mod.init());
      } else {
        import('/js/tags/create.js').then(mod => mod.init && mod.init());
      }
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
    case ROUTES.FAVORITES:
      updateHeaderButton();
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      import('/js/tags/delete.js').then(mod => mod.init && mod.init());
      import('/js/properties/edit.js').then(mod => mod.init && mod.init());
      import('/js/properties/delete.js').then(mod => mod.init && mod.init());
      import('/js/tags/favorites.js').then(mod => mod.init && mod.init());
      import('/js/user/favorites.js').then(mod => mod.init && mod.init());
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
