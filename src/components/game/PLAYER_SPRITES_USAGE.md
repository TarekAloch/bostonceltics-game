# Player Sprites Usage Guide

## Overview

Three new components for realistic basketball player silhouettes on the court:

1. **PlayerSprite.jsx** - Individual player silhouette
2. **BallSprite.jsx** - Animated basketball
3. **CourtPlayers.jsx** - Manages all 10 players + ball

## File Locations

```
/var/www/html/bostonceltics.com/src/components/game/
├── PlayerSprite.jsx     (8.9k) - Individual player component
├── BallSprite.jsx       (4.5k) - Basketball component
└── CourtPlayers.jsx     (9.5k) - Updated to use realistic sprites
```

## Quick Start

### Import in your Game component

```jsx
import CourtPlayers from './components/game/CourtPlayers'
import { celtics, lakers } from './data/players'

// Inside Court component
<Court possession={possession}>
  <CourtPlayers
    possession={possession}
    celticsPlayers={celtics.slice(0, 5)}
    lakersPlayers={lakers.slice(0, 5)}
    activePlayer={activePlayer}
    playType="pick-roll"
    phase="playing"
    onPlayComplete={() => console.log('Play finished')}
  />
</Court>
```

## Component APIs

### PlayerSprite

Individual player silhouette with realistic basketball player shape.

```jsx
<PlayerSprite
  team="celtics"           // 'celtics' | 'lakers'
  number={0}               // Jersey number
  pose="standing"          // 'standing' | 'running' | 'shooting' | 'defending' | 'ball'
  isActive={true}          // Adds glow effect
  hasBall={true}           // Shows basketball near player
  position={{ x: 65, y: 50 }}  // Percentage-based position
  facing="right"           // 'left' | 'right'
  isVillain={false}        // Red glow for LeBron/AD
/>
```

**Team Colors:**
- Celtics: #007A33 (green) body, #BA9653 (gold) trim/number
- Lakers: #552583 (purple) body, #FDB927 (gold) trim/number

**Poses:**
- `standing` - Athletic stance with idle bobbing
- `running` - Running motion with leg animation
- `shooting` - Jump shot with elevated body
- `defending` - Wide defensive stance, arms spread
- `ball` - Dribbling/holding ball stance

### BallSprite

Animated basketball with realistic texture and motion.

```jsx
<BallSprite
  position={{ x: 50, y: 50 }}     // Percentage-based position
  isInAir={false}                 // Ball in flight
  state="dribbling"               // 'held' | 'dribbling' | 'shooting' | 'passing'
  targetPosition={{ x: 90, y: 50 }}  // Where ball is moving to
  onAnimationComplete={() => {}}  // Callback
/>
```

**States:**
- `held` - Static at player position
- `dribbling` - Bouncing animation
- `shooting` - Arc animation with spin
- `passing` - Quick movement with rotation

### CourtPlayers

Manages all 10 players on court with smart positioning.

```jsx
<CourtPlayers
  possession="celtics"        // 'celtics' | 'lakers'
  celticsPlayers={celtics}    // Array of 5 player objects
  lakersPlayers={lakers}      // Array of 5 player objects
  activePlayer={tatum}        // Current ball handler
  playType="isolation"        // 'pick-roll' | 'isolation' | 'fast-break' | null
  phase="playing"             // 'intro' | 'playing' | 'scoring' | 'celebrating'
  onPlayComplete={() => {}}   // Callback when animation finishes
/>
```

**Play Types:**

1. **pick-roll** - Ball handler + screener close together
   - Screener sets pick near ball handler
   - Other players spread to wings/corners

2. **isolation** - Clear out for 1-on-1
   - Ball handler isolated at top
   - All other players in corners for spacing

3. **fast-break** - Transition running
   - Players running toward offensive basket
   - Ball handler leading the break

4. **default** - Standard half-court offense
   - Traditional 5-out spacing

**Phases:**
- `intro` - Players standing, no animation
- `playing` - Active play, dribbling/movement
- `scoring` - Shooting animation
- `celebrating` - After basket, static

## Player Data Format

Players should have this structure (from `/var/www/html/bostonceltics.com/src/data/players.js`):

```js
{
  name: 'Jayson Tatum',
  number: 0,
  position: 'SF',    // 'PG' | 'SG' | 'SF' | 'PF' | 'C'
  rating: 95,
  villain: false     // true for LeBron/AD (red glow effect)
}
```

## Positioning System

**Percentage-based (0-100%) for responsive design:**

```
Court Layout:
  0% (left basket) ←→ 100% (right basket)
  0% (top) ↕ 100% (bottom)

Key Positions:
  - Left basket: x=10%, y=50%
  - Right basket: x=90%, y=50%
  - Half court: x=50%, y=50%
  - Top of key: x=65%, y=50%
```

## Animations

### PlayerSprite Animations
- **Idle bobbing** - Standing pose has subtle up/down motion
- **Running** - Faster bobbing when in running pose
- **Shooting** - Upward motion with slight delay
- **Glow pulse** - Active player glows with team color
- **Villain glow** - Red pulsing glow for LeBron/AD

### BallSprite Animations
- **Dribble bounce** - Up/down with rotation
- **Shot arc** - Parabolic motion toward basket
- **Pass** - Quick linear movement with spin
- **Motion trail** - Orange blur when in air

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support (when interactive)
- High contrast team colors
- Clear visual indicators for active players

## Performance Optimizations

1. **SVG-based** - Crisp at any resolution
2. **Memoized positions** - useMemo prevents recalculations
3. **AnimatePresence** - Smooth enter/exit animations
4. **Percentage-based layout** - No media queries needed
5. **Conditional rendering** - Only show ball/glows when needed

## Integration Example

Full example from a Game component:

```jsx
import { useState } from 'react'
import Court from './components/game/Court'
import CourtPlayers from './components/game/CourtPlayers'
import { celtics, lakers } from './data/players'

export default function Game() {
  const [possession, setPossession] = useState('celtics')
  const [activePlayer, setActivePlayer] = useState(celtics[0]) // Tatum
  const [playType, setPlayType] = useState('pick-roll')
  const [phase, setPhase] = useState('playing')

  const handlePlayComplete = () => {
    console.log('Play finished!')
    setPhase('celebrating')
  }

  return (
    <div className="w-full h-screen bg-[#0A1612]">
      <Court possession={possession}>
        <CourtPlayers
          possession={possession}
          celticsPlayers={celtics.slice(0, 5)}
          lakersPlayers={lakers.slice(0, 5)}
          activePlayer={activePlayer}
          playType={playType}
          phase={phase}
          onPlayComplete={handlePlayComplete}
        />
      </Court>

      {/* Control buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button onClick={() => setPlayType('pick-roll')}>
          Pick & Roll
        </button>
        <button onClick={() => setPlayType('isolation')}>
          Isolation
        </button>
        <button onClick={() => setPlayType('fast-break')}>
          Fast Break
        </button>
        <button onClick={() => setPhase('scoring')}>
          Shoot!
        </button>
      </div>
    </div>
  )
}
```

## Customization

### Adjust Player Size

In `PlayerSprite.jsx`, modify the SVG viewBox and className:

```jsx
// Larger players
<svg viewBox="0 0 100 200" className="w-20 h-40 md:w-24 md:h-48">

// Smaller players
<svg viewBox="0 0 100 200" className="w-8 h-16 md:w-12 md:h-24">
```

### Change Team Colors

In `PlayerSprite.jsx`, update `TEAM_COLORS`:

```js
const TEAM_COLORS = {
  celtics: {
    body: '#007A33',    // Jersey color
    trim: '#BA9653',    // Number/outline color
    glow: 'rgba(0,122,51,0.6)',  // Active glow
  },
}
```

### Add New Poses

In `PlayerSprite.jsx`, add to `POSES` object:

```js
POSES = {
  celebrating: {
    body: 'M50,20 C45,20...', // Arms raised celebration
    head: 'M50,5 C55,5...',
  },
}
```

## Testing

```jsx
// Test individual player
<PlayerSprite
  team="celtics"
  number={7}
  pose="shooting"
  isActive={true}
  position={{ x: 50, y: 50 }}
/>

// Test ball
<BallSprite
  position={{ x: 50, y: 50 }}
  state="dribbling"
/>

// Test full court
<CourtPlayers
  possession="celtics"
  celticsPlayers={[...]}
  lakersPlayers={[...]}
  playType="fast-break"
  phase="playing"
/>
```

## Troubleshooting

**Players not showing:**
- Check players array has 5 items
- Verify position values are 0-100%
- Ensure Court component wraps CourtPlayers

**Ball not following player:**
- Check activePlayer is in players array
- Verify activePlayer.name matches exactly
- Ensure position has x, y properties

**Glows not appearing:**
- Set isActive={true} for active player
- Check team colors in TEAM_COLORS
- Verify isVillain for Lakers stars

**Animations choppy:**
- Reduce number of concurrent animations
- Check browser performance
- Use will-change CSS for heavy animations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile: iOS 14+, Android Chrome 90+

Requires Framer Motion 10+ and React 18+.
