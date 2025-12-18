/**
 * Handles Google Translate Widget initialization and Custom Dropdown Logic.
 */

window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es,fr,it,de,pt',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

export function init() {
    if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }

    setupCustomDropdown();
    updateLabelFromCookie();
}

function updateLabelFromCookie() {
    const cookies = document.cookie.split(';');
    const googtrans = cookies.find(c => c.trim().startsWith('googtrans='));
    if (googtrans) {
        const value = googtrans.split('=')[1];
        const lang = value.split('/').pop();
        const langMap = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'it': 'Italian',
            'de': 'German',
            'pt': 'Portuguese'
        };
        const selectedText = langMap[lang] || 'English';
        const langLabel = document.getElementById('current-lang');
        if (langLabel) {
            langLabel.innerText = selectedText;
            langLabel.classList.add('notranslate');
        }
    }
}

function setupCustomDropdown() {
    const customBtn = document.getElementById('custom-btn');
    const customOptions = document.getElementById('custom-options');
    const currentLangSpan = document.getElementById('current-lang');

    if (!customBtn || !customOptions) {
        return;
    }

    const newBtn = customBtn.cloneNode(true);
    customBtn.parentNode.replaceChild(newBtn, customBtn);

    newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customOptions.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        customOptions.classList.remove('show');
    });
    customOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function () {
            const selectedLang = this.getAttribute('data-lang');

            const langMap = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'it': 'Italian',
                'de': 'German',
                'pt': 'Portuguese'
            };

            const selectedText = langMap[selectedLang] || 'English';

            const langLabel = document.getElementById('current-lang');
            if (langLabel) {
                langLabel.innerText = selectedText;
                langLabel.classList.add('notranslate');
            }
            customOptions.classList.remove('show');
            const cookieName = 'googtrans';
            const cookieValue = `/en/${selectedLang}`;
            const domain = window.location.hostname === 'localhost' ? '' : `domain=.${window.location.hostname};`;

            document.cookie = `${cookieName}=${cookieValue}; path=/; ${domain}`;
            document.cookie = `${cookieName}=${cookieValue}; path=/;`;

            let googleSelect = document.querySelector('.goog-te-combo');

            if (googleSelect) {
                googleSelect.value = selectedLang;
                googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }

            if (!googleSelect) {
                window.location.reload();
            }
        });
    });
}
