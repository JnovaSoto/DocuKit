import { generateTable } from './generateTable.js';
import { dropdown } from './dropdownAtt.js';

/**
 * Renders the tags table with the given tags and attributes.
 * @param {HTMLElement} table - The table element to populate.
 * @param {Array} tags - Array of tag objects.
 * @param {Array} attributes - Array of attribute objects.
 */
export function renderTable(table, tags, attributes) {
    if (!table) return;

    // Preserve the header row
    const header = table.querySelector('tr');
    table.innerHTML = '';

    if (header) {
        table.appendChild(header);
    } else {
        // Fallback header if none exists (e.g. after a full clear)
        table.innerHTML = `
            <thead>
              <tr>
                <th><h3>Tags</h3></th>
                <th><h3>Usability</h3></th>
                <th><h3>Attributes</h3></th>
                <th><h3>Edit</h3></th>
                <th><h3>Delete</h3></th>
              </tr>
            </thead>
        `;
    }

    // Generate rows
    tags.forEach(tag => {
        const row = document.createElement('tr');
        const dropdownRow = document.createElement('tr');
        dropdownRow.classList.add('dropdown-row');
        dropdownRow.style.display = 'none';

        const tagAttributes = attributes.filter(att => Number(att.tagId) === Number(tag.id));
        const filledRows = generateTable(tag, tagAttributes, row, dropdownRow);


        table.appendChild(filledRows.row);
        table.appendChild(filledRows.dropdownRow);
    });

    // Initialize dropdown functionality
    dropdown(table);
}
