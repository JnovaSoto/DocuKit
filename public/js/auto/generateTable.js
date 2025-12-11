import { escapeHTML } from '../tools/escapeHTML.js';

/**
 * Generates table rows for an item (tag or property) with its attributes.
 * @param {Object} item - Item object (tag or property)
 * @param {Array} attributes - Array of attribute objects for this item
 * @param {HTMLElement} row - Main row element
 * @param {HTMLElement} dropdownRow - Dropdown row element
 * @param {boolean} isFavorite - Whether this item is in user's favorites
 * @param {Object} userPermissions - User permissions object {loggedIn: boolean, adminLevel: number}
 * @param {string} itemNameKey - Key to access item name ('tagName' or 'propertyName')
 * @param {string} dropdownLabel - Label for dropdown button ('Tags inside' or 'CSS inside')
 * @returns {Object} Object containing row and dropdownRow elements
 */
export function generateTable(item, attributes, row, dropdownRow, isFavorite = false, userPermissions = { loggedIn: false, adminLevel: null }, itemNameKey = 'tagName', dropdownLabel = 'Tags inside') {

    const safeItemName = item && item[itemNameKey] ? escapeHTML(item[itemNameKey]) : '';
    const safeUsability = item && item.usability ? escapeHTML(item.usability) : '';

    // Determine heart icon style based on favorite status
    const heartIcon = isFavorite ? 'favorite' : 'favorite_border';

    // Determine which buttons to show based on user permissions
    const showFavorite = userPermissions.loggedIn; // All logged in users can favorite
    const showEdit = userPermissions.loggedIn && userPermissions.adminLevel === 1;
    const showDelete = userPermissions.loggedIn && userPermissions.adminLevel === 1;

    // Determine type for buttons
    const type = itemNameKey === 'propertyName' ? 'property' : 'tag';

    // Build action buttons HTML
    let favoriteButtonHTML = '';
    let editButtonHTML = '';
    let deleteButtonHTML = '';

    if (showFavorite) {
        favoriteButtonHTML = `
        <button class="favorite-btn js-favorite-toggle ${isFavorite ? 'favorited' : ''}" data-id="${item.id}" data-favorited="${isFavorite}" data-type="${type}">
            <span class="material-symbols-outlined icon_favorite">${heartIcon}</span>
        </button>`;
    }

    if (showEdit) {
        editButtonHTML = `
        <button class="edit-btn edit" data-id="${item.id}" data-type="${type}">
            <span class="material-symbols-outlined icon_edit">edit</span>
        </button>`;
    }

    if (showDelete) {
        deleteButtonHTML = `
        <button class="delete-btn delete" data-id="${item.id}" data-type="${type}">
            <span class="material-symbols-outlined icon_delete">delete</span>
        </button>`;
    }

    // Build row HTML with only the columns that should be visible
    // Add tooltip to item name if content exists
    let rowHTML = `
        <td class="tag-name-cell">
            <strong>${safeItemName}</strong>
            ${item.content ? `<div class="tag-tooltip ${item.content.length > 50 ? 'multiline' : ''}">${escapeHTML(item.content)}</div>` : ''}
        </td>
        <td>${safeUsability}</td>
        <td>
        <button class="dropdown-btn table-button">
            <strong>${dropdownLabel}</strong>
            <span class="material-symbols-outlined arrow">arrow_drop_down</span>
        </button>
        </td>`;

    // Add action columns only if they have content
    if (showFavorite) {
        rowHTML += `<td>${favoriteButtonHTML}</td>`;
    }
    if (showEdit) {
        rowHTML += `<td>${editButtonHTML}</td>`;
    }
    if (showDelete) {
        rowHTML += `<td>${deleteButtonHTML}</td>`;
    }

    row.innerHTML = rowHTML;

    // Calculate colspan for dropdown row based on visible columns
    const totalColumns = 3 + (showFavorite ? 1 : 0) + (showEdit ? 1 : 0) + (showDelete ? 1 : 0);
    let html = `<td colspan="${totalColumns}" class="dropdown-content"><table class="attribute-table">`;

    // Build inner rows for each attribute
    if (Array.isArray(attributes)) {

        attributes.forEach(att => {

            html += `
          <tr>
            <td>Attribute</td>
            <td>${escapeHTML(att.attribute)}</td>
            <td>Information</td>
            <td>${escapeHTML(att.info)}</td>
          </tr>
        `;

        });
    }

    html += `</table></td>`;
    dropdownRow.innerHTML = html;

    return { row, dropdownRow }

}
