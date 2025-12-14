import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Hand, Grab, AlertTriangle, Trophy } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

/**
 * DefenseChoice Component
 *
 * Simple choice-based defense - pick ONE defensive action against Lakers offense.
 * Features 5-second timer, Lakers villain styling, and outcome calculation.
 *
 * @param {Object} lakersPlayer - { name, number, rating, villain }
 * @param {string} lakersAction - 'three-point' | 'mid-range' | 'drive'
 * @param {Function} onComplete - callback with (choice, result)
 *
 * Usage:
 * <DefenseChoice
 *   lakersPlayer={lakersPlayer}
 *   lakersAction="three-point"
 *   onComplete={(choice, result) => console.log(choice, result)}
 * />
 */
export default function DefenseChoice({ lakersPlayer, lakersAction, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(5)
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [result, setResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Validate props
  if (!lakersPlayer) {
    console.error('[DefenseChoice] lakersPlayer prop is required')
    return null
  }

  if (!lakersAction) {
    console.error('[DefenseChoice] lakersAction prop is required')
    return null
  }

  const isVillain = lakersPlayer?.villain

  // Defense action options
  const actions = [
    {
      id: 'contest',
      label: 'CONTEST',
      icon: Hand,
      description: '50% force miss',
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:shadow-blue-500/50',
    },
    {
      id: 'block',
      label: 'GO FOR BLOCK',
      icon: Shield,
      description: '30% block, 20% foul risk',
      color: 'from-green-500 to-green-700',
      hoverColor: 'hover:shadow-green-500/50',
    },
    {
      id: 'steal',
      label: 'GO FOR STEAL',
      icon: Grab,
      description: '25% steal, 25% foul risk',
      color: 'from-orange-500 to-orange-700',
      hoverColor: 'hover:shadow-orange-500/50',
    },
  ]

  // Calculate outcome based on choice
  const calculateOutcome = useCallback((choice) => {
    const rand = Math.random()

    switch (choice) {
      case 'contest':
        return rand < 0.5 ? 'miss' : 'score'

      case 'block':
        if (rand < 0.3) return 'block'
        if (rand < 0.5) return 'foul'
        return 'score'

      case 'steal':
        if (rand < 0.25) return 'steal'
        if (rand < 0.5) return 'foul'
        return 'score'

      default:
        return 'score'
    }
  }, [])

  // Handle choice selection
  const handleChoice = useCallback((choiceId) => {
    if (selectedChoice || showResult) return

    setSelectedChoice(choiceId)
    const outcome = calculateOutcome(choiceId)
    setResult(outcome)
    setShowResult(true)

    // Delay callback to show result animation
    setTimeout(() => {
      onComplete?.(choiceId, outcome)
    }, 2500)
  }, [selectedChoice, showResult, calculateOutcome, onComplete])

  // Timer countdown
  useEffect(() => {
    if (selectedChoice || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-select Contest on timeout
          handleChoice('contest')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, selectedChoice, handleChoice])

  // Get Lakers action display text
  const getActionText = () => {
    switch (lakersAction) {
      case 'three-point':
        return 'SHOOTING A 3-POINTER'
      case 'mid-range':
        return 'TAKING A MID-RANGE JUMPER'
      case 'drive':
        return 'DRIVING TO THE RIM'
      default:
        return 'MAKING A MOVE'
    }
  }

  // Get result styling and message
  const getResultInfo = () => {
    switch (result) {
      case 'miss':
        return {
          color: 'text-[#007A33]',
          bg: 'bg-[#007A33]/20',
          message: 'LAKERS MISS!',
          icon: Trophy,
        }
      case 'block':
        return {
          color: 'text-[#44FF44]',
          bg: 'bg-[#44FF44]/20',
          message: 'BLOCKED!',
          icon: Shield,
        }
      case 'steal':
        return {
          color: 'text-[#44FF44]',
          bg: 'bg-[#44FF44]/20',
          message: 'STEAL!',
          icon: Grab,
        }
      case 'foul':
        return {
          color: 'text-[#FF4444]',
          bg: 'bg-[#FF4444]/20',
          message: 'FOUL!',
          icon: AlertTriangle,
        }
      case 'score':
        return {
          color: 'text-[#FDB927]',
          bg: 'bg-[#FDB927]/20',
          message: 'LAKERS SCORE!',
          icon: AlertTriangle,
        }
      default:
        return null
    }
  }

  const resultInfo = result ? getResultInfo() : null
  const ResultIcon = resultInfo?.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/95 via-[#552583]/30 to-black/95 backdrop-blur-sm"
      >
        {/* "BEAT LA" chant background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl font-['Oswald'] font-bold text-[#007A33]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            >
              BEAT LA
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative max-w-4xl w-full mx-4">
          {/* Timer */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2"
            animate={{ scale: timeLeft <= 2 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 2 ? Infinity : 0 }}
          >
            <div
              className={`text-6xl font-['Oswald'] font-bold ${
                timeLeft <= 2 ? 'text-[#FF4444]' : timeLeft <= 3 ? 'text-[#FDB927]' : 'text-white'
              }`}
            >
              {timeLeft}
            </div>
          </motion.div>

          {/* Lakers player card */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl font-['Oswald'] font-bold text-white mb-2">
                DEFENSE!
              </h2>
              <p className="text-[#FDB927] font-['Oswald'] text-lg">
                {getActionText()}
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

              <div className="flex items-center gap-4 relative z-10">
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

          {/* Defense action buttons */}
          {!showResult && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {actions.map((action, index) => {
                const Icon = action.icon
                const isSelected = selectedChoice === action.id

                return (
                  <motion.button
                    key={action.id}
                    onClick={() => handleChoice(action.id)}
                    disabled={selectedChoice !== null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: selectedChoice ? 1 : 1.05 }}
                    whileTap={{ scale: selectedChoice ? 1 : 0.95 }}
                    className={`relative px-6 py-8 rounded-2xl backdrop-blur-md bg-gradient-to-br ${action.color} border-2 border-white/20 transition-all ${action.hoverColor} hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${isSelected ? 'ring-4 ring-white' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                      <div className="text-center">
                        <p className="font-['Oswald'] text-xl font-bold text-white mb-1">
                          {action.label}
                        </p>
                        <p className="text-white/80 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}

          {/* Result display */}
          {showResult && resultInfo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                className={`inline-block px-12 py-8 rounded-2xl ${resultInfo.bg} border-2 ${resultInfo.color.replace('text-', 'border-')}`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                {ResultIcon && (
                  <ResultIcon
                    className={`w-20 h-20 mx-auto mb-4 ${resultInfo.color}`}
                    strokeWidth={2.5}
                  />
                )}
                <h3 className={`text-5xl font-['Oswald'] font-bold ${resultInfo.color}`}>
                  {resultInfo.message}
                </h3>
              </motion.div>
            </motion.div>
          )}

          {/* Celtics defender silhouette */}
          <motion.div
            className="absolute -bottom-8 left-8 text-[#007A33]/20 text-8xl pointer-events-none"
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🛡️
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
