# TSX Studio: Desktop-First Local Rendering Architecture

## 1. Complete Desktop Architecture

The TSX Studio Desktop application is built using **Electron + React + Vite**, leveraging a **Local-First Rendering Engine**.

### High-Level Flow

1. **Frontend (Renderer Process)**: A polished React UI handles user interaction, project browsing, and rendering orchestration.
2. **Main process (Node.js)**: Handles filesystem access, IPC communication, and spawns the rendering pipeline.
3. **Local Engine**:
   - **Remotion Pipeline**: Bundles TSX code into a browser-executable bundle and renders frames via Headless Chromium.
   - **FFmpeg Sidecar**: Encodes raw frames into high-quality MP4/MOV files using local hardware acceleration (NVIDIA/AMD/Intel).
   - **Whisper Node**: Local transcription using `whisper.cpp` for instant captions without server costs.

## 2. Rendering Engine Implementation Plan

| Phase | Task | Description |
|---|---|---|
| **Phase 1** | **Bundle Extraction** | Fetch project code from `/api/bundle/[id]` and mount it to a local temporary directory. |
| **Phase 2** | **Remotion Bootstrapping** | Programmatically generate a `root.tsx` to wrap the user's composition. |
| **Phase 3** | **Hardware Accelerated Render** | Execute `@remotion/renderer` using `ffmpeg-static` with hardware flags enabled. |
| **Phase 4** | **Artifact Management** | Save the final MP4 to `~/Videos/TSX-Studio` and optionally sync metadata back to the cloud. |

## 3. Secure Auth Token Flow

1. **Trigger**: User clicks "Connect Cloud" in the Desktop App.
2. **Challenge**: App opens a secure browser window to `tsx-studio.com/api/auth/desktop`.
3. **Identity**: User authenticates via existing NextAuth providers (Google, GitHub, etc.).
4. **Exchange**: Cloud generates a scoped JWT and redirects to `tsx-studio://auth?token={JWT}`.
5. **Storage**: Electron captures the deep link and stores the token in the **OS-level Keychain** (macOS) or **Credential Manager** (Windows).
6. **Authorization**: All subsequent API calls include the Bearer token in headers.

## 4. Build & Packaging Strategy

- **Compiler**: Vite + TypeScript for the renderer; TSC for the Main process.
- **Packager**: `electron-builder` for cross-platform binaries.
- **Artifacts**:
  - **Windows**: `.exe` (NSIS Installer) + `.msi`.
  - **macOS**: `.dmg` + `.app` (Universal Apple Silicon/Intel).
  - **Linux**: `.AppImage` + `.deb`.
- **Auto-Updates**: Integrated via GitHub Releases or Vercel.

## 5. Migration: CLI → Desktop App

1. **Logic Reuse**: The core rendering logic from `cli/src/index.ts` has been ported to `desktop/engine/render.ts`.
2. **UI Abstraction**: Replaced `ora` spinners and `chalk` logs with a real-time React Progress Bar and Log Console.
3. **Environment**: Moved from `process.cwd()` to `app.getPath('userData')` for consistent cross-platform storage.
4. **Command Trigger**: Instead of `tsx-studio render [id]`, the UI triggers an IPC call to the same underlying Node.js service.

## 6. Production-Ready Best Practices

- **Error Handling**: Implement human-readable error mapping (e.g., "GPU Memory Full" instead of "Error Code 0x821").
- **Sidecars**: Bundle FFmpeg as a static binary to ensure zero-dependency installation.
- **Performance**: Use `child_process.spawn` for rendering to keep the UI thread responsive.
- **Security**: Never expose the `DATABASE_URL` or AWS secrets to the client; all S3 uploads use **Pre-signed URLs** requested from the API.
