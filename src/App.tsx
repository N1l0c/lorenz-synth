// src/App.tsx
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useLorenzAttractor } from "./audio/useLorenzAttractor";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { attractors, update } = useLorenzAttractor(3); // Three attractors for CMY

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
        // Something broken here, applying blur fills entire scren with yellow-green haze
       // ctx.shadowColor = colors[i];
       // ctx.shadowBlur = 10;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    };

    setTimeout(() => {
      draw();
    }, 100);
  }, []);

  return (
    <>
      <button
        onClick={() => Tone.start()}
        className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded z-10"
      >
        Start Audio
      </button>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </>
  );
}
