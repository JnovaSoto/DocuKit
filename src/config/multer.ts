/**
 * Multer configuration for file uploads.
 * Handles user profile photo uploads with validation.
 * Each user's photos are stored in their own folder: uploads/users/{userId}/
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Request } from 'express';
interface MulterRequest extends Request {
    userPhotoFolder?: string;
    isNewUser?: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensure a directory exists on the filesystem.
 * If the directory does not exist, it is created recursively.
 * @param {string} dirPath - The absolute or relative path to the directory.
 */
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// ============================================================================
// Storage Configuration
// ============================================================================

/**
 * Configure storage for uploaded user profile photos.
 * Stores each user's photos in a structured directory: uploads/users/temp_{username}/
 * or later moved to uploads/users/{userId}/.
 */
const storage = multer.diskStorage({
    destination: function (req: MulterRequest, _file, cb) {
        try {
            let username = req.body.username;

            if (!username) {
                return cb(new Error('Username is required for file upload'), "");
            }

            // Sanitize username to prevent path traversal
            username = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // For signups, always use temporary folder since user doesn't exist yet
            // We'll move the file to the user's ID folder after user creation
            const userFolder = path.join(__dirname, '../uploads/users', 'temp_' + username);

            // Create folder if it doesn't exist
            ensureDirectoryExists(userFolder);

            // Store folder info in request for later use
            req.userPhotoFolder = userFolder;
            req.isNewUser = true;

            cb(null, userFolder);
        } catch (error: any) {
            cb(error, "");
        }
    },
    filename: function (_req, file, cb) {
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
 * Express middleware filter to accept only specific image MIME types.
 * Supported types: jpeg, jpg, png, gif, webp.
 */
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allowed image types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)') as any, false);
    }
};

// ============================================================================
// Multer Instance
// ============================================================================

/**
 * Pre-configured Multer instance for handling user photo uploads.
 * Includes file size limits (5MB) and file type filtering.
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
 * Move an uploaded file from a temporary signup folder to a permanent user ID folder.
 * This should be executed after a successful user creation in the database.
 * @param {string} tempFolder - The path to the temporary folder.
 * @param {number} userId - The unique ID of the newly created user.
 * @param {string} filename - The name of the file to move.
 * @returns {string} The public URL path to the moved photo.
 */
export const movePhotoToUserFolder = (tempFolder: string, userId: number, filename: string) => {
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
