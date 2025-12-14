import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ShieldAlert, Zap } from 'lucide-react'

/**
 * RapidTap Defense QTE Component
 *
 * Usage:
 * <RapidTap
 *   lakersAction="three-point"
 *   lakersPlayer={{ name: "LeBron James", number: 23 }}
 *   onComplete={(result) => console.log(result)}
 *   difficulty="medium"
 * />
 *
 * Results: 'blocked', 'contested', 'steal', 'open'
 */
export default function RapidTap({ lakersAction, lakersPlayer, onComplete, difficulty = 'medium' }) {
  const [phase, setPhase] = useState('ready') // ready, active, result
  const [countdown, setCountdown] = useState(3)
  const [tapCount, setTapCount] = useState(0)
  const [showSteal, setShowSteal] = useState(false)
  const [result, setResult] = useState(null)
  const timerRef = useRef(null)
  const stealTimeoutRef = useRef(null)
  const lastTapTime = useRef(0)

  // Difficulty thresholds
  const thresholds = {
    easy: { block: 15, contest: 8 },
    medium: { block: 20, contest: 12 },
    hard: { block: 25, contest: 15 },
  }

  const currentThresholds = thresholds[difficulty]

  // Evaluate result function - defined before use in effects
  const evaluateResult = useCallback((finalCount) => {
    let resultType
    if (finalCount >= currentThresholds.block) {
      resultType = 'blocked'
    } else if (finalCount >= currentThresholds.contest) {
      resultType = 'contested'
    } else {
      resultType = 'open'
    }

    setResult(resultType)
    setPhase('result')
    setTimeout(() => onComplete(resultType), 1500)
  }, [currentThresholds, onComplete])

  // Countdown phase
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

  // Active phase - 3 second timer
  useEffect(() => {
    if (phase !== 'active') return

    timerRef.current = setTimeout(() => {
      evaluateResult(tapCount)
    }, 3000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [phase, tapCount, evaluateResult])

  // Random steal opportunity
  useEffect(() => {
    if (phase !== 'active') return

    const randomDelay = Math.random() * 1500 + 800 // 800-2300ms
    stealTimeoutRef.current = setTimeout(() => {
      if (phase === 'active') {
        setShowSteal(true)
        setTimeout(() => setShowSteal(false), 600) // 600ms window
      }
    }, randomDelay)

    return () => {
      if (stealTimeoutRef.current) {
        clearTimeout(stealTimeoutRef.current)
      }
    }
  }, [phase])

  const handleTap = useCallback(() => {
    if (phase !== 'active') return

    // Prevent spam (debounce 50ms)
    const now = Date.now()
    if (now - lastTapTime.current < 50) return
    lastTapTime.current = now

    setTapCount(prev => prev + 1)
  }, [phase])

  const handleSteal = useCallback(() => {
    if (phase !== 'active' || !showSteal) return

    setResult('steal')
    setPhase('result')
    if (timerRef.current) clearTimeout(timerRef.current)
    if (stealTimeoutRef.current) clearTimeout(stealTimeoutRef.current)
    setTimeout(() => onComplete('steal'), 1500)
  }, [phase, showSteal, onComplete])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        if (showSteal) {
          handleSteal()
        } else {
          handleTap()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTap, handleSteal, showSteal])

  const progress = (tapCount / currentThresholds.block) * 100
  const contestProgress = (currentThresholds.contest / currentThresholds.block) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1612]/95 backdrop-blur-md"
      role="dialog"
      aria-label="Defense quick-time event"
    >
      <div className="relative flex flex-col items-center w-full max-w-2xl px-4">

        {/* Countdown */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              key="countdown"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute font-['Oswald'] text-8xl md:text-9xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lakers Player Info (Villain styling) */}
        {phase !== 'ready' && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#552583]/20 via-[#552583]/30 to-[#552583]/20 border border-[#FDB927]/30 rounded-lg px-6 py-3">
              <ShieldAlert className="w-6 h-6 text-[#FDB927]" aria-hidden="true" />
              <div>
                <p className="text-[#FDB927] font-['Oswald'] text-sm tracking-widest">DEFENDING AGAINST</p>
                <p className="text-white font-['Oswald'] text-2xl font-bold">
                  #{lakersPlayer.number} {lakersPlayer.name}
                </p>
                <p className="text-[#FDB927]/80 text-sm tracking-wide uppercase">
                  {lakersAction.replace('-', ' ')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main content */}
        {phase === 'active' && (
          <div className="w-full space-y-6">
            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 text-sm font-medium">Defense Pressure</span>
                <span className="text-white font-['Oswald'] text-xl font-bold">
                  {tapCount} / {currentThresholds.block}
                </span>
              </div>

              <div className="relative h-8 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                {/* Contest threshold marker */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-yellow-400/60 z-10"
                  style={{ left: `${contestProgress}%` }}
                  aria-hidden="true"
                />

                {/* Progress fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-[#007A33] to-[#00A844] rounded-full shadow-[0_0_20px_rgba(0,122,51,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.2 }}
                />

                {/* Threshold labels */}
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                  <span className="text-white/40">Open</span>
                  <span className="text-yellow-400/80" style={{ marginLeft: `${contestProgress - 15}%` }}>
                    Contest
                  </span>
                  <span className="text-green-400">Block</span>
                </div>
              </div>

              {/* Threshold indicators */}
              <div className="flex justify-between mt-1 text-xs text-white/40">
                <span>0</span>
                <span>{currentThresholds.contest}</span>
                <span>{currentThresholds.block}</span>
              </div>
            </div>

            {/* Tap button */}
            <AnimatePresence mode="wait">
              {!showSteal ? (
                <motion.button
                  key="tap"
                  onClick={handleTap}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-full min-h-[120px] bg-gradient-to-br from-[#007A33] to-[#005A25] text-white font-['Oswald'] text-3xl md:text-4xl font-bold rounded-2xl shadow-[0_0_40px_rgba(0,122,51,0.4)] border-2 border-[#00A844] active:shadow-[0_0_60px_rgba(0,122,51,0.8)] transition-all touch-none select-none"
                  aria-label="Tap to defend"
                >
                  <Shield className="w-12 h-12 mx-auto mb-2" aria-hidden="true" />
                  TAP TO DEFEND!
                </motion.button>
              ) : (
                <motion.button
                  key="steal"
                  onClick={handleSteal}
                  initial={{ scale: 1.2, rotate: -5 }}
                  animate={{ scale: [1.2, 1.3, 1.2], rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                  className="w-full min-h-[120px] bg-gradient-to-br from-red-600 to-red-700 text-white font-['Oswald'] text-3xl md:text-4xl font-bold rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.8)] border-4 border-yellow-400 animate-pulse touch-none select-none"
                  aria-label="Steal the ball!"
                >
                  <Zap className="w-12 h-12 mx-auto mb-2 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  STEAL!
                </motion.button>
              )}
            </AnimatePresence>

            {/* Instructions */}
            <p className="text-center text-white/50 text-sm md:text-base">
              Tap rapidly or press <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">SPACE</kbd>
            </p>
          </div>
        )}

        {/* Result display */}
        <AnimatePresence>
          {phase === 'result' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute flex flex-col items-center"
            >
              <motion.div
                animate={
                  result === 'blocked' || result === 'steal'
                    ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
                className={`font-['Oswald'] text-6xl md:text-8xl font-bold tracking-wider ${
                  result === 'blocked'
                    ? 'text-green-400 drop-shadow-[0_0_40px_rgba(74,222,128,1)]'
                    : result === 'steal'
                    ? 'text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,1)]'
                    : result === 'contested'
                    ? 'text-orange-400 drop-shadow-[0_0_40px_rgba(251,146,60,0.8)]'
                    : 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]'
                }`}
              >
                {result === 'blocked' && 'BLOCKED!'}
                {result === 'steal' && 'STEAL!'}
                {result === 'contested' && 'CONTESTED'}
                {result === 'open' && 'OPEN SHOT'}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/70 mt-4 text-lg md:text-xl text-center"
              >
                {result === 'blocked' && 'No bucket! Possession to Celtics!'}
                {result === 'steal' && 'Turnover! Celtics ball!'}
                {result === 'contested' && 'Tough shot - lower accuracy'}
                {result === 'open' && 'Lakers have a clean look'}
              </motion.p>

              {/* Stats */}
              {result !== 'steal' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-white/50 text-sm"
                >
                  Final taps: <span className="font-bold text-white">{tapCount}</span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
