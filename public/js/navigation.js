// -------------------------------
// navigation.js - SPA handler
// -------------------------------

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderAndFooter();
  initNavigation();       // global SPA navigation buttons
  executePageScript();    // page-specific scripts
  handlePopState();       // handle back/forward
});

// -------------------------------
// Load header and footer once
// -------------------------------
async function loadHeaderAndFooter() {
  const header = document.querySelector('#header');
  const footer = document.querySelector('#footer');

  if (header && header.innerHTML.trim() === '') {
    try {
      const res = await fetch('/partials/header');
      const html = await res.text();
      header.innerHTML = html;

      // Initialize header scripts AFTER insertion
      import('/js/main/header.js').then(mod => mod.init && mod.init());
      import('/js/tags/getTag.js').then(mod => mod.init && mod.init());

    } catch (err) {
      console.error('Error loading header:', err);
    }
  }

  if (footer && footer.innerHTML.trim() === '') {
    try {
      const res = await fetch('/partials/footer');
      const html = await res.text();
      footer.innerHTML = html;
    } catch (err) {
      console.error('Error loading footer:', err);
    }
  }
}

// -------------------------------
// Global SPA navigation buttons
// -------------------------------
function initNavigation() {
  // Event delegation: any click inside #app or header
  document.body.addEventListener('click', e => {
    if (e.target.matches('#btn-go-create')) changePage('/create');
    if (e.target.matches('#btn-go-home')) changePage('/home');
    if (e.target.matches('#btn-sign-up')) changePage('/signUp');
    if (e.target.matches('#btn-log-in')) changePage('/logIn');
    if(e.target.matches('#btn-go-profile')) changePage('/profile');
    if(e.target.matches('#btn-edit-tags')) changePage('/edit');
  });
}
// -------------------------------
// Change SPA page
// -------------------------------
function changePage(path) {
  history.pushState(null, null, path);

  fetch(path)
    .then(res => res.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newContent = doc.querySelector('#app').innerHTML;
      document.querySelector('#app').innerHTML = newContent;

      // Run page-specific scripts only
      executePageScript();
    })
    .catch(console.error);
}

// -------------------------------
// Page-specific script loader
// -------------------------------
function executePageScript() {
  const path = window.location.pathname;

  switch (path) {
    case '/':
    case '/home':
      import('/js/main/home.js').then(mod => mod.init && mod.init());
      import('/js/tags/edit.js').then(mod => mod.init && mod.init());
      import('/js/tags/delate.js').then(mod => mod.init && mod.init());
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

// -------------------------------
// Handle browser back/forward buttons
// -------------------------------
function handlePopState() {
  window.addEventListener('popstate', () => changePage(location.pathname));
}
