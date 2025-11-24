import { showTemporaryAlert } from '../tools/alerts.js';

export async function init() {

  console.log('📸 SignUp script executed');

  // -------------------------------
  // Select form and handle submit
  // -------------------------------
  const form = document.getElementById('signUp-form');

  form.addEventListener('submit', async (event) => {

    // Prevent page reload
    event.preventDefault();

    // -------------------------------
    // Get user input values
    // -------------------------------
    const usernameInput = document.getElementById("user-input");
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("pasword-input");
    const passwordRepeatInput = document.getElementById("repeat-pasword-input");

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const passwordRepeat = passwordRepeatInput.value;

    // -------------------------------
    // Real-time validation
    // -------------------------------
    usernameInput.addEventListener("input", () => {
      usernameInput.value = usernameInput.value.replace(/[^a-zA-Z0-9_]/g, '');
    });

    emailInput.addEventListener("input", () => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(emailInput.value)) {
        emailInput.setCustomValidity("Invalid email format");
      } else {
        emailInput.setCustomValidity("");
      }
    });

    // -------------------------------
    // Check if passwords match
    // -------------------------------
    if (password === passwordRepeat) {

      const tagBody = { username, password, email, admin: 0 };

      try {
        // -------------------------------
        // Send request to create user
        // -------------------------------
        const tagResponse = await fetch('/users/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tagBody)
        });

        if (!tagResponse.ok) {
          // -------------------------------
          // Show alert if creation fails
          // -------------------------------
          showTemporaryAlert('alert');
          console.error('Error creating user:', tagResponse.statusText);
          return;
        } else {
          // -------------------------------
          // User created successfully, clear inputs
          // -------------------------------
          console.log("User created successfully");
          showTemporaryAlert('success');
          usernameInput.value = "";
          emailInput.value = "";
          passwordInput.value = "";
          passwordRepeatInput.value = "";
        }

      } catch (error) {
        // -------------------------------
        // Handle fetch/network errors
        // -------------------------------
        console.error('Fetch failed:', error);
        showTemporaryAlert('alert');
      }

    } else {
      // -------------------------------
      // Passwords do not match
      // -------------------------------
      showTemporaryAlert('alert', "The passwords don't match");
    }

  });

}
