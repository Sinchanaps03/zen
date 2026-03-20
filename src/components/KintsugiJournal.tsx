import { motion } from "motion/react";
import { useMemo, useState } from "react";

type JournalPhase = "crack" | "repair" | "gold";

const BOWL_STYLES: Record<JournalPhase, { stroke: string; fill: string; title: string; subtitle: string }> = {
  crack: {
    stroke: "#6b7280",
    fill: "#f5f2ed",
    title: "Cracked Reflection",
    subtitle: "Name the weight clearly.",
  },
  repair: {
    stroke: "#5f6b4e",
    fill: "#f5f2ed",
    title: "Intentional Reframe",
    subtitle: "Shift from judgment to compassionate truth.",
  },
  gold: {
    stroke: "#d4a017",
    fill: "#fff8e7",
    title: "Golden Integration",
    subtitle: "Your fracture becomes your wisdom line.",
  },
};

export function KintsugiJournal() {
  const [phase, setPhase] = useState<JournalPhase>("crack");
  const [thought, setThought] = useState("");
  const [reframe, setReframe] = useState("");

  const status = useMemo(() => BOWL_STYLES[phase], [phase]);

  function handleRepair() {
    if (phase === "crack") {
      setPhase("repair");
      return;
    }
    setPhase("gold");
  }

  function handleReset() {
    setPhase("crack");
    setThought("");
    setReframe("");
  }

  return (
    <section className="py-28 px-6 bg-zen-paper" id="kintsugi">
      <div className="max-w-5xl mx-auto text-center">
        <span className="text-zen-vermilion text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Polishing The Mirror</span>
        <h2 className="serif text-4xl md:text-5xl mb-4">Kintsugi Thought Ritual</h2>
        <p className="max-w-2xl mx-auto text-zen-ink/70 mb-10">
          Write the thought that is weighing on you, then reframe it into a gentler truth. The bowl heals as your language heals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-8">
          <div className="bg-white rounded-2xl border border-zen-ink/10 p-6">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-3">Heavy Thought</label>
            <textarea
              rows={4}
              value={thought}
              onChange={(event) => setThought(event.target.value)}
              className="w-full bg-zen-paper border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-zen-vermilion/20 resize-none"
              placeholder="I feel overwhelmed because..."
            />
          </div>

          <div className="bg-white rounded-2xl border border-zen-ink/10 p-6">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block mb-3">Compassionate Reframe</label>
            <textarea
              rows={4}
              value={reframe}
              onChange={(event) => setReframe(event.target.value)}
              className="w-full bg-zen-paper border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-zen-vermilion/20 resize-none"
              placeholder="A kinder and more accurate thought is..."
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-zen-ink/10 p-8 md:p-10 mb-8">
          <motion.svg
            viewBox="0 0 360 220"
            className="w-full max-w-md mx-auto"
            initial={false}
            animate={{ scale: phase === "gold" ? 1.03 : 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.path
              d="M 40 120 Q 180 210 320 120"
              fill={status.fill}
              stroke={status.stroke}
              strokeWidth="6"
              initial={false}
              animate={{ stroke: status.stroke, fill: status.fill }}
              transition={{ duration: 0.4 }}
            />
            <motion.path
              d="M 90 125 L 140 165 L 190 130 L 240 170"
              fill="none"
              stroke={phase === "crack" ? "#6b7280" : status.stroke}
              strokeWidth={phase === "gold" ? 4 : 2}
              strokeDasharray={phase === "crack" ? "8 6" : "0"}
              initial={false}
              animate={{ stroke: phase === "crack" ? "#6b7280" : status.stroke }}
              transition={{ duration: 0.5 }}
            />
          </motion.svg>

          <p className="text-[10px] uppercase tracking-widest opacity-40 mt-4">{status.title}</p>
          <p className="text-sm text-zen-ink/60 mt-1">{status.subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={handleRepair}
            className="px-8 py-3 rounded-full bg-zen-ink text-white text-xs uppercase tracking-widest font-bold hover:bg-zen-vermilion transition-colors"
          >
            {phase === "crack" ? "Begin The Repair" : phase === "repair" ? "Seal With Gold" : "Ritual Complete"}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-full border border-zen-ink/20 text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
