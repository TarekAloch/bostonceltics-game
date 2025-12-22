import { useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Game components
import Scoreboard from '../game/Scoreboard'

// Offense components
import TriviaOffense from '../offense/TriviaOffense'
import PlayCallOffense from '../offense/PlayCallOffense'

// Defense components
import DefenseChoice from '../defense/DefenseChoice'
import DefensePredict from '../defense/DefensePredict'

/**
 * GameScreen - Simplified trivia-based basketball game
 * No sprites, no court animations - just clean trivia gameplay
 */
export default function GameScreen({ state, actions, sound }) {
  const {
    phase,
    score,
    quarter,
    timeRemaining,
    shotClock,
    possession,
    activePlayer,
    lastPlay,
    selectedAction,
    playSelection,
    currentQuestion,
    triviaResult,
    defenseChoice,
    predictionResult,
  } = state

  // Track if we've already triggered resolution for current possession
  const resolvedRef = useRef(false)

  // Reset resolved flag when phase changes to a new input phase
  useEffect(() => {
    if (phase === 'offense-trivia' || phase === 'offense-play-call' ||
        phase === 'defense-choice' || phase === 'defense-predict') {
      resolvedRef.current = false
    }
  }, [phase])

  // Resolve Celtics shot when triviaResult is set (Mode 1: pure trivia)
  useEffect(() => {
    if (phase === 'offense-trivia' && triviaResult && !resolvedRef.current) {
      resolvedRef.current = true
      const timer = setTimeout(() => {
        actions?.resolveCelticsShot?.()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [phase, triviaResult, actions])

  // Resolve Celtics shot when triviaResult AND playSelection are set (Mode 2: play call)
  useEffect(() => {
    if (phase === 'offense-play-call' && triviaResult && playSelection && !resolvedRef.current) {
      resolvedRef.current = true
      const timer = setTimeout(() => {
        actions?.resolveCelticsShot?.()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [phase, triviaResult, playSelection, actions])

  // Resolve Lakers shot when defenseChoice is set (Mode 1: choice)
  useEffect(() => {
    if (phase === 'defense-choice' && defenseChoice && !resolvedRef.current) {
      resolvedRef.current = true
      const timer = setTimeout(() => {
        actions?.resolveLakersShot?.()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [phase, defenseChoice, actions])

  // Resolve Lakers shot when predictionResult is set (Mode 2: predict)
  useEffect(() => {
    if (phase === 'defense-predict' && predictionResult && !resolvedRef.current) {
      resolvedRef.current = true
      const timer = setTimeout(() => {
        actions?.resolveLakersShot?.()
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [phase, predictionResult, actions])

  // Handle transition phase - auto-advance to next possession
  useEffect(() => {
    if (phase !== 'transition') return

    const timer = setTimeout(() => {
      actions?.nextPossession?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [phase, actions])

  // Handle trivia completion for offense (Mode 1)
  const handleTriviaComplete = useCallback((correct, questionIndex) => {
    actions?.answerTrivia?.(correct, questionIndex)
  }, [actions])

  // Handle play call offense completion (Mode 2)
  const handlePlayCallComplete = useCallback((correct, play, questionIndex) => {
    actions?.answerTriviaWithPlay?.(correct, questionIndex, play)
  }, [actions])

  // Handle defense choice completion (Mode 1)
  const handleDefenseChoiceComplete = useCallback((choice) => {
    actions?.selectDefenseChoice?.(choice)
  }, [actions])

  // Handle defense prediction completion (Mode 2)
  const handleDefensePredictComplete = useCallback((prediction) => {
    actions?.submitPrediction?.(prediction)
  }, [actions])

  // Result message
  const getResultMessage = () => {
    if (!lastPlay) return null
    const { type, team, points } = lastPlay

    if (type === 'made') {
      if (team === 'celtics') {
        return points === 3 ? '☘️ THREE POINTER! +3' : '☘️ BUCKET! +2'
      } else {
        return `Lakers score +${points}`
      }
    } else if (type === 'missed') {
      return team === 'celtics' ? 'Shot missed...' : 'Lakers miss!'
    } else if (type === 'blocked') {
      return '🛡️ BLOCKED!'
    } else if (type === 'steal') {
      return '🔥 STEAL!'
    } else if (type === 'foul') {
      return 'Foul called'
    }
    return null
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#0A1612] via-[#0d1a15] to-[#0A1612] overflow-hidden flex flex-col">
      {/* Scoreboard at top */}
      <div className="flex-shrink-0 p-4">
        <Scoreboard
          score={score}
          quarter={quarter}
          timeRemaining={timeRemaining}
          shotClock={shotClock}
          possession={possession}
        />
      </div>

      {/* Main game area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Celtics Offense - Pure Trivia (Mode 1) */}
          {phase === 'offense-trivia' && currentQuestion && activePlayer && (
            <TriviaOffense
              key="offense-trivia"
              question={currentQuestion}
              player={activePlayer}
              onComplete={handleTriviaComplete}
            />
          )}

          {/* Celtics Offense - Play Call + Trivia (Mode 2) */}
          {phase === 'offense-play-call' && currentQuestion && activePlayer && (
            <PlayCallOffense
              key="offense-play-call"
              question={currentQuestion}
              player={activePlayer}
              onComplete={handlePlayCallComplete}
            />
          )}

          {/* Lakers Defense - Choice Mode (Mode 1) */}
          {phase === 'defense-choice' && activePlayer && (
            <DefenseChoice
              key="defense-choice"
              lakersPlayer={activePlayer}
              lakersAction={selectedAction || 'mid-range'}
              onComplete={handleDefenseChoiceComplete}
            />
          )}

          {/* Lakers Defense - Prediction Mode (Mode 2) */}
          {phase === 'defense-predict' && activePlayer && (
            <DefensePredict
              key="defense-predict"
              lakersPlayer={activePlayer}
              actualPlay={selectedAction || 'mid-range'}
              onComplete={handleDefensePredictComplete}
            />
          )}

          {/* Result Phase */}
          {(phase === 'result' || phase === 'transition') && lastPlay && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className={`text-4xl md:text-6xl font-bold font-['Oswald'] ${
                lastPlay.team === 'celtics' && lastPlay.type === 'made'
                  ? 'text-[#00ff44]'
                  : lastPlay.type === 'blocked' || lastPlay.type === 'steal'
                    ? 'text-[#00ff44]'
                    : lastPlay.team === 'lakers' && lastPlay.type === 'made'
                      ? 'text-[#FDB927]'
                      : 'text-white/70'
              }`}>
                {getResultMessage()}
              </div>
              <div className="mt-4 text-white/50 text-lg">
                {phase === 'transition' ? 'Next possession...' : ''}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score display at bottom */}
      <div className="flex-shrink-0 p-4 text-center">
        <div className="text-white/40 text-sm font-['Oswald'] tracking-wider">
          {possession === 'celtics' ? '☘️ CELTICS BALL' : '💜 LAKERS BALL'}
        </div>
      </div>
    </div>
  )
}
