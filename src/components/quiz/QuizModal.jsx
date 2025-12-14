import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, Clock, CheckCircle2, XCircle } from 'lucide-react'

/**
 * QuizModal Component - Trivia with 10s timer
 *
 * Usage:
 * <QuizModal
 *   question={{
 *     question: "Who holds the Celtics career scoring record?",
 *     answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
 *     correct: 2
 *   }}
 *   onComplete={(isCorrect, questionIndex) => console.log(isCorrect)}
 * />
 */
export default function QuizModal({ question, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)

  // Timer tick sound using Web Audio API
  const playTick = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }

      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (error) {
      // Silently fail if audio not supported
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

        // Play tick in last 5 seconds
        if (prev <= 5) {
          playTick()
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [showResult, playTick])

  const handleTimeout = useCallback(() => {
    setIsCorrect(false)
    setShowResult(true)
    setTimeout(() => onComplete(false, question.index || 0), 2000)
  }, [onComplete, question.index])

  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult) return

    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeout(() => onComplete(correct, question.index || 0), 2000)
  }, [selectedAnswer, showResult, question, onComplete])

  // Keyboard support (1-4 for answers)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResult || selectedAnswer !== null) return

      const key = parseInt(e.key)
      if (key >= 1 && key <= 4 && key <= question.answers.length) {
        handleAnswer(key - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleAnswer, showResult, selectedAnswer, question.answers.length])

  // Circular timer progress
  const circumference = 2 * Math.PI * 45 // radius = 45
  const progress = (timeLeft / 10) * circumference
  const timerColor = timeLeft <= 3 ? '#EF4444' : timeLeft <= 5 ? '#F59E0B' : '#007A33'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      role="dialog"
      aria-labelledby="quiz-question"
      aria-describedby="quiz-timer"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-3xl bg-gradient-to-br from-[#0A1612] to-[#0F1E1A] border-2 border-[#007A33]/30 rounded-2xl shadow-[0_0_60px_rgba(0,122,51,0.3)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007A33] to-[#005A25] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#BA9653]" aria-hidden="true" />
            <h2 className="font-['Oswald'] text-xl md:text-2xl font-bold text-white tracking-wide">
              CELTICS TRIVIA
            </h2>
          </div>

          {/* Circular timer */}
          <div className="relative flex items-center justify-center" id="quiz-timer">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={timerColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-['Oswald'] text-2xl font-bold ${
                timeLeft <= 3 ? 'text-red-400' : timeLeft <= 5 ? 'text-yellow-400' : 'text-white'
              }`}>
                {timeLeft}
              </span>
            </div>
            <Clock className="absolute w-4 h-4 text-white/40 -bottom-1" aria-hidden="true" />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 md:px-8 py-8">
          <h3
            id="quiz-question"
            className="text-white font-['Oswald'] text-2xl md:text-3xl font-bold mb-8 leading-relaxed text-center"
          >
            {question.question}
          </h3>

          {/* Answers grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={selectedAnswer === null && !showResult ? { scale: 1.02 } : {}}
                  whileTap={selectedAnswer === null && !showResult ? { scale: 0.98 } : {}}
                  className={`
                    relative min-h-[72px] px-6 py-4 rounded-xl font-medium text-left text-lg
                    border-2 transition-all duration-300 touch-none select-none
                    ${showCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_30px_rgba(74,222,128,0.4)]'
                      : showWrong
                      ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                      : !showResult && selectedAnswer === null
                      ? 'bg-white/5 border-white/20 text-white hover:bg-[#007A33]/20 hover:border-[#007A33] hover:shadow-[0_0_20px_rgba(0,122,51,0.3)]'
                      : 'bg-white/5 border-white/10 text-white/40'
                    }
                  `}
                  aria-label={`Answer ${String.fromCharCode(65 + index)}: ${answer}`}
                >
                  {/* Letter badge */}
                  <span className={`
                    inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 font-['Oswald'] font-bold
                    ${showCorrect
                      ? 'bg-green-500 text-white'
                      : showWrong
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/60'
                    }
                  `}>
                    {String.fromCharCode(65 + index)}
                  </span>

                  <span className="align-middle">{answer}</span>

                  {/* Result icon */}
                  <AnimatePresence>
                    {showCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="w-6 h-6 text-green-400" aria-hidden="true" />
                      </motion.div>
                    )}
                    {showWrong && (
                      <motion.div
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <XCircle className="w-6 h-6 text-red-400" aria-hidden="true" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Keyboard hint */}
                  {!showResult && selectedAnswer === null && (
                    <span className="absolute left-2 top-2 text-xs text-white/30 font-mono">
                      {index + 1}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Result message */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center"
              >
                <p className={`font-['Oswald'] text-2xl md:text-3xl font-bold ${
                  isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isCorrect ? 'CORRECT!' : selectedAnswer === null ? 'TIME\'S UP!' : 'INCORRECT'}
                </p>
                <p className="text-white/70 mt-2 text-sm md:text-base">
                  {isCorrect
                    ? 'Shot accuracy boosted by +15%!'
                    : selectedAnswer === null
                    ? 'No boost applied'
                    : 'Better luck next time'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          {!showResult && (
            <p className="mt-6 text-center text-white/40 text-sm">
              Click or press <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">1</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">2</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">3</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 mx-1">4</kbd>
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
