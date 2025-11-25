/**
 * Centralized logging utility for the application.
 * Provides consistent logging with emoji prefixes and environment-aware behavior.
 * 
 * In development mode: Shows all logs with formatting
 * In production mode: Silent or minimal logging
 */

const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

/**
 * Log levels with corresponding emoji prefixes
 */
const LOG_LEVELS = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
    DEBUG: '🔍',
    NETWORK: '🌐',
    USER: '👤',
    TAG: '🏷️',
    AUTH: '🔐',
    FORM: '📋',
    NAVIGATION: '🧭',
    CREATE: '🔨',
    EDIT: '👷‍♂️',
    DELETE: '🗑️',
    ALERT: '🚩'
};

/**
 * Logs an informational message
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function info(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.INFO} ${message}`, data) : console.log(`${LOG_LEVELS.INFO} ${message}`);
    }
}

/**
 * Logs a success message
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function success(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.SUCCESS} ${message}`, data) : console.log(`${LOG_LEVELS.SUCCESS} ${message}`);
    }
}

/**
 * Logs a warning message
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function warn(message, data) {
    if (isDevelopment) {
        data ? console.warn(`${LOG_LEVELS.WARNING} ${message}`, data) : console.warn(`${LOG_LEVELS.WARNING} ${message}`);
    }
}

/**
 * Logs an error message (always shown, even in production)
 * @param {string} message - The message to log
 * @param {*} [error] - Optional error object to log
 */
export function error(message, error) {
    // Always log errors, even in production
    error ? console.error(`${LOG_LEVELS.ERROR} ${message}`, error) : console.error(`${LOG_LEVELS.ERROR} ${message}`);
}

/**
 * Logs a debug message (development only)
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function debug(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.DEBUG} ${message}`, data) : console.log(`${LOG_LEVELS.DEBUG} ${message}`);
    }
}

/**
 * Logs a network-related message
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function network(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.NETWORK} ${message}`, data) : console.log(`${LOG_LEVELS.NETWORK} ${message}`);
    }
}

/**
 * Logs a user-related action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function user(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.USER} ${message}`, data) : console.log(`${LOG_LEVELS.USER} ${message}`);
    }
}

/**
 * Logs a tag-related action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function tag(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.TAG} ${message}`, data) : console.log(`${LOG_LEVELS.TAG} ${message}`);
    }
}

/**
 * Logs an authentication-related action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function auth(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.AUTH} ${message}`, data) : console.log(`${LOG_LEVELS.AUTH} ${message}`);
    }
}

/**
 * Logs a form-related action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function form(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.FORM} ${message}`, data) : console.log(`${LOG_LEVELS.FORM} ${message}`);
    }
}

/**
 * Logs a navigation action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function navigation(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.NAVIGATION} ${message}`, data) : console.log(`${LOG_LEVELS.NAVIGATION} ${message}`);
    }
}

/**
 * Logs a create action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function create(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.CREATE} ${message}`, data) : console.log(`${LOG_LEVELS.CREATE} ${message}`);
    }
}

/**
 * Logs an edit action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function edit(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.EDIT} ${message}`, data) : console.log(`${LOG_LEVELS.EDIT} ${message}`);
    }
}

/**
 * Logs a delete action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function deleteLog(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.DELETE} ${message}`, data) : console.log(`${LOG_LEVELS.DELETE} ${message}`);
    }
}

/**
 * Logs an alert-related action
 * @param {string} message - The message to log
 * @param {*} [data] - Optional data to log
 */
export function alert(message, data) {
    if (isDevelopment) {
        data ? console.log(`${LOG_LEVELS.ALERT} ${message}`, data) : console.log(`${LOG_LEVELS.ALERT} ${message}`);
    }
}

// Export a default logger object with all methods
export default {
    info,
    success,
    warn,
    error,
    debug,
    network,
    user,
    tag,
    auth,
    form,
    navigation,
    create,
    edit,
    delete: deleteLog,
    alert
};
