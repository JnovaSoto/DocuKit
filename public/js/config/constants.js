/**
 * Application-wide constants and configuration values.
 * Centralizes magic numbers, validation rules, and reusable strings.
 */

/**
 * Validation rules for user inputs
 */
export const VALIDATION = {
    USERNAME: {
        MAX_LENGTH: 20,
        MIN_LENGTH: 3
    },
    EMAIL: {
        MAX_LENGTH: 40
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 100
    },
    TAG_NAME: {
        MAX_LENGTH: 50,
        MIN_LENGTH: 1
    },
    ATTRIBUTE: {
        MAX_LENGTH: 100
    }
};

/**
 * Alert timing configuration (in milliseconds)
 */
export const ALERT_TIMING = {
    SHOW_DELAY: 50,           // Delay before showing alert
    DISPLAY_DURATION: 5000,   // How long alert stays visible
    HIDE_TRANSITION: 500      // Transition duration when hiding
};

/**
 * Session configuration
 */
export const SESSION = {
    TIMEOUT: 1000 * 60 * 30,  // 30 minutes
    CHECK_INTERVAL: 1000 * 60 * 5  // Check every 5 minutes
};

/**
 * API endpoints
 */
export const API = {
    USERS: {
        BASE: '/users',
        ME: '/users/me',
        LOGIN: '/users/login',
        LOGOUT: '/users/logout',
        SIGNUP: '/users/user',
        BY_ID: (id) => `/users/${id}`,
        FAVORITES: '/users/favorites'
    },
    TAGS: {
        BASE: '/tags',
        CREATE: '/tags/create',
        BY_ID: (id) => `/tags/tagId/${id}`,
        BY_IDS: (ids) => `/tags/tagIds/${ids}`,
        BY_NAME: (name) => `/tags/tagName/${name}`,
        UPDATE: (id) => `/tags/${id}`,
        DELETE: (id) => `/tags/delete/${id}`
    },
    ATTRIBUTES: {
        BASE: '/attributes',
        CREATE: '/attributes/attributeCreate',
        BY_TAG_ID: (id) => `/attributes/attributeTagId/${id}`,
        BY_NAME: (name) => `/attributes/attributeName/${name}`
    },
    PARTIALS: {
        HEADER: '/partials/header',
        FOOTER: '/partials/footer'
    }
};

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error occurred. Please try again.',
    UNAUTHORIZED: 'You must be logged in to perform this action.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
    LOGIN: 'Successfully logged in',
    LOGOUT: 'Successfully logged out',
    SIGNUP: 'Account created successfully',
    TAG_CREATED: 'Tag created successfully',
    TAG_UPDATED: 'Tag updated successfully',
    TAG_DELETED: 'Tag deleted successfully'
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

/**
 * Alert element IDs
 */
export const ALERT_IDS = {
    SUCCESS: 'success',
    ERROR: 'alert',
    WARNING: 'warning',
    INFO: 'info'
};

/**
 * Page routes
 */
export const ROUTES = {
    HOME: '/home',
    CREATE: '/create',
    EDIT: '/edit',
    LOGIN: '/logIn',
    SIGNUP: '/signUp',
    PROFILE: '/profile',
    FAVORITES: '/favorites'
};

export default {
    VALIDATION,
    ALERT_TIMING,
    SESSION,
    API,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    HTTP_STATUS,
    ALERT_IDS,
    ROUTES
};
