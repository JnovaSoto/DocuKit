import { escapeHTML } from '../tools/escapeHTML.js';
export function generateTable(tag, attributes, row, dropdownRow) {

    const safeTagName = tag && tag.tagName ? escapeHTML(tag.tagName) : '';
    const safeUsability = tag && tag.usability ? escapeHTML(tag.usability) : '';

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

    let html = `<td colspan="4" class="dropdown-content"><table class="attribute-table">`;

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