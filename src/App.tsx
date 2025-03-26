import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useLorenzAttractor } from "./audio/useLorenzAttractor";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);

  const { attractors, update, startOscillators } = useLorenzAttractor(3); // Three attractors for CMY

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["cyan", "magenta", "yellow"];

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      update(); // mutate attractors in place

      attractors.forEach((a, i) => {
        const x = ((a.x + 30) / 60) * canvas.width;
        const y = (a.z / 50) * canvas.height;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = colors[i];
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    if (started) {
      setTimeout(() => {
        draw();
      }, 100);
    }
  }, [started]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>
      {!started && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            backgroundColor: 'black',
            color: 'white',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Lorenz Synth</h1>
          <button
            onClick={async () => {
              await Tone.start();
              startOscillators();
              setStarted(true);
            }}
            style={{
              padding: '1rem 2rem',
              fontSize: '1rem',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Tap to Start Audio
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
