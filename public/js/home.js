//Exported function to be excecuted in the navigation file 
export async function init() {
  console.log('🏠 Home script ejecutado');

  //This function retrieves tags from the database by accessing the `/tags` path
  async function getTags() {
    const response = await fetch('/tags');
    if (!response.ok) throw new Error('Error al obtener los tags')

    //Then the function return the data in JSON format
    return await response.json();
  }

  try {

    //The variable retrieves the data from getTags() function
    const tags = await getTags();
    console.log('✅ Tags cargados:', tags);

    //Find the element called .tagTable
    const table = document.querySelector(".tagTable");

    //Clean the prevoius lines except the first one 
    const header = table.querySelector("tr");
    table.innerHTML = "";
    table.appendChild(header);

    // We generate the rows dynamically
    tags.forEach(tag => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${tag.tagName}</td>
        <td>${tag.usability}</td>
        <td>
          <button>
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

      table.appendChild(row);
    });

  } catch (error) {
    console.error('❌ Error cargando tags:', error.message);
  }
}
