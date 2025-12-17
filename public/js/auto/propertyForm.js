
export function propertyForm(data) {
    const form = document.getElementById('form-container');
    // Using cloned element or replacing content? The tagForm replaces innerHTML and returns form.
    // So assume we work on the existing #form-container or a new derived element.
    // The previous code in edit.js did replaceWith. Here we just set innerHTML on the passed or found element.
    // Wait, tagForm gets 'form-container' by ID within the function.
    // It returns the form element.

    // data structure expected: { property: object, attributes: array }

    form.method = 'post';
    form.action = 'post'; // This action is likely intercepted by JS anyway
    form.innerHTML = `
        <div class="container">
            <label for="name"><h3 id="label-name"><span class="material-symbols-outlined" translate="no">style</span>Name of the property</h3></label>
        <input type="text" name="name" id="name" placeholder="${data.property.propertyName}" value="${data.property.propertyName}" required>

        <label for="utility"><h3 id="label-utility"><span class="material-symbols-outlined" translate="no">build</span>Utility of the property</h3></label>
        <input type="text" name="utility" id="utility" placeholder="${data.property.usability}" value="${data.property.usability}" required>

        <label for="attributes-container" ><h4 id="label-attributes"><span class="material-symbols-outlined" translate="no">description</span>Values / Attributes</h4></label>
        <div id="attributes-container">
            ${data.attributes.map((attr, index) => `
                <div class="attribute-group">
                    <label>Value ${index + 1}</label>
                    <input type="text" name="attributeName_${attr.id}" value="${attr.attribute || ''}" placeholder="Value / Attribute Name">
                    <label>Info</label>
                    <input type="text" name="attributeInfo_${attr.id}" value="${attr.info || ''}" placeholder="Value Information">
                </div>
            `).join('')}
        </div>

        <input type="hidden" name="propertyId" id="property-id" value="${data.property.id}">
        <button type="submit" >Save Changes</button>
        </div>
    `;
    return form;
}
