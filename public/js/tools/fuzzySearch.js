import { API, ROUTES } from '../config/constants.js';
import { changePage } from '../navigation.js';

let fuse;
const overlay = document.getElementById('search-overlay');
const input = document.getElementById('command-k-input');
const resultsContainer = document.getElementById('search-results');

/**
 * Initialize the fuzzy search indexing.
 * Fetches all tags and properties and creates a Fuse instance.
 */
async function initSearch() {
    try {
        const [tagsRes, propsRes] = await Promise.all([
            fetch(API.TAGS.GET_ALL),
            fetch(API.PROPERTIES.GET_ALL)
        ]);

        const tags = await tagsRes.json();
        const properties = await propsRes.json();

        const data = [
            ...tags.map(t => ({ name: t.tagName, type: 'tag', id: t.id })),
            ...properties.map(p => ({ name: p.propertyName, type: 'property', id: p.id }))
        ];

        fuse = new Fuse(data, {
            keys: ['name'],
            threshold: 0.3,
            location: 0,
            distance: 100,
            minMatchCharLength: 1
        });

    } catch (err) {
        console.error('Failed to initialize search index:', err);
    }
}

/**
 * Event listener for Command+K or Ctrl+K.
 */
window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOverlay();
    }
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
        toggleOverlay();
    }
});

function toggleOverlay() {
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        input.focus();
        if (!fuse) initSearch();
    }
}

// Close when clicking outside the modal
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) toggleOverlay();
});

// Search on input
input.addEventListener('input', () => {
    const query = input.value.trim();
    if (!query || !fuse) {
        resultsContainer.innerHTML = '';
        return;
    }

    const results = fuse.search(query).slice(0, 10);
    renderResults(results);
});

function renderResults(results) {
    resultsContainer.innerHTML = results.map((res, index) => `
        <div class="search-result-item" data-type="${res.item.type}" data-name="${res.item.name}" data-id="${res.item.id}">
            <span class="result-name">${res.item.name}</span>
            <span class="result-type">${res.item.type}</span>
        </div>
    `).join('');

    // Add click listeners to results
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const name = item.dataset.name;

            toggleOverlay();
            input.value = '';
            resultsContainer.innerHTML = '';

            if (type === 'tag') {
                sessionStorage.setItem('lastTag', name);
                changePage(ROUTES.HOME);
            } else {
                sessionStorage.setItem('lastProperty', name);
                changePage(ROUTES.CSS);
            }
        });
    });
}
