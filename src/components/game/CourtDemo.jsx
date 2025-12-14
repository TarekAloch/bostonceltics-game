import { useState } from 'react'
import Court from './Court'
import Crowd from './Crowd'
import { createShotData } from './utils/shotPositions'

/**
 * CourtDemo Component
 *
 * Example implementation showing how to use the enhanced Court component
 * with player sprites, shot animations, and all visual effects.
 *
 * This demonstrates the full integration of:
 * - Player sprites with positioning
 * - Shot arc animations
 * - Play type animations (pick & roll, isolation, fast break)
 * - Visual feedback (glows, shakes, spotlights)
 * - Possession changes
 */
export default function CourtDemo() {
  // Sample player data
  const [celticsRoster] = useState([
    { name: 'Jayson Tatum', number: '0', position: 'SF', rating: 93 },
    { name: 'Jaylen Brown', number: '7', position: 'SG', rating: 89 },
    { name: 'Derrick White', number: '9', position: 'PG', rating: 82 },
    { name: 'Kristaps Porzingis', number: '8', position: 'PF', rating: 87 },
    { name: 'Al Horford', number: '42', position: 'C', rating: 80 },
  ])

  const [lakersRoster] = useState([
    { name: 'LeBron James', number: '23', position: 'SF', rating: 96, villain: true },
    { name: 'Anthony Davis', number: '3', position: 'PF', rating: 95, villain: true },
    { name: "D'Angelo Russell", number: '1', position: 'PG', rating: 84 },
    { name: 'Austin Reaves', number: '15', position: 'SG', rating: 79 },
    { name: 'Rui Hachimura', number: '28', position: 'SF', rating: 78 },
  ])

  // Game state
  const [possession, setPossession] = useState('celtics')
  const [playType, setPlayType] = useState(null)
  const [activePlayer, setActivePlayer] = useState(celticsRoster[0])
  const [phase, setPhase] = useState('playing')
  const [lastPlay, setLastPlay] = useState(null)
  const [showShotArc, setShowShotArc] = useState(false)
  const [shotData, setShotData] = useState(null)
  const [crowdMood, setCrowdMood] = useState('neutral')

  // Demo: Simulate a shot
  const simulateShot = (shotType, result) => {
    const currentTeam = possession
    const currentPlayer = currentTeam === 'celtics' ? celticsRoster[0] : lakersRoster[0]

    // Create shot data
    const shot = createShotData({
      team: currentTeam,
      possession,
      shotType,
      result,
    })

    setShotData(shot)
    setShowShotArc(true)
    setPlayType(null) // Clear play type during shot

    // Handle shot result
    setTimeout(() => {
      if (result === 'made') {
        setLastPlay({
          type: 'made',
          team: currentTeam,
          player: currentPlayer,
          points: shotType === 'three-point' ? 3 : 2,
        })
        setCrowdMood(currentTeam === 'celtics' ? 'hyped' : 'angry')
      } else {
        setLastPlay({
          type: 'missed',
          team: currentTeam,
        })
        setCrowdMood('neutral')
      }
    }, 800)
  }

  const handleShotComplete = () => {
    setShowShotArc(false)
    setShotData(null)
    // Change possession after shot (simplified)
    setTimeout(() => {
      const newPossession = possession === 'celtics' ? 'lakers' : 'celtics'
      setPossession(newPossession)
      setActivePlayer(newPossession === 'celtics' ? celticsRoster[0] : lakersRoster[0])
      setCrowdMood('neutral')
    }, 1000)
  }

  // Demo: Change play type
  const cyclePlayType = () => {
    const playTypes = [null, 'pick-roll', 'isolation', 'fast-break']
    const currentIndex = playTypes.indexOf(playType)
    const nextIndex = (currentIndex + 1) % playTypes.length
    setPlayType(playTypes[nextIndex])
  }

  // Demo: Switch possession
  const switchPossession = () => {
    const newPossession = possession === 'celtics' ? 'lakers' : 'celtics'
    setPossession(newPossession)
    setActivePlayer(newPossession === 'celtics' ? celticsRoster[0] : lakersRoster[0])
    setPlayType(null)
  }

  return (
    <div className="min-h-screen bg-[#0A1612] flex flex-col">
      {/* Demo Controls */}
      <div className="bg-[#007A33]/10 p-4 border-b border-[#007A33]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-['Oswald'] text-white mb-4">Court Demo - Interactive Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shot Controls */}
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Shot Animations</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => simulateShot('three-point', 'made')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  3PT Made
                </button>
                <button
                  onClick={() => simulateShot('mid-range', 'made')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  Mid-Range Made
                </button>
                <button
                  onClick={() => simulateShot('layup', 'made')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  Layup Made
                </button>
                <button
                  onClick={() => simulateShot('three-point', 'missed')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  Shot Missed
                </button>
                <button
                  onClick={() => simulateShot('mid-range', 'blocked')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
                >
                  Blocked Shot
                </button>
              </div>
            </div>

            {/* Play Type Controls */}
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Play Types & Possession</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={cyclePlayType}
                  className="px-4 py-2 bg-[#007A33] hover:bg-[#005a25] text-white rounded transition"
                >
                  Cycle Play: {playType || 'None'}
                </button>
                <button
                  onClick={switchPossession}
                  className="px-4 py-2 bg-[#552583] hover:bg-[#3d1a5f] text-white rounded transition"
                >
                  Switch to {possession === 'celtics' ? 'Lakers' : 'Celtics'}
                </button>
                <button
                  onClick={() => setPlayType('pick-roll')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  Pick & Roll
                </button>
                <button
                  onClick={() => setPlayType('isolation')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  Isolation
                </button>
                <button
                  onClick={() => setPlayType('fast-break')}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  Fast Break
                </button>
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="mt-4 bg-black/20 p-3 rounded-lg">
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span>Possession: <strong className={possession === 'celtics' ? 'text-green-400' : 'text-purple-400'}>
                {possession === 'celtics' ? 'Celtics' : 'Lakers'}
              </strong></span>
              <span>Active Player: <strong className="text-white">{activePlayer?.name}</strong></span>
              <span>Play Type: <strong className="text-white">{playType || 'None'}</strong></span>
              <span>Crowd Mood: <strong className="text-white">{crowdMood}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Court Display */}
      <div className="flex-1 relative">
        <Court
          possession={possession}
          playType={playType}
          celticsPlayers={celticsRoster}
          lakersPlayers={lakersRoster}
          activePlayer={activePlayer}
          phase={phase}
          lastPlay={lastPlay}
          showShotArc={showShotArc}
          shotData={shotData}
          onShotComplete={handleShotComplete}
        >
          {/* Crowd overlays */}
          <Crowd mood={crowdMood} showBeatLA={false} lastPlay={lastPlay} />
        </Court>
      </div>
    </div>
  )
}
