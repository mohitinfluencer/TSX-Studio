# TSX Studio

A high-performance, web-based animation studio powered by Remotion. **Status: All things are working!**

## Features

- **Web-Based Editor**: Monaco editor with TSX syntax highlighting.
- **Live Preview**: Real-time iframe preview scaling to any aspect ratio.
- **Cloud/Local Rendering**: Uses Remotion to render real MP4/MOV files.
- **Project Versioning**: Save unlimited versions of your work.
- **Marketplace**: Share and download templates.

## Prerequisites

- **Node.js**: v18+
- **Database**: PostgreSQL (Neon).
- **FFmpeg**: Required for rendering videos.
  - The project attempts to use `ffmpeg-static` automatically.
  - If you encounter issues, install FFmpeg system-wide:
    - **Windows**: `winget install ffmpeg` or download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.
    - **Mac**: `brew install ffmpeg`
    - **Linux**: `sudo apt install ffmpeg`

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Setup Database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open Studio**
   Visit `http://localhost:3000`.

## Architecture

- **Frontend**: Next.js 15, TailwindCSS, Shadcn UI.
- **Backend**: Next.js API Routes, Remotion Bundler/Renderer.
- **Storage**: Local filesystem for dev (`public/exports`), S3 for production.

## Transcriber Setup

The transcriber uses Python's [faster-whisper](https://github.com/SYSTRAN/faster-whisper) for local audio/video transcription.

### Requirements

- Python 3.10+
- FFmpeg (for audio extraction from video)

### Installation

```bash
cd transcriber
pip install -r requirements.txt
```

### First Run

The first transcription downloads the Whisper model (~75MB to 1.5GB depending on selection).

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| tiny | ~75MB | Fastest | Basic |
| base | ~150MB | Fast | Good |
| small | ~500MB | Medium | Better |
| medium | ~1.5GB | Slow | Best |

## Troubleshooting

- **"FFmpeg not found"**: Ensure `ffmpeg-static` is installed or system FFmpeg is in PATH.
- **"Render Failed"**: Check server console logs for detailed Remotion error output.
- **"Transcription Failed"**: Ensure Python is installed and faster-whisper is set up correctly.
