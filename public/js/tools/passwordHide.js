export function pass(togglePasswordButton, passwordInput, passwordIcon) {
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        if (passwordInput.type === 'password') {
            passwordIcon.textContent = 'visibility';
        } else {
            passwordIcon.textContent = 'visibility_off';
        }
    });

}