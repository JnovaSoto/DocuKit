export function fillForm(tag, attributes) {

  document.getElementById('tagName').value = tag.tagName;
  document.getElementById('usability').value = tag.usability;

  const wrapper = document.getElementById('attributes-wrapper');
  wrapper.innerHTML = ""; // limpiamos por si acaso

  attributes.forEach((att, index) => {

    const block = document.createElement("div");
    block.classList.add("attribute-block");

    block.innerHTML = `
      <h4>Atributo ${index + 1}</h4>
      <label>Attribute</label>
      <input type="text" name="attribute_${index}" value="${att.attribute}">
      
      <label>Info</label>
      <input type="text" name="info_${index}" value="${att.info}">
    `;

    wrapper.appendChild(block);
  });

}
