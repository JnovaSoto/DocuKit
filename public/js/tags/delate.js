import { showTemporaryAlert } from '../tools/alerts.js';
import { cases } from '../tools/caseState.js';

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

   try {
     
    const resSession = await fetch('/users/me');
      const sessionData = await resSession.json();
      if (!sessionData.loggedIn) {
        showTemporaryAlert('alert', 'You must log in to delete a tag');
        return;
      }

    const res = await fetch(`/tags/${id}`, { method: 'DELETE' });

    if (cases(res)) {
      // Remove the row from the table
      const row = deleteBtn.closest('tr');
      if (row) row.remove();

      showTemporaryAlert('success', 'Tag deleted successfully');
      console.log(`Tag ${id} deleted successfully.`);
    } 
    
   } catch (error) {
    
    console.error('Fetch failed:', error);
    showTemporaryAlert('alert', "Something went wrong");
   }
  });
}
