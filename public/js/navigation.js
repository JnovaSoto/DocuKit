//Start the function if the Navigation file is loaded
document.addEventListener('DOMContentLoaded', () => {
  iniciarNavegacion();
  ejecutarScriptActual();
});

function iniciarNavegacion() {

  //Find the button that takes you to the Create Page
  const btnCreate = document.getElementById('btn-go-create');
  //Clicking the Create button changes the page
  if (btnCreate) btnCreate.addEventListener('click', () => cambiarPagina('/create'));

  //Find the button that takes you to the Home Page
  const btnHome = document.getElementById('btn-go-home');
  //Clicking the Home button changes the page
  if (btnHome) btnHome.addEventListener('click', () => cambiarPagina('/home'));
}

//Page changer
function cambiarPagina(ruta) {

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
      const nuevoContenido = doc.querySelector('#app').innerHTML;
      //Replace the current content with the next one
      document.querySelector('#app').innerHTML = nuevoContenido;

      iniciarNavegacion();
      ejecutarScriptActual(); 
    })
    .catch(console.error);
}

function ejecutarScriptActual() {
  //Find the current path
  const path = window.location.pathname;

    //If the path is correct then excecute the script that belong to the page and check if it was loaded
  if (path === '/' || path === '/home') {
    import('/js/home.js').then(mod => mod.init && mod.init());
     import('/js/delate.js').then(mod => mod.init && mod.init());
  } else if (path === '/create') {
    import('/js/create.js').then(mod => mod.init && mod.init());
  }
}


//If the user clicks the back or fordward button it works properly
window.addEventListener('popstate', () => cambiarPagina(location.pathname));
