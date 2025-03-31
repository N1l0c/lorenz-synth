import { useEffect, useRef, useState, useCallback } from "react";
import * as Tone from "tone";

type Attractor = { x: number; y: number; z: number; speed: number };
const sigma = 10, rho = 28, beta = 8 / 3;

// Helper function for random starting positions
function getRandomPosition() {
  return {
    x: Math.random() * 40 - 20, // range: -20 to 20
    y: Math.random() * 40 - 20,
    z: Math.random() * 40 - 20,
    speed: 0.002 // new default speed
  };
}

function getQuantizedFreq(x: number, voice: 'bass' | 'alto' | 'soprano') {
  const scale = [0, 2, 3, 5, 7, 8, 11]; // Harmonic minor or Dorian feel
  const base = voice === 'bass' ? 36 : voice === 'alto' ? 48 : 60; // MIDI: C2, C3, C4
  const pos = Math.floor(((x + 30) / 60) * scale.length);
  const midi = base + scale[pos % scale.length];
  return Tone.Frequency(midi, "midi").toFrequency();
}

export function useLorenzAttractor(count: number) {
  const attractorRef = useRef<Attractor[]>(
    Array.from({ length: count }, () => getRandomPosition())
  );

  const [speeds, setSpeeds] = useState<number[]>(Array(count).fill(0.002));
  const synths = useRef<Tone.Oscillator[]>([]);
  const speedsRef = useRef(speeds);  // Add ref to track speeds

  // Keep speedsRef in sync with speeds state
  useEffect(() => {
    speedsRef.current = speeds;
    attractorRef.current.forEach((attractor, index) => {
      attractor.speed = speeds[index];
    });
  }, [speeds]);

  useEffect(() => {
    synths.current = attractorRef.current.map(() => {
      const panVol = new Tone.PanVol().toDestination();
      const osc = new Tone.Oscillator({ frequency: 440, type: "sine" }).connect(panVol);
      return osc;
    });

    return () => synths.current.forEach((osc) => osc.dispose());
  }, []);

  const update = useCallback(() => {
    attractorRef.current.forEach((a, i) => {
      const dx = sigma * (a.y - a.x);
      const dy = a.x * (rho - a.z) - a.y;
      const dz = a.x * a.y - beta * a.z;
      
      // Use current speed from ref
      const speed = speedsRef.current[i];
      a.x += dx * speed;
      a.y += dy * speed;
      a.z += dz * speed;

      const voice: 'bass' | 'alto' | 'soprano' = i === 0 ? 'bass' : i === 1 ? 'alto' : 'soprano';
      const freq = getQuantizedFreq(a.x, voice);
      const pan = Math.max(-1, Math.min(1, a.y / 30));

      const synth = synths.current[i];
      if (synth) {
        synth.frequency.value = freq;
        if ((synth as any).pan) {
          (synth as any).pan.value = pan;
        }
      }
    });
  }, []);  // Empty deps array since we're using refs

  const startOscillators = () => {
    synths.current.forEach((osc) => {
      if (!osc.state || osc.state !== "started") {
        osc.start();
      }
    });
  };

  const setSpeed = useCallback((index: number, speed: number) => {
    const newSpeeds = [...speedsRef.current];
    newSpeeds[index] = speed;
    setSpeeds(newSpeeds);
  }, []);

  return { 
    attractors: attractorRef.current, 
    update, 
    startOscillators,
    speeds,
    setSpeed 
  };
}