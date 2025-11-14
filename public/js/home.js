// Exported function to be executed in the navigation file 
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

  // -------------------------------
  // Escape HTML to prevent literal display
  // -------------------------------
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  try {
    // -------------------------------
    // Fetch data
    // -------------------------------
    const tags = await getTags();
    console.log('✅ Tags loaded:', tags);

    const attributes = await getAttributes();
    console.log('✅ Attributes loaded:', attributes);

    // -------------------------------
    // Find table and reset content
    // -------------------------------
    const table = document.querySelector(".tagTable");
    const header = table.querySelector("tr");
    table.innerHTML = "";
    table.appendChild(header);

    // -------------------------------
    // Generate table rows dynamically
    // -------------------------------
    tags.forEach(tag => {
      // Main tag row
      const row = document.createElement("tr");

      // Filter attributes for this tag
      const tagAttributes = attributes.filter(att => att.tag === tag.id);

      row.innerHTML = `
        <td><strong>${escapeHTML(tag.tagName)}</strong></td>
        <td>${escapeHTML(tag.usability)}</td>
        <td>
          <button class="dropdown-btn table-button">
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

      // Dropdown row for attributes (hidden initially)
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none';

      let html = `<td colspan="4" class="dropdown-content"><table class="attribute-table">`;

      // Build inner rows for each attribute
      tagAttributes.forEach(att => {
        html += `
          <tr>
            <td>Attribute</td>
            <td>${att.attribute}</td>
            <td>Information</td>
            <td>${att.info}</td>
          </tr>
        `;
      });

      html += `</table></td>`;
      dropdownRow.innerHTML = html;

      // Append main row and dropdown row to the table
      table.appendChild(row);
      table.appendChild(dropdownRow);
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
