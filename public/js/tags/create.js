// Import the alerts for their uses
import { showTemporaryAlert } from '../tools/alerts.js';

// Script to create a new tag from the interface
export function init() {

  console.log('🔨Create script execute');

  // Elements
  const attributesContainer = document.getElementById('attributesContainer');
  const addAttributeBtn = document.getElementById('addAttributeBtn');
  const form = document.getElementById('myForm');

  // -------------------------------
  // Add attribute block dynamically
  // -------------------------------
  addAttributeBtn.addEventListener('click', () => {
    const newAttribute = document.createElement('div');
    newAttribute.classList.add('attributeBlock');

    newAttribute.innerHTML = `
      <label>Attribute of the Tag <span class="req">*</span></label>
      <input type="text" name="attributeName[]" placeholder="Attribute Name" required>
      <input type="text" name="attributeInfo[]" placeholder="Attribute Info" required>
      <button type="button" class="removeBtn">Remove</button>
    `;

    // Inject the HTML element created
    attributesContainer.appendChild(newAttribute);

    // Remove function
    newAttribute.querySelector('.removeBtn').addEventListener('click', () => {
      newAttribute.remove();
    });
  });

  // -------------------------------
  // Handle form submission
  // -------------------------------
  form.addEventListener("submit", async (event) => {
    // Stop page reload
    event.preventDefault(); 

    // Get latest form values
    const tagName = document.getElementById("tagName").value;
    const usability = document.getElementById("usability").value;

    // Get all attributes from inputs
    const attributeNames = Array.from(document.getElementsByName("attributeName[]")).map(input => input.value);
    const attributeInfos = Array.from(document.getElementsByName("attributeInfo[]")).map(input => input.value);

    const attributes = attributeNames.map((attribute, index) => ({
      attribute,
      info: attributeInfos[index]
    }));

    // Make the body for the database request for the tag
    const tagBody = { tagName, usability };

    try {

       
      const resSession = await fetch('/users/me');
      const sessionData = await resSession.json();
      if (!sessionData.loggedIn) {
        showTemporaryAlert('alert', 'You must log in to delete a tag');
        return;
      }

      // -------------------------------
      // Create the tag first
      // -------------------------------
      const tagResponse = await fetch('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagBody)
      });

      if (!tagResponse.ok) {
        const errData = await res.json();

        if (res.status === 403) {
          showTemporaryAlert('alert', 'You do not have permission to create this tag');
        } else {
          showTemporaryAlert('alert', errData.error || 'Failed to create tag');
        }
        return;
      }

      // Backend gives us the id of the last tag created
      const tagResult = await tagResponse.json();
      const tagId = tagResult.id;

      // -------------------------------
      // Send all attributes linked to that tag
      // -------------------------------
      const attributesBody = { tagId, attributes };
      const attrResponse = await fetch('/attributes/attributes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attributesBody)
      });

      if (!attrResponse.ok) {
        const errData = await res.json();

        if (res.status === 403) {
          showTemporaryAlert('alert', 'You do not have permission to create this attribute');
        } else {
          showTemporaryAlert('alert', errData.error || 'Failed to create the attribute');
        }
        return;
      }

      showTemporaryAlert('success');
      console.log('Tag and attributes created successfully!');

      // -------------------------------
      // Reset form for next input
      // -------------------------------
      form.reset();
      attributesContainer.innerHTML = `
        <label>Attribute of the Tag <span class="req">*</span></label>
        <input type="text" name="attributeName[]" placeholder="Attribute Name" required>
        <input type="text" name="attributeInfo[]" placeholder="Attribute Info" required>
      `;

    } catch (error) {
      console.error('Fetch failed:', error);
      showTemporaryAlert('alert');
    }
  });
}
