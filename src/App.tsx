/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform } from "motion/react";
import { 
  Play, 
  Volume2, 
  Wind, 
  Sun, 
  Moon, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  ChevronRight,
  Music,
  Heart,
  Zap,
  Leaf
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BreatheTimer } from "./components/BreatheTimer";
import { KintsugiJournal } from "./components/KintsugiJournal";

type Instrument = {
  id: number;
  name: string;
  category: string;
  frequency_hz: number | null;
  mood: string | null;
  audio_url: string | null;
  image_url: string | null;
  description: string | null;
};

type EmotionalState = {
  key: string;
  label: string;
  fromThought: string;
  toRitual: string;
  targetFrequency: number;
};

const EMOTIONAL_STATES: EmotionalState[] = [
  {
    key: "heavy",
    label: "Heavy",
    fromThought: "I feel stuck in repetitive, heavy thoughts.",
    toRitual: "Use a cleansing resonance to release emotional weight.",
    targetFrequency: 528,
  },
  {
    key: "anxious",
    label: "Anxious",
    fromThought: "My mind is racing and I cannot settle.",
    toRitual: "Slow breathing with grounded lower harmonics.",
    targetFrequency: 432,
  },
  {
    key: "disconnected",
    label: "Disconnected",
    fromThought: "I feel disconnected from purpose and self.",
    toRitual: "Re-tune through melodic focus and gentle attention.",
    targetFrequency: 417,
  },
];

const TeamMember = ({ name, role, image }: { name: string; role: string; image: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="flex flex-col items-center space-y-4"
  >
    <div className="w-48 h-64 overflow-hidden rounded-full border border-zen-ink/10">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="text-center">
      <h3 className="serif text-2xl font-medium">{name}</h3>
      <p className="text-xs uppercase tracking-widest text-zen-ink/50">{role}</p>
    </div>
  </motion.div>
);

const GalleryItem = ({ src, alt, className = "" }: { src: string; alt: string; className?: string }) => (
  <div className={`overflow-hidden rounded-2xl border border-zen-ink/5 group ${className}`}>
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      referrerPolicy="no-referrer"
    />
  </div>
);

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [isLoadingInstruments, setIsLoadingInstruments] = useState(true);
  const [instrumentError, setInstrumentError] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("heavy");
  const [isRagaPlaying, setIsRagaPlaying] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [currentAudioLabel, setCurrentAudioLabel] = useState<string | null>(null);
  const heroRef = useRef(null);
  const ragaAudioRef = useRef<HTMLAudioElement | null>(null);
  const instrumentAudioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const selectedEmotionalState = useMemo(
    () => EMOTIONAL_STATES.find((state) => state.key === selectedEmotion) ?? EMOTIONAL_STATES[0],
    [selectedEmotion],
  );

  const recommendedInstrument = useMemo(() => {
    if (instruments.length === 0) {
      return null;
    }

    const withFrequency = instruments.filter((item) => typeof item.frequency_hz === "number");
    if (withFrequency.length === 0) {
      return instruments[0];
    }

    return withFrequency.reduce((closest, current) => {
      const currentGap = Math.abs((current.frequency_hz ?? 0) - selectedEmotionalState.targetFrequency);
      const closestGap = Math.abs((closest.frequency_hz ?? 0) - selectedEmotionalState.targetFrequency);
      return currentGap < closestGap ? current : closest;
    });
  }, [instruments, selectedEmotionalState.targetFrequency]);

  useEffect(() => {
    async function loadInstruments() {
      try {
        setIsLoadingInstruments(true);
        const response = await fetch('/api/instruments?limit=12');
        if (!response.ok) {
          throw new Error('Could not load instruments');
        }
        const data = (await response.json()) as Instrument[];
        setInstruments(data);
      } catch (error) {
        setInstrumentError('Could not connect to the Zen instrument database. Start the API and PostgreSQL containers.');
      } finally {
        setIsLoadingInstruments(false);
      }
    }

    void loadInstruments();
  }, []);

  async function handleMorningRaga() {
    if (!ragaAudioRef.current) {
      ragaAudioRef.current = new Audio("/audio/morning-raga-432hz.mp3");
      ragaAudioRef.current.loop = true;
    }

    if (isRagaPlaying) {
      ragaAudioRef.current.pause();
      setIsRagaPlaying(false);
      return;
    }

    try {
      await ragaAudioRef.current.play();
      setIsRagaPlaying(true);
    } catch {
      try {
        ragaAudioRef.current.src = "https://cdn.pixabay.com/audio/2023/10/10/audio_95a8f45044.mp3";
        await ragaAudioRef.current.play();
        setIsRagaPlaying(true);
      } catch {
        setIsRagaPlaying(false);
      }
    }
  }

  async function toggleInstrumentAudio(url: string, label: string) {
    if (!instrumentAudioRef.current) {
      instrumentAudioRef.current = new Audio(url);
    }

    const audio = instrumentAudioRef.current;

    if (currentAudioUrl === url && !audio.paused) {
      audio.pause();
      setCurrentAudioUrl(null);
      setCurrentAudioLabel(null);
      return;
    }

    try {
      audio.pause();
      audio.src = url;
      await audio.play();
      setCurrentAudioUrl(url);
      setCurrentAudioLabel(label);
    } catch {
      setCurrentAudioUrl(null);
      setCurrentAudioLabel(null);
    }
  }

  return (
    <div className="min-h-screen selection:bg-zen-vermilion selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference text-white">
        <div className="flex items-center space-x-2">
          <span className="jp text-3xl font-bold tracking-tighter">禅</span>
          <span className="serif text-2xl tracking-widest uppercase">zen</span>
        </div>
        
        <div className="hidden md:flex space-x-12 text-sm uppercase tracking-[0.2em] font-medium">
          <a href="#about" className="hover:text-zen-vermilion transition-colors">About</a>
          <a href="#frequency" className="hover:text-zen-vermilion transition-colors">Frequency</a>
          <a href="#instruments" className="hover:text-zen-vermilion transition-colors">Instruments</a>
          <a href="#gallery" className="hover:text-zen-vermilion transition-colors">Gallery</a>
          <a href="#contact" className="hover:text-zen-vermilion transition-colors">Contact</a>
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2"
        >
          <div className="w-6 h-px bg-current mb-2"></div>
          <div className="w-6 h-px bg-current"></div>
        </button>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-zen-garden-with-stones-and-sand-4029-large.mp4" type="video/mp4" />
          </video>
        </motion.div>

        <motion.div 
          style={{ opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-20 text-center text-white px-4"
        >
          <p className="jp text-xl mb-4 tracking-[0.5em] opacity-80">高周波の音</p>
          <h1 className="serif text-7xl md:text-9xl font-light mb-6 tracking-tight leading-none">
            to the frequency
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl font-light opacity-70 mb-12 leading-relaxed">
            Immerse yourself in the sacred resonance of ancient instruments and modern high-frequency soundscapes.
          </p>
          <div className="flex justify-center mb-10">
            <BreatheTimer />
          </div>
          <motion.a 
            href="#about"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-4 px-10 py-5 bg-white text-zen-ink rounded-full text-sm uppercase tracking-widest font-semibold hover:bg-zen-vermilion hover:text-white transition-all duration-500"
          >
            <span>Begin the Journey</span>
            <ChevronRight size={18} />
          </motion.a>
        </motion.div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-50">
          <div className="w-px h-16 bg-white"></div>
        </div>
      </section>

      {/* About Section - Bento Grid */}
      <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 bg-white p-12 rounded-3xl border border-zen-ink/5 flex flex-col justify-between">
            <div>
              <span className="text-zen-vermilion text-xs uppercase tracking-[0.3em] font-bold mb-6 block">Our Philosophy</span>
              <h2 className="serif text-5xl md:text-6xl font-medium mb-8 leading-tight">
                A sanctuary for the <br /> modern spirit.
              </h2>
              <p className="text-lg text-zen-ink/70 leading-relaxed max-w-2xl">
                Born in the quiet corners of a traditional yoga studio, Zen is more than a music app. It is a digital temple designed to align your internal frequency with the natural rhythms of the universe.
              </p>
            </div>
            <div className="mt-12 flex space-x-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-zen-paper rounded-full"><Wind size={20} className="text-zen-moss" /></div>
                <span className="text-sm font-medium">Breathwork</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-zen-paper rounded-full"><Sun size={20} className="text-zen-vermilion" /></div>
                <span className="text-sm font-medium">Clarity</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-zen-moss text-white p-12 rounded-3xl flex flex-col justify-center items-center text-center">
            <div className="mb-8 p-6 border border-white/20 rounded-full">
              <Volume2 size={48} strokeWidth={1} />
            </div>
            <h3 className="serif text-3xl mb-4">432Hz Tuning</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              All our tracks are natively recorded in 432Hz, the frequency of nature, to promote healing and deep relaxation.
            </p>
          </div>

          <div className="md:col-span-4 h-80 rounded-3xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1545191137-233406518458?q=80&w=1000&auto=format&fit=crop" 
              alt="Zen Garden" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="md:col-span-8 bg-zen-paper p-12 rounded-3xl border border-zen-ink/10 flex items-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              <div className="text-center">
                <div className="text-4xl serif mb-2">108</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">Sacred Tracks</div>
              </div>
              <div className="text-center">
                <div className="text-4xl serif mb-2">528</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">Healing Hz</div>
              </div>
              <div className="text-center">
                <div className="text-4xl serif mb-2">24/7</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">Live Stream</div>
              </div>
              <div className="text-center">
                <div className="text-4xl serif mb-2">∞</div>
                <div className="text-[10px] uppercase tracking-widest opacity-50">Inner Peace</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <KintsugiJournal />

      {/* Features Section */}
      <section id="frequency" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="serif text-5xl md:text-7xl mb-6">The Zen Experience</h2>
            <div className="w-24 h-px bg-zen-vermilion mx-auto mb-8"></div>
            <p className="text-zen-ink/60 max-w-2xl mx-auto italic serif text-xl">
              "When the mind is silent, the soul speaks through the frequency."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: <Music />, title: "Ancient Instruments", desc: "Rare recordings of Shakuhachi flutes, Koto harps, and Tibetan singing bowls." },
              { icon: <Zap />, title: "Binaural Beats", desc: "Scientifically engineered soundscapes to induce Alpha and Theta brainwave states." },
              { icon: <Moon />, title: "Sleep Rituals", desc: "Guided meditations and ambient textures designed for profound nocturnal rest." },
              { icon: <Leaf />, title: "Nature Synthesis", desc: "Real-time environmental sounds captured from remote Japanese forests and shrines." },
              { icon: <Heart />, title: "Heart Resonance", desc: "Focus on the 528Hz frequency to encourage cellular repair and emotional balance." },
              { icon: <Sun />, title: "Morning Ragas", desc: "Energizing high-frequency compositions to start your day with divine intention." }
            ].map((feature, i) => {
              const isMorningRagas = feature.title === "Morning Ragas";
              return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col items-center text-center group ${isMorningRagas ? "cursor-pointer" : ""}`}
                onClick={isMorningRagas ? handleMorningRaga : undefined}
                role={isMorningRagas ? "button" : undefined}
                tabIndex={isMorningRagas ? 0 : undefined}
                onKeyDown={
                  isMorningRagas
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void handleMorningRaga();
                        }
                      }
                    : undefined
                }
              >
                <div className="mb-6 p-5 rounded-2xl bg-zen-paper text-zen-ink group-hover:bg-zen-vermilion group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="serif text-2xl mb-3">{feature.title}</h3>
                <p className="text-sm text-zen-ink/60 leading-relaxed">{feature.desc}</p>
                {isMorningRagas && (
                  <p className="text-[10px] uppercase tracking-widest mt-4 text-zen-vermilion font-bold">
                    {isRagaPlaying ? "Playing 432Hz Drone" : "Click To Play 432Hz Drone"}
                  </p>
                )}
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* CBT + Ritual Transition */}
      <section id="ritual" className="py-32 px-6">
        <motion.div
          animate={{
            backgroundColor: selectedEmotion ? "#F5F2ED" : "#1A1A1A",
            color: selectedEmotion ? "#1A1A1A" : "#F5F2ED",
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto rounded-[2.5rem] p-10 md:p-14 border border-zen-ink/10"
        >
          <span className="text-zen-vermilion text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Polishing The Mirror</span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="serif text-4xl md:text-5xl mb-4">Frequency Check</h2>
              <p className="text-sm md:text-base opacity-70 leading-relaxed mb-8">
                Name the thought state first, then shift to a ritual sound recommendation from the Zen database.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {EMOTIONAL_STATES.map((state) => (
                  <button
                    key={state.key}
                    onClick={() => setSelectedEmotion(state.key)}
                    className={`px-5 py-3 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${
                      selectedEmotion === state.key
                        ? "bg-zen-vermilion text-white"
                        : "bg-white text-zen-ink border border-zen-ink/10"
                    }`}
                  >
                    {state.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  <span className="font-bold uppercase tracking-widest text-[10px] block mb-1 opacity-50">Thought Pattern</span>
                  {selectedEmotionalState.fromThought}
                </p>
                <p>
                  <span className="font-bold uppercase tracking-widest text-[10px] block mb-1 opacity-50">Ritual Shift</span>
                  {selectedEmotionalState.toRitual}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-zen-ink/10 p-8">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 mb-3">Suggested Re-Tune</p>
              {isLoadingInstruments && <p className="text-sm opacity-70">Seeking resonance...</p>}
              {!isLoadingInstruments && instrumentError && (
                <p className="text-sm text-red-700">Database offline. Start API + PostgreSQL to receive live ritual suggestions.</p>
              )}
              {!isLoadingInstruments && !instrumentError && recommendedInstrument && (
                <div>
                  <h3 className="serif text-3xl mb-2">{recommendedInstrument.name}</h3>
                  <p className="text-sm opacity-70 mb-5">{recommendedInstrument.description || "No description available."}</p>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-60 mb-6">
                    <span>{recommendedInstrument.frequency_hz ? `${recommendedInstrument.frequency_hz} Hz` : "N/A"}</span>
                    <span>{recommendedInstrument.mood || "Open"}</span>
                  </div>
                  {recommendedInstrument.audio_url ? (
                    <a
                      href={recommendedInstrument.audio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:text-zen-vermilion"
                    >
                      <Play size={14} />
                      Begin Audio Ritual
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Instruments From Database */}
      <section id="instruments" className="py-32 px-6 bg-zen-paper/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
            <div>
              <span className="text-zen-vermilion text-xs uppercase tracking-[0.3em] font-bold mb-4 block">Live SQL Data</span>
              <h2 className="serif text-5xl md:text-6xl leading-tight">Zen Instrument Library</h2>
            </div>
            <p className="text-zen-ink/60 max-w-xl">
              This section is fetched from PostgreSQL through the Express API, so each card is database-driven.
            </p>
          </div>

          {currentAudioLabel && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zen-ink/10 bg-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-zen-ink/70">
              <Play size={12} /> Now Playing: {currentAudioLabel}
            </div>
          )}

          {isLoadingInstruments && (
            <div className="text-sm uppercase tracking-widest text-zen-ink/40">Loading instruments...</div>
          )}

          {!isLoadingInstruments && instrumentError && (
            <div className="rounded-2xl border border-red-300 bg-red-50 text-red-700 px-6 py-4 text-sm">
              {instrumentError}
            </div>
          )}

          {!isLoadingInstruments && !instrumentError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instruments.map((instrument) => (
                <article key={instrument.id} className="bg-white rounded-3xl border border-zen-ink/10 overflow-hidden">
                  <div className="h-48 bg-zen-ink/5">
                    {instrument.image_url ? (
                      <img
                        src={instrument.image_url}
                        alt={instrument.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-widest text-zen-ink/40 mb-2">{instrument.category}</div>
                    <h3 className="serif text-2xl mb-2">{instrument.name}</h3>
                    <p className="text-sm text-zen-ink/60 mb-4 leading-relaxed">
                      {instrument.description || 'No description available.'}
                    </p>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zen-ink/50">
                      <span>{instrument.frequency_hz ? `${instrument.frequency_hz} Hz` : 'N/A'}</span>
                      <span>{instrument.mood || 'Open'}</span>
                    </div>
                    {instrument.audio_url ? (
                      <button
                        onClick={() => void toggleInstrumentAudio(instrument.audio_url as string, instrument.name)}
                        className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold hover:text-zen-vermilion"
                      >
                        <Play size={14} />
                        {currentAudioUrl === instrument.audio_url ? "Pause Frequency" : "Listen to Frequency"}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 px-6 bg-zen-paper">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div className="max-w-xl">
              <span className="text-zen-vermilion text-xs uppercase tracking-[0.3em] font-bold mb-4 block">The Masters</span>
              <h2 className="serif text-5xl md:text-6xl leading-tight">Curated by seekers, for seekers.</h2>
            </div>
            <p className="text-zen-ink/50 text-sm max-w-xs mt-6 md:mt-0">
              Our team consists of sound engineers, monks, and meditation practitioners dedicated to the art of listening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <TeamMember 
              name="Kenji Sato" 
              role="Sound Architect" 
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop" 
            />
            <TeamMember 
              name="Emi Tanaka" 
              role="Meditation Guide" 
              image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop" 
            />
            <TeamMember 
              name="Hiroshi Ito" 
              role="Instrumentalist" 
              image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop" 
            />
            <TeamMember 
              name="Yuki Mori" 
              role="Frequency Specialist" 
              image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop" 
            />
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section id="gallery" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]">
            <GalleryItem 
              src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop" 
              alt="Temple" 
              className="md:col-span-2 md:row-span-2"
            />
            <GalleryItem 
              src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop" 
              alt="Zen Stones" 
            />
            <GalleryItem 
              src="https://images.unsplash.com/photo-1503642551022-c011aaebcc4b?q=80&w=1000&auto=format&fit=crop" 
              alt="Bonsai" 
            />
            <GalleryItem 
              src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000&auto=format&fit=crop" 
              alt="Kyoto" 
              className="md:col-span-2"
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-zen-ink text-white rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-zen-vermilion/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-zen-moss/20 blur-[100px] rounded-full"></div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="serif text-5xl md:text-7xl mb-8">Ready to transcend?</h2>
            <p className="text-xl opacity-60 mb-12 max-w-2xl mx-auto font-light">
              Join thousands of seekers who have found their frequency. Start your 14-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="w-full sm:w-auto px-12 py-5 bg-white text-zen-ink rounded-full text-sm uppercase tracking-widest font-bold hover:bg-zen-vermilion hover:text-white transition-all duration-500">
                Download Now
              </button>
              <button className="w-full sm:w-auto px-12 py-5 border border-white/20 rounded-full text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-zen-ink transition-all duration-500">
                View Pricing
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <h2 className="serif text-5xl md:text-6xl mb-8">Let's connect in the silence.</h2>
            <p className="text-lg text-zen-ink/60 mb-12 leading-relaxed">
              Have questions about our frequencies or want to collaborate? Reach out to our sanctuary team.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-zen-paper rounded-2xl"><Mail className="text-zen-vermilion" /></div>
                <div>
                  <h4 className="font-bold mb-1">Email Us</h4>
                  <p className="text-zen-ink/50">peace@zenfrequency.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="p-4 bg-zen-paper rounded-2xl"><Instagram className="text-zen-vermilion" /></div>
                <div>
                  <h4 className="font-bold mb-1">Follow Us</h4>
                  <p className="text-zen-ink/50">@zen_frequency</p>
                </div>
              </div>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Name</label>
                <input type="text" className="w-full bg-zen-paper border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-zen-vermilion/20 transition-all" placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Email</label>
                <input type="email" className="w-full bg-zen-paper border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-zen-vermilion/20 transition-all" placeholder="Your email" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold opacity-40">Message</label>
              <textarea rows={6} className="w-full bg-zen-paper border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-zen-vermilion/20 transition-all resize-none" placeholder="How can we help you find your frequency?"></textarea>
            </div>
            <button className="w-full py-5 bg-zen-ink text-white rounded-2xl text-sm uppercase tracking-widest font-bold hover:bg-zen-vermilion transition-all duration-500">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-zen-paper border-t border-zen-ink/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <span className="jp text-4xl font-bold tracking-tighter">禅</span>
              <span className="serif text-3xl tracking-widest uppercase">zen</span>
            </div>
            
            <div className="flex space-x-8">
              <a href="#" className="p-3 bg-white rounded-full hover:text-zen-vermilion transition-all"><Twitter size={20} /></a>
              <a href="#" className="p-3 bg-white rounded-full hover:text-zen-vermilion transition-all"><Instagram size={20} /></a>
              <a href="#" className="p-3 bg-white rounded-full hover:text-zen-vermilion transition-all"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-40">Legal</h5>
              <ul className="space-y-4 text-sm opacity-60">
                <li><a href="#" className="hover:text-zen-vermilion">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Terms of Service</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-40">Support</h5>
              <ul className="space-y-4 text-sm opacity-60">
                <li><a href="#" className="hover:text-zen-vermilion">Help Center</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Community</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-40">Company</h5>
              <ul className="space-y-4 text-sm opacity-60">
                <li><a href="#" className="hover:text-zen-vermilion">Our Story</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Careers</a></li>
                <li><a href="#" className="hover:text-zen-vermilion">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] uppercase tracking-widest font-bold mb-6 opacity-40">Newsletter</h5>
              <p className="text-xs opacity-50 mb-4">Receive weekly frequencies in your inbox.</p>
              <div className="flex">
                <input type="email" className="bg-white border-none rounded-l-xl px-4 py-2 text-xs w-full" placeholder="Email" />
                <button className="bg-zen-ink text-white px-4 py-2 rounded-r-xl text-xs font-bold">Join</button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zen-ink/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-30">
            <p>© 2026 Zen Music. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Made with peace in Kyoto</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
