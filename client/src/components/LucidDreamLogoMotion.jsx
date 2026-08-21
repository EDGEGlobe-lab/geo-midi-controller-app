import React, { useEffect, useuseState } from 'react';
import { motion } from 'framer-motion';

/**
 * GEO MIDI Controller - Lucid Dream Ocean Intelligence
 * Finding Nemo Inspired Auto-Lucid Dream World Motion Experience
 * 
 * Features:
 * - AI-powered mood detection and animation response
 * - Underwater dreamscape environment
 * - Realistic ocean physics and wave simulation
 * - Bioluminescent neon effects
 * - Finding Nemo character-inspired interactions
 */

const LucidDreamLogoMotion = () => {
  const [dreamMood, setDreamMood] = useState('discovery');
  const [waterLevel, setWaterLevel] = useState(50);
  const [bubbles, setBubbles] = useState([]);
  const [isLucid, setIsLucid] = useState(true);
  const [oceanCurrent, setOceanCurrent] = useState(0);

  // AI Mood Detection System
  const moodStates = {
    discovery: { scale: 1.1, rotate: 15, color: '#39FF14', intensity: 0.8 },
    adventure: { scale: 1.2, rotate: 360, color: '#00FFFF', intensity: 1 },
    calm: { scale: 0.95, rotate: -10, color: '#87CEEB', intensity: 0.6 },
    playful: { scale: 1.05, rotate: 45, color: '#FFD700', intensity: 0.9 },
    mysterious: { scale: 1.15, rotate: 180, color: '#FF00FF', intensity: 0.7 },
  };

  // Auto-Lucid Dream Cycle
  useEffect(() => {
    const dreamCycle = setInterval(() => {
      const moods = Object.keys(moodStates);
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setDreamMood(randomMood);
    }, 8000);

    return () => clearInterval(dreamCycle);
  }, []);

  // Ocean Wave Simulation
  useEffect(() => {
    const waveAnimation = setInterval(() => {
      setWaterLevel((prev) => {
        const newLevel = 50 + Math.sin(Date.now() / 2000) * 15;
        return newLevel;
      });
      setOceanCurrent((prev) => (prev + 2) % 360);
    }, 100);

    return () => clearInterval(waveAnimation);
  }, []);

  // Bubble Generation System
  useEffect(() => {
    const bubbleGenerator = setInterval(() => {
      const newBubble = {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 5,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 0.5,
      };
      setBubbles((prev) => [...prev.slice(-20), newBubble]);
    }, 600);

    return () => clearInterval(bubbleGenerator);
  }, []);

  const currentMood = moodStates[dreamMood];

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black overflow-hidden relative">
      {/* Animated Ocean Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(
              circle at 50% ${waterLevel}%,
              rgba(0, 255, 255, 0.2) 0%,
              rgba(0, 50, 100, 0.1) 50%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Bioluminescent Particles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.left}%`,
            bottom: '-20px',
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle at 30% 30%, 
              rgba(0, 255, 255, 0.8) 0%,
              rgba(57, 255, 20, 0.4) 50%,
              transparent 100%)`,
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.6)',
          }}
          animate={{
            y: -window.innerHeight - 50,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Main Lucid Dream Logo Container */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Water Displacement Effect */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: `conic-gradient(
              from ${oceanCurrent}deg,
              rgba(0, 255, 255, 0.1),
              rgba(57, 255, 20, 0.1),
              rgba(255, 0, 255, 0.1),
              rgba(0, 255, 255, 0.1)
            )`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Neon Green Blueberry - Main Character */}
        <motion.svg
          width="300"
          height="300"
          viewBox="0 0 200 200"
          className="relative z-10"
          animate={{
            scale: currentMood.scale,
            rotate: dreamMood === 'adventure' ? currentMood.rotate : 0,
            y: Math.sin(Date.now() / 1000) * 20,
          }}
          transition={{
            scale: { duration: 2, ease: 'easeInOut' },
            rotate: { duration: 4, ease: 'easeInOut' },
            y: { duration: 2, ease: 'easeInOut', repeat: Infinity },
          }}
        >
          {/* Lucid Dream Aura */}
          <defs>
            <radialGradient id="dreamAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={currentMood.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={currentMood.color} stopOpacity="0" />
            </radialGradient>
            <filter id="lucidGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dream Aura Field */}
          <motion.circle
            cx="100"
            cy="110"
            r="85"
            fill="url(#dreamAura)"
            animate={{ r: [75, 95, 75] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Main Blueberry */}
          <circle cx="100" cy="110" r="65" fill="#39FF14" opacity="0.95" filter="url(#lucidGlow)" />
          
          {/* Depth Shading */}
          <ellipse cx="100" cy="75" rx="55" ry="35" fill="#00FF00" opacity="0.4" />

          {/* Eyes */}
          <circle cx="75" cy="95" r="18" fill="#1a1a2e" opacity="0.9" />
          <circle cx="125" cy="95" r="18" fill="#1a1a2e" opacity="0.9" />
          <circle cx="75" cy="95" r="13" fill="#00FFFF" opacity="0.95" />
          <circle cx="125" cy="95" r="13" fill="#00FFFF" opacity="0.95" />

          {/* Pupils with Life */}
          <motion.circle cx="76" cy="96" r="8" fill="#000000" animate={{ cx: [76, 78, 76], cy: [96, 94, 96] }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.circle cx="126" cy="96" r="8" fill="#000000" animate={{ cx: [126, 128, 126], cy: [96, 94, 96] }} transition={{ duration: 3, repeat: Infinity }} />

          {/* Eye Sparkles */}
          <circle cx="70" cy="88" r="5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="120" cy="88" r="5" fill="#FFFFFF" opacity="0.95" />

          {/* Celtic Cross Mouth - WWE Championship */}
          <motion.rect x="95" y="125" width="10" height="35" fill="#FF00FF" opacity="0.9" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <motion.rect x="80" y="138" width="40" height="10" fill="#FF00FF" opacity="0.9" animate={{ scaleX: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} />

          {/* Championship Diamonds */}
          <motion.polygon points="100,120 104,126 100,132 96,126" fill="#FFD700" opacity="0.95" animate={{ y: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.polygon points="75,142 81,146 75,150 69,146" fill="#FFD700" opacity="0.9" animate={{ x: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.polygon points="125,142 131,146 125,150 119,146" fill="#FFD700" opacity="0.9" animate={{ x: [2, -2, 2] }} transition={{ duration: 1.5, repeat: Infinity }} />
          <motion.polygon points="100,160 104,166 100,172 96,166" fill="#FFD700" opacity="0.95" animate={{ y: [2, -2, 2] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.svg>
      </motion.div>

      {/* Finding Nemo Inspired Sea Characters - Floating Around */}
      <motion.div
        className="absolute top-20 left-20 text-4xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        🐠
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-5xl"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, delay: 1 }}
      >
        🐢
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/4 text-3xl"
        animate={{
          rotate: [0, 360],
          y: [0, 40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
      >
        🐙
      </motion.div>

      {/* Dream State Indicator */}
      <div className="absolute bottom-10 left-10 z-20">
        <motion.div
          className="text-white text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="text-sm font-mono">LUCID DREAM MODE</div>
          <div className="text-xl font-bold" style={{ color: currentMood.color }}>
            {dreamMood.toUpperCase()}
          </div>
          <div className="text-xs opacity-60">Mood Intensity: {(currentMood.intensity * 100).toFixed(0)}%</div>
        </motion.div>
      </div>

      {/* Mood Selector Controls */}
      <div className="absolute top-10 right-10 z-20 flex gap-2 flex-wrap justify-end max-w-xs">
        {Object.keys(moodStates).map((mood) => (
          <motion.button
            key={mood}
            onClick={() => setDreamMood(mood)}
            className="px-3 py-1 text-xs font-mono rounded border border-current transition-all"
            style={{
              color: dreamMood === mood ? moodStates[mood].color : '#888',
              borderColor: dreamMood === mood ? moodStates[mood].color : '#444',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mood}
          </motion.button>
        ))}
      </div>

      {/* Bioluminescent Glow Text */}
      <motion.div
        className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 text-center z-10"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      >
        <div className="text-2xl font-bold" style={{ color: currentMood.color }}>
          Finding Your Sound
        </div>
        <div className="text-sm opacity-70" style={{ color: currentMood.color }}>
          In the Lucid Dream of Music
        </div>
      </motion.div>
    </div>
  );
};

export default LucidDreamLogoMotion;
