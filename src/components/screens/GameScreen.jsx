import { useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'

// Game components
import Scoreboard from '../game/Scoreboard'
import Court from '../game/Court'
import Crowd from '../game/Crowd'
import Commentary from '../game/Commentary'

// Offense components
import TriviaOffense from '../offense/TriviaOffense'
import PlayCallOffense from '../offense/PlayCallOffense'

// Defense components
import DefenseChoice from '../defense/DefenseChoice'
import DefensePredict from '../defense/DefensePredict'

/**
 * GameScreen - Main game orchestrator for trivia-based basketball game
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
    crowdMood,
    showBeatLA,
    currentQuestion,
    celticsRoster,
    lakersRoster,
    offenseMode,
    defenseMode,
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

  // Handle phase-specific sound effects
  useEffect(() => {
    if (!phase) return

    try {
      if (phase === 'defense-choice' || phase === 'defense-predict') {
        sound?.playDefenseChant?.()
      }
      if (showBeatLA && possession === 'lakers') {
        sound?.playBeatLAChant?.()
      }
    } catch (error) {
      console.error('[GameScreen] Error playing phase sound:', error)
    }
  }, [phase, possession, showBeatLA, sound])

  // Resolve Celtics shot when triviaResult is set (Mode 1: pure trivia)
  useEffect(() => {
    if (phase === 'offense-trivia' && triviaResult && !resolvedRef.current) {
      resolvedRef.current = true
      // Small delay for UX, then resolve
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
    }, 800)

    return () => clearTimeout(timer)
  }, [phase, actions])

  // Handle result phase sounds
  useEffect(() => {
    if (phase !== 'result' || !lastPlay) return

    const { type, team, points } = lastPlay

    try {
      if (type === 'made') {
        if (team === 'celtics') {
          const isThree = points === 3
          sound?.playCelticsScore?.(isThree)
          if (isThree || lastPlay?.playType === 'fast-break') {
            setTimeout(() => sound?.playCrowdEruption?.(), 500)
          }
        } else {
          sound?.playLakersScore?.()
        }
      } else if (type === 'missed') {
        if (team === 'celtics') {
          sound?.playCelticsMiss?.()
        } else {
          sound?.playLakersMiss?.()
        }
      } else if (type === 'blocked') {
        sound?.playBlock?.()
        setTimeout(() => sound?.playCrowdEruption?.(), 300)
      } else if (type === 'steal') {
        sound?.playSteal?.()
        setTimeout(() => sound?.playCrowdEruption?.(), 300)
      } else if (type === 'foul') {
        sound?.playFoulWhistle?.()
      }
    } catch (error) {
      console.error('[GameScreen] Error playing result sound:', error)
    }
  }, [phase, lastPlay, sound])

  // Shot clock warning sound
  useEffect(() => {
    if (shotClock === 5 && (phase === 'offense-trivia' || phase === 'offense-play-call')) {
      sound?.playShotClockWarning?.()
    }
  }, [shotClock, phase, sound])

  // Quarter buzzer
  useEffect(() => {
    if (timeRemaining === 0) {
      sound?.playQuarterBuzzer?.()
    }
  }, [timeRemaining, sound])

  // Handle trivia completion for offense (Mode 1)
  const handleTriviaComplete = useCallback((correct, questionIndex) => {
    sound?.playQuizResult?.(correct)
    // Just submit answer - useEffect will handle resolution when state updates
    actions?.answerTrivia?.(correct, questionIndex)
  }, [sound, actions])

  // Handle play call offense completion (Mode 2)
  const handlePlayCallComplete = useCallback((correct, play, questionIndex) => {
    sound?.playQuizResult?.(correct)
    // Submit both - useEffect will handle resolution when both are set
    actions?.selectPlay?.(play)
    actions?.answerTrivia?.(correct, questionIndex)
  }, [sound, actions])

  // Handle defense choice completion (Mode 1)
  const handleDefenseChoiceComplete = useCallback((choice, result) => {
    // Play sound based on anticipated result
    if (result === 'block') {
      sound?.playBlock?.()
    } else if (result === 'steal') {
      sound?.playSteal?.()
    } else if (result === 'foul') {
      sound?.playFoulWhistle?.()
    }
    // Just submit choice - useEffect will handle resolution when state updates
    actions?.selectDefenseChoice?.(choice)
  }, [sound, actions])

  // Handle defense prediction completion (Mode 2)
  const handleDefensePredictComplete = useCallback((prediction, wasCorrect) => {
    if (wasCorrect) {
      sound?.playCrowdCheer?.()
    }
    // Just submit prediction - useEffect will handle resolution when state updates
    actions?.submitPrediction?.(prediction)
  }, [sound, actions])

  // Build shot data for Court component
  const shotData = lastPlay && phase === 'result' ? {
    from: possession === 'celtics' ? 'right' : 'left',
    to: 'basket',
    shotType: lastPlay.action || selectedAction || 'mid-range',
    result: lastPlay.type,
  } : null

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#0A1612] via-[#0d1a15] to-[#0A1612] overflow-hidden">
      {/* Scoreboard at top */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4">
        <Scoreboard
          score={score}
          quarter={quarter}
          timeRemaining={timeRemaining}
          shotClock={shotClock}
          possession={possession}
        />
      </div>

      {/* Main court area with crowd */}
      <div className="absolute inset-x-0 top-24 bottom-32 z-10">
        <Court
          possession={possession}
          playType={playSelection}
          celticsPlayers={celticsRoster || []}
          lakersPlayers={lakersRoster || []}
          activePlayer={activePlayer}
          phase={phase}
          lastPlay={lastPlay}
          showShotArc={phase === 'result' && lastPlay?.type !== 'steal' && lastPlay?.type !== 'blocked'}
          shotData={shotData}
          onShotComplete={() => {}}
        >
          <Crowd
            mood={crowdMood || 'neutral'}
            showBeatLA={showBeatLA || false}
            lastPlay={lastPlay}
          />
        </Court>
      </div>

      {/* Phase-based overlays */}
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
      </AnimatePresence>

      {/* Commentary at bottom */}
      <div className="absolute bottom-4 left-0 right-0 z-20">
        <Commentary lastPlay={lastPlay} />
      </div>
    </div>
  )
}
