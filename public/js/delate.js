import { showTemporaryAlert } from './alerts.js';
export async function init() {
  console.log('Delate script ejecutado');

document.addEventListener('click', async (e) => {

  const deleteBtn = e.target.closest('.delete-btn');
  // Click wasn't on a delete button
  if (!deleteBtn) return; 

  //Take the id that was provided trought the attributes in the button
  const id = deleteBtn.dataset.id;
  if (!id) return;

  if (!confirm('Are you sure you want to delete this tag?')) return;

  try {
    const res = await fetch(`/tags/${id}`, { method: 'DELETE' });

    if (res.ok) {
      // ✅ Remove the row from the table
      const row = deleteBtn.closest('tr');
      if (row) row.remove();
       showTemporaryAlert('success');
      console.log(`Tag ${id} deleted successfully.`);
    } else {
       showTemporaryAlert('alert');
      console.error('Failed to delete tag.');
    }
  } catch (err) {
     showTemporaryAlert('alert');
    console.error('Error deleting tag:', err);
  }
});

}
