export async function init() {
  console.log('Delate script ejecutado');

 // delete.js
document.addEventListener('click', async (e) => {
  const deleteBtn = e.target.closest('.delete-btn');
  if (!deleteBtn) return; // Click wasn't on a delete button

  const id = deleteBtn.dataset.id;
  if (!id) return;

  if (!confirm('Are you sure you want to delete this tag?')) return;

  try {
    const res = await fetch(`/tags/${id}`, { method: 'DELETE' });

    if (res.ok) {
      // ✅ Remove the row from the table
      const row = deleteBtn.closest('tr');
      if (row) row.remove();
      console.log(`Tag ${id} deleted successfully.`);
    } else {
      console.error('Failed to delete tag.');
    }
  } catch (err) {
    console.error('Error deleting tag:', err);
  }
});

}
