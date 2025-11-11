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

  try {
    // The variable retrieves the data from getTags() function
    const tags = await getTags();
    console.log('✅ Tags loaded:', tags);

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

      // Dropdown content row (hidden by default)
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none'; // hidden initially
      dropdownRow.innerHTML = `
        <td colspan="4">
          <div class="dropdown-content">
            <p>Tag 1</p>
            <p>Tag 2</p>
            <p>Tag 3</p>
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

      const row = btn.closest('tr'); // Main row
      const dropdownRow = row.nextElementSibling; // The hidden row below

      if (dropdownRow.style.display === 'none') {
        dropdownRow.style.display = 'table-row'; // Show the dropdown row
        btn.querySelector('.arrow').textContent = 'arrow_drop_up';
      } else {
        dropdownRow.style.display = 'none'; // Hide the dropdown row
        btn.querySelector('.arrow').textContent = 'arrow_drop_down';
      }
    });

  } catch (error) {
    console.error('❌ Error loading tags:', error.message);
  }
}
