  
 async function getTags() {

  const response = await fetch('/tags');
  if (!response.ok) throw new Error('Error al obtener los tags');

  const data =  await response.json();

  return data;
}
window.onload = async function () {
  try {
    const tags = await getTags();
    console.log(tags);

    const table = document.querySelector(".tagTable");

    // Limpiamos las filas anteriores (menos la primera fila de encabezados)
    const header = table.querySelector("tr");
    table.innerHTML = "";
    table.appendChild(header);

    // Generamos las filas dinámicamente
    tags.forEach(tag => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${tag.tagName}</td>
        <td>This section of an HTML document supplies metadata about the document itself</td>
        <td>
          <button>
            Tags inside <strong>${tag.tagName}</strong>
            <span class="material-symbols-outlined arrow">arrow_drop_down</span>
          </button>
        </td>
      `;

      table.appendChild(row);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};