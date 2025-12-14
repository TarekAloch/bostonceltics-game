# Integration Guide - Offense Components

## How to Replace QTE Mechanics with Trivia Offense

This guide shows how to integrate the new offense components into the existing GameScreen.jsx.

---

## Current Flow (OLD - QTE Based)

```
GameScreen.jsx
├── phase: 'action-select'
│   └── ActionButtons (choose shot type)
├── phase: 'qte'
│   └── TimingRing (timing-based shooting)
├── phase: 'quiz'
│   └── QuizModal (trivia bonus)
└── phase: 'result'
    └── Calculate shot success
```

---

## New Flow (NEW - Trivia Based)

```
GameScreen.jsx
├── phase: 'offense-trivia'
│   └── TriviaOffense (answer to shoot)
├── phase: 'offense-playcall'
│   └── PlayCallOffense (pick play + trivia)
└── phase: 'result'
    └── Calculate shot success (based on trivia)
```

---

## Step-by-Step Integration

### 1. Import New Components

```jsx
// src/components/screens/GameScreen.jsx

// OLD imports to remove/modify:
// import TimingRing from '../qte/TimingRing'
// import QuizModal from '../quiz/QuizModal'

// NEW imports to add:
import { TriviaOffense, PlayCallOffense } from '../offense'
import { getRandomQuestion } from '../../data/questions'
```

### 2. Add State for Used Questions

```jsx
// In your game state management (e.g., App.jsx or GameScreen.jsx)

const [usedQuestionIndices, setUsedQuestionIndices] = useState([])

// Get random question
const { question, index } = getRandomQuestion(usedQuestionIndices)
```

### 3. Replace QTE Phase with Offense Phase

```jsx
// OLD (remove):
{phase === 'qte' && (
  <TimingRing
    onComplete={(accuracy) => actions.handleQTEComplete(accuracy)}
    difficulty={selectedAction.difficulty}
  />
)}

// NEW (add):
{phase === 'offense-trivia' && (
  <TriviaOffense
    question={{ ...question, index }}
    player={activePlayer}
    onComplete={(isCorrect, questionIndex) => {
      setUsedQuestionIndices(prev => [...prev, questionIndex])
      actions.handleOffenseComplete(isCorrect, 'trivia')
    }}
  />
)}

{phase === 'offense-playcall' && (
  <PlayCallOffense
    question={{ ...question, index }}
    player={activePlayer}
    onComplete={(isCorrect, playType, questionIndex) => {
      setUsedQuestionIndices(prev => [...prev, questionIndex])
      actions.handleOffenseComplete(isCorrect, playType)
    }}
  />
)}
```

### 4. Update Action Handlers

```jsx
// In your actions/game logic

const handleOffenseComplete = (isCorrect, playType) => {
  // Calculate shot success
  let shotSuccess = false

  if (isCorrect) {
    // Base success rate by play type
    const successRates = {
      'trivia': 75,           // Pure trivia mode
      'pick-roll': 75,        // Balanced play
      'isolation': 60,        // Risky play
      'fast-break': 85        // Easy play
    }

    const successRate = successRates[playType] || 75
    shotSuccess = Math.random() * 100 < successRate
  }

  // Award points
  if (shotSuccess) {
    setScore(prev => ({
      ...prev,
      [possession]: prev[possession] + 2
    }))

    // Play success sound
    sound.playScore()

    // Update commentary
    setLastPlay({
      type: 'made',
      team: possession,
      points: 2,
      player: activePlayer.name
    })
  } else {
    // Play miss sound
    sound.playMiss()

    setLastPlay({
      type: 'miss',
      team: possession,
      player: activePlayer.name
    })
  }

  // Move to result phase
  setPhase('result')
}
```

### 5. Update ActionButtons

```jsx
// In ActionButtons.jsx - add new action types

const actions = [
  {
    id: 'trivia-shot',
    label: 'Trivia Shot',
    icon: Trophy,
    description: 'Answer trivia to shoot',
    nextPhase: 'offense-trivia'
  },
  {
    id: 'play-call',
    label: 'Call a Play',
    icon: Target,
    description: 'Strategic offense',
    nextPhase: 'offense-playcall'
  },
  // ... keep existing actions if needed
]
```

---

## Complete Example

Here's a minimal working example integrating both components:

```jsx
// src/components/screens/GameScreen.jsx
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Scoreboard from '../game/Scoreboard'
import Court from '../game/Court'
import PlayerCard from '../game/PlayerCard'
import { TriviaOffense, PlayCallOffense } from '../offense'
import { getRandomQuestion } from '../../data/questions'
import { celtics, lakers } from '../../data/players'

export default function GameScreen({ state, actions, sound }) {
  const [usedQuestions, setUsedQuestions] = useState([])

  const {
    phase,
    score,
    possession,
    activePlayer,
    offenseType
  } = state

  // Get random question
  const { question, index } = getRandomQuestion(usedQuestions)

  const handleOffenseComplete = (isCorrect, playType, questionIndex) => {
    // Track used questions
    setUsedQuestions(prev => [...prev, questionIndex])

    // Calculate success
    let success = false
    if (isCorrect) {
      const rates = {
        'trivia': 75,
        'pick-roll': 75,
        'isolation': 60,
        'fast-break': 85
      }
      success = Math.random() * 100 < (rates[playType] || 75)
    }

    // Update game state
    if (success) {
      actions.scorePoints(possession, 2)
      sound.playScore()
    } else {
      sound.playMiss()
    }

    // Next phase
    actions.setPhase('result')
  }

  return (
    <div className="relative h-screen bg-[#0A1612]">
      <Scoreboard score={score} />
      <Court />

      {possession === 'celtics' && (
        <PlayerCard player={activePlayer} />
      )}

      <AnimatePresence mode="wait">
        {phase === 'offense-trivia' && (
          <TriviaOffense
            question={{ ...question, index }}
            player={activePlayer}
            onComplete={(correct, idx) =>
              handleOffenseComplete(correct, 'trivia', idx)
            }
          />
        )}

        {phase === 'offense-playcall' && (
          <PlayCallOffense
            question={{ ...question, index }}
            player={activePlayer}
            onComplete={(correct, play, idx) =>
              handleOffenseComplete(correct, play, idx)
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## Game State Structure

Update your game state to include offense-specific phases:

```jsx
const initialState = {
  // ... existing state
  phase: 'offense-trivia', // or 'offense-playcall'
  offenseType: 'trivia',   // 'trivia' | 'playcall'
  usedQuestions: [],
  // ... rest of state
}
```

---

## Migration Checklist

- [ ] Import TriviaOffense and PlayCallOffense
- [ ] Import getRandomQuestion
- [ ] Add usedQuestions state
- [ ] Replace 'qte' phase with 'offense-trivia' or 'offense-playcall'
- [ ] Create handleOffenseComplete handler
- [ ] Update ActionButtons with new offense options
- [ ] Remove TimingRing component (or keep for defense)
- [ ] Test shot success calculation
- [ ] Test question randomization (no repeats)
- [ ] Verify sound effects trigger correctly
- [ ] Test accessibility (keyboard navigation)

---

## Backward Compatibility

If you want to keep QTE as an option:

```jsx
// Support both old and new mechanics
{phase === 'qte' && (
  <TimingRing
    onComplete={actions.handleQTEComplete}
  />
)}

{phase === 'offense-trivia' && (
  <TriviaOffense
    question={{ ...question, index }}
    player={activePlayer}
    onComplete={handleOffenseComplete}
  />
)}

// Add toggle in settings
const [offenseMechanic, setOffenseMechanic] = useState('trivia') // or 'qte'
```

---

## Testing the Integration

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to game
# Click "Start Game"

# 3. Test TriviaOffense
# - Answer should appear with 10s timer
# - Click correct answer → "SCORE!"
# - Click wrong answer → "MISS!"
# - Let timer expire → "TIME'S UP!"

# 4. Test PlayCallOffense
# - 3 play options appear (5s timer)
# - Select play → transitions to trivia
# - Answer trivia → "SCORE!" or "MISS!"

# 5. Verify:
# - Score updates correctly
# - Possession switches
# - No question repeats
# - Sounds play
# - Keyboard works (1-4)
```

---

## Troubleshooting

### "Component doesn't render"
- Check phase is set to 'offense-trivia' or 'offense-playcall'
- Verify imports are correct
- Check console for errors

### "Questions repeat"
- Ensure usedQuestions state is being updated
- Pass questionIndex to setUsedQuestions

### "Callback not firing"
- Check onComplete handler is defined
- Verify it's a function
- Add console.log to debug

### "Styles broken"
- Components use Tailwind classes
- Ensure Tailwind is configured
- Check Oswald font is loaded

---

## Performance Optimization

```jsx
// Memoize handlers
const handleOffenseComplete = useCallback((isCorrect, playType, idx) => {
  // ... handler logic
}, [possession, sound, actions])

// Lazy load components (optional)
const TriviaOffense = lazy(() => import('../offense/TriviaOffense'))
const PlayCallOffense = lazy(() => import('../offense/PlayCallOffense'))

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <TriviaOffense {...props} />
</Suspense>
```

---

## Next Steps After Integration

1. **Remove old QTE code** (if not needed)
2. **Add difficulty scaling** (harder questions = more points)
3. **Implement combo system** (consecutive correct answers)
4. **Add Lakers AI offense** (using same components)
5. **Create practice mode** (trivia only, no game)
6. **Add leaderboard** (track trivia accuracy)

---

## Support

See full documentation:
- `/src/components/offense/README.md` - Complete docs
- `/src/components/offense/QUICK_REFERENCE.md` - Cheat sheet
- `/src/components/offense/*.example.jsx` - Live examples

---

Ready to integrate! The offense components are production-ready and drop-in replacements for the QTE system.
