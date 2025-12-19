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
        const [tagsRes, propsRes, attrsRes, propAttrsRes] = await Promise.all([
            fetch(API.TAGS.BASE),
            fetch(API.PROPERTIES.BASE),
            fetch(API.ATTRIBUTES.BASE),
            fetch(API.PROPERTY_ATTRIBUTES.BASE)
        ]);

        const tags = await tagsRes.json();
        const properties = await propsRes.json();
        const attributes = await attrsRes.json();
        const propAttributes = await propAttrsRes.json();

        // Map tags to their attributes
        const data = [
            ...tags.map(t => ({
                name: t.tagName,
                type: 'tag',
                id: t.id,
                attributes: attributes.filter(a => a.tagId === t.id).map(a => a.attribute)
            })),
            ...properties.map(p => ({
                name: p.propertyName,
                type: 'property',
                id: p.id,
                attributes: propAttributes.filter(a => a.propertyId === p.id).map(a => a.attribute)
            }))
        ];

        fuse = new Fuse(data, {
            keys: ['name', 'attributes'],
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

let selectedIndex = -1;

function toggleOverlay() {
    overlay.classList.toggle('active');
    if (overlay.classList.contains('active')) {
        input.focus();
        selectedIndex = -1;
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
        selectedIndex = -1;
        return;
    }

    const results = fuse.search(query).slice(0, 10);
    selectedIndex = -1;
    renderResults(results);
});

// Keyboard navigation for results
input.addEventListener('keydown', (e) => {
    const items = resultsContainer.querySelectorAll('.search-result-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) {
            items[selectedIndex].click();
        }
    }
});

function updateSelection(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('selected', idx === selectedIndex);
        if (idx === selectedIndex) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

function renderResults(results) {
    resultsContainer.innerHTML = results.map((res, index) => `
        <div class="search-result-item" data-type="${res.item.type}" data-name="${res.item.name}" data-id="${res.item.id}">
            <div class="result-content">
                <span class="result-name">${res.item.name}</span>
                <span class="result-type">${res.item.type}</span>
            </div>
            ${res.item.attributes && res.item.attributes.length > 0 ? `<div class="result-attributes">${res.item.attributes.slice(0, 3).join(', ')}</div>` : ''}
        </div>
    `).join('');

    // Add click listeners to results
    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
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
