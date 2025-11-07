//Import the alerts for their uses
import { showTemporaryAlert } from './alerts.js';
// Script to create a new tag from the interfaz
export function init() {
  console.log('Create script ejecutado');

  //Take the creation form
  const form = document.getElementById('myForm');

  //Listen the "submit"
  form.addEventListener("submit", async (event) => {

    // Stop page reload
    event.preventDefault(); 

    // Get latest form values
    const tagName = document.getElementById("tagName").value;
    const usability = document.getElementById("usability").value;
    const content = document.getElementById("content").value;

    //Make the body for the database request
    const body = { tagName, usability, content };
    console.log('Sending body:', body);

    try {
      const response = await fetch('/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      //If the petition finished successfully then show that everything went well
      if (response.ok) {
        const result = await response.json();
        showTemporaryAlert('success'); 
        console.log('Success:', result);

      //If it was not then show that something didnt work
      } else {
        showTemporaryAlert('alert'); 
        console.error('Server error:', response.statusText);
      }

    } catch (error) {
      console.error('Fetch failed:', error);
    }
  });
}
