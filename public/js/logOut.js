export function init(logOutButton){

    console.log("🚪 Log Out Script Executed")

    if (!logOutButton) return;

    logOutButton.addEventListener('click', async event => {
       
        // Prevent page reload
        event.preventDefault();

        await fetch('/users/logout', { method: 'POST' });
        
        //Redirect
        window.location.href = "/home";
    });

}