import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import { useSound } from './hooks/useSound'

// Screen components
import StartScreen from './components/screens/StartScreen'
import GameScreen from './components/screens/GameScreen'
import HalftimeScreen from './components/screens/HalftimeScreen'
import EndScreen from './components/screens/EndScreen'

/**
 * Main App Component - Boston Celtics vs Lakers Game
 *
 * Architecture:
 * - Uses useGameState hook for game logic and state management
 * - Uses useSound hook for audio management
 * - Routes between screens based on gameStatus
 * - Manages sound effects for game events
 *
 * Screens:
 * - 'start': Difficulty selection and game start
 * - 'playing': Main gameplay (QTE, Quiz, Defense)
 * - 'halftime': Break between 2nd and 3rd quarter
 * - 'ended': Victory or defeat screen
 */
export default function App() {
  const { state, actions } = useGameState()
  const sound = useSound()

  // Handle game start - start ambient crowd sound
  useEffect(() => {
    if (state?.gameStatus === 'playing') {
      try {
        sound?.startAmbient?.()
      } catch (error) {
        console.error('[App] Error starting ambient sound:', error)
      }
    }
  }, [state?.gameStatus, sound])

  // Handle game end - stop ambient and play victory/defeat
  useEffect(() => {
    if (state?.gameStatus === 'ended') {
      try {
        sound?.stopAmbient?.()

        const celticsWon = (state?.score?.celtics ?? 0) > (state?.score?.lakers ?? 0)
        if (celticsWon) {
          sound?.playVictory?.()
        } else {
          sound?.playDefeat?.()
        }
      } catch (error) {
        console.error('[App] Error handling game end sound:', error)
      }
    }
  }, [state?.gameStatus, state?.score, sound])

  // Restart handler - reset sound state
  const handleRestart = () => {
    try {
      sound?.stopAmbient?.()
      actions?.restartGame?.()
    } catch (error) {
      console.error('[App] Error restarting game:', error)
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
        {/* Start Screen */}
        {state.gameStatus === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <StartScreen
              onStart={actions.startGame}
              difficulty={state.difficulty}
              setDifficulty={actions.setDifficulty}
              isMuted={sound.isMuted}
              toggleMute={sound.toggleMute}
            />
          </motion.div>
        )}

        {/* Game Screen */}
        {state.gameStatus === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <GameScreen state={state} actions={actions} sound={sound} />
          </motion.div>
        )}

        {/* Halftime Screen */}
        {state.gameStatus === 'halftime' && (
          <motion.div
            key="halftime"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <HalftimeScreen state={state} onContinue={actions.continueFromHalftime} />
          </motion.div>
        )}

        {/* End Screen */}
        {state.gameStatus === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <EndScreen state={state} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
