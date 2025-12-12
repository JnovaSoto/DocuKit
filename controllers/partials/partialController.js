const partialController = {
    getHeader: (req, res) => {
        res.render('partials/header', {
            layout: false,
            user: req.session?.user || null
        });
    },

    getFooter: (req, res) => {
        res.render('partials/footer', {
            layout: false
        });
    }
};

export default partialController;
