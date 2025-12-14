# Defense Components Implementation Guide

Quick-start guide for integrating DefenseChoice and DefensePredict into your Celtics basketball game.

## Quick Start (5 Minutes)

### 1. Import Components

```jsx
import { DefenseChoice, DefensePredict } from './components/defense'
import { getRandomPlayer } from './data/players'
```

### 2. Add to Game State

```jsx
const [defenseMechanic, setDefenseMechanic] = useState(null)

// When Lakers have possession and shoot:
const triggerDefense = () => {
  const usePredict = Math.random() > 0.5
  const lakersPlayer = getRandomPlayer('lakers')

  if (usePredict) {
    setDefenseMechanic({
      type: 'predict',
      player: lakersPlayer,
      actualPlay: getRandomPlay(), // 'three-point' | 'mid-range' | 'drive'
    })
  } else {
    setDefenseMechanic({
      type: 'choice',
      player: lakersPlayer,
      action: getRandomPlay(),
    })
  }
}
```

### 3. Render Component

```jsx
{defenseMechanic?.type === 'choice' && (
  <DefenseChoice
    lakersPlayer={defenseMechanic.player}
    lakersAction={defenseMechanic.action}
    onComplete={(choice, result) => {
      handleDefenseResult(result)
      setDefenseMechanic(null)
    }}
  />
)}

{defenseMechanic?.type === 'predict' && (
  <DefensePredict
    lakersPlayer={defenseMechanic.player}
    actualPlay={defenseMechanic.actualPlay}
    onComplete={(prediction, wasCorrect, result) => {
      handleDefenseResult(result)
      setDefenseMechanic(null)
    }}
  />
)}
```

### 4. Handle Results

```jsx
const handleDefenseResult = (result) => {
  switch (result) {
    case 'miss':
    case 'block':
      // Celtics get rebound
      setPossession('celtics')
      break

    case 'steal':
      // Celtics get ball, fast break opportunity
      setPossession('celtics')
      setFastBreak(true)
      break

    case 'foul':
      // Lakers shoot free throws
      triggerFreeThrows()
      break

    case 'score':
      // Lakers score (2 or 3 points)
      addLakersPoints(getPoints(defenseMechanic.action))
      setPossession('celtics')
      break
  }
}
```

---

## Component API Reference

### DefenseChoice

**Purpose:** Strategic choice-based defense with risk/reward tradeoffs.

**Props:**
```typescript
interface DefenseChoiceProps {
  lakersPlayer: {
    name: string
    number: number
    rating: number
    position?: string
    villain?: boolean
  }
  lakersAction: 'three-point' | 'mid-range' | 'drive'
  onComplete: (choice: string, result: string) => void
}
```

**Choices:**
- `contest` - Safe option (50% miss)
- `block` - Risky (30% block, 20% foul)
- `steal` - Very risky (25% steal, 25% foul)

**Results:**
- `miss` - Lakers miss (Celtics rebound)
- `block` - Shot blocked (Celtics ball)
- `steal` - Ball stolen (Celtics ball)
- `foul` - Foul called (Lakers free throws)
- `score` - Lakers score (2 or 3 points)

**Timer:** 5 seconds (auto-Contest if timeout)

---

### DefensePredict

**Purpose:** Prediction-based defense testing basketball IQ.

**Props:**
```typescript
interface DefensePredictProps {
  lakersPlayer: {
    name: string
    number: number
    rating: number
    position?: string
    villain?: boolean
  }
  actualPlay: 'three-point' | 'mid-range' | 'drive'
  onComplete: (
    prediction: string,
    wasCorrect: boolean,
    result: string
  ) => void
}
```

**Predictions:**
- `three-point` - Predict 3-point shot
- `mid-range` - Predict mid-range jumper
- `drive` - Predict drive to rim

**Results:**
- `miss` - Lakers miss
- `score` - Lakers score

**Success Rates:**
- Correct prediction: 70% miss
- Wrong prediction: 30% miss

**Timer:** 4 seconds (random prediction if timeout)

---

## Integration Patterns

### Pattern 1: Random Defense Selection

```jsx
const getDefenseMechanic = () => {
  return Math.random() > 0.5 ? 'choice' : 'predict'
}

const triggerDefense = () => {
  const type = getDefenseMechanic()
  const lakersPlayer = getRandomPlayer('lakers')
  const play = getRandomPlay()

  setDefenseMechanic({ type, player: lakersPlayer, play })
}
```

### Pattern 2: Situation-Based Selection

```jsx
const getDefenseMechanic = (gameContext) => {
  const { quarter, timeLeft, scoreDiff, momentum } = gameContext

  // Use DefensePredict in clutch situations
  if (quarter === 4 && timeLeft < 120) return 'predict'

  // Use DefenseChoice when Lakers have momentum
  if (momentum === 'lakers') return 'choice'

  // Random otherwise
  return Math.random() > 0.5 ? 'choice' : 'predict'
}
```

### Pattern 3: Player-Based Selection

```jsx
const getDefenseMechanic = (lakersPlayer) => {
  // Always use DefensePredict against villains (LeBron/AD)
  if (lakersPlayer.villain) return 'predict'

  // Use DefenseChoice for role players
  return 'choice'
}
```

### Pattern 4: Difficulty Scaling

```jsx
const getDefenseMechanic = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      // More DefenseChoice (simpler)
      return Math.random() > 0.3 ? 'choice' : 'predict'

    case 'hard':
      // More DefensePredict (harder)
      return Math.random() > 0.7 ? 'choice' : 'predict'

    default:
      return Math.random() > 0.5 ? 'choice' : 'predict'
  }
}
```

---

## Game Logic Examples

### Example 1: Full Possession Flow

```jsx
const handleLakersPossession = async () => {
  // 1. Lakers bring ball up court
  await showAnimation('lakers-offense')

  // 2. Trigger defense mechanic
  const mechanic = getDefenseMechanic()
  const lakersPlayer = selectShooter()
  const play = selectPlay(lakersPlayer)

  setDefenseMechanic({
    type: mechanic,
    player: lakersPlayer,
    play,
  })

  // 3. Wait for player defense action (component handles this)
  // onComplete callback will fire when done
}

const handleDefenseComplete = (result) => {
  setDefenseMechanic(null)

  switch (result) {
    case 'miss':
      addCommentary('Great defense! Lakers miss the shot!')
      triggerRebound('celtics')
      break

    case 'block':
      addCommentary('BLOCKED BY THE CELTICS!')
      playSoundEffect('crowd-roar')
      addCelticsStats('blocks', 1)
      setPossession('celtics')
      break

    case 'steal':
      addCommentary('STEAL! Celtics going the other way!')
      playSoundEffect('crowd-roar')
      addCelticsStats('steals', 1)
      setPossession('celtics')
      setFastBreak(true)
      break

    case 'foul':
      addCommentary('Foul on the Celtics!')
      playSoundEffect('whistle')
      addCelticsStats('fouls', 1)
      triggerFreeThrows(lakersPlayer)
      break

    case 'score':
      const points = getPoints(defenseMechanic.play)
      addCommentary(`Lakers score ${points}!`)
      playSoundEffect('lakers-score')
      addLakersPoints(points)
      setPossession('celtics')
      break
  }
}
```

### Example 2: Stats Tracking

```jsx
const [defenseStats, setDefenseStats] = useState({
  attempts: 0,
  blocks: 0,
  steals: 0,
  fouls: 0,
  lakersFieldGoals: 0,
  lakersFieldGoalAttempts: 0,
  choiceAttempts: 0,
  predictAttempts: 0,
  correctPredictions: 0,
})

const handleDefenseComplete = (type, data) => {
  setDefenseStats(prev => ({
    ...prev,
    attempts: prev.attempts + 1,
    [type === 'choice' ? 'choiceAttempts' : 'predictAttempts']:
      prev[type === 'choice' ? 'choiceAttempts' : 'predictAttempts'] + 1,
  }))

  if (type === 'choice') {
    const { choice, result } = data

    setDefenseStats(prev => ({
      ...prev,
      blocks: result === 'block' ? prev.blocks + 1 : prev.blocks,
      steals: result === 'steal' ? prev.steals + 1 : prev.steals,
      fouls: result === 'foul' ? prev.fouls + 1 : prev.fouls,
      lakersFieldGoalAttempts: prev.lakersFieldGoalAttempts + 1,
      lakersFieldGoals: result === 'score' ? prev.lakersFieldGoals + 1 : prev.lakersFieldGoals,
    }))
  } else {
    const { prediction, wasCorrect, result } = data

    setDefenseStats(prev => ({
      ...prev,
      correctPredictions: wasCorrect ? prev.correctPredictions + 1 : prev.correctPredictions,
      lakersFieldGoalAttempts: prev.lakersFieldGoalAttempts + 1,
      lakersFieldGoals: result === 'score' ? prev.lakersFieldGoals + 1 : prev.lakersFieldGoals,
    }))
  }
}

// Display stats
const defensiveFieldGoalPct =
  (1 - defenseStats.lakersFieldGoals / defenseStats.lakersFieldGoalAttempts) * 100

const predictionAccuracy =
  (defenseStats.correctPredictions / defenseStats.predictAttempts) * 100
```

### Example 3: Difficulty Adjustment

```jsx
const [difficulty, setDifficulty] = useState('medium')

// Adjust probabilities based on difficulty
const getAdjustedProbability = (base, difficulty) => {
  const modifiers = {
    easy: 1.3,    // 30% better success rate
    medium: 1.0,  // Normal
    hard: 0.7,    // 30% worse success rate
  }

  return Math.min(1, base * modifiers[difficulty])
}

// Adjust timers
const getTimerDuration = (base, difficulty) => {
  const modifiers = {
    easy: 1.5,    // 50% more time
    medium: 1.0,  // Normal
    hard: 0.75,   // 25% less time
  }

  return Math.floor(base * modifiers[difficulty])
}
```

---

## Styling Customization

### Custom Colors

```jsx
// Override Lakers colors
const customLakersColors = {
  primary: '#552583',
  secondary: '#FDB927',
  villain: '#FF4444',
}

// Pass as style prop or create custom theme
```

### Custom Animations

```jsx
// Disable animations
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

// Adjust animation speed
const animationSpeed = prefersReducedMotion ? 0 : 1
```

---

## Performance Optimization

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react'

const DefenseChoice = lazy(() => import('./components/defense/DefenseChoice'))
const DefensePredict = lazy(() => import('./components/defense/DefensePredict'))

// Render with Suspense
<Suspense fallback={<LoadingSpinner />}>
  {defenseMechanic?.type === 'choice' && (
    <DefenseChoice {...props} />
  )}
</Suspense>
```

### Memoization

```jsx
import { memo } from 'react'

const MemoizedDefenseChoice = memo(DefenseChoice)
const MemoizedDefensePredict = memo(DefensePredict)
```

---

## Testing

### Run Unit Tests

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
npm test
```

### Example Test

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DefenseChoice } from './components/defense'

test('renders defense options', () => {
  render(
    <DefenseChoice
      lakersPlayer={{ name: 'LeBron James', number: 23, rating: 92 }}
      lakersAction="three-point"
      onComplete={vi.fn()}
    />
  )

  expect(screen.getByText('CONTEST')).toBeInTheDocument()
  expect(screen.getByText('GO FOR BLOCK')).toBeInTheDocument()
  expect(screen.getByText('GO FOR STEAL')).toBeInTheDocument()
})
```

---

## Troubleshooting

### Component doesn't render
- Check that Framer Motion is installed
- Verify player data structure matches prop types
- Check console for errors

### Timer doesn't count down
- Ensure component is mounted (not conditionally hidden)
- Check for cleanup issues in parent component
- Verify no competing timers in parent

### Callbacks not firing
- Ensure onComplete prop is passed
- Check callback function signature matches expected params
- Verify component isn't unmounting too early

### Animations stuttering
- Check for excessive re-renders in parent
- Use React DevTools Profiler
- Consider memoization

---

## Best Practices

### 1. Always Handle All Results

```jsx
// Good
const handleResult = (result) => {
  switch (result) {
    case 'miss': /* ... */ break
    case 'block': /* ... */ break
    case 'steal': /* ... */ break
    case 'foul': /* ... */ break
    case 'score': /* ... */ break
    default: console.error('Unknown result:', result)
  }
}

// Bad
const handleResult = (result) => {
  if (result === 'score') {
    addPoints()
  }
  // Missing other cases!
}
```

### 2. Clean Up State

```jsx
// Good
const handleComplete = (choice, result) => {
  handleDefenseResult(result)
  setDefenseMechanic(null) // Clean up
}

// Bad
const handleComplete = (choice, result) => {
  handleDefenseResult(result)
  // Forgot to clean up - component stays mounted!
}
```

### 3. Track Stats

```jsx
// Good
const handleComplete = (choice, result) => {
  updateStats(choice, result)
  handleGameLogic(result)
}

// Track everything for post-game analysis
```

### 4. Provide Feedback

```jsx
// Good
const handleComplete = (choice, result) => {
  playSound(result)
  showAnimation(result)
  updateCommentary(result)
  updateScore(result)
}

// Bad
const handleComplete = (choice, result) => {
  updateScore(result)
  // Player doesn't know what happened!
}
```

---

## Support

- **File Issues:** Create issue in project repo
- **Questions:** Check README.md and ACCESSIBILITY.md
- **Examples:** See DefenseExample.jsx for working demo
- **Tests:** See DefenseChoice.test.jsx for test patterns

---

## Version History

- **v1.0.0** - Initial release with DefenseChoice and DefensePredict
- Components replace old RapidTap QTE mechanic
- Built for Boston Celtics vs LA Lakers game
