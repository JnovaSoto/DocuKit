/**
 * Theme Switcher - Dynamically changes CSS variables for different themes
 * Supports both color themes (HTML/CSS) and dark mode
 */

import logger from './logger.js';

let currentTheme = 'html'; // Default theme (html or css)
let isDarkMode = false; // Default dark mode state

/**
 * Theme configurations for light mode
 */
const lightThemes = {
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
        '--shadow-primary-strong': 'rgba(204, 163, 30, 0.3)',
        '--color-bg-primary': '#ffffff',
        '--color-bg-secondary': '#f8f9fa',
        '--color-text-primary': '#333',
        '--color-text-secondary': '#555',
        '--color-border': '#ddd'
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
        '--shadow-primary-strong': 'rgba(28, 126, 214, 0.3)',
        '--color-bg-primary': '#ffffff',
        '--color-bg-secondary': '#f8f9fa',
        '--color-text-primary': '#333',
        '--color-text-secondary': '#555',
        '--color-border': '#ddd'
    }
};

/**
 * Dark mode theme configurations
 */
const darkThemes = {
    html: {
        // HTML theme in dark mode (Even darker amber-gold)
        '--color-primary': '#c2942d',
        '--color-primary-dark': '#a37a23',
        '--color-primary-light': '#d4a843',
        '--color-primary-lighter': '#e0b855',
        '--color-primary-gradient': '#a37a23',
        '--color-secondary': '#8f7635',
        '--bg-hover': '#24201a',
        '--shadow-primary': 'rgba(194, 148, 45, 0.2)',
        '--shadow-primary-strong': 'rgba(194, 148, 45, 0.3)',
        '--color-bg-primary': '#1a1a1a',
        '--color-bg-secondary': '#242424',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#cccccc',
        '--color-border': '#404040'
    },
    css: {
        // CSS theme in dark mode (Even darker ocean blue)
        '--color-primary': '#2a75bb',
        '--color-primary-dark': '#20609a',
        '--color-primary-light': '#3a8fd9',
        '--color-primary-lighter': '#5ba3e0',
        '--color-primary-gradient': '#20609a',
        '--color-secondary': '#4a65a3',
        '--bg-hover': '#161d26',
        '--shadow-primary': 'rgba(42, 117, 187, 0.2)',
        '--shadow-primary-strong': 'rgba(42, 117, 187, 0.3)',
        '--color-bg-primary': '#1a1a1a',
        '--color-bg-secondary': '#242424',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#cccccc',
        '--color-border': '#404040'
    }
};

/**
 * Applies a theme by updating CSS variables
 * @param {string} themeName - Name of the theme to apply ('html' or 'css')
 * @param {boolean} dark - Whether to apply dark mode
 */
export function applyTheme(themeName, dark = isDarkMode) {
    const themes = dark ? darkThemes : lightThemes;

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

    // Update body class for dark mode
    if (dark) {
        root.classList.add('dark-mode');
    } else {
        root.classList.remove('dark-mode');
    }

    currentTheme = themeName;
    isDarkMode = dark;
    logger.success(`Theme switched to: ${themeName} ${dark ? '(Dark)' : '(Light)'}`);

    // Store preferences in localStorage
    localStorage.setItem('preferredTheme', themeName);
    localStorage.setItem('darkMode', dark.toString());
}

/**
 * Gets the current theme
 * @returns {string} Current theme name
 */
export function getCurrentTheme() {
    return currentTheme;
}

/**
 * Gets the current dark mode state
 * @returns {boolean} Whether dark mode is enabled
 */
export function getDarkMode() {
    return isDarkMode;
}

/**
 * Toggles dark mode on/off
 */
export function toggleDarkMode() {
    applyTheme(currentTheme, !isDarkMode);
    logger.info(`Dark mode ${!isDarkMode ? 'enabled' : 'disabled'}`);
}

/**
 * Initializes the theme system
 * Loads saved theme preference or defaults to 'html' light mode
 * Also checks system preference for dark mode if no saved preference
 */
export function initTheme() {
    const savedTheme = localStorage.getItem('preferredTheme') || 'html';
    const savedDarkMode = localStorage.getItem('darkMode');

    // If no saved dark mode preference, check system preference
    let useDarkMode = false;
    if (savedDarkMode !== null) {
        useDarkMode = savedDarkMode === 'true';
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        useDarkMode = true;
    }

    applyTheme(savedTheme, useDarkMode);
    logger.info(`Theme initialized: ${savedTheme} ${useDarkMode ? '(Dark)' : '(Light)'}`);

    // Listen for system dark mode changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only auto-switch if user hasn't set a preference
            if (localStorage.getItem('darkMode') === null) {
                applyTheme(currentTheme, e.matches);
            }
        });
    }
}

/**
 * Toggles between HTML and CSS themes (maintains dark mode state)
 */
export function toggleTheme() {
    const newTheme = currentTheme === 'html' ? 'css' : 'html';
    applyTheme(newTheme, isDarkMode);
}
