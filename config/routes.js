/**
 * Server-side route path constants.
 * Centralizes all API endpoint paths for consistency between client and server.
 */

export const ROUTES = {
    USERS: {
        BASE: '/users',
        SIGNUP: '/user',
        LOGIN: '/login',
        LOGOUT: '/logout',
        ME: '/me',
        BY_ID: '/users/:id'
    },
    TAGS: {
        BASE: '/',
        CREATE: '/',
        BY_ID: '/:id',
        BY_IDS: '/idTag/:ids',
        BY_NAME: '/tagName/:name',
        DELETE: '/:id'
    },
    ATTRIBUTES: {
        BASE: '/attributes',
        CREATE: '/attributes/create',
        BY_TAG_ID: '/attributes/idAttribute/:id',
        BY_NAME: '/attribute/attributeName/:name'
    },
    PARTIALS: {
        HEADER: '/header',
        FOOTER: '/footer'
    }
};

export default ROUTES;
