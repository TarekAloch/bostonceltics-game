import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function Scoreboard({ score, quarter, timeRemaining, shotClock, possession }) {
  const [scoreAnimation, setScoreAnimation] = useState({ celtics: false, lakers: false })
  const [prevScore, setPrevScore] = useState(score)

  // Detect score changes for animation
  useEffect(() => {
    if (score.celtics > prevScore.celtics) {
      setScoreAnimation(prev => ({ ...prev, celtics: true }))
      setTimeout(() => setScoreAnimation(prev => ({ ...prev, celtics: false })), 500)
    }
    if (score.lakers > prevScore.lakers) {
      setScoreAnimation(prev => ({ ...prev, lakers: true }))
      setTimeout(() => setScoreAnimation(prev => ({ ...prev, lakers: false })), 500)
    }
    setPrevScore(score)
  }, [score])

  const isLowTime = timeRemaining <= 10
  const isLowShotClock = shotClock <= 5

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Jumbotron style scoreboard */}
      <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007A33] via-[#BA9653] to-[#007A33]" />

        {/* Main scoreboard content */}
        <div className="p-4 md:p-6">
          {/* Teams and scores */}
          <div className="flex items-center justify-between">
            {/* Celtics */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <span className="text-3xl md:text-4xl">☘️</span>
                {possession === 'celtics' && (
                  <motion.div
                    layoutId="possession"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#007A33] rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="text-left">
                <p className="text-[#007A33] font-['Oswald'] text-lg md:text-xl tracking-wider">CELTICS</p>
                <motion.p
                  className={`font-['Oswald'] text-4xl md:text-6xl font-bold tabular-nums ${
                    scoreAnimation.celtics ? 'text-[#00ff55]' : 'text-white'
                  }`}
                  animate={scoreAnimation.celtics ? { scale: [1, 1.2, 1] } : {}}
                >
                  {score.celtics}
                </motion.p>
              </div>
            </div>

            {/* Center - Time */}
            <div className="flex flex-col items-center">
              {/* Quarter */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#BA9653] font-['Oswald'] text-sm tracking-widest">
                  {quarter <= 4 ? `Q${quarter}` : 'OT'}
                </span>
              </div>

              {/* Game clock */}
              <motion.div
                className={`font-['Oswald'] text-3xl md:text-5xl font-bold tabular-nums ${
                  isLowTime ? 'text-red-500' : 'text-white'
                }`}
                animate={isLowTime ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
              >
                {formatTime(timeRemaining)}
              </motion.div>

              {/* Shot clock */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/40 text-xs">SHOT</span>
                <motion.span
                  className={`font-['Oswald'] text-xl md:text-2xl tabular-nums ${
                    isLowShotClock ? 'text-orange-500' : 'text-white/70'
                  }`}
                  animate={isLowShotClock ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3, repeat: isLowShotClock ? Infinity : 0 }}
                >
                  {shotClock}
                </motion.span>
              </div>
            </div>

            {/* Lakers */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right">
                <p className="text-[#552583] font-['Oswald'] text-lg md:text-xl tracking-wider">LAKERS</p>
                <motion.p
                  className={`font-['Oswald'] text-4xl md:text-6xl font-bold tabular-nums ${
                    scoreAnimation.lakers ? 'text-[#FDB927]' : 'text-white'
                  }`}
                  animate={scoreAnimation.lakers ? { scale: [1, 1.2, 1] } : {}}
                >
                  {score.lakers}
                </motion.p>
              </div>
              <div className="relative">
                {/* Lakers "villain" logo */}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-[0_0_20px_rgba(85,37,131,0.5)]">
                  LA
                </div>
                {possession === 'lakers' && (
                  <motion.div
                    layoutId="possession"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#552583] rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom LED strip effect */}
        <div className="h-1 bg-gradient-to-r from-[#007A33] via-transparent to-[#552583]" />
      </div>
    </motion.div>
  )
}
