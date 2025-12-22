import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * TriviaOffense - Clean, simple trivia component
 * No complex audio, no heavy animations - just stable trivia gameplay
 */
export default function TriviaOffense({ question, player, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const timerRef = useRef(null)
  const completedRef = useRef(false)

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsCorrect(false)
    setShowResult(true)
    setTimeout(() => onComplete(false, question?.index ?? 0), 2000)
  }, [onComplete, question])

  // Countdown timer
  useEffect(() => {
    if (showResult) return

    completedRef.current = false

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [showResult, handleTimeout])

  // Handle answer selection
  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult || !question || completedRef.current) return

    completedRef.current = true
    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeout(() => onComplete(correct, question?.index ?? 0), 2000)
  }, [selectedAnswer, showResult, question, onComplete])

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

  // Validate question prop
  if (!question || !question.question || !question.answers || !Array.isArray(question.answers)) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="bg-[#007A33] rounded-t-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-['Oswald'] text-xl tracking-wider">CELTICS TRIVIA</h2>
          <p className="text-white/70 text-sm">
            {player?.name} #{player?.number} • {player?.position}
          </p>
        </div>

        {/* Timer */}
        <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xl ${
          timeLeft <= 3 ? 'border-red-500 text-red-500' : 'border-white/30 text-white'
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div className="bg-[#0d1a15] p-6">
        <h3 className="text-white text-xl md:text-2xl font-medium mb-6 leading-relaxed">
          {question.question}
        </h3>

        {/* Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.answers.map((answer, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectAnswer = index === question.correct

            let bgColor = 'bg-[#1a2e25] hover:bg-[#243d32]'
            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = 'bg-green-600'
              } else if (isSelected && !isCorrectAnswer) {
                bgColor = 'bg-red-600'
              }
            } else if (isSelected) {
              bgColor = 'bg-[#007A33]'
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`${bgColor} p-4 rounded-lg text-left transition-colors flex items-center gap-3 ${
                  showResult ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className="w-8 h-8 rounded bg-black/30 flex items-center justify-center text-white/70 font-bold text-sm">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-white flex-1">{answer}</span>
                <span className="text-white/50 text-sm">{index + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Result message */}
        {showResult && (
          <div className={`mt-6 text-center text-2xl font-bold ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {isCorrect ? '✓ CORRECT!' : '✗ WRONG!'}
          </div>
        )}

        {/* Keyboard hint */}
        {!showResult && (
          <p className="text-white/40 text-center text-sm mt-4">
            Click answer or press <kbd className="px-2 py-1 bg-white/10 rounded mx-1">1</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded mx-1">2</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded mx-1">3</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded mx-1">4</kbd>
          </p>
        )}
      </div>
    </motion.div>
  )
}
