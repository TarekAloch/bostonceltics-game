# Defense Components

Two interactive defense mechanics for the Boston Celtics vs LA Lakers basketball game, replacing the old RapidTap QTE system.

## Components

### 1. DefenseChoice

**File:** `/var/www/html/bostonceltics.com/src/components/defense/DefenseChoice.jsx`

Simple choice-based defense where the player picks one defensive action against Lakers offense.

#### Features
- **3 defensive actions:**
  - **CONTEST** - Hands up defense (50% force miss)
  - **GO FOR BLOCK** - Aggressive block attempt (30% block, 20% foul risk, 50% score)
  - **GO FOR STEAL** - Risky steal attempt (25% steal, 25% foul risk, 50% score)
- **5-second timer** - Auto-selects Contest if time expires
- **Lakers villain styling** - LeBron/AD get red glow and "VILLAIN" badge
- **"BEAT LA" chant** - Animated background text
- **Result animations** - Visual feedback for miss/block/steal/foul/score

#### Props

```jsx
<DefenseChoice
  lakersPlayer={{
    name: 'LeBron James',
    number: 23,
    rating: 92,
    villain: true
  }}
  lakersAction="three-point" // 'three-point' | 'mid-range' | 'drive'
  onComplete={(choice, result) => {
    // choice: 'contest' | 'block' | 'steal'
    // result: 'miss' | 'block' | 'steal' | 'foul' | 'score'
    console.log(choice, result)
  }}
/>
```

#### Outcome Probabilities

| Action | Block/Steal | Foul | Miss | Score |
|--------|------------|------|------|-------|
| Contest | - | - | 50% | 50% |
| Block | 30% | 20% | - | 50% |
| Steal | 25% | 25% | - | 50% |

---

### 2. DefensePredict

**File:** `/var/www/html/bostonceltics.com/src/components/defense/DefensePredict.jsx`

Prediction-based defense where the player guesses what play the Lakers will run.

#### Features
- **3 predictions:**
  - **3-POINTER** - "They're going outside!"
  - **MID-RANGE** - "They're taking a jumper!"
  - **DRIVE** - "They're going to the rim!"
- **4-second timer** - Faster decision window (random prediction if timeout)
- **Mystery overlay** - Question mark hides Lakers player until prediction
- **Reveal animation** - Shows actual play and prediction accuracy
- **Scouting report aesthetic** - Cards styled like game planning docs
- **Conditional outcomes:**
  - Correct prediction: 70% Lakers miss
  - Wrong prediction: 30% Lakers miss

#### Props

```jsx
<DefensePredict
  lakersPlayer={{
    name: 'Anthony Davis',
    number: 3,
    rating: 91,
    villain: true
  }}
  actualPlay="drive" // 'three-point' | 'mid-range' | 'drive' (hidden from player)
  onComplete={(prediction, wasCorrect, result) => {
    // prediction: 'three-point' | 'mid-range' | 'drive'
    // wasCorrect: boolean
    // result: 'miss' | 'score'
    console.log(prediction, wasCorrect, result)
  }}
/>
```

#### Outcome Probabilities

| Prediction | Lakers Miss | Lakers Score |
|------------|-------------|--------------|
| Correct | 70% | 30% |
| Wrong | 30% | 70% |

---

## Shared Design Elements

### Color Palette

```css
/* Lakers (enemy) */
--lakers-purple: #552583;
--lakers-gold: #FDB927;

/* Celtics */
--celtics-green: #007A33;

/* Feedback */
--success-green: #44FF44;
--danger-red: #FF4444;
```

### Lakers Villain Styling

Players with `villain: true` (LeBron, AD) get:
- Pulsing red glow overlay
- "VILLAIN" badge in top-right corner
- Stronger shadow effects
- Intimidating animations

### Typography

- **Font:** Oswald (already in project)
- **Headings:** Bold, uppercase
- **Timers:** 60px size, color changes as countdown progresses

### Animations

All animations use Framer Motion:
- Entrance: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`
- Button hover: `whileHover={{ scale: 1.05 }}`
- Timer pulse: `animate={{ scale: [1, 1.1, 1] }}` when low
- Background chants: Floating text with opacity fade

---

## Integration Example

```jsx
import { useState } from 'react'
import { DefenseChoice, DefensePredict } from './components/defense'
import { getRandomPlayer } from './data/players'

function GameEngine() {
  const [gameState, setGameState] = useState({
    celticsScore: 0,
    lakersScore: 0,
    possession: 'lakers'
  })

  const [activeDefense, setActiveDefense] = useState(null)

  // Trigger defense
  const startDefensePossession = () => {
    const defenseType = Math.random() > 0.5 ? 'choice' : 'predict'
    const lakersPlayer = getRandomPlayer('lakers')

    if (defenseType === 'choice') {
      const actions = ['three-point', 'mid-range', 'drive']
      const lakersAction = actions[Math.floor(Math.random() * actions.length)]

      setActiveDefense({
        type: 'choice',
        lakersPlayer,
        lakersAction
      })
    } else {
      const plays = ['three-point', 'mid-range', 'drive']
      const actualPlay = plays[Math.floor(Math.random() * plays.length)]

      setActiveDefense({
        type: 'predict',
        lakersPlayer,
        actualPlay
      })
    }
  }

  // Handle defense result
  const handleDefenseComplete = (type, data) => {
    if (type === 'choice') {
      const { choice, result } = data

      switch (result) {
        case 'score':
          setGameState(prev => ({
            ...prev,
            lakersScore: prev.lakersScore + getPoints(activeDefense.lakersAction)
          }))
          break
        case 'foul':
          // Handle foul (1-2 free throws)
          break
        case 'steal':
        case 'block':
        case 'miss':
          // Celtics get possession
          setGameState(prev => ({ ...prev, possession: 'celtics' }))
          break
      }
    } else {
      const { prediction, wasCorrect, result } = data

      if (result === 'score') {
        setGameState(prev => ({
          ...prev,
          lakersScore: prev.lakersScore + getPoints(activeDefense.actualPlay)
        }))
      } else {
        setGameState(prev => ({ ...prev, possession: 'celtics' }))
      }
    }

    setActiveDefense(null)
  }

  const getPoints = (action) => {
    return action === 'three-point' ? 3 : 2
  }

  return (
    <>
      {/* Game UI */}
      <div>Score: {gameState.celticsScore} - {gameState.lakersScore}</div>

      {/* Defense components */}
      {activeDefense?.type === 'choice' && (
        <DefenseChoice
          lakersPlayer={activeDefense.lakersPlayer}
          lakersAction={activeDefense.lakersAction}
          onComplete={(choice, result) =>
            handleDefenseComplete('choice', { choice, result })
          }
        />
      )}

      {activeDefense?.type === 'predict' && (
        <DefensePredict
          lakersPlayer={activeDefense.lakersPlayer}
          actualPlay={activeDefense.actualPlay}
          onComplete={(prediction, wasCorrect, result) =>
            handleDefenseComplete('predict', { prediction, wasCorrect, result })
          }
        />
      )}
    </>
  )
}
```

---

## Testing

Run the example component to test both mechanics:

```jsx
import DefenseExample from './components/defense/DefenseExample'

// In your App.jsx or test route
<DefenseExample />
```

The example includes:
- Buttons to trigger each defense type
- Event log showing all results
- Usage code snippets
- Full working demo

---

## Accessibility

Both components include:
- Keyboard navigation support
- High contrast colors
- Clear visual feedback
- Screen reader friendly labels (can be enhanced)

### TODO for WCAG Compliance
- [ ] Add ARIA labels to all buttons
- [ ] Add focus visible states
- [ ] Test with screen readers
- [ ] Add keyboard shortcuts (Space/Enter)
- [ ] Add reduced motion support

---

## Performance Considerations

- **Framer Motion**: Already in project dependencies
- **Bundle size**: ~8KB total for both components (gzipped)
- **Render optimization**: Uses `useCallback` to prevent unnecessary re-renders
- **Animation performance**: GPU-accelerated transforms only
- **Timer efficiency**: Single interval per component, cleaned up on unmount

---

## File Structure

```
src/components/defense/
├── DefenseChoice.jsx     # Choice-based defense
├── DefensePredict.jsx    # Prediction-based defense
├── DefenseExample.jsx    # Demo/test component
├── index.js              # Barrel export
└── README.md             # This file
```

---

## Dependencies

All dependencies already in project:
- `react` (19.2.0)
- `framer-motion` (12.23.26)
- `lucide-react` (0.561.0) - Icons
- `tailwindcss` (4.1.18)

---

## Design Notes

### Why Lakers as Villains?

The Celtics-Lakers rivalry is one of the NBA's greatest. LeBron and AD are marked as villains to:
1. Create narrative tension
2. Make defense feel urgent/important
3. Give Celtics fans satisfaction when stopping them
4. Increase engagement through rivalry emotion

### Why Two Different Mechanics?

Variety keeps gameplay fresh:
- **DefenseChoice**: Strategic risk/reward (safe Contest vs risky Block/Steal)
- **DefensePredict**: Pattern recognition and game IQ
- Alternating between them prevents repetition fatigue
- Both reward different player skills

### Timer Durations

- **DefenseChoice (5s)**: Enough time to read options and make strategic choice
- **DefensePredict (4s)**: Faster to match quick basketball reads
- Both have color-coded warnings (yellow → red)

---

## Future Enhancements

- [ ] Add sound effects (crowd cheer, buzzer, whistle)
- [ ] Player fatigue system (lower success rates when tired)
- [ ] Hot/cold streaks (boost success after consecutive stops)
- [ ] Defensive badges/achievements
- [ ] Multiplayer co-op defense
- [ ] Advanced stats tracking (blocks per game, steal %, etc)
- [ ] Coach tips based on Lakers player tendencies
- [ ] Difficulty scaling based on quarter/score

---

## Credits

Built for the Boston Celtics vs LA Lakers basketball game.
Replaces the old RapidTap QTE mechanic with more strategic gameplay.
