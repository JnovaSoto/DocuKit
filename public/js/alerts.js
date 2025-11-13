//This function is only used to control the behavior of alerts.
export function showTemporaryAlert(id) {

  //Depends of the context you need the correct or the bad one
  const alert = document.getElementById(id);
  if (!alert) return;

  //Makes the alert to appear
  alert.style.display = 'block';
  
  // Allow browser to register the initial position
  setTimeout(() => {
    alert.classList.add('show');
  }, 50); 

  // Slide out and hide after 5 seconds
  setTimeout(() => {
    alert.classList.remove('show');

    setTimeout(() => {
      alert.style.display = 'none';
    }, 500); // matches transition duration
    
  }, 5000);
}
