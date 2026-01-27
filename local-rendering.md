# 🚀 Local Rendering Guide

TSX Studio uses a **Hybrid Local-First Architecture**. While you design in the cloud, the heavy lifting of video rendering (Remotion) and audio transcription (Whisper) happens on your own hardware.

## Why Local Rendering?

1. **Unlimited Duration**: Cloud serverless functions are limited to 30-60 seconds. Local rendering allows for hours of content.
2. **GPU Acceleration**: Utilize your local NVIDIA/Apple Silicon GPU for significantly faster renders.
3. **Data Privacy**: Your RAW project code stays in RAM and is only rendered to disk on your machine.
4. **Cost Efficient**: No cloud rendering fees or complex credit systems.

## 🛠 Prerequisites

- **Node.js**: Version 20 or higher.
- **FFmpeg**: Required by Remotion for video encoding.
- **Python** (Optional): Only if performing local transcribing.

## 🏃 Getting Started

### 1. Install the CLI

Open your terminal and run:
\`\`\`bash
npm install -g @tsx-studio/cli
\`\`\`

### 2. Authenticate

Get your secret from your TSX Studio Account Settings and run:
\`\`\`bash
tsx-studio auth YOUR_SECRET_HERE
\`\`\`

### 3. Render a Project

Find your Project ID in the URL or the Export Dialog, then run:
\`\`\`bash
tsx-studio render PROJECT_ID
\`\`\`
By default, this will save \`output.mp4\` to your current directory.

### 4. Sync Back to Cloud (Optional)

If you want to view your render in the TSX Studio web dashboard:
\`\`\`bash
tsx-studio sync output.mp4 PROJECT_ID
\`\`\`

## 🔌 Troubleshooting

### FFmpeg not found

Ensure \`ffmpeg\` is in your system PATH.

- **macOS**: \`brew install ffmpeg\`
- **Windows**: \`choco install ffmpeg\` or download from ffmpeg.org

### Remotion Bundle Error

If bundling fails, ensure your project code doesn't have syntax errors. The CLI provides detailed logs.
