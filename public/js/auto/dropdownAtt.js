export function dropdown(table) {
  if (!table) return;

  // Prevent attaching the handler more than once to the same table (idempotent)
  if (table.dataset.dropdownBound === '1') return;
  table.dataset.dropdownBound = '1';

  table.addEventListener('click', (e) => {
    const btn = e.target.closest('.dropdown-btn');
    if (!btn) return;

    const row = btn.closest('tr');
    if (!row) return;

    const dropdownRow = row.nextElementSibling;
    if (!dropdownRow) return;

    // Use computed style to reliably detect current visibility
    const computed = getComputedStyle(dropdownRow).display;
    const isHidden = computed === 'none';

    const arrow = btn.querySelector('.arrow');

    if (isHidden) {
      dropdownRow.style.display = 'table-row';
      if (arrow) arrow.textContent = 'arrow_drop_up';
    } else {
      dropdownRow.style.display = 'none';
      if (arrow) arrow.textContent = 'arrow_drop_down';
    }
  });
}