import { useState } from 'react'
import PlayCallOffense from './PlayCallOffense'
import { getRandomQuestion } from '../../data/questions'
import { celtics } from '../../data/players'

/**
 * PlayCallOffense Example
 *
 * Shows how to use the PlayCallOffense component (two-phase gameplay)
 */
export default function PlayCallOffenseExample() {
  const [showOffense, setShowOffense] = useState(false)
  const [score, setScore] = useState(0)
  const [playLog, setPlayLog] = useState([])
  const [usedQuestions, setUsedQuestions] = useState([])

  const handleStartOffense = () => {
    setShowOffense(true)
  }

  const handleOffenseComplete = (isCorrect, playType, questionIndex) => {
    console.log('Offense completed:', { isCorrect, playType, questionIndex })

    const points = isCorrect ? 2 : 0
    setScore(prev => prev + points)

    setPlayLog(prev => [
      {
        play: playType,
        result: isCorrect ? 'SCORE' : 'MISS',
        points,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev.slice(0, 4) // Keep last 5 plays
    ])

    setUsedQuestions(prev => [...prev, questionIndex])
    setShowOffense(false)
  }

  const { question, index } = getRandomQuestion(usedQuestions)
  const player = celtics[1] // Jaylen Brown

  return (
    <div className="min-h-screen bg-[#0A1612] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="font-['Oswald'] text-5xl font-bold text-white mb-4">
          PlayCallOffense Example
        </h1>
        <p className="text-white/70 text-lg mb-6">
          Two-phase offense: Choose a play, then answer trivia
        </p>

        <div className="bg-white/10 rounded-xl p-6 inline-block mb-8">
          <div className="text-[#BA9653] text-6xl font-bold font-['Oswald']">
            {score}
          </div>
          <div className="text-white/60 text-sm uppercase tracking-wide">
            Points
          </div>
        </div>

        <button
          onClick={handleStartOffense}
          disabled={showOffense}
          className="px-8 py-4 bg-[#007A33] hover:bg-[#005A25] text-white font-['Oswald'] text-xl font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,122,51,0.4)]"
        >
          {showOffense ? 'Play Active...' : 'Call a Play'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white/5 rounded-xl p-6">
          <h2 className="text-white font-['Oswald'] text-xl mb-3">How It Works:</h2>
          <ul className="text-white/70 space-y-2 text-sm">
            <li>• <strong>Phase 1:</strong> Select a play (5 seconds)</li>
            <li>• <strong>Pick & Roll:</strong> Balanced (75% success)</li>
            <li>• <strong>Isolation:</strong> Hard (60% success)</li>
            <li>• <strong>Fast Break:</strong> Easy (85% success)</li>
            <li>• <strong>Phase 2:</strong> Answer trivia (10 seconds)</li>
            <li>• Correct answer = 2 points</li>
          </ul>
        </div>

        <div className="bg-white/5 rounded-xl p-6">
          <h2 className="text-white font-['Oswald'] text-xl mb-3">Play Log:</h2>
          {playLog.length === 0 ? (
            <p className="text-white/50 text-sm">No plays yet</p>
          ) : (
            <div className="space-y-2">
              {playLog.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <div className="text-white font-medium text-sm uppercase">
                      {log.play.replace('-', ' ')}
                    </div>
                    <div className="text-white/40 text-xs">{log.timestamp}</div>
                  </div>
                  <div className={`font-['Oswald'] text-lg font-bold ${
                    log.result === 'SCORE' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {log.result}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showOffense && (
        <PlayCallOffense
          question={{ ...question, index }}
          player={player}
          onComplete={handleOffenseComplete}
        />
      )}
    </div>
  )
}
