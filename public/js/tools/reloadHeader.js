/**
 * Reloads the header to update user session info
 */
export async function reloadHeader() {
    try {
        const header = document.querySelector('#header');
        if (!header) return;

        const response = await fetch('/partials/header');
        const html = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const metaTags = tempDiv.querySelectorAll('meta');
        metaTags.forEach(meta => meta.remove());

        header.innerHTML = tempDiv.innerHTML;

        // Re-initialize header scripts
        const headerModule = await import('/js/main/header.js');
        // Reset the initialization flag
        if (headerModule.resetInit) headerModule.resetInit();
        if (headerModule.init) await headerModule.init();

        const getTagModule = await import('/js/tags/getTag.js');
        if (getTagModule.init) await getTagModule.init();

        const getPropertyModule = await import('/js/properties/getProperty.js');
        if (getPropertyModule.init) await getPropertyModule.init();

        // Re-initialize translation
        const translationModule = await import('/js/tools/translation.js');
        if (translationModule.init) await translationModule.init();

    } catch (err) {
        logger.error('Error reloading header:', err);
    }
}
