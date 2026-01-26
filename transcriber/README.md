# TSX Studio Transcriber

Local audio/video transcription service using [faster-whisper](https://github.com/SYSTRAN/faster-whisper).

## Requirements

- Python 3.10+
- ffmpeg (for audio extraction from video)

## Installation

```bash
# Navigate to transcriber folder
cd transcriber

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

## First Run

The first transcription will download the Whisper model:

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| tiny | ~75MB | Fastest | Basic |
| base | ~150MB | Fast | Good |
| small | ~500MB | Medium | Better |
| medium | ~1.5GB | Slow | Best |

## Usage

```bash
python transcribe.py input.mp3 base output.json
```

## Output Format

```json
{
  "language": "en",
  "language_probability": 0.98,
  "duration": 125.4,
  "segments": [
    { "id": 0, "start": 0.0, "end": 2.1, "text": "Hello world" }
  ]
}
```

## Troubleshooting

### FFmpeg not found

Install ffmpeg and add to PATH:

- Windows: `choco install ffmpeg` or download from <https://ffmpeg.org>
- Linux: `sudo apt install ffmpeg`
- Mac: `brew install ffmpeg`

### CUDA/GPU Support

For GPU acceleration, install CUDA toolkit and use:

```bash
pip install faster-whisper[cuda]
```
