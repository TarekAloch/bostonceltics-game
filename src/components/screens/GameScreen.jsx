import { useEffect, useCallback } from 'react'
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
 *
 * Phase-based rendering:
 * - offense-trivia: Pure trivia mode (Mode 1)
 * - offense-play-call: Play selection + trivia (Mode 2)
 * - defense-choice: Contest/Block/Steal choice (Mode 1)
 * - defense-predict: Predict Lakers play (Mode 2)
 * - result: Show shot result and trigger sounds
 * - transition: Auto-advance to next possession
 *
 * @param {Object} state - Full game state from useGameState
 * @param {Object} actions - Game action handlers from useGameState
 * @param {Object} sound - Sound hook with play methods from useSound
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
  } = state

  // Handle phase-specific sound effects
  useEffect(() => {
    if (!phase) return

    try {
      // Defense chant during Lakers possession
      if (phase === 'defense-choice' || phase === 'defense-predict') {
        sound?.playDefenseChant?.()
      }

      // Beat LA chant when appropriate
      if (showBeatLA && possession === 'lakers') {
        sound?.playBeatLAChant?.()
      }
    } catch (error) {
      console.error('[GameScreen] Error playing phase sound:', error)
    }
  }, [phase, possession, showBeatLA, sound])

  // Handle result phase sounds and transitions
  useEffect(() => {
    if (phase !== 'result' || !lastPlay) return

    const { type, team, points } = lastPlay

    try {
      // Trigger appropriate sounds based on result type
      if (type === 'made') {
        if (team === 'celtics') {
          const isThree = points === 3
          sound?.playCelticsScore?.(isThree)

          // Extra celebration for big shots
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

    // Auto-advance after showing result (Celtics possession)
    if (team === 'celtics') {
      const timer = setTimeout(() => {
        try {
          actions?.resolveCelticsShot?.()
        } catch (error) {
          console.error('[GameScreen] Error resolving Celtics shot:', error)
        }
      }, 2500)

      return () => clearTimeout(timer)
    }

    // Auto-advance after showing result (Lakers possession)
    if (team === 'lakers') {
      const timer = setTimeout(() => {
        actions?.resolveLakersShot?.()
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [phase, lastPlay, sound, actions])

  // Handle transition phase - auto-advance to next possession
  useEffect(() => {
    if (phase !== 'transition') return

    const timer = setTimeout(() => {
      actions?.nextPossession?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [phase, actions])

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

  // Handle trivia completion for offense
  const handleTriviaComplete = useCallback((correct, questionIndex) => {
    // Play quiz result sound
    sound?.playQuizResult?.(correct)

    // Submit trivia answer to game state
    actions?.answerTrivia?.(correct, questionIndex)

    // Trigger shot resolution after brief delay
    setTimeout(() => {
      actions?.resolveCelticsShot?.()
    }, 100)
  }, [sound, actions])

  // Handle play call offense completion
  const handlePlayCallComplete = useCallback((correct, play, questionIndex) => {
    // Play quiz result sound
    sound?.playQuizResult?.(correct)

    // Submit play selection and trivia answer
    actions?.selectPlay?.(play)
    actions?.answerTrivia?.(correct, questionIndex)

    // Trigger shot resolution after brief delay
    setTimeout(() => {
      actions?.resolveCelticsShot?.()
    }, 100)
  }, [sound, actions])

  // Handle defense choice completion
  const handleDefenseChoiceComplete = useCallback((choice, result) => {
    // Submit defense choice
    actions?.selectDefenseChoice?.(choice)

    // Play appropriate sound based on result
    if (result === 'block') {
      sound?.playBlock?.()
    } else if (result === 'steal') {
      sound?.playSteal?.()
    } else if (result === 'foul') {
      sound?.playFoulWhistle?.()
    }

    // Trigger Lakers shot resolution after brief delay
    setTimeout(() => {
      actions?.resolveLakersShot?.()
    }, 100)
  }, [sound, actions])

  // Handle defense prediction completion
  const handleDefensePredictComplete = useCallback((prediction, wasCorrect, result) => {
    // Submit prediction
    actions?.submitPrediction?.(prediction)

    // Play reaction sound
    if (wasCorrect) {
      sound?.playCrowdCheer?.()
    }

    // Trigger Lakers shot resolution after brief delay
    setTimeout(() => {
      actions?.resolveLakersShot?.()
    }, 100)
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
          onShotComplete={() => {
            // Shot animation complete callback if needed
          }}
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

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-32 right-4 z-30 bg-black/80 text-white text-xs p-3 rounded font-mono max-w-xs">
          <div className="font-bold mb-2 text-green-400">DEBUG</div>
          <div>Phase: {phase}</div>
          <div>Possession: {possession}</div>
          <div>Offense Mode: {offenseMode}</div>
          <div>Defense Mode: {defenseMode}</div>
          <div>Active: {activePlayer?.name || 'none'}</div>
          <div>Question: {currentQuestion ? 'loaded' : 'none'}</div>
        </div>
      )}
    </div>
  )
}
