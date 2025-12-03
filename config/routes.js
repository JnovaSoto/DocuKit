/**
 * Server-side route path constants.
 * Centralizes all API endpoint paths for consistency between client and server.
 */

export const ROUTES = {
    USERS: {
        BASE: '/',
        ME: '/me',
        LOGIN: '/login',
        LOGOUT: '/logout',
        SIGNUP: '/user',
        BY_ID: '/userbyid/:id',
        FAVORITES: '/favorites'
    },
    TAGS: {
        BASE: '/',
        CREATE: '/tagCreate',
        BY_ID: '/tagId/:id',
        BY_IDS: '/tagIds/:ids',
        BY_NAME: '/tagName/:name',
        UPDATE: '/tagUpdate/:id',
        DELETE: '/tagDelete/:id'
    },
    ATTRIBUTES: {
        BASE: '/',
        CREATE: '/attributeCreate',
        BY_TAG_ID: '/attributeTagId/:id',
        BY_NAME: '/attributeName/:name'
    },
    ATTRIBUTE_METADATA: {
        BASE: '/',
        CREATE: '/attributeMetadataCreate',
        BY_NAME: '/attributeMetadataName/:name'
    },
    PARTIALS: {
        HEADER: '/header',
        FOOTER: '/footer'
    }
};

export default ROUTES;
