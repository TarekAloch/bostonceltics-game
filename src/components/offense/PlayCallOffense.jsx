import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

const PLAYS = [
  { id: 'pick-roll', name: 'Pick & Roll', icon: '🏀', desc: 'Classic two-man game' },
  { id: 'isolation', name: 'Isolation', icon: '⚡', desc: 'One-on-one attack' },
  { id: 'fast-break', name: 'Fast Break', icon: '🚀', desc: 'Push the pace' },
]

/**
 * PlayCallOffense - Simplified play selection + trivia
 * Clean, stable gameplay without complex animations
 */
export default function PlayCallOffense({ question, player, onComplete }) {
  const [phase, setPhase] = useState('play-select')
  const [selectedPlay, setSelectedPlay] = useState(null)
  const [playTimer, setPlayTimer] = useState(5)
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const playTimerRef = useRef(null)
  const triviaTimerRef = useRef(null)
  const completedRef = useRef(false)

  // Handle play selection
  const handlePlaySelect = useCallback((playId) => {
    if (selectedPlay) return

    const play = PLAYS.find(p => p.id === playId)
    setSelectedPlay(play)

    if (playTimerRef.current) {
      clearInterval(playTimerRef.current)
    }

    setTimeout(() => {
      setPhase('trivia')
    }, 500)
  }, [selectedPlay])

  // Handle trivia timeout
  const handleTimeout = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    setIsCorrect(false)
    setShowResult(true)
    setTimeout(() => onComplete(false, selectedPlay?.id || 'pick-roll', question?.index ?? 0), 2000)
  }, [onComplete, selectedPlay, question])

  // Play selection timer
  useEffect(() => {
    if (phase !== 'play-select' || selectedPlay) return

    playTimerRef.current = setInterval(() => {
      setPlayTimer(prev => {
        if (prev <= 1) {
          clearInterval(playTimerRef.current)
          handlePlaySelect('pick-roll')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [phase, selectedPlay, handlePlaySelect])

  // Trivia timer
  useEffect(() => {
    if (phase !== 'trivia' || showResult) return

    completedRef.current = false

    triviaTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(triviaTimerRef.current)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (triviaTimerRef.current) clearInterval(triviaTimerRef.current)
    }
  }, [phase, showResult, handleTimeout])

  // Handle answer selection
  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult || !question || completedRef.current) return

    completedRef.current = true
    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)

    if (triviaTimerRef.current) {
      clearInterval(triviaTimerRef.current)
    }

    setTimeout(() => onComplete(correct, selectedPlay?.id || 'pick-roll', question?.index ?? 0), 2000)
  }, [selectedAnswer, showResult, question, onComplete, selectedPlay])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'play-select' && !selectedPlay) {
        if (e.key === '1') handlePlaySelect('pick-roll')
        else if (e.key === '2') handlePlaySelect('isolation')
        else if (e.key === '3') handlePlaySelect('fast-break')
      } else if (phase === 'trivia' && !showResult && question?.answers) {
        const key = parseInt(e.key)
        if (key >= 1 && key <= 4 && key <= question.answers.length) {
          handleAnswer(key - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, selectedPlay, showResult, question, handlePlaySelect, handleAnswer])

  if (!question || !question.question || !question.answers) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Play Selection Phase */}
      {phase === 'play-select' && (
        <>
          <div className="bg-[#007A33] rounded-t-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-['Oswald'] text-xl tracking-wider">CALL THE PLAY</h2>
              <p className="text-white/70 text-sm">{player?.name} has the ball</p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center text-white font-bold">
              {playTimer}
            </div>
          </div>

          <div className="bg-[#0d1a15] p-6">
            <div className="grid grid-cols-3 gap-4">
              {PLAYS.map((play, index) => (
                <button
                  key={play.id}
                  onClick={() => handlePlaySelect(play.id)}
                  className="bg-[#1a2e25] hover:bg-[#243d32] p-4 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">{play.icon}</div>
                  <div className="text-white font-medium">{play.name}</div>
                  <div className="text-white/50 text-xs mt-1">{play.desc}</div>
                  <div className="text-white/30 text-xs mt-2">Press {index + 1}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Trivia Phase */}
      {phase === 'trivia' && (
        <>
          <div className="bg-[#007A33] rounded-t-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-['Oswald'] text-xl tracking-wider">
                {selectedPlay?.name?.toUpperCase()} - TRIVIA
              </h2>
              <p className="text-white/70 text-sm">{player?.name} #{player?.number}</p>
            </div>
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xl ${
              timeLeft <= 3 ? 'border-red-500 text-red-500' : 'border-white/30 text-white'
            }`}>
              {timeLeft}
            </div>
          </div>

          <div className="bg-[#0d1a15] p-6">
            <h3 className="text-white text-xl md:text-2xl font-medium mb-6">
              {question.question}
            </h3>

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
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`${bgColor} p-4 rounded-lg text-left transition-colors flex items-center gap-3`}
                  >
                    <span className="w-8 h-8 rounded bg-black/30 flex items-center justify-center text-white/70 font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-white flex-1">{answer}</span>
                    <span className="text-white/50 text-sm">{index + 1}</span>
                  </button>
                )
              })}
            </div>

            {showResult && (
              <div className={`mt-6 text-center text-2xl font-bold ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {isCorrect ? '✓ CORRECT!' : '✗ WRONG!'}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
