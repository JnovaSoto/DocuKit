//This function is only used to control the behavior of alerts.
export function showTemporaryAlert(id) {

  //Depends of the context you need the correct or the bad one
  const el = document.getElementById(id);
  if (!el) return;

  //Makes the alert to appear
  el.style.display = 'block';
  
  // Allow browser to register the initial position
  setTimeout(() => {
    el.classList.add('show');
  }, 50); 

  // Slide out and hide after 5 seconds
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => {
      el.style.display = 'none';
    }, 500); // matches transition duration
  }, 5000);
}
