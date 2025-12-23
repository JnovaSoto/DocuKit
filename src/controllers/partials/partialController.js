const partialController = {
    /**
     * Render the header partial.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getHeader: (req, res) => {
        res.render('partials/header', {
            layout: false,
            user: req.session?.user || null
        });
    },

    /**
     * Render the footer partial.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     */
    getFooter: (req, res) => {
        res.render('partials/footer', {
            layout: false
        });
    }
};

export default partialController;
