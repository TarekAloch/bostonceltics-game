import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const generateCommentary = (lastPlay) => {
  if (!lastPlay) return null

  const { type, team, player, points, action, contested } = lastPlay

  // Celtics commentary (exciting, supportive)
  if (team === 'celtics') {
    if (type === 'made') {
      const threePointers = [
        `${player?.toUpperCase()} FOR THREE! BANG!`,
        `${player?.toUpperCase()} FROM DOWNTOWN! YES!`,
        `THREE-POINTER! ${player?.toUpperCase()} IS ON FIRE!`,
        `SPLASH! ${player?.toUpperCase()} NAILS IT!`,
      ]
      const twos = [
        `${player?.toUpperCase()} SCORES!`,
        `BUCKET! ${player?.toUpperCase()} MAKES IT LOOK EASY!`,
        `${player?.toUpperCase()} WITH THE BEAUTIFUL SHOT!`,
        `MONEY! ${player?.toUpperCase()} CAN'T MISS!`,
      ]
      return points === 3
        ? threePointers[Math.floor(Math.random() * threePointers.length)]
        : twos[Math.floor(Math.random() * twos.length)]
    }
    if (type === 'missed') {
      return [
        `${player?.toUpperCase()} can't connect...`,
        `The shot rims out...`,
        `Just misses! So close!`,
        `Off the iron...`,
      ][Math.floor(Math.random() * 4)]
    }
    if (type === 'steal') {
      return `TURNOVER! CELTICS BALL!`
    }
  }

  // Lakers commentary (dismissive, with boos implied)
  if (team === 'lakers') {
    if (type === 'made') {
      return [
        `${player} scores... [crowd boos]`,
        `Lakers get two... the crowd lets them hear it`,
        `${player} with the bucket... fans not happy`,
        `LA scores... BOOOO!`,
      ][Math.floor(Math.random() * 4)]
    }
    if (type === 'missed') {
      return [
        `${player?.toUpperCase()} MISSES! THE CROWD LOVES IT!`,
        `BRICK! TD GARDEN GOES WILD!`,
        `NO GOOD! GET THAT OUTTA HERE!`,
        `REJECTED BY THE RIM!`,
      ][Math.floor(Math.random() * 4)]
    }
    if (type === 'blocked') {
      return [
        `BLOCKED! GET THAT WEAK STUFF OUT!`,
        `DENIED! NOT IN TD GARDEN!`,
        `SWATTED! THE CROWD ERUPTS!`,
        `REJECTED! CELTICS DEFENSE!`,
      ][Math.floor(Math.random() * 4)]
    }
  }

  // Game events
  if (type === 'shot-clock') {
    return team === 'celtics'
      ? 'Shot clock violation on Boston...'
      : 'SHOT CLOCK! LAKERS TURNOVER!'
  }

  if (type === 'game-end') {
    return lastPlay.winner === 'celtics'
      ? '🏆 CELTICS WIN! TD GARDEN IS ROCKING!'
      : 'Final buzzer... Lakers escape with the win'
  }

  return null
}

export default function Commentary({ lastPlay }) {
  const [text, setText] = useState(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!lastPlay) return

    const commentary = generateCommentary(lastPlay)
    if (commentary) {
      setText(commentary)
      setKey(prev => prev + 1)
    }
  }, [lastPlay])

  return (
    <div className="h-16 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {text && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`px-6 py-2 rounded-full backdrop-blur-sm ${
              lastPlay?.team === 'celtics'
                ? lastPlay?.type === 'made'
                  ? 'bg-[#007A33]/80 text-white'
                  : 'bg-white/10 text-white/80'
                : lastPlay?.type === 'made'
                ? 'bg-[#552583]/60 text-white/80'
                : 'bg-[#007A33]/60 text-white'
            }`}
          >
            <p className="font-['Oswald'] text-sm md:text-base tracking-wider text-center">
              {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
