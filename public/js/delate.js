import { showTemporaryAlert } from './alerts.js';

export async function init() {

  console.log('🗑 Delete script executed');

  // -------------------------------
  // Handle delete button clicks
  // -------------------------------
  document.addEventListener('click', async (e) => {

    const deleteBtn = e.target.closest('.delete-btn');
    // Click wasn't on a delete button
    if (!deleteBtn) return; 

    // Take the id provided through the button's data attributes
    const id = deleteBtn.dataset.id;
    if (!id) return;

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this tag?')) return;

    const res = await fetch(`/tags/${id}`, { method: 'DELETE' });

    if (res.ok) {
      // Remove the row from the table
      const row = deleteBtn.closest('tr');
      if (row) row.remove();

      showTemporaryAlert('success', 'Tag deleted successfully');
      console.log(`Tag ${id} deleted successfully.`);
    } else {

      const errData = await res.json();

      if (res.status === 401) {
        showTemporaryAlert('alert', 'You do not have permission to delete this tag');
      } else if (res.status === 404) {
        showTemporaryAlert('alert', 'Tag not found');
      } else {
        showTemporaryAlert('alert', errData.error || 'Failed to delete tag');
      }

      console.error('Failed to delete tag:', errData);
    }
  });
}
