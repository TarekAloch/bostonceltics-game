import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TimingRing({ action, onComplete, difficulty = 'medium' }) {
  const [phase, setPhase] = useState('ready') // ready, active, result
  const [ringScale, setRingScale] = useState(2.5)
  const [result, setResult] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const animationRef = useRef(null)
  const startTimeRef = useRef(null)

  // Difficulty affects timing window
  const difficultySettings = {
    easy: { duration: 2000, perfectWindow: 0.15, goodWindow: 0.3 },
    medium: { duration: 1500, perfectWindow: 0.1, goodWindow: 0.25 },
    hard: { duration: 1200, perfectWindow: 0.08, goodWindow: 0.2 },
  }

  // Action affects difficulty
  const actionModifier = {
    'three-point': 0.8,
    'mid-range': 1,
    'drive': 1.2,
  }

  const settings = difficultySettings[difficulty]
  const modifier = actionModifier[action] || 1
  const duration = settings.duration * modifier

  // Countdown before QTE starts
  useEffect(() => {
    if (phase !== 'ready') return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('active')
          return 0
        }
        return prev - 1
      })
    }, 500)

    return () => clearInterval(interval)
  }, [phase])

  // Ring animation
  useEffect(() => {
    if (phase !== 'active') return

    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const newScale = 2.5 - (progress * 1.5) // Scale from 2.5 to 1

      setRingScale(newScale)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Time ran out
        setResult('miss')
        setPhase('result')
        setTimeout(() => onComplete('miss'), 1000)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, duration, onComplete])

  const handleClick = useCallback(() => {
    if (phase !== 'active') return

    cancelAnimationFrame(animationRef.current)

    // Calculate how close to target (scale 1)
    const distance = Math.abs(ringScale - 1)

    let resultType
    if (distance <= settings.perfectWindow) {
      resultType = 'perfect'
    } else if (distance <= settings.goodWindow) {
      resultType = 'good'
    } else {
      resultType = 'miss'
    }

    setResult(resultType)
    setPhase('result')
    setTimeout(() => onComplete(resultType), 1200)
  }, [phase, ringScale, settings, onComplete])

  // Handle keyboard and touch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        handleClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClick])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClick}
    >
      <div className="relative flex flex-col items-center">
        {/* Countdown */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              key="countdown"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute font-['Oswald'] text-8xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Target ring (static) */}
        {phase !== 'ready' && (
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#007A33]/20 blur-xl" />

            {/* Target zones visualization */}
            <div className="relative w-48 h-48 md:w-64 md:h-64">
              {/* Perfect zone (inner) */}
              <div className="absolute inset-0 m-auto w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-green-500/50" />

              {/* Good zone (middle) */}
              <div className="absolute inset-0 m-auto w-36 h-36 md:w-44 md:h-44 rounded-full border-2 border-yellow-500/30" />

              {/* Target ring (outer) */}
              <div className="absolute inset-0 rounded-full border-4 border-white/30" />

              {/* Shrinking ring */}
              {phase === 'active' && (
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-[#007A33]"
                  style={{
                    transform: `scale(${ringScale})`,
                    boxShadow: '0 0 30px rgba(0,122,51,0.6), inset 0 0 30px rgba(0,122,51,0.2)',
                  }}
                />
              )}

              {/* Center dot */}
              <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-white shadow-[0_0_20px_white]" />
            </div>
          </div>
        )}

        {/* Result display */}
        <AnimatePresence>
          {phase === 'result' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute flex flex-col items-center"
            >
              <motion.div
                animate={result === 'perfect' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`font-['Oswald'] text-5xl md:text-7xl font-bold tracking-wider ${
                  result === 'perfect'
                    ? 'text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]'
                    : result === 'good'
                    ? 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]'
                    : 'text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.8)]'
                }`}
              >
                {result === 'perfect' ? 'PERFECT!' : result === 'good' ? 'GOOD!' : 'MISS!'}
              </motion.div>
              <p className="text-white/60 mt-2 text-lg">
                {result === 'perfect'
                  ? '90% shot chance'
                  : result === 'good'
                  ? '60% shot chance'
                  : '30% shot chance'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        {phase === 'active' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-20 text-white/70 font-['Oswald'] text-xl tracking-wider"
          >
            TAP / CLICK / SPACE when the ring reaches the center!
          </motion.p>
        )}

        {/* Action indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -top-20 text-center"
        >
          <p className="text-[#BA9653] font-['Oswald'] text-lg tracking-widest">
            {action === 'three-point' ? '3-POINT SHOT' : action === 'mid-range' ? 'MID-RANGE' : 'DRIVE TO BASKET'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
