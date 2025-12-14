import { motion } from 'framer-motion'
import { Trophy, RotateCcw, TrendingUp } from 'lucide-react'
import { useEffect, useMemo } from 'react'

/**
 * EndScreen - Game over screen with celebration or defeat
 *
 * Props:
 * - state: Game state object with score and stats
 * - onRestart: Function to restart the game
 *
 * Features:
 * - Celtics win: Green celebration with confetti, shamrocks, "BEAT LA!" chant
 * - Lakers win: Dark defeat screen with somber messaging
 * - Final score and stats display
 * - Responsive mobile design
 */
export default function EndScreen({ state, onRestart }) {
  const celticsWon = state.score.celtics > state.score.lakers
  const lakersWon = state.score.lakers > state.score.celtics
  const isTie = state.score.celtics === state.score.lakers

  // Calculate FG percentages
  const celticsFG = state.stats.celtics.fga > 0
    ? ((state.stats.celtics.fg / state.stats.celtics.fga) * 100).toFixed(1)
    : '0.0'
  const lakersFG = state.stats.lakers.fga > 0
    ? ((state.stats.lakers.fg / state.stats.lakers.fga) * 100).toFixed(1)
    : '0.0'

  const celticsThreeP = state.stats.celtics.threesA > 0
    ? ((state.stats.celtics.threes / state.stats.celtics.threesA) * 100).toFixed(1)
    : '0.0'

  // Confetti particles for victory
  const confettiParticles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#007A33', '#BA9653', '#FFFFFF', '#000000'][Math.floor(Math.random() * 4)],
    })), []
  )

  // Play victory/defeat sound (passed via state or trigger here)
  useEffect(() => {
    // Sound will be triggered in App.jsx based on game end
  }, [])

  if (celticsWon) {
    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#007A33] via-[#005a25] to-[#003d1a]">
        {/* Confetti effect */}
        {confettiParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: `${particle.x}%`,
              top: '-5%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, 360],
              opacity: [1, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* Shamrock animations */}
        <motion.div
          className="absolute text-8xl opacity-20"
          style={{ top: '10%', left: '10%' }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ☘️
        </motion.div>
        <motion.div
          className="absolute text-6xl opacity-20"
          style={{ top: '60%', right: '15%' }}
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ☘️
        </motion.div>

        {/* Green glow effect */}
        <div className="absolute inset-0 bg-[#007A33]/20 animate-pulse" />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
          {/* Championship trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
            className="mb-6"
          >
            <Trophy className="w-24 h-24 md:w-32 md:h-32 text-[#BA9653] drop-shadow-[0_0_30px_rgba(186,150,83,0.8)]" />
          </motion.div>

          {/* Victory text */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-['Oswald'] text-6xl md:text-8xl font-bold tracking-tight mb-4"
          >
            <span className="text-white drop-shadow-[0_0_40px_rgba(0,122,51,1)]">
              CELTICS WIN!
            </span>
          </motion.h1>

          {/* Beat LA chant */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-8"
          >
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="font-['Oswald'] text-4xl md:text-6xl font-bold text-[#BA9653] tracking-wider drop-shadow-[0_0_20px_rgba(186,150,83,0.6)]"
            >
              BEAT LA!
            </motion.p>
          </motion.div>

          {/* Final score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 w-full max-w-lg border-2 border-[#BA9653]"
          >
            <p className="text-white/60 font-['Oswald'] tracking-wider mb-4 text-lg">FINAL SCORE</p>
            <div className="flex justify-around items-center">
              <div>
                <p className="text-[#007A33] font-['Oswald'] text-2xl mb-2">CELTICS</p>
                <p className="text-white font-bold text-5xl md:text-6xl">{state.score.celtics}</p>
              </div>
              <div className="text-white/40 text-3xl font-light">-</div>
              <div>
                <p className="text-[#552583] font-['Oswald'] text-2xl mb-2">LAKERS</p>
                <p className="text-white font-bold text-5xl md:text-6xl">{state.score.lakers}</p>
              </div>
            </div>
          </motion.div>

          {/* Stats summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-6 w-full max-w-lg mb-8"
          >
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-white/60 text-sm mb-1">CELTICS FG%</p>
                <p className="text-[#007A33] font-bold text-2xl">{celticsFG}%</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">3PT%</p>
                <p className="text-[#007A33] font-bold text-2xl">{celticsThreeP}%</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">STEALS</p>
                <p className="text-[#BA9653] font-bold text-2xl">{state.stats.celtics.steals || 0}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">BLOCKS</p>
                <p className="text-[#BA9653] font-bold text-2xl">{state.stats.celtics.blocks || 0}</p>
              </div>
            </div>
          </motion.div>

          {/* Play again button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="px-10 py-4 bg-gradient-to-r from-[#BA9653] to-[#9a7a43] rounded-full font-['Oswald'] text-xl tracking-wider shadow-[0_0_40px_rgba(186,150,83,0.6)] hover:shadow-[0_0_60px_rgba(186,150,83,0.8)] transition-shadow flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </motion.button>

          {/* Championship banner */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 text-[#BA9653]/60 font-['Oswald'] tracking-widest text-sm"
          >
            BANNER 18 • TD GARDEN
          </motion.p>
        </div>
      </div>
    )
  }

  if (lakersWon) {
    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#000000]">
        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />

        {/* Muted purple glow (Lakers color, but somber) */}
        <motion.div
          className="absolute w-96 h-96 bg-[#552583]/20 rounded-full blur-[150px]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
          {/* Sad shamrock */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
            className="text-7xl md:text-8xl mb-6 grayscale opacity-40"
          >
            ☘️
          </motion.div>

          {/* Defeat text */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-['Oswald'] text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white/60"
          >
            GAME OVER
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/40 font-['Oswald'] text-2xl md:text-3xl tracking-wide mb-8"
          >
            We'll Get 'Em Next Time
          </motion.p>

          {/* Final score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 w-full max-w-lg border border-white/10"
          >
            <p className="text-white/40 font-['Oswald'] tracking-wider mb-4 text-lg">FINAL SCORE</p>
            <div className="flex justify-around items-center">
              <div>
                <p className="text-white/40 font-['Oswald'] text-2xl mb-2">CELTICS</p>
                <p className="text-white/60 font-bold text-5xl md:text-6xl">{state.score.celtics}</p>
              </div>
              <div className="text-white/20 text-3xl font-light">-</div>
              <div>
                <p className="text-[#552583]/60 font-['Oswald'] text-2xl mb-2">LAKERS</p>
                <p className="text-white/80 font-bold text-5xl md:text-6xl">{state.score.lakers}</p>
              </div>
            </div>
          </motion.div>

          {/* Somber message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 w-full max-w-lg mb-8 border border-white/10"
          >
            <p className="text-white/40 text-sm md:text-base italic">
              "The Lakers escaped tonight, but the rivalry lives on.
              This is just one battle in a historic war."
            </p>
            <p className="text-[#007A33]/60 font-['Oswald'] text-xs mt-3 tracking-wider">
              CELTICS FG: {celticsFG}% • LAKERS FG: {lakersFG}%
            </p>
          </motion.div>

          {/* Try again button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            className="px-10 py-4 bg-gradient-to-r from-[#007A33]/80 to-[#005a25]/80 hover:from-[#007A33] hover:to-[#005a25] rounded-full font-['Oswald'] text-xl tracking-wider shadow-lg transition-all flex items-center gap-3"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 text-white/20 font-['Oswald'] tracking-widest text-sm"
          >
            THE BANNER 18 QUEST CONTINUES
          </motion.p>
        </div>
      </div>
    )
  }

  // Tie game (unlikely but possible)
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a1a] via-[#0f1f0f] to-[#0a1a0a]">
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-['Oswald'] text-6xl md:text-8xl font-bold tracking-tight mb-8 text-white/70"
        >
          OVERTIME!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/50 text-2xl mb-8"
        >
          {state.score.celtics} - {state.score.lakers}
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="px-10 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-full font-['Oswald'] text-xl tracking-wider shadow-lg flex items-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          PLAY AGAIN
        </motion.button>
      </div>
    </div>
  )
}
