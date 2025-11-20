export function dropdown(table){

    table.addEventListener('click', (e) => {
        const btn = e.target.closest('.dropdown-btn');
        if (!btn) return;

        const mainRow = btn.closest('tr');
        const dropdown = mainRow.nextElementSibling;

        if (dropdown.style.display === 'none') {
          dropdown.style.display = 'table-row';
          btn.querySelector('.arrow').textContent = 'arrow_drop_up';
        } else {
          dropdown.style.display = 'none';
          btn.querySelector('.arrow').textContent = 'arrow_drop_down';
        }
      });
}