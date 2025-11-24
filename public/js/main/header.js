// header.js
export async function init() {
  console.log("🗣 Header script executed");

  try {

    const res = await fetch('/users/me');
    const data = await res.json();

    const waitForElement = async (selector) => {
      return new Promise((resolve) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        const observer = new MutationObserver(() => {
          const elNow = document.querySelector(selector);
          if (elNow) {
            resolve(elNow);
            observer.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    };

    const btnCreate = document.getElementById('btn-create-tags');
    const btnEdit = document.getElementById('btn-edit-tags');
    const btnDelete = document.getElementById('btn-delete-tags');
    const headerDropdown = document.getElementById('headerDropdown');
    const dropdownMenu = headerDropdown.nextElementSibling;

    // Helper to enable/disable buttons

    const setButtonState = (btn, enabled) => {
      if (!btn) return;
      if (enabled) {
        btn.classList.remove('disabled');
        btn.removeAttribute('tabindex');
        btn.removeAttribute('aria-disabled');
      } else {
        btn.classList.add('disabled');
        btn.setAttribute('tabindex', '-1');
        btn.setAttribute('aria-disabled', 'true');
      }
    };
    
    // Default: disable all buttons
    setButtonState(btnCreate, false);
    setButtonState(btnEdit, false);
    setButtonState(btnDelete, false);

    // Clear dropdown items
    dropdownMenu.innerHTML = '';

    if (data.loggedIn) {
      // Update dropdown text
      headerDropdown.textContent = data.username;

      // Profile link
      const profileLink = document.createElement('a');
      profileLink.className = 'dropdown-item';
      profileLink.href = '/profile';
      profileLink.id = 'btn-go-profile';
      profileLink.textContent = 'Profile';

      // Divider
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';

      // Logout link
      const logoutLink = document.createElement('a');
      logoutLink.className = 'dropdown-item';
      logoutLink.id = 'btn-log-out';
      logoutLink.textContent = 'Log out';

      import('/js/logOut.js').then(mod => {
        if (mod.init) mod.init(logoutLink);
      });

      // Append dropdown items
      dropdownMenu.append(profileLink, divider, logoutLink);

      // Admin-level logic
      switch (data.admin) {
        case 0:

          //Can create tags
          setButtonState(btnCreate, true);

          break;
        case 1:

         //Can create, edit and delete tags
          setButtonState(btnCreate, true); 
          setButtonState(btnEdit, true);  
          setButtonState(btnDelete, true); 
          
          break;
        default:
          console.warn('Unknown admin level:', data.admin);
      }
    }else {
      // User not logged in: show Sign up 
      const signUpLink = document.createElement('a');
      signUpLink.className = 'dropdown-item';
      signUpLink.href = '/signUp';
      signUpLink.id = 'btn-sign-up';
      signUpLink.textContent = 'Sign up';
      // Divider
      const divider = document.createElement('div');
      divider.className = 'dropdown-divider';
      // User not logged in: show Log in
      const logInLink = document.createElement('a');
      logInLink.className = 'dropdown-item';
      logInLink.href = '/logIn';
      logInLink.id = 'btn-log-in';
      logInLink.textContent = 'Log in';

      dropdownMenu.append(signUpLink, divider, logInLink);

      // Update dropdown text
      headerDropdown.textContent = 'User';
    }

  } catch (err) {
    console.error('Error checking session:', err);
  }
}