import { useEffect, useRef } from "react";
import * as Tone from "tone";

type Attractor = { x: number; y: number; z: number };
const sigma = 10, rho = 28, beta = 8 / 3, dt = 0.01;

export function useLorenzAttractor(count: number) {
  const attractorRef = useRef<Attractor[]>(
    Array.from({ length: count }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
    }))
  );

  const synths = useRef<Tone.Oscillator[]>([]);

  useEffect(() => {
    synths.current = attractorRef.current.map(() => {
      const panVol = new Tone.PanVol().toDestination();
      const osc = new Tone.Oscillator({ frequency: 440, type: "sine" }).connect(panVol);
      return osc;
    });

    return () => synths.current.forEach((osc) => osc.dispose());
  }, []);

  const update = () => {
    attractorRef.current.forEach((a, i) => {
      const dx = sigma * (a.y - a.x);
      const dy = a.x * (rho - a.z) - a.y;
      const dz = a.x * a.y - beta * a.z;
      a.x += dx * dt;
      a.y += dy * dt;
      a.z += dz * dt;

      const freq = 220 + ((a.x + 30) / 60) * 660;
      const pan = Math.max(-1, Math.min(1, a.y / 30));

      const synth = synths.current[i];
      if (synth) {
        synth.frequency.value = freq;
        if ((synth as any).pan) {
          (synth as any).pan.value = pan;
        }
      }
    });
  };

  const startOscillators = () => {
    synths.current.forEach((osc) => {
      if (!osc.state || osc.state !== "started") {
        osc.start();
      }
    });
  };

  return { attractors: attractorRef.current, update, startOscillators };
}