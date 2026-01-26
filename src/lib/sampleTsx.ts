export const SAMPLE_TSX = `import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export default function IntroAnimation() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance animations
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale = spring({
    frame,
    fps,
    config: { stiffness: 100 },
  });

  const subtitleY = interpolate(frame, [15, 35], [50, 0], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: 'transparent', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica'
    }}>
      {/* Glow Effect */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        filter: 'blur(100px)',
        transform: \`scale(\${1 + Math.sin(frame / 10) * 0.1})\`
      }} />

      <div style={{ 
        textAlign: 'center', 
        transform: \`scale(\${titleScale})\`,
        opacity: titleOpacity 
      }}>
        <h1 style={{ 
          fontSize: 120, 
          fontWeight: 900, 
          margin: 0,
          background: 'linear-gradient(to right, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.05em',
          fontStyle: 'italic'
        }}>
          TSX STUDIO
        </h1>
        
        <div style={{ 
          marginTop: 20,
          transform: \`translateY(\${subtitleY}px)\`,
          opacity: subtitleOpacity
        }}>
          <p style={{ 
            fontSize: 32, 
            color: 'white', 
            fontWeight: 500,
            letterSpacing: '0.2em',
            margin: 0,
            textShadow: '0 0 20px rgba(255,255,255,0.3)'
          }}>
            REMOTION POWERED
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
}
`;
