// -------------------------------
// Start the function when the DOM is loaded
// -------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await loadFooterAndHeader(); 
  startNavigation();
  executeActualScript();
});

// -------------------------------
// Navigation button handlers
// -------------------------------
function startNavigation() {

  // Find the button that takes you to the Create Page
  const btnCreate = document.getElementById('btn-go-create');
  if (btnCreate) btnCreate.addEventListener('click', () => changePage('/create'));

  // Find the button that takes you to the Home Page
  const btnHome = document.getElementById('btn-go-home');
  if (btnHome) btnHome.addEventListener('click', () => changePage('/home'));

  // Find the button that takes you to the Log In Page
  const btnSignUp = document.getElementById('btn-sign-up');
  if (btnSignUp) btnSignUp.addEventListener('click', () => changePage('/signUp'));
}

// -------------------------------
// Page changer function
// -------------------------------
function changePage(path) {

  // Push a state to the next path: State-Title-URL
  history.pushState(null, null, path);

  // Fetch the next path
  fetch(path)
    .then(res => res.text()) // Convert the response into text
    .then(html => {
      // Parse the text into a HTML Document
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Replace the current content with the new content
      const newContent = doc.querySelector('#app').innerHTML;
      document.querySelector('#app').innerHTML = newContent;

      // Reinitialize navigation and page-specific scripts
      startNavigation();
      executeActualScript();
    })
    .catch(console.error);
}

// -------------------------------
// Execute the script belonging to the current page
// -------------------------------
function executeActualScript() {
  const path = window.location.pathname;

  if (path === '/' || path === '/home') {
    import('/js/home.js').then(mod => mod.init && mod.init());
    import('/js/delate.js').then(mod => mod.init && mod.init());
  } else if (path === '/create') {
    import('/js/create.js').then(mod => mod.init && mod.init());
  } else if (path === '/signUp') {
    import('/js/signUp.js').then(mod => mod.init && mod.init());
  }
}

// -------------------------------
// Load header and footer if empty
// -------------------------------
async function loadFooterAndHeader() {
  const header = document.querySelector('#header');
  const footer = document.querySelector('#footer');

  if (header && header.innerHTML.trim() === '') {
    try {
      const res = await fetch('/partials/header');
      const html = await res.text();
      header.innerHTML = html;
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
// Handle browser back/forward buttons
// -------------------------------
window.addEventListener('popstate', () => changePage(location.pathname));
