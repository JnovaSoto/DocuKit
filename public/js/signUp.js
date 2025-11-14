import { showTemporaryAlert } from './alerts.js';
export async function init() {

  console.log('Log In script executed');

  // -------------------------------
  // Handle login button clicks
  // -------------------------------

  const form = document.getElementById('signUp-form');

  form.addEventListener('submit', async (e) => {

     // Stop page reload
    event.preventDefault();

    // Take the attributes of the user from the form
    const username = document.getElementById("user-input").value
    const email = document.getElementById("email-input").value
        const password = document.getElementById("pasword-input").value

    const tagBody = {username,password,email,admin:0}

     try {
      // -------------------------------
      // Create the user 
      // -------------------------------
      const tagResponse = await fetch('/tags/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagBody)
      });

      if (!tagResponse.ok) {
        showTemporaryAlert('alert');
        console.error('Error creating user:', tagResponse.statusText);
        return;
      }else{
        console.log("User created successfully")
        showTemporaryAlert('success');
      }

    } catch (error) {
      console.error('Fetch failed:', error);
      showTemporaryAlert('alert');
    }

  });

}
