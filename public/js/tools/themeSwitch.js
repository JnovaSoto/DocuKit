/**
 * Theme Switcher - Dynamically changes CSS variables for different themes
 */

import logger from './logger.js';

let currentTheme = 'html'; // Default theme

/**
 * Theme configurations
 */
const themes = {
    html: {
        // Original HTML theme (yellow/gold)
        '--color-primary': '#cca31e',
        '--color-primary-dark': '#b38f1a',
        '--color-primary-light': '#cea520',
        '--color-primary-lighter': '#eeca54',
        '--color-primary-gradient': '#d68306',
        '--color-secondary': '#9b884a',
        '--bg-hover': '#fff9e6',
        '--shadow-primary': 'rgba(204, 163, 30, 0.2)',
        '--shadow-primary-strong': 'rgba(204, 163, 30, 0.3)'
    },
    css: {
        // CSS theme (blue)
        '--color-primary': '#1c7ed6',
        '--color-primary-dark': '#1864ab',
        '--color-primary-light': '#4dabf7',
        '--color-primary-lighter': '#74c0fc',
        '--color-primary-gradient': '#1971c2',
        '--color-secondary': '#4c6ef5',
        '--bg-hover': '#e7f5ff',
        '--shadow-primary': 'rgba(28, 126, 214, 0.2)',
        '--shadow-primary-strong': 'rgba(28, 126, 214, 0.3)'
    }
};

/**
 * Applies a theme by updating CSS variables
 * @param {string} themeName - Name of the theme to apply ('html' or 'css')
 */
export function applyTheme(themeName) {
    if (!themes[themeName]) {
        logger.error(`Theme "${themeName}" not found`);
        return;
    }

    const theme = themes[themeName];
    const root = document.documentElement;

    // Apply each CSS variable
    Object.entries(theme).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });

    currentTheme = themeName;
    logger.success(`Theme switched to: ${themeName}`);

    // Store theme preference in localStorage
    localStorage.setItem('preferredTheme', themeName);
}

/**
 * Gets the current theme
 * @returns {string} Current theme name
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Initializes the theme system
 * Loads saved theme preference or defaults to 'html'
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('preferredTheme') || 'html';
    applyTheme(savedTheme);
    logger.info(`Theme initialized: ${savedTheme}`);
}

/**
 * Toggles between HTML and CSS themes
 */
export function toggleTheme() {
    const newTheme = currentTheme === 'html' ? 'css' : 'html';
    applyTheme(newTheme);
}
