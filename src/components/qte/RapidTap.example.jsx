import { useState } from 'react'
import RapidTap from './RapidTap'

/**
 * Example Usage: RapidTap Component
 *
 * Integration examples for the defense QTE mechanic
 */

// Example 1: Basic usage in game flow
export function BasicExample() {
  const [showQTE, setShowQTE] = useState(false)
  const [result, setResult] = useState(null)

  const handleDefense = (defenseResult) => {
    setResult(defenseResult)
    setShowQTE(false)

    // Process result in game logic
    console.log('Defense result:', defenseResult)
    // 'blocked' -> Lakers miss, Celtics get ball
    // 'contested' -> Reduce Lakers shot accuracy by 30%
    // 'steal' -> Turnover, Celtics possession
    // 'open' -> Lakers shoot at full accuracy
  }

  return (
    <div>
      <button onClick={() => setShowQTE(true)}>
        Start Defense QTE
      </button>

      {showQTE && (
        <RapidTap
          lakersAction="three-point"
          lakersPlayer={{ name: "LeBron James", number: 23 }}
          onComplete={handleDefense}
          difficulty="medium"
        />
      )}

      {result && <div>Result: {result}</div>}
    </div>
  )
}

// Example 2: Dynamic difficulty based on game state
export function DynamicDifficultyExample() {
  const [showQTE, setShowQTE] = useState(false)
  const [gameState, setGameState] = useState({
    quarter: 4,
    timeRemaining: 30,
    scoreDifference: -5 // Celtics down 5
  })

  // Increase difficulty in clutch situations
  const getDifficulty = () => {
    if (gameState.quarter === 4 && gameState.timeRemaining < 60) {
      return 'hard' // Clutch time
    }
    if (Math.abs(gameState.scoreDifference) <= 3) {
      return 'hard' // Close game
    }
    return 'medium'
  }

  return (
    <RapidTap
      lakersAction="mid-range"
      lakersPlayer={{ name: "Anthony Davis", number: 3 }}
      onComplete={(result) => console.log(result)}
      difficulty={getDifficulty()}
    />
  )
}

// Example 3: Different Lakers actions
export function ActionVariationsExample() {
  const lakersActions = [
    { action: 'three-point', player: { name: "LeBron James", number: 23 } },
    { action: 'mid-range', player: { name: "Anthony Davis", number: 3 } },
    { action: 'drive', player: { name: "Austin Reaves", number: 15 } }
  ]

  const [currentAction, setCurrentAction] = useState(0)

  return (
    <div>
      {lakersActions.map((actionData, index) => (
        <button key={index} onClick={() => setCurrentAction(index)}>
          {actionData.action} - {actionData.player.name}
        </button>
      ))}

      <RapidTap
        lakersAction={lakersActions[currentAction].action}
        lakersPlayer={lakersActions[currentAction].player}
        onComplete={(result) => console.log(result)}
        difficulty="medium"
      />
    </div>
  )
}

// Example 4: Game integration with state management
export function GameIntegrationExample() {
  const [gameState, setGameState] = useState({
    possession: 'lakers',
    showDefenseQTE: true,
    celticsPossessions: 0,
    lakersScore: 0
  })

  const handleDefenseResult = (result) => {
    setGameState(prev => {
      const newState = { ...prev, showDefenseQTE: false }

      switch (result) {
        case 'blocked':
          // Celtics get possession, no points
          newState.possession = 'celtics'
          newState.celticsPossessions = prev.celticsPossessions + 1
          break

        case 'steal':
          // Turnover, Celtics fast break opportunity
          newState.possession = 'celtics'
          newState.celticsPossessions = prev.celticsPossessions + 1
          // Trigger fast break bonus
          break

        case 'contested':
          // Lakers shoot at reduced accuracy (30% reduction)
          // Roll for shot with penalty
          const contestedChance = Math.random() > 0.5 // 50% make rate when contested
          if (contestedChance) {
            newState.lakersScore = prev.lakersScore + 2
          }
          newState.possession = 'celtics'
          break

        case 'open':
          // Lakers shoot at full accuracy (75% make rate)
          const openChance = Math.random() > 0.25
          if (openChance) {
            newState.lakersScore = prev.lakersScore + 2
          }
          newState.possession = 'celtics'
          break
      }

      return newState
    })
  }

  return (
    <div className="game-container">
      <div className="scoreboard">
        Lakers: {gameState.lakersScore}
      </div>

      {gameState.showDefenseQTE && gameState.possession === 'lakers' && (
        <RapidTap
          lakersAction="three-point"
          lakersPlayer={{ name: "LeBron James", number: 23 }}
          onComplete={handleDefenseResult}
          difficulty="medium"
        />
      )}
    </div>
  )
}

// Example 5: With AnimatePresence for smooth transitions
import { AnimatePresence } from 'framer-motion'

export function AnimatedExample() {
  const [showQTE, setShowQTE] = useState(false)

  return (
    <div>
      <button onClick={() => setShowQTE(true)}>
        Lakers Shooting
      </button>

      <AnimatePresence>
        {showQTE && (
          <RapidTap
            lakersAction="drive"
            lakersPlayer={{ name: "Anthony Davis", number: 3 }}
            onComplete={(result) => {
              console.log(result)
              setShowQTE(false)
            }}
            difficulty="hard"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Example 6: Tracking stats across multiple possessions
export function StatsTrackingExample() {
  const [defenseStats, setDefenseStats] = useState({
    blocks: 0,
    steals: 0,
    contests: 0,
    open: 0
  })

  const handleDefense = (result) => {
    setDefenseStats(prev => ({
      ...prev,
      [result === 'blocked' ? 'blocks' : result === 'steal' ? 'steals' : result === 'contested' ? 'contests' : 'open']:
        prev[result === 'blocked' ? 'blocks' : result === 'steal' ? 'steals' : result === 'contested' ? 'contests' : 'open'] + 1
    }))
  }

  return (
    <div>
      <div className="stats">
        <div>Blocks: {defenseStats.blocks}</div>
        <div>Steals: {defenseStats.steals}</div>
        <div>Contests: {defenseStats.contests}</div>
        <div>Open Shots Allowed: {defenseStats.open}</div>
      </div>

      <RapidTap
        lakersAction="mid-range"
        lakersPlayer={{ name: "D'Angelo Russell", number: 1 }}
        onComplete={handleDefense}
        difficulty="medium"
      />
    </div>
  )
}
