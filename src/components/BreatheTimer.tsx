import { useEffect, useState } from "react";

export function BreatheTimer() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  function startTimer() {
    if (secondsLeft === 0) {
      setSecondsLeft(60);
    }
    setIsRunning(true);
  }

  function resetTimer() {
    setIsRunning(false);
    setSecondsLeft(60);
  }

  return (
    <div className="bg-white/95 text-zen-ink rounded-2xl border border-zen-ink/10 p-4 min-w-[220px] shadow-sm backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-widest font-bold text-zen-ink/45 mb-2">Zazen Breathe</p>
      <p className="serif text-2xl text-zen-ink mb-3">{secondsLeft}s</p>
      <div className="flex gap-2">
        <button
          onClick={startTimer}
          className="px-3 py-2 rounded-lg bg-zen-ink text-white text-[10px] uppercase tracking-widest font-bold hover:bg-zen-vermilion transition-colors"
        >
          {isRunning ? "Running" : "Start"}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-2 rounded-lg border border-zen-ink/20 text-zen-ink text-[10px] uppercase tracking-widest font-bold"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
