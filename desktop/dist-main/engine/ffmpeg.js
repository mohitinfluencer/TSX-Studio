"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFFmpegPath = getFFmpegPath;
exports.getFFprobePath = getFFprobePath;
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const ffprobe_static_1 = __importDefault(require("ffprobe-static"));
function getFFmpegPath() {
    if (process.env.NODE_ENV === 'development') {
        return ffmpeg_static_1.default;
    }
    // In production (Electron packed), we need to handle the path correctly
    // This depends on how electron-builder bundles the static bin
    return ffmpeg_static_1.default;
}
function getFFprobePath() {
    return ffprobe_static_1.default.path;
}
//# sourceMappingURL=ffmpeg.js.map