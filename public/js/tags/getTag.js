import { showTemporaryAlert } from '../tools/alerts.js';
import { generateTable } from '../auto/generateTable.js';
import { dropdown } from '../auto/dropdownAtt.js';
import { cases } from '../tools/caseState.js';

export async function init() {
  console.log('🧤 GetTag script executed');

  const formGetTag = document.getElementById('getTag');
  if (!formGetTag) return;

  formGetTag.addEventListener('submit', async (event) => {

    const error = document.getElementById('error')

    error.style.display = 'none';

    // Prevent default form submission
    event.preventDefault();

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    // Get the tag name from input
    const tagName = input.value.trim();

    try {
      
      const resSession = await fetch('/users/me');
      const sessionData = await resSession.json();
      
      if (!sessionData.loggedIn) {
        showTemporaryAlert('alert', 'You must log in to search a tag');
        return;
      }

      const table = document.querySelector('.tagTable');
      // Clear previous results
      table.innerHTML = `
        <th><h3>Tags</h3></th>
        <th><h3>Usability</h3></th>
        <th><h3>Atributes</h3></th>
        <th><h3>Edit</h3></th>
        <th><h3>Delete </h3></th>
      `;

      // Fetch tag(s) by name
      const resTag = await fetch(`/tags/tagName/${encodeURIComponent(tagName)}`);
      if (await cases(resTag,true)) {

        // Load tags and attributes
        const rawTag = await resTag.json();
        // Ensure tags is always an array
        const tags = Array.isArray(rawTag) ? rawTag : [rawTag];

        const resAttrAll = await fetch('/attributes/attributes');
        if (!resAttrAll.ok) throw new Error('Error fetching attributes list');
        const allAttributes = await resAttrAll.json();

        // For each tag found, create rows and filter attributes by tag id
        for (const t of tags) {
          const tagId = Number(t.id);
          // Robust filter: coerce to Number to avoid type mismatch
          const tagAttrs = allAttributes.filter(att => Number(att.tag) === tagId);
          console.log(`Attributes for tag id=${tagId}:`, tagAttrs);

          const row = document.createElement('tr');
          const dropdownRow = document.createElement('tr');
          dropdownRow.classList.add('dropdown-row');
          dropdownRow.style.display = 'none';

          const filled = generateTable(t, tagAttrs, row, dropdownRow);
          table.appendChild(filled.row);
          table.appendChild(filled.dropdownRow);
        }

        showTemporaryAlert('success', 'Tags retrieved successfully');
        return;
      }else {

         // If not found by name, search by attribute name (fallback)
        const resAttr = await fetch(`/attributes/attribute/attributeName/${encodeURIComponent(tagName)}`);
        if (!(await cases(resAttr,true))) {
              document.querySelector('.tagTable').innerHTML = "";
              error.style.display = 'block';
              return;
          }

          const attData = await resAttr.json();
          const attributesFound = Array.isArray(attData) ? attData : [attData];

          const tagIds = attData.map(attr => attr.tag);

          const resTagById = await fetch(`/tags/idTag/${tagIds.join(',')}`);
          const tags = await resTagById.json();
          
          if (!(await cases(resTagById))) return;

            const tagsArray = Array.isArray(tags) ? tags : [tags];

            const table = document.querySelector(".tagTable");
            const header = table.querySelector("tr");
            table.innerHTML = '';

            if (header) table.appendChild(header);

              tagsArray.forEach(t => {
                const row = document.createElement("tr");
                const dropdownRow = document.createElement("tr");
                dropdownRow.classList.add('dropdown-row');
                dropdownRow.style.display = 'none';

                const tagAttrs = attributesFound.filter(att => Number(att.tag) === Number(t.id));

                const filled = generateTable(t, tagAttrs, row, dropdownRow);
                table.appendChild(filled.row);
                table.appendChild(filled.dropdownRow);
            });

        dropdown(table);
        showTemporaryAlert('success', 'Tag(s) and attribute(s) found');
        return;
      }
      
    } catch (err) {
      console.error('Error fetching tag:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}