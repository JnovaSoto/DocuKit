import { Request, Response } from 'express';

const partialController = {
    /**
     * Render the navigation header partial with user session data.
     * @param {Request} req - The Express request object containing session.
     * @param {Response} res - The Express response object used to render.
     */
    getHeader: (req: Request, res: Response) => {
        res.render('partials/header', {
            layout: false,
            user: req.session?.username || null
        });
    },

    /**
     * Render the application footer partial.
     * @param {Request} _req - The Express request object.
     * @param {Response} res - The Express response object used to render.
     */
    getFooter: (_req: Request, res: Response) => {
        res.render('partials/footer', {
            layout: false
        });
    }

};

export default partialController;
