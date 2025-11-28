/**
 * Multer configuration for file uploads.
 * Handles user profile photo uploads with validation.
 * Each user's photos are stored in their own folder: uploads/users/{userId}/
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to create
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// ============================================================================
// Storage Configuration
// ============================================================================

/**
 * Configure storage for uploaded files
 * Stores each user's photos in their own folder: uploads/users/{userId}/
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            const username = req.body.username;

            if (!username) {
                return cb(new Error('Username is required for file upload'));
            }

            // For signups, always use temporary folder since user doesn't exist yet
            // We'll move the file to the user's ID folder after user creation
            const userFolder = path.join(__dirname, '../uploads/users', 'temp_' + username);

            // Create folder if it doesn't exist
            ensureDirectoryExists(userFolder);

            // Store folder info in request for later use
            req.userPhotoFolder = userFolder;
            req.isNewUser = true;

            cb(null, userFolder);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        // Generate filename: profile_timestamp.extension
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `profile_${timestamp}${ext}`);
    }
});

// ============================================================================
// File Filter
// ============================================================================

/**
 * Filter to accept only image files
 */
const fileFilter = (req, file, cb) => {
    // Allowed image types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// ============================================================================
// Multer Instance
// ============================================================================

/**
 * Multer upload instance with configuration
 */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

// ============================================================================
// Helper to move temp folder to user ID folder
// ============================================================================

/**
 * Move uploaded file from temp folder to user ID folder
 * Call this after user is created in database
 * @param {string} tempFolder - Temporary folder path
 * @param {number} userId - New user's ID
 * @param {string} filename - Uploaded filename
 * @returns {string} New file path
 */
export const movePhotoToUserFolder = (tempFolder, userId, filename) => {
    const userFolder = path.join(__dirname, '../uploads/users', userId.toString());
    ensureDirectoryExists(userFolder);

    const oldPath = path.join(tempFolder, filename);
    const newPath = path.join(userFolder, filename);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        // Remove temp folder if empty
        try {
            fs.rmdirSync(tempFolder);
        } catch (err) {
            // Folder not empty or doesn't exist, ignore
        }
    }

    return `/uploads/users/${userId}/${filename}`;
};

export default upload;
