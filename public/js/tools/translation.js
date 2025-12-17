/**
 * Handles Google Translate Widget initialization and Custom Dropdown Logic.
 */

// Make the init function global so the Google script can find it
window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,it,de,pt',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

/**
 * Validates availability of Google Translate API and elements before attaching listeners
 */
export function init() {
    // Inject the Google Script if it's not already there
    if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }

    setupCustomDropdown();
}

function setupCustomDropdown() {
    const customBtn = document.getElementById('custom-btn');
    const customOptions = document.getElementById('custom-options');
    const currentLangSpan = document.getElementById('current-lang');

    // If elements don't exist yet (e.g. partial loading issues), retry briefly or exit
    if (!customBtn || !customOptions) {
        // console.warn('Translation dropdown elements not found yet.');
        return;
    }

    // Toggle dropdown
    // Remove old listeners to prevent duplicates if init is called multiple times
    const newBtn = customBtn.cloneNode(true);
    customBtn.parentNode.replaceChild(newBtn, customBtn);

    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customOptions.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        customOptions.classList.remove('show');
    });

    // Handle Language Selection
    customOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function () {
            const selectedLang = this.getAttribute('data-lang');
            const selectedText = this.querySelector('span').innerText;

            // 1. Update UI
            if (currentLangSpan) currentLangSpan.innerText = selectedText;
            customOptions.classList.remove('show');

            // 2. Trigger Google Translate

            // Method A: Set Cookie (Most reliable for persistence)
            // Google Translate uses /SOURCE_LANG/TARGET_LANG format
            // usually /auto/es or /en/es
            const cookieName = 'googtrans';
            const cookieValue = `/en/${selectedLang}`;
            const domain = window.location.hostname === 'localhost' ? '' : `domain=.${window.location.hostname};`;

            document.cookie = `${cookieName}=${cookieValue}; path=/; ${domain}`;
            document.cookie = `${cookieName}=${cookieValue}; path=/;`; // fallback for localhost

            // Method B: DOM Manipulation (Instant)
            let googleSelect = document.querySelector('.goog-te-combo');

            if (googleSelect) {
                googleSelect.value = selectedLang;
                googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            // If DOM method fails (e.g. widget not ready), the cookie + reload would catch it
            // but we try to avoid reload for SPA feel. 
            // If the user reports it "doesn't work", we might need to force reload if googleSelect is missing.
            if (!googleSelect) {
                // console.log('Widget not ready, reloading to apply cookie...');
                window.location.reload();
            }
        });
    });
}
