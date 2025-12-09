import { generateTable } from './generateTable.js';
import { dropdown } from './dropdownAtt.js';
import { checkSession } from '../tools/session.js';

/**
 * Renders table with dynamic columns based on user permissions.
 * Works for both tags and properties.
 */
export async function renderTable(table, items, attributes, userFavorites = []) {
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

    // Detect if we're working with tags or properties
    const isProperty = items.length > 0 && items[0].hasOwnProperty('propertyName');
    const itemNameKey = isProperty ? 'propertyName' : 'tagName';
    const attributeIdKey = isProperty ? 'propertyId' : 'tagId';
    const headerLabel = isProperty ? 'Properties' : 'Tags';
    const dropdownLabel = isProperty ? 'CSS inside' : 'Tags inside';

    const header = table.querySelector('tr');
    table.innerHTML = '';

    if (header) {
        table.appendChild(header);
    } else {
        let headerHTML = `
            <thead>
              <tr>
                <th><h3>${headerLabel}</h3></th>
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

    items.forEach(item => {
        const row = document.createElement('tr');
        const dropdownRow = document.createElement('tr');
        dropdownRow.classList.add('dropdown-row');
        dropdownRow.style.display = 'none';

        const itemAttributes = attributes.filter(att => Number(att[attributeIdKey]) === Number(item.id));
        const isFavorite = userFavorites.includes(Number(item.id));
        const filledRows = generateTable(item, itemAttributes, row, dropdownRow, isFavorite, userPermissions, itemNameKey, dropdownLabel);

        table.appendChild(filledRows.row);
        table.appendChild(filledRows.dropdownRow);
    });

    dropdown(table);
}
