export interface ClaudePreset {
    id: string;
    name: string;
    description: string;
    prompt: string;
}

export const CLAUDE_PRESETS: ClaudePreset[] = [
    {
        id: "tiktok-viral",
        name: "TikTok Viral",
        description: "Dynamic word-level highlights with bounce animations and neon glow.",
        prompt: `Create a viral TikTok-style caption animation using Remotion.
        
RULES:
1. One single TSX file only.
2. 1920x1080, 30fps.
3. Transparent background (<AbsoluteFill style={{backgroundColor: 'transparent'}}>).
4. Use the provided JSON segments for perfect timing.
5. STYLE: Large, bold, centered in the bottom third.
6. EFFECT: Highlight one word at a time as it is spoken.
7. ANIMATION: 'Bounce-in' effect for the current word.
8. COLORS: High-contrast white text with a strong black stroke and neon outer glow.

PROMPT:
I have a JSON transcript with timestamps. Convert this into a high-performance Remotion component.
The video duration is <<<DURATION>>> seconds.

JSON DATA:
<<<JSON_DATA>>>`
    },
    {
        id: "clean-subtitles",
        name: "Clean Subtitles",
        description: "Minimalist, professional subtitles with smooth transitions.",
        prompt: `Create a professional 'Clean' subtitle animation using Remotion.

RULES:
1. One single TSX file only.
2. 1920x1080, 30fps.
3. Transparent background.
4. Smooth 'Fade-in' and 'Fade-out' for each segment.
5. STYLE: Classic Sans-serif (like Inter or Roboto), bottom-center.
6. LIMIT: Max 2 lines of text at a time.
7. COLORS: Simple white with a subtle drop shadow for readability.

PROMPT:
I have a JSON transcript with timestamps. Convert this into a clean Remotion subtitle component.
The video duration is <<<DURATION>>> seconds.

JSON DATA:
<<<JSON_DATA>>>`
    },
    {
        id: "mrbeast-style",
        name: "MrBeast Style",
        description: "High-energy, high-impact captions with emphasis on key words.",
        prompt: `Create a high-energy 'MrBeast' style caption animation using Remotion.

RULES:
1. One single TSX file only.
2. 1920x1080, 30fps.
3. STYLE: Ultra-bold, slightly tilted (2-3 degrees random rotation).
4. ANIMATION: Rapid 'Pop-in' scaling effect (0.8 to 1.1 to 1.0).
5. EMPHASIS: Highlight key action words with primary colors (Yellow #FFFF00, Green #00FF00).
6. FONT: Use a heavy impact-style font.
7. NO STATIC TEXT: Every frame should feel alive.

PROMPT:
I have a JSON transcript with timestamps. Convert this into a high-impact Remotion caption component.
The video duration is <<<DURATION>>> seconds.

JSON DATA:
<<<JSON_DATA>>>`
    }
];

export function getClaudePrompt(presetId: string, jsonText: string, duration: number = 30) {
    const preset = CLAUDE_PRESETS.find(p => p.id === presetId) || CLAUDE_PRESETS[0];
    return preset.prompt
        .replace("<<<JSON_DATA>>>", jsonText || "{ \"segments\": [] }")
        .replace("<<<DURATION>>>", duration.toString());
}
