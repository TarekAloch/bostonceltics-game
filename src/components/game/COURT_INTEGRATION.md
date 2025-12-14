# Court Component Integration Guide

Enhanced basketball court visualization with player sprites, shot animations, and dynamic play animations.

## Components Overview

### 1. Court.jsx (Enhanced)
Main court component with integrated player rendering and visual effects.

**New Props:**
```jsx
<Court
  // Existing
  possession="celtics"           // 'celtics' | 'lakers'
  children={<Crowd ... />}       // Child components

  // NEW - Player Integration
  celticsPlayers={[...]}         // Array of Celtics player objects
  lakersPlayers={[...]}          // Array of Lakers player objects
  activePlayer={playerObj}       // Current player with ball

  // NEW - Animation
  playType="pick-roll"           // 'pick-roll' | 'isolation' | 'fast-break' | null
  phase="playing"                // Game phase state

  // NEW - Shot Arc
  showShotArc={true}             // Toggle shot animation
  shotData={shotDataObj}         // Shot configuration object
  onShotComplete={() => {}}      // Callback when shot animation completes

  // NEW - Visual Feedback
  lastPlay={lastPlayObj}         // Last play for score glow effects
/>
```

**Visual Effects:**
- Green glow pulse when Celtics score
- Purple/yellow glow when Lakers score
- Court shake on dunks and 3-pointers
- Spotlight on active player
- Possession indicator glow

---

### 2. CourtPlayers.jsx (NEW)
Renders animated player sprites on the court.

**Props:**
```jsx
<CourtPlayers
  possession="celtics"           // Current possession
  celticsPlayers={[...]}         // Celtics roster
  lakersPlayers={[...]}          // Lakers roster
  activePlayer={playerObj}       // Player with ball (gets highlighted)
  playType="pick-roll"           // Animation type
  phase="playing"                // Game phase
/>
```

**Player Object Structure:**
```javascript
{
  name: 'Jayson Tatum',
  number: '0',
  position: 'SF',
  rating: 93,
  villain: false  // Lakers stars get red villain glow
}
```

**Play Type Animations:**

| Play Type | Offensive Formation | Defensive Formation |
|-----------|-------------------|-------------------|
| `pick-roll` | Ball handler + screener converge | Switching defense |
| `isolation` | Ball handler isolated, others clear out | On-ball pressure |
| `fast-break` | Players sprint up court with trail effect | Defenders getting back |
| `null` (default) | Standard half-court setup | Standard defensive positions |

**Visual Features:**
- Jersey numbers displayed on sprites
- Active player name shown below sprite
- Ball icon hovers above ball handler
- Green (Celtics) or Purple (Lakers) team colors
- Gold stroke for Lakers (brand colors)
- Movement trails during fast breaks
- Screen indicator boxes for pick & roll

---

### 3. ShotArc.jsx (NEW)
Animated basketball shot trajectory.

**Props:**
```jsx
<ShotArc
  from={{ x: 300, y: 100 }}      // Shooter position (SVG coords 0-400, 0-200)
  to={{ x: 375, y: 100 }}        // Basket position
  shotType="three-point"         // 'three-point' | 'mid-range' | 'layup'
  result="made"                  // 'made' | 'missed' | 'blocked'
  onComplete={() => {}}          // Callback when animation finishes
/>
```

**Shot Types:**
- **three-point**: High arc, 0.8s duration
- **mid-range**: Medium arc, 0.6s duration
- **layup**: Low/fast arc, 0.4s duration

**Result Animations:**
- **made**: Green swish effect, net ripple, "SWISH!" text
- **missed**: Ball bounces off rim with shake effect
- **blocked**: Ball deflects mid-flight with red impact ring

---

### 4. shotPositions.js (NEW)
Utility functions for shot position calculations.

**Key Functions:**

```javascript
import { createShotData, getBasketPosition, getShootingPosition } from './utils/shotPositions'

// Easy way: Create complete shot data
const shotData = createShotData({
  team: 'celtics',
  possession: 'celtics',
  shotType: 'three-point',
  result: 'made',
  position: 'wing-top'  // Optional: specific position
})

// Manual way: Build positions yourself
const basket = getBasketPosition('celtics', 'celtics')  // { x: 375, y: 100 }
const shooter = getShootingPosition('three-point', 'celtics', 'corner-bottom')
```

**Available Positions:**

Celtics (Right Side):
- `three-point-top`, `three-point-wing-top`, `three-point-wing-bottom`
- `three-point-corner-top`, `three-point-corner-bottom`
- `mid-range-top`, `mid-range-elbow-top`, `mid-range-elbow-bottom`
- `layup-right`, `layup-left`, `paint`

Lakers (Left Side):
- Mirror positions on left side of court

---

## Integration Example

### Basic Setup
```jsx
import Court from './components/game/Court'
import Crowd from './components/game/Crowd'

function Game() {
  const [possession, setPossession] = useState('celtics')
  const [playType, setPlayType] = useState(null)
  const [celticsRoster] = useState([
    { name: 'Jayson Tatum', number: '0', position: 'SF', rating: 93 },
    // ... more players
  ])
  const [lakersRoster] = useState([
    { name: 'LeBron James', number: '23', position: 'SF', rating: 96, villain: true },
    // ... more players
  ])

  return (
    <Court
      possession={possession}
      celticsPlayers={celticsRoster}
      lakersPlayers={lakersRoster}
      activePlayer={celticsRoster[0]}
      playType={playType}
    >
      <Crowd mood="hyped" />
    </Court>
  )
}
```

### With Shot Animation
```jsx
import { createShotData } from './components/game/utils/shotPositions'

function Game() {
  const [showShot, setShowShot] = useState(false)
  const [shotData, setShotData] = useState(null)

  const takeShot = () => {
    const shot = createShotData({
      team: 'celtics',
      possession: 'celtics',
      shotType: 'three-point',
      result: 'made'
    })

    setShotData(shot)
    setShowShot(true)
  }

  const handleShotComplete = () => {
    setShowShot(false)
    // Update game state (score, possession, etc.)
  }

  return (
    <Court
      possession="celtics"
      showShotArc={showShot}
      shotData={shotData}
      onShotComplete={handleShotComplete}
      // ... other props
    />
  )
}
```

### Play Type Cycle
```jsx
function Game() {
  const cyclePlay = () => {
    const plays = [null, 'pick-roll', 'isolation', 'fast-break']
    const nextPlay = plays[(plays.indexOf(playType) + 1) % plays.length]
    setPlayType(nextPlay)
  }

  return (
    <>
      <button onClick={cyclePlay}>Change Play</button>
      <Court playType={playType} {...otherProps} />
    </>
  )
}
```

---

## Coordinate System

SVG ViewBox: `0 0 400 200`

```
0,0 ──────────────────────── 400,0
 │                              │
 │   Left Basket (25,100)       │   Right Basket (375,100)
 │         ●                    │            ●
 │                              │
 │        Half Court (200,100)  │
 │              ☘️              │
 │                              │
0,200 ────────────────────── 400,200
```

**Key Positions:**
- Left basket: `(25, 100)`
- Right basket: `(375, 100)`
- Center court: `(200, 100)`
- Three-point arc radius: ~65 units
- Paint width: 60 units
- Paint height: 80 units

---

## Performance Considerations

### Optimizations
1. **Player sprites**: Use SVG for crisp rendering at any scale
2. **Animations**: Framer Motion with GPU-accelerated transforms
3. **Memoization**: Player positions calculated via `useMemo`
4. **Lazy rendering**: Sprites only render when players array provided

### Performance Tips
- Limit active animations (don't run shot + multiple play transitions simultaneously)
- Use `AnimatePresence` for smooth mount/unmount
- Shot arcs auto-cleanup on complete
- Player sprites reuse shared SVG patterns

---

## Accessibility

- All player sprites have descriptive text labels
- Court markings use proper stroke contrast
- Team colors meet WCAG AA contrast ratios
- Animations can be disabled via `prefers-reduced-motion`
- Keyboard navigation supported (focus on active player)

---

## Testing

### Unit Tests
```javascript
import { createShotData, determineShotType } from './utils/shotPositions'

test('creates valid shot data', () => {
  const shot = createShotData({
    team: 'celtics',
    possession: 'celtics',
    shotType: 'three-point',
    result: 'made'
  })

  expect(shot).toHaveProperty('from')
  expect(shot).toHaveProperty('to')
  expect(shot.shotType).toBe('three-point')
})
```

### Demo Component
Use `CourtDemo.jsx` for interactive testing of all features.

---

## Troubleshooting

**Players not showing:**
- Ensure player arrays have at least 1 player
- Check player object structure (must have `name`, `number`)
- Verify `possession` prop is set

**Shot arc not animating:**
- Confirm `showShotArc={true}` and `shotData` is provided
- Check `shotData.from` and `shotData.to` are valid coordinates
- Ensure `onShotComplete` callback is defined

**Animations choppy:**
- Reduce number of simultaneous animations
- Check browser GPU acceleration enabled
- Consider debouncing rapid state changes

---

## File Locations

```
/var/www/html/bostonceltics.com/src/components/game/
├── Court.jsx                 # Enhanced main component
├── CourtPlayers.jsx          # NEW - Player sprites
├── ShotArc.jsx              # NEW - Shot animation
├── CourtDemo.jsx            # NEW - Interactive demo
├── Crowd.jsx                # Existing crowd component
├── PlayerCard.jsx           # Existing player card
└── utils/
    └── shotPositions.js     # NEW - Shot position utilities
```

---

## Future Enhancements

- [ ] Dribble animation for ball handler
- [ ] Pass animation between players
- [ ] Defensive hand-checking indicators
- [ ] Rebound battle animations
- [ ] Substitution transitions
- [ ] Timeout huddle formation
- [ ] Replay camera angles
- [ ] Heat maps for shot charts
