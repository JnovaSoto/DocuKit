import { generateTable } from './generateTable.js';
import { dropdown } from './dropdownAtt.js';
import { checkSession } from '../tools/session.js';

/**
 * Renders tags table with dynamic columns based on user permissions.
 */
export async function renderTable(table, tags, attributes, userFavorites = []) {
    if (!table) return;

    let userPermissions = { loggedIn: false, adminLevel: null };
    try {
        const sessionData = await checkSession();
        if (sessionData.loggedIn) {
            userPermissions = {
                loggedIn: true,
                adminLevel: sessionData.admin
            };
        }
    } catch (error) {
        // Treat as guest if session check fails
    }

    const header = table.querySelector('tr');
    table.innerHTML = '';

    if (header) {
        table.appendChild(header);
    } else {
        let headerHTML = `
            <thead>
              <tr>
                <th><h3>Tags</h3></th>
                <th><h3>Usability</h3></th>
                <th><h3>Attributes</h3></th>`;

        if (userPermissions.loggedIn) {
            headerHTML += `<th><h3>Favorite</h3></th>`;
        }
        if (userPermissions.loggedIn && userPermissions.adminLevel === 1) {
            headerHTML += `<th><h3>Edit</h3></th>`;
            headerHTML += `<th><h3>Delete</h3></th>`;
        }

        headerHTML += `
              </tr>
            </thead>
        `;
        table.innerHTML = headerHTML;
    }

    tags.forEach(tag => {
        const row = document.createElement('tr');
        const dropdownRow = document.createElement('tr');
        dropdownRow.classList.add('dropdown-row');
        dropdownRow.style.display = 'none';

        const tagAttributes = attributes.filter(att => Number(att.tagId) === Number(tag.id));
        const isFavorite = userFavorites.includes(Number(tag.id));
        const filledRows = generateTable(tag, tagAttributes, row, dropdownRow, isFavorite, userPermissions);

        table.appendChild(filledRows.row);
        table.appendChild(filledRows.dropdownRow);
    });

    dropdown(table);
}
