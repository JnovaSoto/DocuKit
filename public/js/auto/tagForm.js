export function tagForm(tag) {
    const form = document.getElementById('form-container');
    form.id = 'edit-form';
    form.method = 'post';
    form.action = '/tags';
    form.innerHTML = `
        <label>Name of the tag</label>
        <input type="text" name="name" id="name" placeholder="${tag.tag.tagName}" value="${tag.tag.tagName}" required>
        
        <label>Utility of the tag</label>
        <input type="text" name="utility" id="utility" placeholder="${tag.tag.usability}" value="${tag.tag.usability}" required>
        
        <label>Attributes</label>
        <div id="attributes-container">
            ${tag.attributes.map((attr, index) => `
                <div class="attribute-group">
                    <label>Attribute ${index + 1}</label>
                    <input type="text" name="attributeName_${attr.id}" value="${attr.attribute || attr.attribute}" placeholder="Attribute Name">
                    <label>Info</label>
                    <input type="text" name="attributeInfo_${attr.id}" value="${attr.attributeInfo || attr.info}" placeholder="Attribute Info">
                </div>
            `).join('')}
        </div>
        
        <input type="hidden" name="tagId" id="tag-id" value="${tag.tag.id}">
        <button type="submit" class="btn btn-primary mt-3" >Save Changes</button>
    `;
    return form;
}