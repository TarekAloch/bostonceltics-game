import { motion } from 'framer-motion'
import { Trophy, RotateCcw, Camera, TrendingUp, Award } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'

/**
 * EndScreen - Game over with HIGH SCORES display
 * Session-only high scores (no persistence needed)
 */
export default function EndScreen({ state, onRestart }) {
  const celticsWon = state.score.celtics > state.score.lakers
  const scoreDiff = state.score.celtics - state.score.lakers

  // Session high scores (stored in component state, reset on page refresh)
  const [sessionHighScore, setSessionHighScore] = useState(0)
  const [sessionHighDiff, setSessionHighDiff] = useState(0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [isNewHighDiff, setIsNewHighDiff] = useState(false)

  // Check for new records on mount
  useEffect(() => {
    const currentScore = state.score.celtics
    const currentDiff = scoreDiff

    // Get from sessionStorage (persists during browser session)
    const storedHighScore = parseInt(sessionStorage.getItem('celtics_high_score') || '0', 10)
    const storedHighDiff = parseInt(sessionStorage.getItem('celtics_high_diff') || '0', 10)

    setSessionHighScore(Math.max(storedHighScore, currentScore))
    setSessionHighDiff(Math.max(storedHighDiff, currentDiff))

    if (currentScore > storedHighScore) {
      sessionStorage.setItem('celtics_high_score', currentScore.toString())
      setIsNewHighScore(true)
    }
    if (currentDiff > storedHighDiff && celticsWon) {
      sessionStorage.setItem('celtics_high_diff', currentDiff.toString())
      setIsNewHighDiff(true)
    }
  }, [state.score.celtics, scoreDiff, celticsWon])

  // Stats calculations
  const celticsFG = state.stats.celtics.fga > 0
    ? ((state.stats.celtics.fg / state.stats.celtics.fga) * 100).toFixed(1)
    : '0.0'
  const celticsThreeP = state.stats.celtics.threesA > 0
    ? ((state.stats.celtics.threes / state.stats.celtics.threesA) * 100).toFixed(1)
    : '0.0'

  // Confetti for victory
  const confettiParticles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: ['#007A33', '#BA9653', '#FFFFFF', '#000000'][Math.floor(Math.random() * 4)],
    })), []
  )

  if (celticsWon) {
    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#007A33] via-[#005a25] to-[#003d1a]">
        {/* Confetti */}
        {confettiParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full"
            style={{ backgroundColor: particle.color, left: `${particle.x}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360], opacity: [1, 0.8, 0] }}
            transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* Shamrocks */}
        <motion.div
          className="absolute text-8xl opacity-20"
          style={{ top: '10%', left: '10%' }}
          animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {String.fromCodePoint(0x2618, 0xFE0F)}
        </motion.div>
        <motion.div
          className="absolute text-6xl opacity-20"
          style={{ top: '60%', right: '15%' }}
          animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {String.fromCodePoint(0x2618, 0xFE0F)}
        </motion.div>

        <div className="absolute inset-0 bg-[#007A33]/20 animate-pulse" />

        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl overflow-y-auto max-h-full py-8">
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
            className="mb-4"
          >
            <Trophy className="w-20 h-20 md:w-24 md:h-24 text-[#BA9653] drop-shadow-[0_0_30px_rgba(186,150,83,0.8)]" />
          </motion.div>

          {/* Victory text */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-['Oswald'] text-5xl md:text-7xl font-bold tracking-tight mb-2"
          >
            <span className="text-white drop-shadow-[0_0_40px_rgba(0,122,51,1)]">CELTICS WIN!</span>
          </motion.h1>

          {/* Beat LA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-6"
          >
            <motion.p
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              className="font-['Oswald'] text-3xl md:text-5xl font-bold text-[#BA9653] tracking-wider"
            >
              BEAT LA!
            </motion.p>
          </motion.div>

          {/* Final score */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 mb-4 w-full max-w-lg border-2 border-[#BA9653]"
          >
            <p className="text-white/60 font-['Oswald'] tracking-wider mb-2 text-sm">FINAL SCORE</p>
            <div className="flex justify-around items-center">
              <div>
                <p className="text-[#007A33] font-['Oswald'] text-xl mb-1">CELTICS</p>
                <p className="text-white font-bold text-4xl md:text-5xl">{state.score.celtics}</p>
              </div>
              <div className="text-white/40 text-2xl font-light">-</div>
              <div>
                <p className="text-[#552583] font-['Oswald'] text-xl mb-1">LAKERS</p>
                <p className="text-white font-bold text-4xl md:text-5xl">{state.score.lakers}</p>
              </div>
            </div>
          </motion.div>

          {/* HIGH SCORES CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="bg-gradient-to-br from-[#007A33] to-[#005a25] p-5 rounded-2xl border-4 border-[#BA9653] shadow-[0_0_40px_rgba(186,150,83,0.5)] w-full max-w-lg mb-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-7 h-7 text-[#BA9653]" />
              <h2 className="text-2xl font-['Oswald'] font-bold text-white tracking-wider">HIGH SCORES</h2>
              <Award className="w-7 h-7 text-[#BA9653]" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm font-['Oswald'] mb-1">HIGHEST SCORE</p>
                <p className="text-3xl font-bold text-[#BA9653]">
                  {Math.max(sessionHighScore, state.score.celtics)}
                </p>
                {isNewHighScore && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block bg-[#BA9653] text-black text-xs font-bold px-2 py-1 rounded-full mt-1"
                  >
                    NEW!
                  </motion.span>
                )}
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <p className="text-white/60 text-sm font-['Oswald'] mb-1">BIGGEST WIN</p>
                <p className="text-3xl font-bold text-[#BA9653]">
                  +{Math.max(sessionHighDiff, scoreDiff)}
                </p>
                {isNewHighDiff && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block bg-[#BA9653] text-black text-xs font-bold px-2 py-1 rounded-full mt-1"
                  >
                    NEW!
                  </motion.span>
                )}
              </div>
            </div>

            {/* Screenshot message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="bg-black/40 rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-[#BA9653]" />
                <span className="text-lg font-['Oswald'] text-white tracking-wide">
                  SCREENSHOT THIS PAGE
                </span>
                <Camera className="w-5 h-5 text-[#BA9653]" />
              </div>
              <p className="text-[#BA9653] font-['Oswald'] text-lg tracking-wider">
                TO SHARE WITH THE HOMIES
              </p>
            </motion.div>
          </motion.div>

          {/* Stats summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-4 w-full max-w-lg mb-6"
          >
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-white/60 text-xs">FG%</p>
                <p className="text-[#007A33] font-bold text-lg">{celticsFG}%</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">3PT%</p>
                <p className="text-[#007A33] font-bold text-lg">{celticsThreeP}%</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">STEALS</p>
                <p className="text-[#BA9653] font-bold text-lg">{state.stats.celtics.steals || 0}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">BLOCKS</p>
                <p className="text-[#BA9653] font-bold text-lg">{state.stats.celtics.blocks || 0}</p>
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

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-4 text-[#BA9653]/60 font-['Oswald'] tracking-widest text-sm"
          >
            BANNER 18 - TD GARDEN
          </motion.p>
        </div>
      </div>
    )
  }

  // LAKERS WON - Defeat screen
  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#000000]">
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/50 to-black" />

      <motion.div
        className="absolute w-96 h-96 bg-[#552583]/20 rounded-full blur-[150px]"
        style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        animate={{ opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          className="text-7xl md:text-8xl mb-6 grayscale opacity-40"
        >
          {String.fromCodePoint(0x2618, 0xFE0F)}
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 w-full max-w-lg mb-8 border border-white/10"
        >
          <p className="text-white/40 text-sm md:text-base italic">
            "The Lakers escaped tonight, but the rivalry lives on. This is just one battle in a historic war."
          </p>
          <p className="text-[#007A33]/60 font-['Oswald'] text-xs mt-3 tracking-wider">
            CELTICS FG: {celticsFG}%
          </p>
        </motion.div>

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
