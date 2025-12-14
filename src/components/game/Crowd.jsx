import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const crowdPhrases = {
  hyped: ['LET\'S GO!', 'DEFENSE!', 'YES!', 'CELTICS!'],
  angry: ['BOO!', 'COME ON!', 'NO!', 'UGH!'],
  chanting: ['BEAT LA!', 'BEAT LA!', 'BEAT LA!'],
}

export default function Crowd({ mood, showBeatLA, lastPlay }) {
  const [visiblePhrases, setVisiblePhrases] = useState([])
  const [crowdWave, setCrowdWave] = useState(false)

  // Generate crowd phrases based on mood
  useEffect(() => {
    if (mood === 'neutral') {
      setVisiblePhrases([])
      return
    }

    const phrases = showBeatLA ? crowdPhrases.chanting : crowdPhrases[mood] || []
    if (phrases.length === 0) return

    // Show multiple phrases
    const newPhrases = []
    for (let i = 0; i < 5; i++) {
      newPhrases.push({
        id: Date.now() + i,
        text: phrases[Math.floor(Math.random() * phrases.length)],
        x: Math.random() * 80 + 10, // 10-90%
        y: Math.random() * 30 + 5, // 5-35%
        side: Math.random() > 0.5 ? 'left' : 'right',
      })
    }
    setVisiblePhrases(newPhrases)

    // Clear after animation
    const timer = setTimeout(() => setVisiblePhrases([]), 2000)
    return () => clearTimeout(timer)
  }, [mood, showBeatLA, lastPlay])

  // Crowd wave on big plays
  useEffect(() => {
    if (lastPlay?.type === 'made' && lastPlay?.team === 'celtics' && lastPlay?.points === 3) {
      setCrowdWave(true)
      setTimeout(() => setCrowdWave(false), 2000)
    }
  }, [lastPlay])

  return (
    <>
      {/* Crowd silhouettes - top */}
      <div className="absolute top-0 left-0 right-0 h-16 md:h-24 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex justify-around items-end">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`top-${i}`}
              className="relative"
              animate={{
                y: crowdWave
                  ? [0, -10, 0]
                  : mood === 'hyped'
                  ? [0, -5, 0]
                  : 0,
              }}
              transition={{
                duration: crowdWave ? 0.5 : 0.8,
                delay: crowdWave ? i * 0.05 : i * 0.1,
                repeat: crowdWave ? 1 : mood === 'hyped' ? Infinity : 0,
              }}
            >
              {/* Person silhouette */}
              <div
                className={`w-4 md:w-6 h-8 md:h-12 rounded-t-full ${
                  mood === 'hyped'
                    ? 'bg-gradient-to-t from-[#007A33]/60 to-[#007A33]/20'
                    : mood === 'angry'
                    ? 'bg-gradient-to-t from-red-900/60 to-red-900/20'
                    : 'bg-gradient-to-t from-[#007A33]/40 to-[#007A33]/10'
                }`}
                style={{
                  boxShadow: mood === 'hyped' ? '0 0 10px rgba(0,122,51,0.5)' : 'none',
                }}
              />
              {/* Arms up when hyped */}
              {mood === 'hyped' && (
                <>
                  <motion.div
                    className="absolute -top-2 -left-1 w-1 h-4 bg-[#007A33]/40 rounded-full origin-bottom"
                    animate={{ rotate: [-20, -40, -20] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -top-2 -right-1 w-1 h-4 bg-[#007A33]/40 rounded-full origin-bottom"
                    animate={{ rotate: [20, 40, 20] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  />
                </>
              )}
            </motion.div>
          ))}
        </div>
        {/* Glow overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-[#0A1612] ${
          mood === 'hyped' ? 'mix-blend-overlay' : ''
        }`} />
      </div>

      {/* Crowd silhouettes - bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 md:h-20 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 flex justify-around items-start">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`bottom-${i}`}
              animate={{
                y: mood === 'hyped' ? [0, 3, 0] : 0,
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                repeat: mood === 'hyped' ? Infinity : 0,
              }}
            >
              <div
                className={`w-3 md:w-5 h-6 md:h-10 rounded-t-full ${
                  mood === 'hyped'
                    ? 'bg-gradient-to-b from-[#007A33]/50 to-transparent'
                    : mood === 'angry'
                    ? 'bg-gradient-to-b from-red-900/40 to-transparent'
                    : 'bg-gradient-to-b from-[#007A33]/30 to-transparent'
                }`}
              />
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1612] to-transparent" />
      </div>

      {/* Floating crowd phrases */}
      <AnimatePresence>
        {visiblePhrases.map((phrase) => (
          <motion.div
            key={phrase.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`absolute font-['Oswald'] text-lg md:text-2xl font-bold tracking-wider pointer-events-none ${
              showBeatLA
                ? 'text-[#007A33] drop-shadow-[0_0_10px_rgba(0,122,51,0.8)]'
                : mood === 'hyped'
                ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                : 'text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]'
            }`}
            style={{
              left: `${phrase.x}%`,
              top: phrase.side === 'left' ? `${phrase.y}%` : 'auto',
              bottom: phrase.side === 'right' ? `${phrase.y}%` : 'auto',
            }}
          >
            {phrase.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Beat LA overlay */}
      <AnimatePresence>
        {showBeatLA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="font-['Oswald'] text-4xl md:text-6xl font-bold text-[#007A33] tracking-widest drop-shadow-[0_0_30px_rgba(0,122,51,0.8)]"
            >
              BEAT LA! BEAT LA!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
