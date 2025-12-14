import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * BallSprite - Animated basketball that moves between players
 *
 * @param {Object} props
 * @param {Object} props.position - {x, y} position percentage on court
 * @param {boolean} props.isInAir - Ball in flight (shooting/passing)
 * @param {string} props.state - 'dribbling' | 'shooting' | 'passing' | 'held'
 * @param {Object} props.targetPosition - Where ball is moving to
 * @param {Function} props.onAnimationComplete - Callback when animation finishes
 */
export default function BallSprite({
  position = { x: 50, y: 50 },
  isInAir = false,
  state = 'held',
  targetPosition = null,
  onAnimationComplete = () => {},
}) {
  const [currentPos, setCurrentPos] = useState(position)

  // Update position when target changes
  useEffect(() => {
    if (targetPosition) {
      setCurrentPos(targetPosition)
    } else {
      setCurrentPos(position)
    }
  }, [position, targetPosition])

  // Animation variants based on state
  const variants = {
    held: {
      scale: 1,
      rotate: 0,
      y: 0,
    },
    dribbling: {
      y: [0, -15, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    shooting: {
      scale: [1, 0.8, 0.6],
      rotate: [0, 720],
      y: [0, -100, -150],
      transition: {
        duration: 1.2,
        ease: [0.43, 0.13, 0.23, 0.96], // Custom ease for arc
      },
    },
    passing: {
      scale: [1, 1.2, 1],
      rotate: [0, 360],
      transition: {
        duration: 0.4,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <motion.div
      className="absolute pointer-events-none z-20"
      initial={false}
      animate={{
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
      }}
      transition={{
        type: isInAir ? 'spring' : 'tween',
        duration: isInAir ? 0.8 : 0.3,
        ease: isInAir ? [0.43, 0.13, 0.23, 0.96] : 'easeInOut',
      }}
      onAnimationComplete={onAnimationComplete}
      style={{
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        variants={variants}
        animate={state}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-4 h-4 md:w-6 md:h-6"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          }}
        >
          {/* Basketball sphere with gradient */}
          <defs>
            <radialGradient id="ballGradient" cx="35%" cy="35%">
              <stop offset="0%" stopColor="#FF8C42" />
              <stop offset="50%" stopColor="#FF6B35" />
              <stop offset="100%" stopColor="#C84C28" />
            </radialGradient>

            {/* Shadow for 3D effect */}
            <radialGradient id="ballShadow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="80%" stopColor="#000" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* Main basketball circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#ballGradient)"
          />

          {/* Basketball seam lines */}
          <g stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round">
            {/* Vertical curves */}
            <path d="M50,5 Q65,25 65,50 T50,95" />
            <path d="M50,5 Q35,25 35,50 T50,95" />

            {/* Horizontal curves */}
            <path d="M5,50 Q25,35 50,35 T95,50" />
            <path d="M5,50 Q25,65 50,65 T95,50" />
          </g>

          {/* Highlight for shine */}
          <circle
            cx="35"
            cy="35"
            r="12"
            fill="white"
            opacity="0.3"
          />

          {/* Shadow overlay */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#ballShadow)"
          />
        </svg>
      </motion.div>

      {/* Motion trail when in air */}
      {isInAir && (
        <motion.div
          className="absolute inset-0 -m-2"
          animate={{
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        >
          <div className="w-full h-full rounded-full bg-orange-500/20 blur-sm" />
        </motion.div>
      )}
    </motion.div>
  )
}

BallSprite.displayName = 'BallSprite'
