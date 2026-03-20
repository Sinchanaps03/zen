CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  frequency_hz INTEGER,
  mood VARCHAR(80),
  audio_url TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO instruments (name, category, frequency_hz, mood, audio_url, image_url, description)
VALUES
  (
    'Shakuhachi',
    'Flute',
    432,
    'Calm',
    '/audio/shakuhachi-432hz.mp3',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    'Traditional bamboo flute with breath-led overtones and spacious harmonics.'
  ),
  (
    'Tibetan Singing Bowl',
    'Resonant',
    528,
    'Healing',
    '/audio/tibetan-bowl-528hz.mp3',
    'https://images.unsplash.com/photo-1512418490979-92798cec7de5?q=80&w=1200&auto=format&fit=crop',
    'Sustained metallic resonance used in meditation rituals and sound baths.'
  ),
  (
    'Koto',
    'String',
    432,
    'Focus',
    '/audio/koto-432hz.mp3',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop',
    'Japanese zither textures that sit between melody and atmospheric drone.'
  ),
  (
    'Tanpura',
    'String Drone',
    432,
    'Grounding',
    '/audio/tanpura-432hz.mp3',
    'https://images.unsplash.com/photo-1526312426976-593c2b5f8f67?q=80&w=1200&auto=format&fit=crop',
    'Continuous harmonic bed used in Indian classical music to steady attention and breath.'
  ),
  (
    'Bansuri',
    'Woodwind',
    417,
    'Transformative',
    '/audio/bansuri-417hz.mp3',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
    'Soft bamboo flute lines traditionally used for dawn ragas and emotional release.'
  ),
  (
    'Sitar',
    'String',
    417,
    'Clarity',
    '/audio/sitar-417hz.mp3',
    'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop',
    'Rich plucked resonance used for meditative focus and structured cognitive reframe sessions.'
  )
ON CONFLICT DO NOTHING;
