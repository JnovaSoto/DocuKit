//Start the function if the Navigation file is loaded
document.addEventListener('DOMContentLoaded', async () => {
  await loadFooterAndHeader(); 
  startNavigation();
  executeActualScript();
});


function startNavigation() {

  //Find the button that takes you to the Create Page
  const btnCreate = document.getElementById('btn-go-create');
  //Clicking the Create button changes the page
  if (btnCreate) btnCreate.addEventListener('click', () => changePage('/create'));

  //Find the button that takes you to the Home Page
  const btnHome = document.getElementById('btn-go-home');
  //Clicking the Home button changes the page
  if (btnHome) btnHome.addEventListener('click', () => changePage('/home'));

   //Find the button that takes you to the Home Page
  const btnlogIn = document.getElementById('btn-log-in');
  //Clicking the Home button changes the page
  if (btnlogIn) btnlogIn.addEventListener('click', () => changePage('/logIn'));

}

//Page changer
function changePage(ruta) {

  //Pushing a state to the next path State-Title-Url
  history.pushState(null, null, ruta);
  //Fetch the next path
  fetch(ruta)
  //Converts the response into text
    .then(res => res.text())
  //Handles the HTML text that was fetched
    .then(html => {
      // Create a new DOM Parser
      const parser = new DOMParser();
      //Parse the text into a HTML Document
      const doc = parser.parseFromString(html, 'text/html');
      //Find the app container and select his content
      const newContent = doc.querySelector('#app').innerHTML;
      //Replace the current content with the next one
      document.querySelector('#app').innerHTML = newContent;

      startNavigation();
      executeActualScript(); 
    })
    .catch(console.error);
}

function executeActualScript() {
  //Find the current path
  const path = window.location.pathname;

    //If the path is correct then excecute the script that belong to the page and check if it was loaded
  if (path === '/' || path === '/home') {
    import('/js/home.js').then(mod => mod.init && mod.init());
     import('/js/delate.js').then(mod => mod.init && mod.init());
  } else if (path === '/create') {
    import('/js/create.js').then(mod => mod.init && mod.init());
  }else if (path === '/logIn') {
    import('/js/logIn.js').then(mod => mod.init && mod.init());
  }
}

async function loadFooterAndHeader() {

  const header = document.querySelector('#header');
  const footer = document.querySelector('#footer');
  
  // Only is loaded if its empty
  if (header && header.innerHTML.trim() === '') {
    try {
      const res = await fetch('/partials/header');
      const html = await res.text();
      header.innerHTML = html;
    } catch (err) {
      console.error('Error cargando header:', err);
    }
  }
  if (footer && footer.innerHTML.trim() === '') {
    try {
      const res = await fetch('/partials/footer');
      const html = await res.text();
      footer.innerHTML = html;
    } catch (err) {
      console.error('Error cargando header:', err);
    }
  }
}


//If the user clicks the back or fordward button it works properly
window.addEventListener('popstate', () => changePage(location.pathname));
