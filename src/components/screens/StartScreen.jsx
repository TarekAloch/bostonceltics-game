import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Trophy, Volume2, VolumeX, ChevronRight } from 'lucide-react'

const difficulties = [
  {
    id: 'easy',
    name: 'ROOKIE',
    description: 'Lakers shoot 35%',
    color: 'from-green-600 to-green-700',
  },
  {
    id: 'medium',
    name: 'ALL-STAR',
    description: 'Lakers shoot 45%',
    color: 'from-yellow-600 to-yellow-700',
  },
  {
    id: 'hard',
    name: 'FINALS',
    description: 'Lakers shoot 55%',
    color: 'from-red-600 to-red-700',
  },
]

export default function StartScreen({ onStart, difficulty, setDifficulty, isMuted, toggleMute }) {
  const [showDifficulty, setShowDifficulty] = useState(false)

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1612] via-[#0f2018] to-[#0A1612]">
        {/* Shamrock pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='30' y='35' font-size='30' text-anchor='middle' fill='%23007A33'%3E☘%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        {/* Animated glow spots */}
        <motion.div
          className="absolute w-96 h-96 bg-[#007A33] rounded-full blur-[150px] opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-[#BA9653] rounded-full blur-[120px] opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '20%', right: '15%' }}
        />
      </div>

      {/* Sound toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleMute}
        className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Championship banner decoration */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#BA9653]" />
          <Trophy className="w-8 h-8 text-[#BA9653]" />
          <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#BA9653]" />
        </motion.div>

        {/* Shamrock */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
          className="text-7xl md:text-8xl mb-4"
        >
          ☘️
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-['Oswald'] text-5xl md:text-7xl font-bold tracking-tight mb-2"
        >
          <span className="text-[#007A33] drop-shadow-[0_0_30px_rgba(0,122,51,0.5)]">CELTICS</span>
          <span className="text-white mx-3 text-3xl md:text-4xl">vs</span>
          <span className="text-[#552583] drop-shadow-[0_0_30px_rgba(85,37,131,0.5)]">LAKERS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#BA9653] font-['Oswald'] text-xl md:text-2xl tracking-widest mb-8"
        >
          TD GARDEN • BOSTON
        </motion.p>

        {/* Play button or difficulty select */}
        <AnimatePresence mode="wait">
          {!showDifficulty ? (
            <motion.button
              key="play"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDifficulty(true)}
              className="group relative px-12 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] text-2xl tracking-wider shadow-[0_0_40px_rgba(0,122,51,0.4)] hover:shadow-[0_0_60px_rgba(0,122,51,0.6)] transition-shadow"
            >
              <span className="flex items-center gap-3">
                <Play className="w-6 h-6 fill-current" />
                START GAME
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="font-['Oswald'] text-xl tracking-wider text-white/60 mb-2">
                SELECT DIFFICULTY
              </p>

              <div className="flex flex-col md:flex-row gap-3">
                {difficulties.map((diff, i) => (
                  <motion.button
                    key={diff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDifficulty(diff.id)}
                    className={`relative px-8 py-4 rounded-xl font-['Oswald'] tracking-wider transition-all ${
                      difficulty === diff.id
                        ? `bg-gradient-to-r ${diff.color} shadow-lg ring-2 ring-white/30`
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">{diff.name}</span>
                    <span className="block text-sm opacity-70">{diff.description}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="mt-4 px-12 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] text-xl tracking-wider shadow-[0_0_40px_rgba(0,122,51,0.4)] hover:shadow-[0_0_60px_rgba(0,122,51,0.6)] transition-shadow flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                LET'S GO CELTICS!
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-white/40 text-sm max-w-md"
        >
          <p>Use Quick Time Events and Trivia to score. Defend against the Lakers!</p>
          <p className="mt-2 text-[#007A33]">4 Quarters • 90 seconds each</p>
        </motion.div>
      </div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#007A33] to-transparent"
      />
    </div>
  )
}
