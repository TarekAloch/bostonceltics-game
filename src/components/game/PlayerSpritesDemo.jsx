import { useState } from 'react'
import PlayerSprite from './PlayerSprite'
import BallSprite from './BallSprite'
import CourtPlayers from './CourtPlayers'
import Court from './Court'
import { celtics, lakers } from '../../data/players'

/**
 * PlayerSpritesDemo - Interactive demo of player sprite components
 *
 * Usage: Import this in your app to test the player sprites
 * <PlayerSpritesDemo />
 */
export default function PlayerSpritesDemo() {
  const [demoMode, setDemoMode] = useState('full') // 'full' | 'player' | 'ball'
  const [possession, setPossession] = useState('celtics')
  const [playType, setPlayType] = useState('pick-roll')
  const [phase, setPhase] = useState('playing')
  const [activePlayer, setActivePlayer] = useState(celtics[0])

  // Individual player demo controls
  const [playerTeam, setPlayerTeam] = useState('celtics')
  const [playerPose, setPlayerPose] = useState('standing')
  const [playerNumber, setPlayerNumber] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [hasBall, setHasBall] = useState(true)
  const [isVillain, setIsVillain] = useState(false)
  const [facing, setFacing] = useState('right')

  // Ball demo controls
  const [ballState, setBallState] = useState('dribbling')
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 })

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1612] to-[#1a2f27] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-['Oswald'] font-bold text-[#007A33] mb-2">
            Player Sprites Demo
          </h1>
          <p className="text-white/60">
            Interactive demonstration of realistic basketball player silhouettes
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          {['full', 'player', 'ball'].map((mode) => (
            <button
              key={mode}
              onClick={() => setDemoMode(mode)}
              className={`px-6 py-2 rounded-lg font-['Oswald'] tracking-wider uppercase transition-all ${
                demoMode === mode
                  ? 'bg-[#007A33] text-white shadow-lg shadow-[#007A33]/50'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {mode === 'full' ? 'Full Court' : mode === 'player' ? 'Single Player' : 'Basketball'}
            </button>
          ))}
        </div>

        {/* Demo Area */}
        <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm mb-8">
          {/* Full Court Demo */}
          {demoMode === 'full' && (
            <div>
              <div className="h-[600px] relative">
                <Court possession={possession}>
                  <CourtPlayers
                    possession={possession}
                    celticsPlayers={celtics.slice(0, 5)}
                    lakersPlayers={lakers.slice(0, 5)}
                    activePlayer={activePlayer}
                    playType={playType}
                    phase={phase}
                    onPlayComplete={() => {
                      console.log('Play completed!')
                      setPhase('celebrating')
                      setTimeout(() => setPhase('playing'), 2000)
                    }}
                  />
                </Court>
              </div>

              {/* Full Court Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {/* Possession */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Possession</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPossession('celtics')}
                      className={`flex-1 py-2 rounded ${
                        possession === 'celtics'
                          ? 'bg-[#007A33] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Celtics
                    </button>
                    <button
                      onClick={() => setPossession('lakers')}
                      className={`flex-1 py-2 rounded ${
                        possession === 'lakers'
                          ? 'bg-[#552583] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Lakers
                    </button>
                  </div>
                </div>

                {/* Play Type */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Play Type</label>
                  <select
                    value={playType}
                    onChange={(e) => setPlayType(e.target.value)}
                    className="w-full bg-white/10 text-white p-2 rounded"
                  >
                    <option value={null}>Default</option>
                    <option value="pick-roll">Pick & Roll</option>
                    <option value="isolation">Isolation</option>
                    <option value="fast-break">Fast Break</option>
                  </select>
                </div>

                {/* Phase */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Phase</label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full bg-white/10 text-white p-2 rounded"
                  >
                    <option value="intro">Intro</option>
                    <option value="playing">Playing</option>
                    <option value="scoring">Scoring</option>
                    <option value="celebrating">Celebrating</option>
                  </select>
                </div>

                {/* Active Player */}
                <div>
                  <label className="block text-white/60 text-sm mb-2">Active Player</label>
                  <select
                    value={activePlayer?.name}
                    onChange={(e) => {
                      const player = [...celtics, ...lakers].find(p => p.name === e.target.value)
                      setActivePlayer(player)
                      setPossession(celtics.includes(player) ? 'celtics' : 'lakers')
                    }}
                    className="w-full bg-white/10 text-white p-2 rounded"
                  >
                    <optgroup label="Celtics">
                      {celtics.slice(0, 5).map(p => (
                        <option key={p.name} value={p.name}>#{p.number} {p.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Lakers">
                      {lakers.slice(0, 5).map(p => (
                        <option key={p.name} value={p.name}>#{p.number} {p.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Single Player Demo */}
          {demoMode === 'player' && (
            <div>
              <div className="h-[400px] bg-[#C4A26E]/20 rounded-lg relative">
                <PlayerSprite
                  team={playerTeam}
                  number={playerNumber}
                  pose={playerPose}
                  isActive={isActive}
                  hasBall={hasBall}
                  position={{ x: 50, y: 50 }}
                  facing={facing}
                  isVillain={isVillain}
                />
              </div>

              {/* Player Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Team</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPlayerTeam('celtics')}
                      className={`flex-1 py-2 rounded text-sm ${
                        playerTeam === 'celtics'
                          ? 'bg-[#007A33] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Celtics
                    </button>
                    <button
                      onClick={() => setPlayerTeam('lakers')}
                      className={`flex-1 py-2 rounded text-sm ${
                        playerTeam === 'lakers'
                          ? 'bg-[#552583] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Lakers
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Number</label>
                  <input
                    type="number"
                    value={playerNumber}
                    onChange={(e) => setPlayerNumber(Number(e.target.value))}
                    className="w-full bg-white/10 text-white p-2 rounded"
                    min="0"
                    max="99"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Pose</label>
                  <select
                    value={playerPose}
                    onChange={(e) => setPlayerPose(e.target.value)}
                    className="w-full bg-white/10 text-white p-2 rounded text-sm"
                  >
                    <option value="standing">Standing</option>
                    <option value="running">Running</option>
                    <option value="shooting">Shooting</option>
                    <option value="defending">Defending</option>
                    <option value="ball">With Ball</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Facing</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFacing('left')}
                      className={`flex-1 py-2 rounded text-sm ${
                        facing === 'left'
                          ? 'bg-[#007A33] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => setFacing('right')}
                      className={`flex-1 py-2 rounded text-sm ${
                        facing === 'right'
                          ? 'bg-[#007A33] text-white'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      Right
                    </button>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-4 flex gap-4">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Active (glow effect)
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBall}
                      onChange={(e) => setHasBall(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Has Ball
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVillain}
                      onChange={(e) => setIsVillain(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Villain (red glow)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Ball Demo */}
          {demoMode === 'ball' && (
            <div>
              <div className="h-[400px] bg-[#C4A26E]/20 rounded-lg relative">
                <BallSprite
                  position={ballPosition}
                  isInAir={ballState === 'shooting' || ballState === 'passing'}
                  state={ballState}
                />
              </div>

              {/* Ball Controls */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <label className="block text-white/60 text-sm mb-2">State</label>
                  <select
                    value={ballState}
                    onChange={(e) => setBallState(e.target.value)}
                    className="w-full bg-white/10 text-white p-2 rounded"
                  >
                    <option value="held">Held</option>
                    <option value="dribbling">Dribbling</option>
                    <option value="shooting">Shooting</option>
                    <option value="passing">Passing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">X Position (%)</label>
                  <input
                    type="range"
                    value={ballPosition.x}
                    onChange={(e) => setBallPosition({ ...ballPosition, x: Number(e.target.value) })}
                    className="w-full"
                    min="0"
                    max="100"
                  />
                  <div className="text-white/40 text-xs text-center">{ballPosition.x}%</div>
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-2">Y Position (%)</label>
                  <input
                    type="range"
                    value={ballPosition.y}
                    onChange={(e) => setBallPosition({ ...ballPosition, y: Number(e.target.value) })}
                    className="w-full"
                    min="0"
                    max="100"
                  />
                  <div className="text-white/40 text-xs text-center">{ballPosition.y}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Component Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-[#007A33] font-['Oswald'] text-xl mb-3">PlayerSprite</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>✓ 5 realistic poses</li>
              <li>✓ Team color fills</li>
              <li>✓ Jersey numbers</li>
              <li>✓ Active/villain glows</li>
              <li>✓ Responsive sizing</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-[#FDB927] font-['Oswald'] text-xl mb-3">BallSprite</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>✓ 4 animation states</li>
              <li>✓ Realistic texture</li>
              <li>✓ 3D gradient effect</li>
              <li>✓ Motion trails</li>
              <li>✓ Arc physics</li>
            </ul>
          </div>

          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-[#552583] font-['Oswald'] text-xl mb-3">CourtPlayers</h3>
            <ul className="text-white/60 text-sm space-y-2">
              <li>✓ 10 players managed</li>
              <li>✓ 4 play formations</li>
              <li>✓ Smart positioning</li>
              <li>✓ Possession switching</li>
              <li>✓ Phase animations</li>
            </ul>
          </div>
        </div>

        {/* Code Example */}
        <div className="mt-8 bg-black/50 rounded-lg p-6 border border-white/10">
          <h3 className="text-white font-['Oswald'] text-xl mb-4">Usage Example</h3>
          <pre className="text-[#00FF44] text-sm overflow-x-auto">
            <code>{`import CourtPlayers from './components/game/CourtPlayers'
import { celtics, lakers } from './data/players'

<Court possession="celtics">
  <CourtPlayers
    possession="celtics"
    celticsPlayers={celtics.slice(0, 5)}
    lakersPlayers={lakers.slice(0, 5)}
    activePlayer={celtics[0]}
    playType="pick-roll"
    phase="playing"
    onPlayComplete={() => console.log('Done!')}
  />
</Court>`}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
