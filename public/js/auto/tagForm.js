export function tagForm(tag) {
    const form = document.getElementById('form-container');
    form.method = 'post';
    form.action = 'post';
    form.innerHTML = `
        <div class="form-group">
            <label for="name"><span class="material-symbols-outlined" translate="no">sticker</span> Name of the tag</label>
            <input type="text" name="name" id="name" placeholder="${tag?.tag?.tagName || ''}" value="${tag?.tag?.tagName || ''}" required translate="no">
        </div>
        
        <div class="form-group">
            <label for="utility"><span class="material-symbols-outlined" translate="no">build</span> Utility of the tag</label>
            <textarea name="utility" id="utility" placeholder="${tag?.tag?.usability || ''}" required>${tag?.tag?.usability || ''}</textarea>
        </div>
        
        <label for="attributesContainer" class="section-label"><span class="material-symbols-outlined" translate="no">description</span> Attributes</label>
        <div id="attributesContainer">
            ${tag.attributes.map((attr, index) => `
                <div class="attribute-block">
                    <label translate="no">Attribute Name</label>
                    <input type="text" name="attributeName_${attr.id}" value="${attr.attribute || ''}" placeholder="Attribute Name" translate="no">
                    <label translate="no">Attribute Info</label>
                    <textarea name="attributeInfo_${attr.id}" placeholder="Attribute Info">${attr.attributeInfo || attr.info || ''}</textarea>
                </div>
            `).join('')}
        </div>
        
        <input type="hidden" name="tagId" id="tag-id" value="${tag?.tag?.id || ''}">
        
        <div class="form-buttons">
            <button type="button" class="btn-cancel" onclick="window.location.href='/home'">Cancel</button>
            <button type="submit" class="btn-submit">Save Changes</button>
        </div>
    `;
    return form;
}