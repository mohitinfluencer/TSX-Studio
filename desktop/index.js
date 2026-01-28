const { app } = require('electron');
const path = require('path');

/**
 * ENTRY POINT FOR TSX STUDIO DESKTOP
 * This file handles production vs development PIVOTING.
 * In production, it only runs compiled JavaScript.
 */

const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

if (isDev) {
    // Development: Run TypeScript directly
    require('tsx/cjs');
    require('./main.ts');
} else {
    // Production: Run compiled JavaScript only
    // This removes all 'tsx' and 'typescript' dependencies from runtime
    const mainPath = path.join(__dirname, 'dist-main', 'main.js');
    require(mainPath);
}
