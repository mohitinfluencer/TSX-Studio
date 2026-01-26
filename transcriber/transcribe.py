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
import argparse
import re
from faster_whisper import WhisperModel

# Optional dependency for transliteration
try:
    from aksharamukha import transliterate
except ImportError:
    transliterate = None

def has_arabic_script(text):
    """Check if the text contains characters from the Arabic block (Urdu/Persian/Arabic)."""
    return bool(re.search(r'[\u0600-\u06FF]', text))

def transcribe(input_path: str, model_size: str, output_path: str, language: str = None, initial_prompt: str = None, target_script: str = "Auto"):
    """
    Transcribe audio/video file and save timestamped JSON.
    """
    if not os.path.exists(input_path):
        print(json.dumps({"error": f"File not found: {input_path}"}))
        sys.exit(1)

    try:
        # Detect Hardware for maximum speed
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        # int8 is best for CPU, float16 is best for GPU
        compute_type = "float16" if device == "cuda" else "int8"
        
        print(f"Hardware: {device.upper()} | Model: {model_size} | Compute: {compute_type}", file=sys.stderr)
        
        # Use more threads for CPU if available
        cpu_threads = os.cpu_count() or 4
        
        model = WhisperModel(
            model_size, 
            device=device, 
            compute_type=compute_type,
            cpu_threads=cpu_threads,
            num_workers=cpu_threads // 2 if device == "cpu" else 1
        )
        
        # Optimize parameters for high stability in Hindi
        transcribe_args = {
            "beam_size": 5,
            "temperature": 0.0,
            "vad_filter": True,
            "initial_prompt": initial_prompt,
            "condition_on_previous_text": False,
            "repetition_penalty": 1.25, # Higher penalty to break loops
            "no_speech_threshold": 0.6,
            "compression_ratio_threshold": 2.2, # Threshold to reject repetitive text
            "log_prob_threshold": -1.0,
        }
        
        if language:
            transcribe_args["language"] = language
            
        print(f"Transcribing: {input_path} (Language: {language}, Script: {target_script})", file=sys.stderr)
        segments, info = model.transcribe(input_path, **transcribe_args)
        
        # Build output structure
        result = {
            "language": info.language,
            "language_probability": round(info.language_probability, 3),
            "duration": round(info.duration, 2),
            "segments": []
        }
        
        segments_list = list(segments)
        
        for segment in segments_list:
            text = segment.text.strip()
            
            # Post-processing for script override (Hindi/Urdu Fix)
            if target_script in ["Hindi", "Mixed"] and has_arabic_script(text):
                if transliterate:
                    print(f"DETECTED ARABIC SCRIPT IN {target_script.upper()} MODE. TRANSLITERATING...", file=sys.stderr)
                    # Use Aksharamukha to transliterate Urdu/Arabic script to Devanagari
                    text = transliterate.process('Urdu', 'Devanagari', text)
                else:
                    print(f"WARNING: Arabic script detected in {target_script} mode but 'aksharamukha' not installed.", file=sys.stderr)

            result["segments"].append({
                "id": segment.id,
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": text
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
    parser = argparse.ArgumentParser(description="TSX Studio Transcription Service")
    parser.add_argument("input_file", help="Path to input audio/video file")
    parser.add_argument("model_size", help="Whisper model size (tiny, base, etc.)")
    parser.add_argument("output_path", help="Path to save output JSON")
    parser.add_argument("--language", help="Force transcription language", default=None)
    parser.add_argument("--prompt", help="Initial prompt for Whisper", default=None)
    parser.add_argument("--script", help="Target output script (Auto, Hindi, Urdu)", default="Auto")
    
    args = parser.parse_args()
    
    transcribe(args.input_file, args.model_size, args.output_path, args.language, args.prompt, args.script)
