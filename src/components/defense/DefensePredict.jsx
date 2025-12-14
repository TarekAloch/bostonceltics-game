import { motion, AnimatePresence } from 'framer-motion'
import { Target, TrendingUp, Zap, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

/**
 * DefensePredict Component
 *
 * Predict what the Lakers will do - correct prediction = 70% miss, wrong = 30% miss.
 * Features 4-second timer, scouting report aesthetic, and reveal animation.
 *
 * @param {Object} lakersPlayer - { name, number, rating, villain }
 * @param {string} actualPlay - 'three-point' | 'mid-range' | 'drive' (hidden until selection)
 * @param {Function} onComplete - callback with (prediction, wasCorrect, result)
 *
 * Usage:
 * <DefensePredict
 *   lakersPlayer={lakersPlayer}
 *   actualPlay="three-point"
 *   onComplete={(prediction, wasCorrect, result) => console.log(prediction, wasCorrect, result)}
 * />
 */
export default function DefensePredict({ lakersPlayer, actualPlay, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(4)
  const [prediction, setPrediction] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Validate props
  if (!lakersPlayer) {
    console.error('[DefensePredict] lakersPlayer prop is required')
    return null
  }

  if (!actualPlay) {
    console.error('[DefensePredict] actualPlay prop is required')
    return null
  }

  const isVillain = lakersPlayer?.villain

  // Prediction options
  const predictions = [
    {
      id: 'three-point',
      label: '3-POINTER',
      description: "They're going outside!",
      icon: Target,
      color: 'from-purple-500 to-purple-700',
      hoverColor: 'hover:shadow-purple-500/50',
    },
    {
      id: 'mid-range',
      label: 'MID-RANGE',
      description: "They're taking a jumper!",
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:shadow-blue-500/50',
    },
    {
      id: 'drive',
      label: 'DRIVE',
      description: "They're going to the rim!",
      icon: Zap,
      color: 'from-red-500 to-red-700',
      hoverColor: 'hover:shadow-red-500/50',
    },
  ]

  // Calculate outcome based on prediction
  const calculateOutcome = useCallback((pred, actual) => {
    const wasCorrect = pred === actual
    const rand = Math.random()

    // If prediction correct: 70% miss, 30% score
    // If prediction wrong: 30% miss, 70% score
    if (wasCorrect) {
      return rand < 0.7 ? 'miss' : 'score'
    } else {
      return rand < 0.3 ? 'miss' : 'score'
    }
  }, [])

  // Handle prediction selection
  const handlePrediction = useCallback((predId) => {
    if (prediction || revealed) return

    setPrediction(predId)

    // Reveal actual play after brief delay
    setTimeout(() => {
      setRevealed(true)
      const wasCorrect = predId === actualPlay
      const outcome = calculateOutcome(predId, actualPlay)
      setResult(outcome)

      // Show result
      setTimeout(() => {
        setShowResult(true)

        // Callback after result animation
        setTimeout(() => {
          onComplete?.(predId, wasCorrect, outcome)
        }, 2000)
      }, 1500)
    }, 800)
  }, [prediction, revealed, actualPlay, calculateOutcome, onComplete])

  // Timer countdown
  useEffect(() => {
    if (prediction || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Random prediction on timeout
          const randomPred = predictions[Math.floor(Math.random() * predictions.length)]
          handlePrediction(randomPred.id)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, prediction, handlePrediction, predictions])

  // Get play display text
  const getPlayText = (playType) => {
    switch (playType) {
      case 'three-point':
        return '3-POINTER'
      case 'mid-range':
        return 'MID-RANGE JUMPER'
      case 'drive':
        return 'DRIVE TO THE RIM'
      default:
        return 'UNKNOWN PLAY'
    }
  }

  const wasCorrect = prediction === actualPlay

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/95 via-[#552583]/30 to-black/95 backdrop-blur-sm"
      >
        {/* "DEFENSE!" chant background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl font-['Oswald'] font-bold text-[#007A33]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -120],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: i * 0.6,
              }}
            >
              DEFENSE!
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative max-w-4xl w-full mx-4">
          {/* Timer */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            animate={{ scale: timeLeft <= 2 ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.4, repeat: timeLeft <= 2 ? Infinity : 0 }}
          >
            <div
              className={`text-6xl font-['Oswald'] font-bold ${
                timeLeft <= 1 ? 'text-[#FF4444]' : timeLeft <= 2 ? 'text-[#FDB927]' : 'text-white'
              }`}
            >
              {timeLeft}
            </div>
          </motion.div>

          {/* Lakers player card with mystery effect */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-['Oswald'] font-bold text-white mb-2">
                READ THE PLAY!
              </h2>
              <p className="text-[#FDB927] font-['Oswald'] text-lg">
                What will they do?
              </p>
            </div>

            <div
              className="relative px-6 py-4 rounded-2xl backdrop-blur-md bg-gradient-to-br from-[#552583]/90 to-[#3d1a5f]/90 border-2 border-[#FDB927]/30 mx-auto max-w-md"
              style={{
                boxShadow: isVillain
                  ? '0 0 40px rgba(255,68,68,0.4), 0 0 80px rgba(85,37,131,0.3)'
                  : '0 0 30px rgba(253,185,39,0.3)',
              }}
            >
              {/* Villain glow effect */}
              {isVillain && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-t from-red-900/40 to-transparent"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-red-800 shadow-lg">
                    VILLAIN
                  </div>
                </>
              )}

              {/* Mystery question marks overlay (until prediction made) */}
              {!prediction && (
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
                  animate={{ opacity: [0.7, 0.9, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <HelpCircle className="w-24 h-24 text-[#FDB927]" strokeWidth={2} />
                </motion.div>
              )}

              <div className="flex items-center gap-4 relative">
                {/* Jersey number */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center font-['Oswald'] text-3xl font-bold bg-[#FDB927]/30 text-[#FDB927]">
                  #{lakersPlayer?.number || '00'}
                </div>

                {/* Player info */}
                <div className="flex-1">
                  <p className="font-['Oswald'] text-2xl font-bold text-white mb-1">
                    {lakersPlayer?.name || 'Unknown'}
                  </p>
                  <p className="text-[#FDB927]/80 text-sm">
                    {lakersPlayer?.position || 'POS'} • {lakersPlayer?.rating || 0} OVR
                  </p>
                </div>

                {/* Basketball emoji */}
                <div className="text-4xl">🏀</div>
              </div>
            </div>
          </motion.div>

          {/* Prediction buttons (scouting report style) */}
          {!revealed && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {predictions.map((pred, index) => {
                const Icon = pred.icon
                const isSelected = prediction === pred.id

                return (
                  <motion.button
                    key={pred.id}
                    onClick={() => handlePrediction(pred.id)}
                    disabled={prediction !== null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: prediction ? 1 : 1.05 }}
                    whileTap={{ scale: prediction ? 1 : 0.95 }}
                    className={`relative px-6 py-8 rounded-2xl backdrop-blur-md bg-gradient-to-br ${pred.color} border-2 border-white/20 transition-all ${pred.hoverColor} hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? 'ring-4 ring-white' : ''}`}
                  >
                    {/* Scouting report badge */}
                    <div className="absolute -top-2 -left-2 bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                      SCOUT
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                      <div className="text-center">
                        <p className="font-['Oswald'] text-xl font-bold text-white mb-1">
                          {pred.label}
                        </p>
                        <p className="text-white/80 text-sm">{pred.description}</p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* Reveal actual play */}
          {revealed && !showResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-['Oswald'] font-bold text-white mb-2">
                  ACTUAL PLAY:
                </h3>
                <p className="text-4xl font-['Oswald'] font-bold text-[#FDB927]">
                  {getPlayText(actualPlay)}
                </p>
              </div>

              <motion.div
                className={`inline-block px-12 py-6 rounded-2xl ${
                  wasCorrect
                    ? 'bg-[#007A33]/30 border-2 border-[#44FF44]'
                    : 'bg-[#FF4444]/30 border-2 border-[#FF4444]'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: 1 }}
              >
                {wasCorrect ? (
                  <>
                    <CheckCircle className="w-16 h-16 mx-auto mb-3 text-[#44FF44]" strokeWidth={2.5} />
                    <h3 className="text-4xl font-['Oswald'] font-bold text-[#44FF44]">
                      GOOD READ!
                    </h3>
                  </>
                ) : (
                  <>
                    <XCircle className="w-16 h-16 mx-auto mb-3 text-[#FF4444]" strokeWidth={2.5} />
                    <h3 className="text-4xl font-['Oswald'] font-bold text-[#FF4444]">
                      WRONG READ!
                    </h3>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* Final result */}
          {showResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center mt-6"
            >
              <motion.div
                className={`inline-block px-12 py-8 rounded-2xl ${
                  result === 'miss'
                    ? 'bg-[#007A33]/30 border-2 border-[#007A33]'
                    : 'bg-[#FDB927]/30 border-2 border-[#FDB927]'
                }`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <h3
                  className={`text-5xl font-['Oswald'] font-bold ${
                    result === 'miss' ? 'text-[#007A33]' : 'text-[#FDB927]'
                  }`}
                >
                  {result === 'miss' ? 'LAKERS MISS!' : 'LAKERS SCORE!'}
                </h3>
              </motion.div>
            </motion.div>
          )}

          {/* Celtics defender silhouette */}
          <motion.div
            className="absolute -bottom-8 right-8 text-[#007A33]/20 text-8xl pointer-events-none"
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            👀
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
