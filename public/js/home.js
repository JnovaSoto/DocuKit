// Exported function to be executed in the navigation file 
export async function init() {
  console.log('🏠 Home script ejecutado');

  // This function retrieves tags from the database by accessing the `/tags` path
  async function getTags() {
    const response = await fetch('/tags');
    if (!response.ok) throw new Error('Error fetching tags');

    // Then the function returns the data in JSON format
    return await response.json();
  }
  // This function retrieves all the attributes from the database by accessing the `/tags/attributes` path
  async function getAttributes() {
    const response = await fetch('/tags/attributes');
    if (!response.ok) throw new Error('Error fetching attributes');

    // Then the function returns the data in JSON format
    return await response.json();
  }

  try {
    // The variable retrieves the data from getTags() function
    const tags = await getTags();
    console.log('✅ Tags loaded:', tags);
    // The variable retrieves the data from getAttributes() function
    const attributes = await getAttributes();
    console.log('✅ Attributes loaded:', attributes);

    // Find the element called .tagTable
    const table = document.querySelector(".tagTable");

    // Keep the header row
    const header = table.querySelector("tr");
    table.innerHTML = "";
    table.appendChild(header);

    // We generate the rows dynamically
    tags.forEach(tag => {
      // Main row
      const row = document.createElement("tr");

      //Filter the attributes per id 
      const tagAttributes = attributes.filter(att => att.tag === tag.id);

      row.innerHTML = `
        <td>${tag.tagName}</td>
        <td>${tag.usability}</td>
        <td>
          <button class="dropdown-btn">
            <strong>Tags inside</strong>
            <span class="material-symbols-outlined arrow">arrow_drop_down</span>
          </button>
        </td>
        <td>
          <button class="delete-btn delete" data-id="${tag.id}">
            <span class="material-symbols-outlined icon_delete">delete</span>
          </button>
        </td>
      `;

      const dropdownRow = document.createElement('th');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none'; // hidden initially
      dropdownRow.innerHTML = `
        <td colspan="4">
          <div class="dropdown-content">`;

      tagAttributes.forEach(att =>{
        dropdownRow.innerHTML += `
            <p>${att.attribute} -> ${att.info}</p>
        `
      })
      dropdownRow.innerHTML += `
          </div>
        </td>
      `;


      // Append both rows to the table
      table.appendChild(row);
      table.appendChild(dropdownRow);
    });

    // Event delegation for dropdown buttons
    table.addEventListener('click', (e) => {
      const btn = e.target.closest('.dropdown-btn');
      if (!btn) return; // Click not on a dropdown button

      const row = btn.closest('tr'); 
      const dropdownRow = row.nextElementSibling; 

      if (dropdownRow.style.display === 'none') {
        // Show the dropdown row
        dropdownRow.style.display = 'table-row'; 
        btn.querySelector('.arrow').textContent = 'arrow_drop_up';
      } else {
        // Hide the dropdown row
        dropdownRow.style.display = 'none'; 
        btn.querySelector('.arrow').textContent = 'arrow_drop_down';
      }
    });

  } catch (error) {
    console.error('❌ Error loading tags:', error.message);
  }
}
