import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, CheckCircle2, XCircle, Zap } from 'lucide-react'

/**
 * TriviaOffense Component - Pure trivia mode for Boston Celtics game
 *
 * Answer trivia correctly to boost shot accuracy. Features a 10-second countdown,
 * Celtics-themed design, and smooth animations.
 *
 * Usage:
 * <TriviaOffense
 *   question={{
 *     question: "Who holds the Celtics career scoring record?",
 *     answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
 *     correct: 1
 *   }}
 *   player={{ name: "Jayson Tatum", number: 0, position: "SF" }}
 *   onComplete={(isCorrect, questionIndex) => {
 *     console.log('Answer:', isCorrect)
 *   }}
 * />
 */
export default function TriviaOffense({ question, player, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close()
        } catch (error) {
          // Silently fail cleanup
        }
      }
    }
  }, [])

  // Timer tick sound using Web Audio API - pass frequency as parameter to avoid dependency
  const playTick = useCallback((frequency) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (error) {
      console.warn('Audio not supported:', error)
    }
  }, [])

  // Success/failure sound
  const playResultSound = useCallback((success) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      if (success) {
        // Triumphant major chord arpeggio
        oscillator.frequency.value = 523.25 // C5
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
      } else {
        // Disappointing minor chord
        oscillator.frequency.value = 220 // A3
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }

      oscillator.type = 'triangle'
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + (success ? 0.5 : 0.3))
    } catch (error) {
      console.warn('Audio not supported:', error)
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (showResult) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }

        if (prev <= 5) {
          playTick(prev <= 3 ? 1200 : 800)
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [showResult, playTick, handleTimeout])

  const handleTimeout = useCallback(() => {
    setIsCorrect(false)
    setShowResult(true)
    playResultSound(false)
    setTimeout(() => onComplete(false, question?.index ?? 0), 2500)
  }, [onComplete, question, playResultSound])

  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult || !question) return

    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)
    playResultSound(correct)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeout(() => onComplete(correct, question?.index ?? 0), 2500)
  }, [selectedAnswer, showResult, question, onComplete, playResultSound])

  // Keyboard support (1-4 for answers)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResult || selectedAnswer !== null || !question?.answers) return

      const key = parseInt(e.key)
      if (key >= 1 && key <= 4 && key <= question.answers.length) {
        handleAnswer(key - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAnswer, showResult, selectedAnswer, question])

  // Circular timer progress
  // Validate question prop
  if (!question || !question.question || !question.answers || !Array.isArray(question.answers)) {
    console.error('[TriviaOffense] Invalid question prop:', question)
    return null
  }

  const circumference = 2 * Math.PI * 45
  const progress = (timeLeft / 10) * circumference
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 5 ? '#F59E0B' : '#007A33'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4"
      role="dialog"
      aria-labelledby="trivia-question"
      aria-describedby="trivia-timer"
    >

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-gradient-to-br from-[#0A1612] to-[#0F1E1A] border-2 border-[#007A33]/40 rounded-3xl shadow-[0_0_80px_rgba(0,122,51,0.4)] overflow-hidden"
      >
        {/* Header with player info */}
        <div className="bg-gradient-to-r from-[#007A33] to-[#005A25] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-7 h-7 text-[#BA9653]" aria-hidden="true" />
            </motion.div>
            <div>
              <h2 className="font-['Oswald'] text-xl md:text-2xl font-bold text-white tracking-wide uppercase">
                Celtics Trivia
              </h2>
              {player && (
                <p className="text-[#BA9653] text-sm font-medium">
                  {player.name} #{player.number} • {player.position}
                </p>
              )}
            </div>
          </div>

          {/* Circular timer */}
          <div className="relative flex items-center justify-center" id="trivia-timer">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100" aria-label={`${timeLeft} seconds remaining`}>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="7"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={timerColor}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: 'drop-shadow(0 0 12px currentColor)',
                  transition: 'stroke 0.3s ease'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                key={timeLeft}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`font-['Oswald'] text-3xl font-bold ${
                  timeLeft <= 3 ? 'text-red-400' : timeLeft <= 5 ? 'text-yellow-400' : 'text-white'
                }`}
              >
                {timeLeft}
              </motion.span>
            </div>
            <Clock className="absolute w-5 h-5 text-white/30 -bottom-1" aria-hidden="true" />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 md:px-10 py-10">
          <motion.h3
            id="trivia-question"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white font-['Oswald'] text-2xl md:text-4xl font-bold mb-10 leading-relaxed text-center"
          >
            {question.question}
          </motion.h3>

          {/* Answers grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === index
              const isCorrectAnswer = index === question.correct
              const showCorrect = showResult && isCorrectAnswer
              const showWrong = showResult && isSelected && !isCorrectAnswer

              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null || showResult}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08, type: "spring" }}
                  whileHover={selectedAnswer === null && !showResult ? {
                    scale: 1.03,
                    boxShadow: "0 0 30px rgba(0,122,51,0.5)"
                  } : {}}
                  whileTap={selectedAnswer === null && !showResult ? { scale: 0.97 } : {}}
                  className={`
                    group relative min-h-[80px] px-6 py-5 rounded-xl font-medium text-left text-base md:text-lg
                    border-2 transition-all duration-300 touch-none select-none
                    ${showCorrect
                      ? 'bg-gradient-to-r from-green-500/30 to-green-500/20 border-green-500 text-green-300 shadow-[0_0_40px_rgba(74,222,128,0.5)]'
                      : showWrong
                      ? 'bg-gradient-to-r from-red-500/30 to-red-500/20 border-red-500 text-red-300 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                      : !showResult && selectedAnswer === null
                      ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/20 text-white hover:from-[#007A33]/20 hover:to-[#007A33]/10 hover:border-[#007A33] cursor-pointer'
                      : 'bg-white/5 border-white/10 text-white/40'
                    }
                  `}
                  aria-label={`Answer ${String.fromCharCode(65 + index)}: ${answer}`}
                  aria-pressed={isSelected}
                >
                  {/* Glow effect on hover */}
                  {!showResult && selectedAnswer === null && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#007A33]/0 via-[#007A33]/20 to-[#007A33]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  {/* Letter badge */}
                  <span className={`
                    inline-flex items-center justify-center w-10 h-10 rounded-full mr-4 font-['Oswald'] font-bold text-base
                    ${showCorrect
                      ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(74,222,128,0.6)]'
                      : showWrong
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]'
                      : 'bg-white/10 text-white/60 group-hover:bg-[#007A33]/40 group-hover:text-white transition-colors'
                    }
                  `}>
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="align-middle relative z-10">{answer}</span>

                  {/* Result icon */}
                  <AnimatePresence>
                    {showCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute right-5 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="w-7 h-7 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" aria-hidden="true" />
                      </motion.div>
                    )}
                    {showWrong && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute right-5 top-1/2 -translate-y-1/2"
                      >
                        <XCircle className="w-7 h-7 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" aria-hidden="true" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Keyboard hint */}
                  {!showResult && selectedAnswer === null && (
                    <kbd className="absolute right-3 top-3 px-2 py-1 text-xs text-white/40 bg-white/5 rounded border border-white/10 font-mono">
                      {index + 1}
                    </kbd>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Result message */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mt-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-block mb-3"
                >
                  {isCorrect ? (
                    <Zap className="w-16 h-16 text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)]" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" aria-hidden="true" />
                  )}
                </motion.div>

                <p className={`font-['Oswald'] text-4xl md:text-5xl font-bold mb-3 ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isCorrect ? 'SCORE!' : selectedAnswer === null ? 'TIME\'S UP!' : 'MISS!'}
                </p>

                <p className="text-white/80 text-base md:text-lg font-medium">
                  {isCorrect
                    ? 'Perfect shot! Basketball knowledge pays off.'
                    : selectedAnswer === null
                    ? 'Shot clock violation. No points awarded.'
                    : 'Brick! Better luck on the next possession.'}
                </p>

                {/* Stat indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-6 max-w-xs mx-auto"
                >
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isCorrect ? '100%' : '0%' }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        isCorrect ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-2">
                    {isCorrect ? 'Shot accuracy: +15%' : 'No bonus'}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          {!showResult && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-center text-white/40 text-sm"
            >
              Click answer or press{' '}
              {[1, 2, 3, 4].slice(0, question.answers.length).map((num, i) => (
                <kbd key={num} className="px-2.5 py-1.5 bg-white/10 rounded border border-white/20 mx-1 font-mono">
                  {num}
                </kbd>
              ))}
            </motion.p>
          )}
        </div>

        {/* Court pattern decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#BA9653] to-transparent opacity-50" />
      </motion.div>
    </motion.div>
  )
}
