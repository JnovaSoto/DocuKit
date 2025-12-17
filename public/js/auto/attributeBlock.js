/**
 * Generates the HTML for an attribute input block.
 * @param {string} type - 'tag' or 'property' to determine labels/placeholders
 * @param {boolean} includeRemoveBtn - Whether to include the remove button
 * @returns {string} HTML string for the attribute block
 */
export function generateAttributeBlock(type = 'tag', includeRemoveBtn = false) {
    const label = type === 'tag' ? 'Attribute of the Tag' : 'Value / Attribute';
    const namePlaceholder = type === 'tag' ? 'Attribute Name' : 'Value / Attribute';
    const infoPlaceholder = type === 'tag' ? 'Attribute Info' : 'Value Info';

    let html = `
    <div class="attributeBlock">
        <label>${label} <span class="req">*</span></label>
        
        <div class="input-wrapper">
            <span class="material-symbols-outlined" translate="no">edit_attributes</span>
            <input type="text" name="attributeName[]" placeholder="${namePlaceholder}" required>
        </div>
        <div class="input-wrapper">
            <span class="material-symbols-outlined" translate="no">description</span>
            <input type="text" name="attributeInfo[]" placeholder="${infoPlaceholder}" required>
        </div>
    `;

    if (includeRemoveBtn) {
        html += `
        <button type="button" class="removeBtn">Remove</button>
        `;
    }

    html += `</div>`;
    return html;
}
