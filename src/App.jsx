import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameState } from './hooks/useGameState'
import { useSound } from './hooks/useSound'

import StartScreen from './components/screens/StartScreen'
import GameScreen from './components/screens/GameScreen'
import HalftimeScreen from './components/screens/HalftimeScreen'
import EndScreen from './components/screens/EndScreen'

/**
 * Main App Component - Boston Celtics vs Lakers Game
 */
export default function App() {
  const { state, actions } = useGameState()
  const sound = useSound()

  useEffect(() => {
    if (state?.gameStatus === 'playing') {
      try {
        sound?.startAmbient?.()
      } catch (error) {
        console.error('[App] Error starting ambient sound:', error)
      }
    }
  }, [state?.gameStatus, sound])

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

  const handleRestart = () => {
    try {
      sound?.stopAmbient?.()
      actions?.restartGame?.()
    } catch (error) {
      console.error('[App] Error restarting game:', error)
    }
  }

  return (
    <div className="relative w-screen min-h-dvh overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait">
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
              rosterType={state.rosterType || 'current2025'}
              setRosterType={actions.setRosterType}
              quarterLength={state.quarterLength || 1}
              setQuarterLength={actions.setQuarterLength}
              isMuted={sound.isMuted}
              toggleMute={sound.toggleMute}
            />
          </motion.div>
        )}

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
