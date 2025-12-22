import { motion } from 'framer-motion'
import { useState, useEffect, memo } from 'react'
import CourtPlayers from './CourtPlayers'
import ShotArc from './ShotArc'

function Court({
  children,
  possession,
  playType,
  celticsPlayers = [],
  lakersPlayers = [],
  activePlayer,
  phase,
  lastPlay,
  showShotArc = false,
  shotData = null,
  onShotComplete
}) {
  const [courtShake, setCourtShake] = useState(false)
  const [scoreGlow, setScoreGlow] = useState(null)

  // Handle scoring animations
  useEffect(() => {
    if (lastPlay?.type === 'made') {
      // Score glow effect
      setScoreGlow(lastPlay.team)
      setTimeout(() => setScoreGlow(null), 1000)

      // Court shake for dunks
      if (lastPlay.playType === 'dunk' || lastPlay.points === 3) {
        setCourtShake(true)
        setTimeout(() => setCourtShake(false), 500)
      }
    }
  }, [lastPlay])

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Court container */}
      <motion.div
        className="relative w-full max-w-4xl aspect-[16/10] md:aspect-[2/1]"
        animate={courtShake ? {
          x: [0, -4, 4, -4, 4, 0],
          y: [0, -2, 2, -2, 2, 0],
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Court floor - parquet pattern */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl">
          {/* Base wood color */}
          <div className="absolute inset-0 bg-[#C4A26E]" />

          {/* Parquet pattern */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  #C4A26E 0px,
                  #C4A26E 15px,
                  #a88b5a 15px,
                  #a88b5a 30px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 15px,
                  rgba(0,0,0,0.05) 15px,
                  rgba(0,0,0,0.05) 30px
                )
              `,
              backgroundSize: '30px 30px',
            }}
          />

          {/* Court lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
            {/* Outer boundary */}
            <rect x="10" y="10" width="380" height="180" fill="none" stroke="white" strokeWidth="2" />

            {/* Center line */}
            <line x1="200" y1="10" x2="200" y2="190" stroke="white" strokeWidth="2" />

            {/* Center circle */}
            <circle cx="200" cy="100" r="30" fill="none" stroke="white" strokeWidth="2" />

            {/* Left three-point arc */}
            <path
              d="M 10 60 L 40 60 A 65 65 0 0 1 40 140 L 10 140"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Right three-point arc */}
            <path
              d="M 390 60 L 360 60 A 65 65 0 0 0 360 140 L 390 140"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />

            {/* Left key/paint */}
            <rect x="10" y="60" width="60" height="80" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="70" cy="100" r="20" fill="none" stroke="white" strokeWidth="2" />

            {/* Right key/paint */}
            <rect x="330" y="60" width="60" height="80" fill="none" stroke="white" strokeWidth="2" />
            <circle cx="330" cy="100" r="20" fill="none" stroke="white" strokeWidth="2" />

            {/* Left basket */}
            <circle cx="25" cy="100" r="5" fill="none" stroke="#FF4444" strokeWidth="2" />
            <rect x="10" y="90" width="10" height="20" fill="none" stroke="white" strokeWidth="1" />

            {/* Right basket */}
            <circle cx="375" cy="100" r="5" fill="none" stroke="#FF4444" strokeWidth="2" />
            <rect x="380" y="90" width="10" height="20" fill="none" stroke="white" strokeWidth="1" />
          </svg>

          {/* Center court logo - Celtics shamrock */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              className="text-8xl md:text-9xl select-none"
            >
              ☘️
            </motion.div>
          </div>

          {/* Possession indicator glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: possession === 'celtics'
                ? 'radial-gradient(circle at 25% 50%, rgba(0,122,51,0.2) 0%, transparent 50%)'
                : 'radial-gradient(circle at 75% 50%, rgba(85,37,131,0.2) 0%, transparent 50%)',
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Score glow pulse */}
          {scoreGlow && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 1 }}
              style={{
                background: scoreGlow === 'celtics'
                  ? 'radial-gradient(circle at center, rgba(0,255,68,0.3) 0%, transparent 60%)'
                  : 'radial-gradient(circle at center, rgba(253,185,39,0.3) 0%, transparent 60%)',
                boxShadow: scoreGlow === 'celtics'
                  ? '0 0 100px rgba(0,255,68,0.5)'
                  : '0 0 100px rgba(253,185,39,0.5)',
              }}
            />
          )}

          {/* Player sprites layer */}
          <CourtPlayers
            possession={possession}
            celticsPlayers={celticsPlayers}
            lakersPlayers={lakersPlayers}
            activePlayer={activePlayer}
            playType={playType}
            phase={phase}
          />

          {/* Shot arc animation */}
          {showShotArc && shotData && (
            <ShotArc
              from={shotData.from}
              to={shotData.to}
              shotType={shotData.shotType}
              result={shotData.result}
              onComplete={onShotComplete}
            />
          )}

          {/* Active player spotlight */}
          {activePlayer && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              style={{
                background: `radial-gradient(circle at ${
                  possession === 'celtics' ? '70%' : '30%'
                } 50%, rgba(255,255,255,0.1) 0%, transparent 30%)`,
              }}
            />
          )}
        </div>

        {/* Crowd glow effect around court */}
        <div className="absolute -inset-4 rounded-2xl bg-gradient-to-t from-[#007A33]/20 to-transparent -z-10 blur-xl" />

        {/* Game content overlay */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20 }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Memoize to prevent re-renders when props haven't changed
export default memo(Court, (prev, next) => {
  return (
    prev.possession === next.possession &&
    prev.playType === next.playType &&
    prev.phase === next.phase &&
    prev.showShotArc === next.showShotArc &&
    prev.lastPlay?.type === next.lastPlay?.type &&
    prev.activePlayer?.name === next.activePlayer?.name
  )
})
