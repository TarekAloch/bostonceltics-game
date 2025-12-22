import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Clock, CheckCircle2, XCircle, Zap, Target, Repeat, Zap as Lightning } from 'lucide-react'

/**
 * PlayCallOffense Component - Two-phase offense (Play Selection + Trivia)
 *
 * Phase 1: Choose a basketball play (Pick & Roll, Isolation, Fast Break)
 * Phase 2: Answer trivia question (difficulty/success varies by play)
 *
 * Usage:
 * <PlayCallOffense
 *   question={{
 *     question: "Who holds the Celtics career scoring record?",
 *     answers: ["Larry Bird", "John Havlicek", "Paul Pierce", "Bill Russell"],
 *     correct: 1
 *   }}
 *   player={{ name: "Jayson Tatum", number: 0, position: "SF" }}
 *   onComplete={(isCorrect, playType, questionIndex) => {
 *     console.log('Play:', playType, 'Result:', isCorrect)
 *   }}
 * />
 */

const PLAYS = [
  {
    id: 'pick-roll',
    name: 'PICK & ROLL',
    icon: Repeat,
    description: 'Classic play with high success rate',
    successRate: 75,
    color: '#007A33',
    difficulty: 'Balanced'
  },
  {
    id: 'isolation',
    name: 'ISOLATION',
    icon: Target,
    description: 'One-on-one matchup, high risk/reward',
    successRate: 60,
    color: '#BA9653',
    difficulty: 'Hard'
  },
  {
    id: 'fast-break',
    name: 'FAST BREAK',
    icon: Lightning,
    description: 'Quick tempo offense, easier execution',
    successRate: 85,
    color: '#F59E0B',
    difficulty: 'Easy'
  }
]

export default function PlayCallOffense({ question, player, onComplete }) {
  const [phase, setPhase] = useState('play-select') // 'play-select' | 'trivia'
  const [selectedPlay, setSelectedPlay] = useState(null)
  const [playTimer, setPlayTimer] = useState(5)

  // Trivia phase state
  const [timeLeft, setTimeLeft] = useState(10)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const playTimerRef = useRef(null)
  const triviaTimerRef = useRef(null)
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

  // Sound effects
  const playSound = useCallback((frequency, duration = 0.1, volume = 0.08) => {
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

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (error) {
      console.warn('Audio not supported:', error)
    }
  }, [])

  // Define callbacks BEFORE useEffects that reference them
  const handlePlaySelect = useCallback((playId) => {
    if (selectedPlay) return

    const play = PLAYS.find(p => p.id === playId)
    setSelectedPlay(play)
    playSound(880, 0.2, 0.1)

    if (playTimerRef.current) {
      clearInterval(playTimerRef.current)
    }

    setTimeout(() => {
      setPhase('trivia')
    }, 1000)
  }, [selectedPlay, playSound])

  const handleTimeout = useCallback(() => {
    setIsCorrect(false)
    setShowResult(true)
    playSound(220, 0.3, 0.1)
    setTimeout(() => onComplete(false, selectedPlay?.id || 'pick-roll', question?.index ?? 0), 2500)
  }, [onComplete, selectedPlay, question, playSound])

  // Play selection timer
  useEffect(() => {
    if (phase !== 'play-select' || selectedPlay) return

    playTimerRef.current = setInterval(() => {
      setPlayTimer(prev => {
        if (prev <= 1) {
          clearInterval(playTimerRef.current)
          handlePlaySelect('pick-roll') // Auto-select Pick & Roll
          return 0
        }
        if (prev <= 3) playSound(600)
        return prev - 1
      })
    }, 1000)

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [phase, selectedPlay, playSound, handlePlaySelect])

  // Trivia timer
  useEffect(() => {
    if (phase !== 'trivia' || showResult) return

    triviaTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(triviaTimerRef.current)
          handleTimeout()
          return 0
        }
        if (prev <= 5) playSound(prev <= 3 ? 1200 : 800)
        return prev - 1
      })
    }, 1000)

    return () => {
      if (triviaTimerRef.current) clearInterval(triviaTimerRef.current)
    }
  }, [phase, showResult, playSound, handleTimeout])

  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null || showResult || !question) return

    setSelectedAnswer(answerIndex)
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)
    playSound(correct ? 523.25 : 220, correct ? 0.5 : 0.3, 0.15)

    if (triviaTimerRef.current) {
      clearInterval(triviaTimerRef.current)
    }

    setTimeout(() => onComplete(correct, selectedPlay?.id || 'pick-roll', question?.index ?? 0), 2500)
  }, [selectedAnswer, showResult, question, onComplete, selectedPlay, playSound])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'play-select' && !selectedPlay) {
        if (e.key === '1') handlePlaySelect('pick-roll')
        if (e.key === '2') handlePlaySelect('isolation')
        if (e.key === '3') handlePlaySelect('fast-break')
      }

      if (phase === 'trivia' && !showResult && selectedAnswer === null && question?.answers) {
        const key = parseInt(e.key)
        if (key >= 1 && key <= 4 && key <= question.answers.length) {
          handleAnswer(key - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, selectedPlay, showResult, selectedAnswer, question, handlePlaySelect, handleAnswer])

  // Validate required props
  if (!question || !question.question || !question.answers || !Array.isArray(question.answers)) {
    console.error('[PlayCallOffense] Invalid question prop:', question)
    return null
  }

  // Play Selection Phase
  if (phase === 'play-select') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4"
        role="dialog"
        aria-labelledby="play-selection"
      >

        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-5xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-['Oswald'] text-4xl md:text-5xl font-bold text-white mb-2 uppercase"
            >
              Call Your Play
            </motion.h2>
            {player && (
              <p className="text-[#BA9653] text-lg font-medium">
                {player?.name ?? 'Unknown Player'} #{player?.number ?? 0} has the ball
              </p>
            )}

            {/* Timer */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/10 rounded-full border border-white/20"
            >
              <Clock className="w-5 h-5 text-white/60" />
              <span className={`font-['Oswald'] text-2xl font-bold ${
                playTimer <= 2 ? 'text-red-400' : 'text-white'
              }`}>
                {playTimer}s
              </span>
            </motion.div>
          </div>

          {/* Play options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLAYS.map((play, index) => (
              <motion.button
                key={play.id}
                onClick={() => handlePlaySelect(play.id)}
                disabled={selectedPlay !== null}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={!selectedPlay ? { scale: 1.05, y: -5 } : {}}
                whileTap={!selectedPlay ? { scale: 0.95 } : {}}
                className={`
                  group relative p-6 rounded-2xl border-2 transition-all duration-300
                  ${selectedPlay?.id === play.id
                    ? 'bg-gradient-to-br from-[#007A33]/40 to-[#005A25]/40 border-[#007A33] shadow-[0_0_50px_rgba(0,122,51,0.6)] scale-105'
                    : !selectedPlay
                    ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/20 hover:border-[#007A33]/50 hover:shadow-[0_0_30px_rgba(0,122,51,0.3)] cursor-pointer'
                    : 'bg-white/5 border-white/10 opacity-50'
                  }
                `}
                aria-label={`${play.name} - ${play.description}`}
              >
                {/* Play icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                  className="mb-4 flex justify-center"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedPlay?.id === play.id
                      ? 'bg-[#007A33] shadow-[0_0_30px_rgba(0,122,51,0.6)]'
                      : 'bg-white/10 group-hover:bg-[#007A33]/30'
                  }`}>
                    <play.icon className={`w-8 h-8 ${
                      selectedPlay?.id === play.id ? 'text-white' : 'text-white/70'
                    }`} />
                  </div>
                </motion.div>

                {/* Play name */}
                <h3 className="font-['Oswald'] text-2xl font-bold text-white mb-2 text-center">
                  {play.name}
                </h3>

                {/* Description */}
                <p className="text-white/70 text-sm text-center mb-4">
                  {play.description}
                </p>

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Success Rate:</span>
                    <span className="text-[#BA9653] font-bold">{play.successRate}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Difficulty:</span>
                    <span className="text-white font-medium">{play.difficulty}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${play.successRate}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-[#007A33] to-[#BA9653]"
                    />
                  </div>
                </div>

                {/* Keyboard hint */}
                {!selectedPlay && (
                  <kbd className="absolute right-3 top-3 px-2.5 py-1.5 text-sm text-white/40 bg-white/5 rounded border border-white/10 font-mono">
                    {index + 1}
                  </kbd>
                )}

                {/* Selected indicator */}
                <AnimatePresence>
                  {selectedPlay?.id === play.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <CheckCircle2 className="w-8 h-8 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Instructions */}
          {!selectedPlay && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center text-white/40 text-sm"
            >
              Select a play or press{' '}
              {[1, 2, 3].map((num) => (
                <kbd key={num} className="px-2.5 py-1.5 bg-white/10 rounded border border-white/20 mx-1 font-mono">
                  {num}
                </kbd>
              ))}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    )
  }

  // Trivia Phase
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
    >

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative w-full max-w-4xl bg-gradient-to-br from-[#0A1612] to-[#0F1E1A] border-2 border-[#007A33]/40 rounded-3xl shadow-[0_0_80px_rgba(0,122,51,0.4)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#007A33] to-[#005A25] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedPlay && <selectedPlay.icon className="w-7 h-7 text-[#BA9653]" />}
            <div>
              <h2 className="font-['Oswald'] text-xl md:text-2xl font-bold text-white uppercase">
                {selectedPlay.name}
              </h2>
              <p className="text-white/70 text-sm">
                Execute the play • Answer correctly to score
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
              <motion.circle
                cx="50" cy="50" r="45" fill="none"
                stroke={timerColor} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
              />
            </svg>
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`absolute font-['Oswald'] text-3xl font-bold ${
                timeLeft <= 3 ? 'text-red-400' : timeLeft <= 5 ? 'text-yellow-400' : 'text-white'
              }`}
            >
              {timeLeft}
            </motion.span>
          </div>
        </div>

        {/* Question */}
        <div className="px-6 md:px-10 py-10">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white font-['Oswald'] text-2xl md:text-4xl font-bold mb-10 text-center"
          >
            {question.question}
          </motion.h3>

          {/* Answers */}
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
                  transition={{ delay: index * 0.08 }}
                  whileHover={!selectedAnswer && !showResult ? { scale: 1.03 } : {}}
                  whileTap={!selectedAnswer && !showResult ? { scale: 0.97 } : {}}
                  className={`
                    relative min-h-[80px] px-6 py-5 rounded-xl font-medium text-left text-lg
                    border-2 transition-all duration-300
                    ${showCorrect
                      ? 'bg-green-500/30 border-green-500 text-green-300 shadow-[0_0_40px_rgba(74,222,128,0.5)]'
                      : showWrong
                      ? 'bg-red-500/30 border-red-500 text-red-300 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                      : !showResult && !selectedAnswer
                      ? 'bg-white/5 border-white/20 text-white hover:border-[#007A33] cursor-pointer'
                      : 'bg-white/5 border-white/10 text-white/40'
                    }
                  `}
                >
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full mr-4 font-['Oswald'] font-bold ${
                    showCorrect ? 'bg-green-500 text-white' :
                    showWrong ? 'bg-red-500 text-white' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="align-middle">{answer}</span>

                  <AnimatePresence>
                    {showCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-5 top-1/2 -translate-y-1/2">
                        <CheckCircle2 className="w-7 h-7 text-green-400" />
                      </motion.div>
                    )}
                    {showWrong && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-5 top-1/2 -translate-y-1/2">
                        <XCircle className="w-7 h-7 text-red-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showResult && !selectedAnswer && (
                    <kbd className="absolute right-3 top-3 px-2 py-1 text-xs bg-white/5 rounded border border-white/10 font-mono text-white/40">
                      {index + 1}
                    </kbd>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Result */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 text-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block mb-3">
                  {isCorrect ? (
                    <Zap className="w-16 h-16 text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                  )}
                </motion.div>

                <p className={`font-['Oswald'] text-4xl font-bold mb-3 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'SCORE!' : selectedAnswer === null ? 'TIME\'S UP!' : 'MISS!'}
                </p>
                <p className="text-white/80 text-lg">
                  {isCorrect
                    ? `${selectedPlay.name} executed perfectly!`
                    : `${selectedPlay.name} failed. Turnover!`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
