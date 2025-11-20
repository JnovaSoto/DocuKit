// Exported function to be executed in the navigation file 
import { generateTable } from './generateTable.js'
export async function init() {

  console.log('🏠 Home script executed');

  // -------------------------------
  // Fetch functions
  // -------------------------------
  // Retrieve tags from the database
  async function getTags() {
    const response = await fetch('/tags');
    if (!response.ok) throw new Error('Error fetching tags');
    return await response.json();
  }

  // Retrieve all attributes from the database
  async function getAttributes() { 
    const response = await fetch('/tags/attributes');
    if (!response.ok) throw new Error('Error fetching attributes');
    return await response.json();
  }

  try {
    // -------------------------------
    // Fetch data
    // -------------------------------
    const tags = await getTags();
    console.log('✅ Tags loaded:', tags);

    const attributes = await getAttributes();
    console.log('✅ Attributes loaded:', attributes);

    const table = document.querySelector(".tagTable");
    const header = table.querySelector("tr");
    table.innerHTML = "";
    table.appendChild(header);

    tags.forEach(tag => {
          
      const row = document.createElement("tr");
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none';

      const tagAttributes = attributes.filter(att => att.tag === tag.id);

      const filledRows = generateTable(tag, tagAttributes,row,dropdownRow);
      // Append main row and dropdown row to the table
      
      table.appendChild(filledRows.row);
      table.appendChild(filledRows.dropdownRow);
    });

     // -------------------------------
    // Event delegation for dropdown buttons
    // -------------------------------
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
