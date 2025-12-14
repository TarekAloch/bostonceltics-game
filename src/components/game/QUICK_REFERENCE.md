# Court Component - Quick Reference Card

## Essential Imports

```jsx
import Court from './components/game/Court'
import Crowd from './components/game/Crowd'
import { createShotData } from './components/game/utils/shotPositions'
```

---

## Minimal Setup

```jsx
function Game() {
  const [possession, setPossession] = useState('celtics')

  const roster = [
    { name: 'Jayson Tatum', number: '0', position: 'SF', rating: 93 },
    { name: 'Jaylen Brown', number: '7', position: 'SG', rating: 89 },
    { name: 'Derrick White', number: '9', position: 'PG', rating: 82 },
    { name: 'Kristaps Porzingis', number: '8', position: 'PF', rating: 87 },
    { name: 'Al Horford', number: '42', position: 'C', rating: 80 },
  ]

  return (
    <Court
      possession={possession}
      celticsPlayers={roster}
      lakersPlayers={[/* Lakers roster */]}
      activePlayer={roster[0]}
      phase="playing"
    >
      <Crowd mood="neutral" />
    </Court>
  )
}
```

---

## Complete Feature Set

```jsx
<Court
  // Required
  possession="celtics"              // 'celtics' | 'lakers'

  // Player Integration
  celticsPlayers={celticsRoster}    // Array[5]
  lakersPlayers={lakersRoster}      // Array[5]
  activePlayer={playerObj}          // Player with ball

  // Game State
  phase="playing"                   // 'intro' | 'playing' | 'scoring' | 'celebrating'
  lastPlay={lastPlayObj}            // Last play for effects

  // Animations
  playType="pick-roll"              // 'pick-roll' | 'isolation' | 'fast-break' | null

  // Shot Animation
  showShotArc={true}                // Boolean
  shotData={shotObj}                // From createShotData()
  onShotComplete={() => {}}         // Callback
>
  <Crowd mood="hyped" showBeatLA={false} lastPlay={lastPlay} />
</Court>
```

---

## Player Object Structure

```javascript
{
  name: 'Jayson Tatum',    // Required
  number: '0',             // Required
  position: 'SF',          // Required
  rating: 93,              // Required
  villain: false           // Optional - red glow for Lakers stars
}
```

---

## Shot Animation Flow

```jsx
// 1. Create shot data
const shot = createShotData({
  team: 'celtics',
  possession: 'celtics',
  shotType: 'three-point',    // 'three-point' | 'mid-range' | 'layup'
  result: 'made',             // 'made' | 'missed' | 'blocked'
  position: 'wing-top'        // Optional specific position
})

// 2. Trigger animation
setState({
  showShotArc: true,
  shotData: shot
})

// 3. Handle completion
function handleShotComplete() {
  setState({ showShotArc: false })
  // Update score, possession, etc.
}
```

---

## Play Types Quick Reference

| Play Type | Offensive Formation | When to Use |
|-----------|-------------------|-------------|
| `pick-roll` | Ball handler + screener | Standard half-court offense |
| `isolation` | Solo ball handler, others spaced | Star player iso play |
| `fast-break` | Players sprinting up court | Transition offense |
| `null` | Standard positions | Default setup |

---

## Visual Effects Triggers

```jsx
// Score Glow
lastPlay = {
  type: 'made',
  team: 'celtics',
  points: 3  // Triggers court shake if 3
}

// Court Shake
lastPlay = {
  type: 'made',
  playType: 'dunk',  // Also triggers shake
  // OR
  points: 3          // 3-pointer triggers shake
}
```

---

## Crowd Moods

```jsx
<Crowd
  mood="hyped"      // 'hyped' | 'angry' | 'neutral'
  showBeatLA={true} // Boolean - triggers "BEAT LA!" chant
  lastPlay={lastPlay}
/>
```

---

## Common Patterns

### Cycle Play Types
```jsx
const [playType, setPlayType] = useState(null)

function cyclePlay() {
  const plays = [null, 'pick-roll', 'isolation', 'fast-break']
  const next = plays[(plays.indexOf(playType) + 1) % plays.length]
  setPlayType(next)
}
```

### Switch Possession
```jsx
function switchPossession() {
  const newPossession = possession === 'celtics' ? 'lakers' : 'celtics'
  setPossession(newPossession)
  setActivePlayer(newPossession === 'celtics' ? celticsRoster[0] : lakersRoster[0])
  setPlayType(null)  // Reset play type
}
```

### Simulate Shot
```jsx
function simulateShot(shotType, result) {
  const shot = createShotData({
    team: possession,
    possession,
    shotType,
    result
  })

  setShowShotArc(true)
  setShotData(shot)
  setPlayType(null)  // Clear play during shot
}
```

---

## Coordinate Systems

### SVG (Court Lines)
- Range: `0-400` (x), `0-200` (y)
- Left basket: `(25, 100)`
- Right basket: `(375, 100)`

### Percentage (Player Sprites)
- Range: `0-100%` (x and y)
- Responsive across screen sizes
- Used by PlayerSprite and BallSprite

---

## Shot Positions (shotPositions.js)

### Predefined Positions

**Three-Point:**
- `three-point-top`
- `three-point-wing-top`
- `three-point-wing-bottom`
- `three-point-corner-top`
- `three-point-corner-bottom`

**Mid-Range:**
- `mid-range-top`
- `mid-range-elbow-top`
- `mid-range-elbow-bottom`

**Close:**
- `layup-right`
- `layup-left`
- `paint`

### Random Position
```jsx
// Don't specify position - gets random spot for shot type
createShotData({
  team: 'celtics',
  shotType: 'three-point',  // Random 3pt position
  // No position specified
})
```

---

## Debug Mode

Player sprites show debug labels in development:

```jsx
// Shows in development only
process.env.NODE_ENV === 'development'
// Displays jersey number below sprite
```

---

## Performance Tips

1. **Don't run shot + play animation simultaneously**
   ```jsx
   setPlayType(null)  // Clear before shot
   ```

2. **Limit re-renders**
   ```jsx
   useMemo(() => calculatePositions(), [possession, playType])
   ```

3. **Clean up timers**
   ```jsx
   useEffect(() => {
     const timer = setTimeout(...)
     return () => clearTimeout(timer)
   }, [deps])
   ```

---

## Troubleshooting Checklist

- [ ] Player arrays have 5 players each?
- [ ] Each player has `name` and `number`?
- [ ] `possession` is 'celtics' or 'lakers'?
- [ ] `activePlayer` is from correct team?
- [ ] `shotData` created with `createShotData()`?
- [ ] `onShotComplete` callback defined?
- [ ] `phase` is valid game phase?

---

## File Locations

```
src/components/game/
├── Court.jsx                 # Main component
├── CourtPlayers.jsx          # Player management
├── PlayerSprite.jsx          # Player silhouettes
├── BallSprite.jsx            # Basketball
├── ShotArc.jsx              # Shot animation
├── CourtDemo.jsx            # Interactive demo
└── utils/
    └── shotPositions.js     # Position utilities
```

---

## Test Component

```jsx
import CourtDemo from './components/game/CourtDemo'

// Render this to test all features interactively
<CourtDemo />
```

---

## Documentation

- Full guide: `src/components/game/COURT_INTEGRATION.md`
- Summary: `COURT_ENHANCEMENTS_SUMMARY.md`
- This quick ref: `src/components/game/QUICK_REFERENCE.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-12-14
