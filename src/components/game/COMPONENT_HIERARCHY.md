# Court Component Hierarchy

## Visual Component Tree

```
GameScreen.jsx
│
├─ Scoreboard.jsx
│
├─ Court.jsx ★ ENHANCED
│  │
│  ├─ [Parquet Floor Pattern]
│  ├─ [Court Lines SVG]
│  ├─ [Center Court Logo]
│  │
│  ├─ [Possession Indicator Glow]
│  ├─ [Score Glow Effect] ★ NEW
│  ├─ [Court Shake Animation] ★ NEW
│  │
│  ├─ CourtPlayers.jsx ★ MODIFIED
│  │  │
│  │  ├─ PlayerSprite.jsx (x10 - 5 per team)
│  │  │  ├─ [Player Silhouette SVG]
│  │  │  ├─ [Jersey Number]
│  │  │  ├─ [Team Color Styling]
│  │  │  ├─ [Active Player Glow]
│  │  │  ├─ [Villain Effect (Lakers)]
│  │  │  └─ [Pose Animation]
│  │  │
│  │  ├─ BallSprite.jsx
│  │  │  ├─ [Basketball SVG]
│  │  │  ├─ [State Animation (dribble/shoot/pass)]
│  │  │  └─ [Motion Trail]
│  │  │
│  │  └─ [Play Type Indicator] ★ NEW
│  │
│  ├─ ShotArc.jsx ★ NEW
│  │  ├─ [Shot Path (Bezier Curve)]
│  │  ├─ [Ball Animation Along Arc]
│  │  └─ [Result Effect]
│  │     ├─ Swish (made)
│  │     ├─ Rim Bounce (missed)
│  │     └─ Block Deflection (blocked)
│  │
│  ├─ [Active Player Spotlight] ★ NEW
│  │
│  └─ Crowd.jsx
│     ├─ [Top Crowd Silhouettes]
│     ├─ [Bottom Crowd Silhouettes]
│     ├─ [Floating Crowd Phrases]
│     └─ [Beat LA Overlay]
│
├─ PlayerCard.jsx
│
├─ ActionButtons.jsx
│
├─ Commentary.jsx
│
└─ [Phase-based Overlays]
   ├─ TimingRing.jsx (QTE)
   ├─ RapidTap.jsx (Defense)
   └─ QuizModal.jsx (Trivia)
```

---

## Data Flow

```
GameScreen State
     │
     ├─> possession ────────┐
     ├─> activePlayer ──────┤
     ├─> celticsRoster ─────┤
     ├─> lakersRoster ──────┤
     ├─> playType ──────────┤
     ├─> phase ─────────────┤
     ├─> lastPlay ──────────┤
     ├─> showShotArc ───────┤
     └─> shotData ──────────┤
                            │
                            ▼
                       Court.jsx
                            │
     ┌──────────────────────┼──────────────────────┐
     │                      │                      │
     ▼                      ▼                      ▼
CourtPlayers.jsx      ShotArc.jsx            Crowd.jsx
     │
     ├─> PlayerSprite.jsx (x10)
     │   ├─ team
     │   ├─ number
     │   ├─ pose
     │   ├─ position
     │   ├─ isActive
     │   ├─ hasBall
     │   └─ facing
     │
     └─> BallSprite.jsx
         ├─ position
         ├─ state
         ├─ isInAir
         └─ targetPosition
```

---

## Animation Flow

```
1. ACTION SELECTION
   User selects shot type
        │
        ▼
   ActionButtons emits action
        │
        ▼
   playType set (e.g., 'isolation')
        │
        ▼
   CourtPlayers animates to formation
        │
        ▼

2. SHOOTING PHASE
   phase = 'scoring'
        │
        ▼
   createShotData() generates shot config
        │
        ▼
   showShotArc = true
   shotData = { from, to, shotType, result }
        │
        ▼
   ShotArc animates ball along arc
        │
        ▼
   Result animation (swish/bounce/block)
        │
        ▼
   onShotComplete callback
        │
        ▼

3. RESULT PROCESSING
   lastPlay updated
        │
        ├─> Court triggers score glow
        ├─> Court triggers shake (if 3PT/dunk)
        └─> Crowd updates mood
        │
        ▼

4. POSSESSION CHANGE
   phase = 'transition'
        │
        ▼
   possession switches
        │
        ▼
   CourtPlayers animates to new positions
   (offense/defense flip)
        │
        ▼
   phase = 'action-select'
   (cycle repeats)
```

---

## Prop Flow Diagram

```
                     GameScreen
                         │
            ┌────────────┴────────────┐
            │                         │
        [State]                   [Actions]
            │                         │
    ┌───────┼───────┐                │
    │       │       │                │
possession  │    roster              │
            │       │                │
    ┌───────┼───────┼───────┐        │
    │       │       │       │        │
    │   activePlayer│   playType     │
    │       │       │       │        │
    ▼       ▼       ▼       ▼        ▼
  Court.jsx ──────────────────> onShotComplete
    │
    ├─────────────────────────┐
    │                         │
    ▼                         ▼
CourtPlayers.jsx         ShotArc.jsx
    │                         │
    ├──────┬──────┐           │
    │      │      │           │
    ▼      ▼      ▼           ▼
Player  Player  Ball      [Arc Animation]
Sprite  Sprite  Sprite
  (×5)   (×5)
```

---

## State Management

### Court.jsx Internal State
```javascript
const [courtShake, setCourtShake] = useState(false)
const [scoreGlow, setScoreGlow] = useState(null)

// Triggered by lastPlay prop changes
useEffect(() => {
  if (lastPlay?.type === 'made') {
    setScoreGlow(lastPlay.team)      // Green or purple glow
    if (lastPlay.points === 3) {
      setCourtShake(true)             // Shake animation
    }
  }
}, [lastPlay])
```

### CourtPlayers.jsx Internal State
```javascript
const [ballState, setBallState] = useState('held')
const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 })

// Ball follows active player
useEffect(() => {
  if (activePlayer) {
    const player = findPlayerPosition(activePlayer)
    setBallPosition(player.pos)
  }
}, [activePlayer])

// Ball state based on phase
useEffect(() => {
  switch (phase) {
    case 'playing':
      setBallState('held')
      break
    case 'scoring':
      setBallState('shooting')
      break
  }
}, [phase])
```

---

## Render Order (Z-Index Layers)

```
Layer 20: Game Content Overlay (children)
          ├─ Crowd phrases
          └─ QTE components

Layer 15: Active Player Spotlight

Layer 10: Player Sprites & Ball
          ├─ CourtPlayers (base)
          ├─ PlayerSprite (×10)
          └─ BallSprite

Layer 5:  Shot Arc Animation
          └─ ShotArc.jsx

Layer 3:  Score Glow Effect
          └─ Pulsing radial gradient

Layer 2:  Possession Indicator
          └─ Subtle glow on offense side

Layer 1:  Court Elements
          ├─ Parquet floor
          ├─ Court lines (SVG)
          └─ Center court logo

Layer 0:  Background
          └─ Crowd glow effect

Layer -1: Backdrop
          └─ Screen background gradient
```

---

## Event Flow

```
USER INPUT
   │
   ▼
ActionButtons onClick
   │
   ▼
actions.selectAction(action)
   │
   ▼
GameScreen updates state
   ├─> selectedAction = action
   ├─> playType = mapActionToPlay(action)
   └─> phase = 'qte'
   │
   ▼
Court receives new props
   │
   ├─> CourtPlayers animates to playType formation
   └─> Players move to positions
   │
   ▼
QTE Component renders
   │
   ▼
User completes QTE
   │
   ▼
actions.completeQTE(result)
   │
   ▼
GameScreen updates
   ├─> phase = 'scoring'
   ├─> shotData = createShotData(...)
   └─> showShotArc = true
   │
   ▼
ShotArc animates
   │
   ▼
Animation complete
   │
   ▼
onShotComplete callback
   │
   ▼
GameScreen updates
   ├─> score updated
   ├─> lastPlay set
   ├─> showShotArc = false
   └─> phase = 'transition'
   │
   ▼
Court effects trigger
   ├─> Score glow
   ├─> Court shake
   └─> Crowd mood change
```

---

## Component Lifecycle

### Court Mount
```
1. Court.jsx mounts
2. Renders court lines and floor
3. CourtPlayers mounts
4. PlayerSprite × 10 mount with entrance animation
5. BallSprite mounts
6. Crowd mounts with silhouettes
7. All settle into idle animations
```

### Possession Change
```
1. possession prop changes
2. CourtPlayers recalculates positions (useMemo)
3. PlayerSprite components animate to new positions
4. BallSprite follows new active player
5. Possession glow shifts to new offensive end
6. Active player spotlight repositions
```

### Shot Sequence
```
1. showShotArc changes to true
2. ShotArc mounts
3. Ball sprite animates along arc
4. Result effect plays (swish/bounce/block)
5. onComplete callback fires
6. ShotArc unmounts
7. Score glow pulses
8. Court may shake
9. Crowd reacts
```

---

## Responsive Behavior

### Screen Size Adaptations

**Desktop (≥768px)**
- Player sprites: 16w × 32h (larger)
- Ball: 6w × 6h
- Full court visible
- All animations run smoothly

**Mobile (<768px)**
- Player sprites: 12w × 24h (smaller)
- Ball: 4w × 4h
- Court scales to fit screen
- Touch-optimized interactions

### Coordinate Systems

**Court Lines (SVG)**
- Absolute coordinates in viewBox
- Scales proportionally with container
- Maintains aspect ratio

**Player Sprites (Percentage)**
- Relative to court container
- Automatically responsive
- No media queries needed

---

## Performance Characteristics

### Render Cycles
- Court: Re-renders on possession/lastPlay change
- CourtPlayers: Memoized position calculations
- PlayerSprite: Individual re-renders on pose/position change
- BallSprite: Updates on position/state change

### Animation Performance
- GPU-accelerated transforms (Framer Motion)
- No layout thrashing
- Debounced state changes
- Automatic cleanup on unmount

### Memory Usage
- 10 PlayerSprite instances (lightweight SVG)
- 1 BallSprite instance
- Minimal DOM nodes
- No memory leaks (proper cleanup)

---

## Key Files Reference

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| Court.jsx | Component | ~210 | Main court container |
| CourtPlayers.jsx | Component | ~240 | Player management |
| PlayerSprite.jsx | Component | ~235 | Player silhouette |
| BallSprite.jsx | Component | ~170 | Basketball sprite |
| ShotArc.jsx | Component | ~200 | Shot animation |
| shotPositions.js | Utility | ~200 | Position helpers |
| CourtDemo.jsx | Demo | ~250 | Interactive test |
| GameScreen.jsx | Screen | ~175 | Game orchestrator |

---

**Total Code:** ~1,700 lines
**Components:** 8
**Utilities:** 1
**Documentation:** 3 files
**Status:** Production Ready

---

Last Updated: 2025-12-14
