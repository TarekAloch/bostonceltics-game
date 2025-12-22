import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState, useEffect, useCallback } from 'react'
import PlayerSprite from './PlayerSprite'
import BallSprite from './BallSprite'

/**
 * CourtPlayers Component - Realistic player silhouettes on court
 *
 * Renders player sprites on the basketball court with animations based on play type.
 *
 * Props:
 * - possession: 'celtics' | 'lakers'
 * - celticsPlayers: Array of Celtics player objects
 * - lakersPlayers: Array of Lakers player objects
 * - activePlayer: Current player with the ball
 * - playType: 'pick-roll' | 'isolation' | 'fast-break' | 'defense' | null
 * - phase: Game phase state
 * - onPlayComplete: Callback when play animation completes
 *
 * Coordinate system: Percentage-based (0-100%) for responsive layout
 */
export default function CourtPlayers({
  possession,
  celticsPlayers = [],
  lakersPlayers = [],
  activePlayer,
  playType,
  phase,
  onPlayComplete = () => {}
}) {
  const [ballState, setBallState] = useState('held')
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 })

  // Memoize player slices to avoid recreating arrays
  const celticsOnCourt = useMemo(() => celticsPlayers.slice(0, 5), [celticsPlayers])
  const lakersOnCourt = useMemo(() => lakersPlayers.slice(0, 5), [lakersPlayers])
  // Calculate player positions based on play type and possession (percentage-based)
  const playerPositions = useMemo(() => {
    const isCelticsOffense = possession === 'celtics'

    // Base offensive positions (right side of court) - percentage-based
    const offensivePositions = {
      'pick-roll': [
        { x: 65, y: 50, role: 'ballHandler' },  // Ball handler at top
        { x: 75, y: 45, role: 'screener' },     // Screener setting pick
        { x: 85, y: 35, role: 'wing' },         // Wing spacing
        { x: 85, y: 65, role: 'wing' },         // Wing spacing
        { x: 88, y: 50, role: 'corner' },       // Corner
      ],
      'isolation': [
        { x: 65, y: 50, role: 'ballHandler' },  // Iso player at top
        { x: 88, y: 30, role: 'corner' },       // Clear out corner
        { x: 88, y: 70, role: 'corner' },       // Clear out corner
        { x: 78, y: 38, role: 'wing' },         // Wing spaced
        { x: 78, y: 62, role: 'wing' },         // Wing spaced
      ],
      'fast-break': [
        { x: 78, y: 50, role: 'ballHandler' },  // Ball handler leading
        { x: 73, y: 40, role: 'wing' },         // Wing running left
        { x: 73, y: 60, role: 'wing' },         // Wing running right
        { x: 63, y: 45, role: 'trailer' },      // Trailer 1
        { x: 63, y: 55, role: 'trailer' },      // Trailer 2
      ],
      'default': [
        { x: 65, y: 50, role: 'point' },        // Point guard
        { x: 78, y: 40, role: 'wing' },         // Shooting guard
        { x: 78, y: 60, role: 'wing' },         // Small forward
        { x: 85, y: 43, role: 'forward' },      // Power forward
        { x: 88, y: 52, role: 'center' },       // Center
      ],
    }

    // Defensive positions - percentage-based
    const defensivePositions = {
      'default': [
        { x: 63, y: 50, role: 'point' },        // On ball defender
        { x: 73, y: 45, role: 'wing' },         // Wing defender
        { x: 73, y: 55, role: 'wing' },         // Wing defender
        { x: 80, y: 48, role: 'forward' },      // Forward defender
        { x: 84, y: 52, role: 'center' },       // Rim protector
      ],
      'fast-break': [
        { x: 68, y: 50, role: 'back' },         // Getting back
        { x: 73, y: 43, role: 'back' },         // Getting back
        { x: 73, y: 57, role: 'back' },         // Getting back
        { x: 48, y: 48, role: 'trailing' },     // Still at other end
        { x: 48, y: 52, role: 'trailing' },     // Still at other end
      ],
    }

    const currentPlayType = playType || 'default'
    const offensePos = offensivePositions[currentPlayType] || offensivePositions.default
    const defensePos = defensivePositions[currentPlayType] || defensivePositions.default

    // If Lakers have possession, flip the court (mirror x positions)
    const flipPosition = (pos) => ({
      ...pos,
      x: 100 - pos.x // Flip on percentage scale
    })

    if (isCelticsOffense) {
      return {
        celtics: offensePos,
        lakers: defensePos.map(flipPosition)
      }
    } else {
      return {
        celtics: defensePos,
        lakers: offensePos.map(flipPosition)
      }
    }
  }, [possession, playType])

  // Determine player pose based on state
  const getPlayerPose = (isOffense, isActive, role) => {
    if (phase === 'intro') return 'standing'
    if (playType === 'fast-break') return 'running'
    if (phase === 'scoring' && isActive) return 'shooting'
    if (!isOffense) return 'defending'
    if (isActive) return 'ball'
    return 'standing'
  }

  // Update ball position to follow active player
  useEffect(() => {
    if (!activePlayer) return

    try {
      const allPlayers = [
        ...celticsOnCourt.map((p, i) => ({
          ...p,
          team: 'celtics',
          pos: playerPositions.celtics[i] || { x: 50, y: 50 }
        })),
        ...lakersOnCourt.map((p, i) => ({
          ...p,
          team: 'lakers',
          pos: playerPositions.lakers[i] || { x: 50, y: 50 }
        }))
      ]
      const player = allPlayers.find(p => p?.name === activePlayer?.name)
      if (player && player.pos) {
        setBallPosition(player.pos)
      }
    } catch (error) {
      console.error('[CourtPlayers] Error updating ball position:', error)
    }
  }, [activePlayer, celticsOnCourt, lakersOnCourt, playerPositions])

  // Ball state management based on phase
  useEffect(() => {
    switch (phase) {
      case 'intro':
        setBallState('held')
        break
      case 'playing':
        setBallState(playType === 'fast-break' ? 'dribbling' : 'held')
        break
      case 'scoring':
        setBallState('shooting')
        setTimeout(() => {
          onPlayComplete()
        }, 1200)
        break
      case 'celebrating':
        setBallState('held')
        break
      default:
        setBallState('held')
    }
  }, [phase, playType, onPlayComplete])

  // Get active player index with safety checks
  const getActivePlayerIndex = useCallback((players, team) => {
    if (!activePlayer || !players || !Array.isArray(players)) return 0
    try {
      const index = players.findIndex(p => p?.name === activePlayer?.name && possession === team)
      return index >= 0 ? index : 0
    } catch (error) {
      console.error('[CourtPlayers] Error finding active player:', error)
      return 0
    }
  }, [activePlayer, possession])

  const activeCelticsIndex = getActivePlayerIndex(celticsPlayers, 'celtics')
  const activeLakersIndex = getActivePlayerIndex(lakersPlayers, 'lakers')

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Celtics players */}
        {celticsOnCourt.map((player, index) => {
          const isActive = possession === 'celtics' && index === activeCelticsIndex
          const position = playerPositions.celtics[index] || { x: 50, y: 50 }
          const isOffense = possession === 'celtics'

          return (
            <PlayerSprite
              key={`celtics-${player?.name || index}`}
              team="celtics"
              number={player?.number || 0}
              pose={getPlayerPose(isOffense, isActive, position.role)}
              isActive={isActive}
              hasBall={isActive && ballState !== 'shooting' && isOffense}
              position={position}
              facing={isOffense ? 'right' : 'left'}
              isVillain={false}
            />
          )
        })}

        {/* Lakers players */}
        {lakersOnCourt.map((player, index) => {
          const isActive = possession === 'lakers' && index === activeLakersIndex
          const position = playerPositions.lakers[index] || { x: 50, y: 50 }
          const isOffense = possession === 'lakers'

          return (
            <PlayerSprite
              key={`lakers-${player?.name || index}`}
              team="lakers"
              number={player?.number || 0}
              pose={getPlayerPose(isOffense, isActive, position.role)}
              isActive={isActive}
              hasBall={isActive && ballState !== 'shooting' && isOffense}
              position={position}
              facing={isOffense ? 'left' : 'right'}
              isVillain={player?.villain || false}
            />
          )
        })}
      </AnimatePresence>

      {/* Basketball */}
      <BallSprite
        position={ballPosition}
        isInAir={ballState === 'shooting' || ballState === 'passing'}
        state={ballState}
        targetPosition={
          ballState === 'shooting'
            ? { x: possession === 'celtics' ? 90 : 10, y: 50 }
            : null
        }
        onAnimationComplete={() => {
          if (ballState === 'shooting') {
            setBallState('held')
          }
        }}
      />

      {/* Play type indicator */}
      {playType && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-xs md:text-sm font-['Oswald'] tracking-wider uppercase bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm">
          {playType.replace('-', ' & ')}
        </div>
      )}
    </div>
  )
}
