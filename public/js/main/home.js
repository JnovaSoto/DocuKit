// Home / navigation initialization
import { generateTable } from '../auto/generateTable.js';
import { dropdown } from '../auto/dropdownAtt.js';

export async function init() {
  
  console.log('🏠 Home script executed');
  // -------------------------------
  // Fetch helpers
  // -------------------------------
  async function getTags() {
    const response = await fetch('/tags');
    if (!response.ok) throw new Error('Error fetching tags');
    return await response.json();
  }

  async function getAttributes() {
    const response = await fetch('/attributes/attributes');
    if (!response.ok) throw new Error('Error fetching attributes');
    return await response.json();
  }

  try {
    // -------------------------------
    // Fetch data
    // -------------------------------
    const tags = await getTags();
    //console.log('✅ Tags loaded:', tags);

    const attributes = await getAttributes();
    //console.log('✅ Attributes loaded:', attributes);

    const table = document.querySelector(".tagTable");
    const header = table.querySelector("tr");
    table.innerHTML = "";
    if (header) table.appendChild(header);

    tags.forEach(tag => {
      const row = document.createElement("tr");
      const dropdownRow = document.createElement('tr');
      dropdownRow.classList.add('dropdown-row');
      dropdownRow.style.display = 'none';

      // Robust filter: ensure types match
      const tagAttributes = attributes.filter(att => Number(att.tag) === Number(tag.id));

      const filledRows = generateTable(tag, tagAttributes, row, dropdownRow);
      table.appendChild(filledRows.row);
      table.appendChild(filledRows.dropdownRow);
    });

    // Use centralized dropdown binding (idempotent)
    dropdown(table);

  } catch (error) {
    console.error('❌ Error loading tags:', error.message);
  }
}