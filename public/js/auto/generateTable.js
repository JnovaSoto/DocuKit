import { escapeHTML } from '../tools/escapeHTML.js';

/**
 * Generates table rows for a tag with its attributes.
 * @param {Object} tag - Tag object
 * @param {Array} attributes - Array of attribute objects for this tag
 * @param {HTMLElement} row - Main row element
 * @param {HTMLElement} dropdownRow - Dropdown row element
 * @param {boolean} isFavorite - Whether this tag is in user's favorites
 * @returns {Object} Object containing row and dropdownRow elements
 */
export function generateTable(tag, attributes, row, dropdownRow, isFavorite = false) {

    const safeTagName = tag && tag.tagName ? escapeHTML(tag.tagName) : '';
    const safeUsability = tag && tag.usability ? escapeHTML(tag.usability) : '';

    // Determine heart icon style based on favorite status
    const heartIcon = isFavorite ? 'bookmark_heart' : 'bookmark';

    row.innerHTML = `
        <td><strong>${safeTagName}</strong></td>
        <td>${safeUsability}</td>
        <td>
        <button class="dropdown-btn table-button">
            <strong>Tags inside</strong>
            <span class="material-symbols-outlined arrow">arrow_drop_down</span>
        </button>
        </td>
        <td>
        <button class="favorite-btn js-favorite-toggle" data-id="${tag.id}" data-favorited="${isFavorite}">
            <span class="material-symbols-outlined icon_favorite">${heartIcon}</span>
        </button>
        </td>   
        <td>
        <button class="edit-btn edit" id="btn-edit-tags" data-id="${tag.id}">
            <span class="material-symbols-outlined icon_edit">edit</span>
        </button>
        </td>
        <td>
        <button class="delete-btn delete" id="btn-delete-tags" data-id="${tag.id}">
            <span class="material-symbols-outlined icon_delete">delete</span>
        </button>
        </td>
    `;

    let html = `<td colspan="6" class="dropdown-content"><table class="attribute-table">`;

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