import { showTemporaryAlert } from './alerts.js';

export async function init() {

  console.log('📋 Log In script executed');

  // -------------------------------
  // Select form and handle submit
  // -------------------------------
  const form = document.getElementById('login-form');

  form.addEventListener('submit', async (event) => {

    // Prevent page reload
    event.preventDefault();

    // -------------------------------
    // Get user login input
    // -------------------------------
    const login = document.getElementById("login-input").value
    const password = document.getElementById("pasword-input").value
      
    const tagBody = {login, password}
      
    try {
      // -------------------------------
      // Send login request to server
      // -------------------------------
      const tagResponse = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(tagBody)
      });

      if (!tagResponse.ok) {
        // -------------------------------
        // Show alert if login fails
        // -------------------------------
        showTemporaryAlert('alert', "User or Password are incorrects");
        console.error('Error login user:', tagResponse.statusText);
        return;
      } else {
        // -------------------------------
        // Login successful, clear input fields
        // -------------------------------
        console.log("User logged in successfully")
        showTemporaryAlert('success', "Log In success");
        document.getElementById("login-input").value = "";
        document.getElementById("pasword-input").value = "";

        //Redirect
        window.location.href = "/home";
      }

    } catch (error) {
      // -------------------------------
      // Handle fetch/network errors
      // -------------------------------
      console.error('Fetch failed:', error);
      showTemporaryAlert('alert', "Something went wrong");
    }

  });
}
