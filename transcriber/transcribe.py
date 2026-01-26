#!/usr/bin/env python3
"""
TSX Studio Transcription Service
Uses faster-whisper for local audio/video transcription.

Usage:
    python transcribe.py <input_file> <model_size> <output_json_path>

Models: tiny, base, small, medium, large-v2
"""

import sys
import json
import os
from faster_whisper import WhisperModel

def transcribe(input_path: str, model_size: str, output_path: str):
    """
    Transcribe audio/video file and save timestamped JSON.
    """
    if not os.path.exists(input_path):
        print(json.dumps({"error": f"File not found: {input_path}"}))
        sys.exit(1)

    try:
        # Use CPU by default, GPU if available
        device = "cpu"
        compute_type = "int8"
        
        print(f"Loading model: {model_size}", file=sys.stderr)
        model = WhisperModel(model_size, device=device, compute_type=compute_type)
        
        print(f"Transcribing: {input_path}", file=sys.stderr)
        segments, info = model.transcribe(input_path, beam_size=5)
        
        # Build output structure
        result = {
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
            "segments": []
        }
        
        for segment in segments:
            result["segments"].append({
                "id": segment.id,
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })
            # Progress indicator
            progress = min(100, int((segment.end / info.duration) * 100))
            print(f"PROGRESS:{progress}", file=sys.stderr)
        
        # Write output JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(json.dumps({"success": True, "output": output_path}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({"error": "Usage: transcribe.py <input_file> <model_size> <output_path>"}))
        sys.exit(1)
    
    input_file = sys.argv[1]
    model_size = sys.argv[2]
    output_file = sys.argv[3]
    
    transcribe(input_file, model_size, output_file)
