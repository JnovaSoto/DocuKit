export function tagForm(tag) {
    const form = document.getElementById('form-container');
    form.method = 'post';
    form.action = 'post';
    form.innerHTML = `
        <div class="container">
            <label for="name"><h3 id="label-name"><span class="material-symbols-outlined">sticker</span>Name of the tag</h3></label>
        <input type="text" name="name" id="name" placeholder="${tag.tag.tagName}" value="${tag.tag.tagName}" required>
        
        <label for="utility"><h3 id="label-utility"><span class="material-symbols-outlined">build</span>Utility of the tag</h3></label>
        <input type="text" name="utility" id="utility" placeholder="${tag.tag.usability}" value="${tag.tag.usability}" required>
        
        <label for="attributes-container" ><h4 id="label-attributes"><span class="material-symbols-outlined">description</span>Attributes</h4></label>
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
        <button type="submit" >Save Changes</button>
        </div>
    `;
    return form;
}