export async function init() {
  console.log('Delate script ejecutado');

    const tagId = 1; 

    try {
        const response = await fetch('/tags/'+ tagId, {
            method: 'DELETE',
        });

        if (response.ok) {
            const result = await response.json();
            showTemporaryAlert('success'); 
            console.log('Success:', result);

        } else {
            showTemporaryAlert('alert'); 
            console.error('Server error:', response.statusText);
        }

        } catch (error) {
        console.error('Fetch failed:', error);
        }
}