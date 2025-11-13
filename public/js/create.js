//Import the alerts for their uses
import { showTemporaryAlert } from './alerts.js';

// Script to create a new tag from the interfaz
export function init() {

  console.log('Create script execute');

  //Container
  const attributesContainer = document.getElementById('attributesContainer');
  //Add button
  const addAttributeBtn = document.getElementById('addAttributeBtn');

  //If add button was clicked
  addAttributeBtn.addEventListener('click', () => {

    const newAttribute = document.createElement('div');

    newAttribute.classList.add('attributeBlock');

    newAttribute.innerHTML = `
      <label>Atribute of the Tag <span class="req">*</span></label>

        <input type="text" name="attributeName[]" placeholder="Attribute Name" required>
        <input type="text" name="attributeInfo[]" placeholder="Attribute Info" required>
      
      <button type="button" class="removeBtn">Remove</button>
    `;

    //Inyect the HTML element created
    attributesContainer.appendChild(newAttribute);

    // Remove function
    newAttribute.querySelector('.removeBtn').addEventListener('click', () => {
      newAttribute.remove();
    });

  });

  //Take the creation form
  const form = document.getElementById('myForm');

  //Listen the "submit"
  form.addEventListener("submit", async (event) => {

    // Stop page reload
    event.preventDefault(); 

    // Get latest form values
    const tagName = document.getElementById("tagName").value;
    const usability = document.getElementById("usability").value;

    // Get all attributes
    const attributeNames = Array.from(document.getElementsByName("attributeName[]")).map(input => input.value);
    const attributeInfos = Array.from(document.getElementsByName("attributeInfo[]")).map(input => input.value);

    //Get all the attributes
    const attributes = attributeNames.map((attribute, index) => ({
      attribute,   
      info: attributeInfos[index]
    }));

    //Make the body for the database request for the tag
    const tagBody = { tagName, usability };

    try {

      // Create the tag first
      const tagResponse = await fetch('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagBody)
      });

      if (!tagResponse.ok) {
        showTemporaryAlert('alert');
        console.error('Error creating tag:', tagResponse.statusText);
        return;
      }

       // Our backend give us the id of the last tag created
      const tagResult = await tagResponse.json();
      const tagId = tagResult.id;

      //Send all attributes linked to that tag
      const attributesBody = { tagId, attributes }; 
      const attrResponse = await fetch('/tags/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attributesBody)
      });


      if (!attrResponse.ok) {
        showTemporaryAlert('alert');
        console.error('Error creating attributes:', attrResponse.statusText);
        return;
      }

      showTemporaryAlert('success');
      console.log('Tag and attributes created successfully!');

      // Reset form
      form.reset();
      attributesContainer.innerHTML = ''; 
      attributesContainer.innerHTML = `
      <label>Atribute of the Tag <span class="req">*</span></label>

        <input type="text" name="attributeName[]" placeholder="Attribute Name" required>
        <input type="text" name="attributeInfo[]" placeholder="Attribute Info" required>
      
    `;

    } catch (error) {
      console.error('Fetch failed:', error);
      showTemporaryAlert('alert');
    }
  });
}
