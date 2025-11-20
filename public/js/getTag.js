import { showTemporaryAlert } from './alerts.js';
import { generateTable } from './generateTable.js';
import { dropdown } from './dropdownAtt.js';
import { cases } from './caseState.js'

export async function init() {
  console.log('🧤 GetTag script executed');

  const formGetTag = document.getElementById('getTag');
  if (!formGetTag) return;

  formGetTag.addEventListener('submit', async (event) => {
    event.preventDefault();

    const input = formGetTag.querySelector('input[type="search"]');
    if (!input || !input.value.trim()) {
      showTemporaryAlert('alert', 'Please enter a tag name to search');
      return;
    }

    const tagName = input.value.trim();

    try {
      // -------------------------------
      // Verificar sesión
      // -------------------------------
      const resSession = await fetch('/users/me');
      const sessionData = await resSession.json();
      if (!sessionData.loggedIn) {
        showTemporaryAlert('alert', 'You must log in to search a tag');
        return;
      }

      // Fetch tag by name
      const resTag = await fetch(`/tags/${encodeURIComponent(tagName)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (await cases(resTag)) {
const response = await fetch('/tags/attributes');
if (!response.ok) throw new Error('Error fetching attributes');

const tags = await resTag.json();
const attributes = await response.json();

console.log('Tag fetched successfully:', tags);
console.log('✅ Attributes loaded:', attributes);

const table = document.querySelector(".tagTable");
const header = table.querySelector("tr");
table.innerHTML = '';
table.appendChild(header);

// Por cada tag
tags.forEach(tag => {
    const row = document.createElement("tr");
    const dropdownRow = document.createElement("tr");
    dropdownRow.classList.add('dropdown-row');
    dropdownRow.style.display = 'none';

    // Por cada atributo de este tag
    attributes.forEach(att => {
        if (att.tag === tag.id) {
            // Puedes procesar el atributo aquí si hace falta
            // Por ejemplo, agregar celdas a row
        }
    });

    const filledRows = generateTable(tag, attributes.filter(att => att.tag === tag.id), row, dropdownRow);
    table.appendChild(filledRows.row);
    table.appendChild(filledRows.dropdownRow);
});


        dropdown(table);

      } else {

        // Fetch attribute by name
        const resAtt = await fetch(`/tags/${encodeURIComponent(tagName)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (await cases(resAtt)) console.log('Attribute fetched successfully:', await resAtt.json());

        // Fetch tag by id
        const tag = await fetch(`/tags/idTag/${encodeURIComponent(resAtt)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

         if (await cases(resAtt)) console.log('Tag fetched successfully:', await resAtt.json());

         //Per Attribute Name







        
      }

      

    } catch (err) {
      console.error('Error fetching tag:', err);
      showTemporaryAlert('alert', 'An unexpected error occurred');
    }
  });
}
