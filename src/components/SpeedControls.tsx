interface SpeedControlsProps {
  speeds: number[];
  setSpeed: (index: number, speed: number) => void;
}

// Helper functions for log scale conversion
const logToLinear = (logValue: number) => Math.exp(logValue);
const linearToLog = (value: number) => Math.log(value);

export function SpeedControls({ speeds, setSpeed }: SpeedControlsProps) {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem',
      background: 'rgba(0,0,0,0.7)',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {speeds.map((speed, i) => {
        const minLog = linearToLog(0.0001);
        const maxLog = linearToLog(0.01);
        const currentLog = linearToLog(speed);

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: 'white', minWidth: '60px' }}>
              {i === 0 ? 'Bass' : i === 1 ? 'Alto' : 'Soprano'}
            </label>
            <input
              type="range"
              min={minLog}
              max={maxLog}
              step={0.01}
              value={currentLog}
              onChange={(e) => {
                const logValue = parseFloat(e.target.value);
                setSpeed(i, logToLinear(logValue));
              }}
              style={{ width: '120px' }}
            />
            <span style={{ color: 'white', minWidth: '50px' }}>
              {speed.toFixed(5)}
            </span>
          </div>
        );
      })}
    </div>
  );
}