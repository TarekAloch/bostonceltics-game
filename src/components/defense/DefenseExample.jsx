import { useState } from 'react'
import DefenseChoice from './DefenseChoice'
import DefensePredict from './DefensePredict'
import { lakers } from '../../data/players'

/**
 * DefenseExample - Demo component showing how to use both defense components
 *
 * Usage in game flow:
 * 1. Randomly decide which defense mechanic to use
 * 2. Get random Lakers player
 * 3. Determine Lakers action
 * 4. Show appropriate defense component
 * 5. Handle result and update game state
 */
export default function DefenseExample() {
  const [activeDefense, setActiveDefense] = useState(null)
  const [log, setLog] = useState([])

  // Get random Lakers player
  const getRandomLaker = () => {
    return lakers[Math.floor(Math.random() * lakers.length)]
  }

  // Get random Lakers action
  const getRandomAction = () => {
    const actions = ['three-point', 'mid-range', 'drive']
    return actions[Math.floor(Math.random() * actions.length)]
  }

  // Handle defense result
  const handleDefenseComplete = (type, choice, result, wasCorrect = null) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = {
      timestamp,
      type,
      choice,
      result,
      wasCorrect,
    }

    setLog((prev) => [logEntry, ...prev])
    setActiveDefense(null)

    console.log('Defense Complete:', logEntry)
  }

  // Start DefenseChoice
  const startChoiceDefense = () => {
    setActiveDefense({
      type: 'choice',
      lakersPlayer: getRandomLaker(),
      lakersAction: getRandomAction(),
    })
  }

  // Start DefensePredict
  const startPredictDefense = () => {
    setActiveDefense({
      type: 'predict',
      lakersPlayer: getRandomLaker(),
      actualPlay: getRandomAction(),
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007A33] to-[#005a25] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-['Oswald'] font-bold text-white mb-4">
            Defense Components Demo
          </h1>
          <p className="text-white/80 text-lg">
            Test the two defense mechanics replacing RapidTap QTE
          </p>
        </div>

        {/* Control buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={startChoiceDefense}
            disabled={activeDefense !== null}
            className="px-6 py-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-['Oswald'] text-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test DefenseChoice
          </button>

          <button
            onClick={startPredictDefense}
            disabled={activeDefense !== null}
            className="px-6 py-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white font-['Oswald'] text-xl font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test DefensePredict
          </button>
        </div>

        {/* Event log */}
        <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-['Oswald'] font-bold text-white mb-4">
            Event Log
          </h2>

          {log.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              No events yet. Click a button above to test defense mechanics.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {log.map((entry, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-lg p-4 border border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[#FDB927] font-['Oswald'] font-bold">
                      {entry.type === 'choice' ? 'DEFENSE CHOICE' : 'DEFENSE PREDICT'}
                    </span>
                    <span className="text-white/60 text-sm">{entry.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-white/60">Choice:</span>{' '}
                      <span className="text-white font-semibold">{entry.choice}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Result:</span>{' '}
                      <span
                        className={`font-semibold ${
                          ['miss', 'block', 'steal'].includes(entry.result)
                            ? 'text-green-400'
                            : entry.result === 'foul'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {entry.result}
                      </span>
                    </div>
                    {entry.wasCorrect !== null && (
                      <div className="col-span-2">
                        <span className="text-white/60">Prediction:</span>{' '}
                        <span
                          className={`font-semibold ${
                            entry.wasCorrect ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {entry.wasCorrect ? 'CORRECT' : 'WRONG'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage instructions */}
        <div className="mt-8 bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
          <h2 className="text-2xl font-['Oswald'] font-bold text-white mb-4">
            Integration Guide
          </h2>
          <div className="text-white/80 space-y-2 text-sm font-mono">
            <p>// Import components</p>
            <p className="text-green-400">
              import {'{ DefenseChoice, DefensePredict }'} from './components/defense'
            </p>
            <p className="mt-4">// In your game logic:</p>
            <p className="text-blue-400">const defenseType = Math.random() {'>'} 0.5 ? 'choice' : 'predict'</p>
            <p className="text-blue-400">const lakersPlayer = getRandomPlayer('lakers')</p>
            <p className="text-blue-400">const action = getRandomAction()</p>
            <p className="mt-4">// Render based on type:</p>
            <p className="text-purple-400">
              {'{defenseType === "choice" ? ('}
            </p>
            <p className="text-purple-400 ml-4">
              {'<DefenseChoice ... />'}
            </p>
            <p className="text-purple-400">
              {') : ('}
            </p>
            <p className="text-purple-400 ml-4">
              {'<DefensePredict ... />'}
            </p>
            <p className="text-purple-400">
              {')'}
            </p>
          </div>
        </div>
      </div>

      {/* Render active defense component */}
      {activeDefense?.type === 'choice' && (
        <DefenseChoice
          lakersPlayer={activeDefense.lakersPlayer}
          lakersAction={activeDefense.lakersAction}
          onComplete={(choice, result) =>
            handleDefenseComplete('choice', choice, result)
          }
        />
      )}

      {activeDefense?.type === 'predict' && (
        <DefensePredict
          lakersPlayer={activeDefense.lakersPlayer}
          actualPlay={activeDefense.actualPlay}
          onComplete={(prediction, wasCorrect, result) =>
            handleDefenseComplete('predict', prediction, result, wasCorrect)
          }
        />
      )}
    </div>
  )
}
