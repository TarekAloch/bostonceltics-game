import { useState } from 'react'
import TriviaOffense from './TriviaOffense'
import { getRandomQuestion } from '../../data/questions'
import { celtics } from '../../data/players'

/**
 * TriviaOffense Example
 *
 * Shows how to use the TriviaOffense component in a game flow
 */
export default function TriviaOffenseExample() {
  const [showTrivia, setShowTrivia] = useState(false)
  const [score, setScore] = useState(0)
  const [usedQuestions, setUsedQuestions] = useState([])

  const handleStartTrivia = () => {
    setShowTrivia(true)
  }

  const handleTriviaComplete = (isCorrect, questionIndex) => {
    console.log('Trivia completed:', { isCorrect, questionIndex })

    if (isCorrect) {
      setScore(prev => prev + 2) // 2 points for correct answer
    }

    setUsedQuestions(prev => [...prev, questionIndex])
    setShowTrivia(false)
  }

  const { question, index } = getRandomQuestion(usedQuestions)
  const player = celtics[0] // Jayson Tatum

  return (
    <div className="min-h-screen bg-[#0A1612] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="font-['Oswald'] text-5xl font-bold text-white mb-4">
          TriviaOffense Example
        </h1>
        <p className="text-white/70 text-lg mb-6">
          Pure trivia mode - answer correctly to score
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
          onClick={handleStartTrivia}
          disabled={showTrivia}
          className="px-8 py-4 bg-[#007A33] hover:bg-[#005A25] text-white font-['Oswald'] text-xl font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(0,122,51,0.4)]"
        >
          {showTrivia ? 'Question Active...' : 'Start Offense'}
        </button>
      </div>

      <div className="bg-white/5 rounded-xl p-6 max-w-2xl">
        <h2 className="text-white font-['Oswald'] text-xl mb-3">How It Works:</h2>
        <ul className="text-white/70 space-y-2 text-sm">
          <li>• Click "Start Offense" to begin</li>
          <li>• Answer the trivia question within 10 seconds</li>
          <li>• Correct answer = 2 points (and shot boost in actual game)</li>
          <li>• Wrong answer or timeout = 0 points</li>
          <li>• Use keyboard (1-4) or click to answer</li>
        </ul>
      </div>

      {showTrivia && (
        <TriviaOffense
          question={{ ...question, index }}
          player={player}
          onComplete={handleTriviaComplete}
        />
      )}
    </div>
  )
}
