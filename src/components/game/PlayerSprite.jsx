import { motion } from 'framer-motion'
import { useMemo } from 'react'

// Team colors
const TEAM_COLORS = {
  celtics: {
    body: '#007A33',
    trim: '#BA9653',
    glow: 'rgba(0,122,51,0.6)',
  },
  lakers: {
    body: '#552583',
    trim: '#FDB927',
    glow: 'rgba(85,37,131,0.6)',
  },
}

// Realistic basketball player silhouette paths for different poses
const POSES = {
  standing: {
    // Athletic stance, feet shoulder-width, knees slightly bent
    body: 'M50,20 C45,20 40,25 40,30 L40,40 C35,42 30,45 30,50 L30,80 C30,82 28,85 25,90 L25,120 C25,122 27,125 30,125 L35,125 L35,190 C35,195 38,200 42,200 L48,200 C50,200 52,198 52,196 L52,125 L48,125 L48,190 C48,192 47,193 45,193 L42,193 C40,193 38,191 38,189 L38,125 L42,125 L42,80 L45,50 C45,48 47,46 50,45 L50,40 C50,38 52,36 55,35 L55,50 L58,80 L58,125 L62,125 L62,189 C62,191 60,193 58,193 L55,193 C53,193 52,192 52,190 L52,125 L48,125 L48,196 C48,198 50,200 52,200 L58,200 C62,200 65,195 65,190 L65,125 L70,125 C73,125 75,122 75,120 L75,90 C72,85 70,82 70,80 L70,50 C70,45 65,42 60,40 L60,30 C60,25 55,20 50,20 Z',
    head: 'M50,5 C55,5 60,10 60,15 C60,20 55,25 50,25 C45,25 40,20 40,15 C40,10 45,5 50,5 Z',
  },
  running: {
    // Running motion, one leg forward, arms pumping
    body: 'M50,20 C45,20 40,25 40,30 L40,40 C35,42 32,45 32,50 L35,75 L30,95 L25,130 C24,135 20,140 15,145 C13,147 13,150 15,152 C17,154 20,154 22,152 L35,140 L42,115 L45,85 L48,75 L50,80 L52,115 L50,145 L48,185 C48,190 50,195 54,198 C56,199 58,199 60,197 C62,195 62,192 60,190 L58,150 L60,120 L65,85 L68,75 L68,50 C68,45 65,42 60,40 L60,30 C60,25 55,20 50,20 Z M25,155 L20,190 C19,195 22,200 27,200 L32,200 C35,200 37,198 37,195 L38,165 L32,150 Z',
    head: 'M52,5 C57,5 62,10 62,15 C62,20 57,25 52,25 C47,25 42,20 42,15 C42,10 47,5 52,5 Z',
  },
  shooting: {
    // Jump shot, arms extended upward, body elevated
    body: 'M50,15 C45,15 40,20 40,25 L40,35 C38,37 35,40 35,45 L38,65 L40,75 C40,77 38,78 35,80 C33,82 32,85 35,87 L40,90 L42,100 L40,130 L38,160 C38,165 40,170 45,172 C47,173 50,173 52,171 C54,169 54,166 52,164 L48,135 L50,105 L52,75 C52,73 54,72 57,70 C59,68 60,65 57,63 L52,60 L50,50 L52,45 C52,42 55,40 58,38 L58,50 L60,80 L62,110 L65,135 C66,140 70,143 75,143 C77,143 79,141 79,139 C79,137 78,135 76,134 L70,110 L68,80 L65,50 L65,40 C65,38 67,37 70,35 L70,25 C70,20 65,15 60,15 L50,15 Z',
    head: 'M50,0 C55,0 60,5 60,10 C60,15 55,20 50,20 C45,20 40,15 40,10 C40,5 45,0 50,0 Z',
  },
  defending: {
    // Wide defensive stance, arms spread
    body: 'M50,20 C45,20 40,25 40,30 L40,40 C35,42 25,45 20,50 C18,52 17,55 20,57 L30,62 L35,75 L38,90 L40,110 L40,140 L38,175 C38,180 40,185 45,187 C47,188 50,188 52,186 C54,184 54,181 52,179 L50,145 L52,115 L54,90 L58,75 L58,62 L62,57 L72,52 C75,50 75,47 72,45 C67,42 60,40 55,38 L55,30 C55,25 50,20 50,20 Z M60,55 L70,50 C73,48 75,50 75,53 L73,58 L65,62 Z M40,55 L30,50 C27,48 25,50 25,53 L27,58 L35,62 Z',
    head: 'M50,5 C55,5 60,10 60,15 C60,20 55,25 50,25 C45,25 40,20 40,15 C40,10 45,5 50,5 Z',
  },
  ball: {
    // Dribbling/holding ball stance
    body: 'M50,20 C45,20 40,25 40,30 L40,40 C35,42 30,45 30,50 L32,75 L35,85 L35,95 C33,96 30,98 30,101 C30,104 33,106 35,106 L38,106 L40,120 L40,145 L38,180 C38,185 40,190 45,192 C47,193 50,193 52,191 C54,189 54,186 52,184 L50,150 L52,120 L55,106 L60,106 C63,106 65,104 65,101 C65,98 62,96 60,95 L60,85 L63,75 L65,50 C65,45 60,42 55,40 L55,30 C55,25 50,20 50,20 Z',
    head: 'M50,5 C55,5 60,10 60,15 C60,20 55,25 50,25 C45,25 40,20 40,15 C40,10 45,5 50,5 Z',
  },
}

/**
 * PlayerSprite - Realistic basketball player silhouette
 *
 * @param {Object} props
 * @param {string} props.team - 'celtics' | 'lakers'
 * @param {number} props.number - Jersey number
 * @param {string} props.pose - 'standing' | 'running' | 'shooting' | 'defending' | 'ball'
 * @param {boolean} props.isActive - Highlights player with glow
 * @param {boolean} props.hasBall - Shows ball near player
 * @param {Object} props.position - {x, y} position percentage on court
 * @param {string} props.facing - 'left' | 'right'
 * @param {boolean} props.isVillain - Red glow for LeBron/AD
 * @param {string} props.className - Additional CSS classes
 */
export default function PlayerSprite({
  team = 'celtics',
  number = 0,
  pose = 'standing',
  isActive = false,
  hasBall = false,
  position = { x: 50, y: 50 },
  facing = 'right',
  isVillain = false,
  className = '',
}) {
  // Validate team and pose
  const colors = TEAM_COLORS[team] || TEAM_COLORS.celtics
  const poseData = POSES[pose] || POSES.standing

  if (!TEAM_COLORS[team]) {
    console.warn(`[PlayerSprite] Invalid team: ${team}, defaulting to celtics`)
  }

  if (!POSES[pose]) {
    console.warn(`[PlayerSprite] Invalid pose: ${pose}, defaulting to standing`)
  }

  // Animation variants
  const variants = useMemo(() => ({
    idle: {
      y: [0, -3, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    running: {
      y: [0, -5, 0, -5, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'linear',
      },
    },
    shooting: {
      y: [0, -15, -10],
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    active: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
      },
    },
  }), [])

  // Glow color based on state
  const glowColor = isVillain && team === 'lakers'
    ? 'rgba(220,38,38,0.8)' // Red for villains
    : isActive
    ? colors.glow
    : 'transparent'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...(pose === 'standing' && variants.idle),
        ...(pose === 'running' && variants.running),
        ...(pose === 'shooting' && variants.shooting),
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      className={`player-sprite ${className}`}
    >
      {/* Active/Villain glow */}
      {(isActive || isVillain) && (
        <motion.div
          className="absolute inset-0 -m-4 rounded-full blur-xl pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
          }}
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* Player silhouette SVG */}
      <motion.svg
        viewBox="0 0 100 200"
        className="w-12 h-24 md:w-16 md:h-32 drop-shadow-lg"
        style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          filter: isActive ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
        }}
        animate={isActive ? variants.active : {}}
      >
        {/* Body silhouette */}
        <path
          d={poseData.body}
          fill={colors.body}
          stroke={colors.trim}
          strokeWidth="1"
        />

        {/* Head */}
        <path
          d={poseData.head}
          fill={colors.body}
          stroke={colors.trim}
          strokeWidth="1"
        />

        {/* Jersey number */}
        <text
          x="50"
          y="65"
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fontFamily="'Oswald', sans-serif"
          fill={colors.trim}
          stroke={colors.body}
          strokeWidth="1"
        >
          {number}
        </text>
      </motion.svg>

      {/* Basketball (when hasBall is true) */}
      {hasBall && (
        <motion.div
          className="absolute"
          style={{
            left: facing === 'right' ? '60%' : '40%',
            top: pose === 'shooting' ? '30%' : '60%',
          }}
          animate={{
            y: pose === 'ball' ? [0, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: pose === 'ball' ? Infinity : 0,
          }}
        >
          <svg viewBox="0 0 30 30" className="w-4 h-4 md:w-5 md:h-5">
            {/* Basketball circle */}
            <circle cx="15" cy="15" r="14" fill="#FF6B35" stroke="#000" strokeWidth="1" />
            {/* Basketball lines */}
            <path d="M15,1 Q20,15 15,29" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M15,1 Q10,15 15,29" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M1,15 Q15,10 29,15" fill="none" stroke="#000" strokeWidth="1" />
            <path d="M1,15 Q15,20 29,15" fill="none" stroke="#000" strokeWidth="1" />
          </svg>
        </motion.div>
      )}

      {/* Debug label (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50 whitespace-nowrap">
          #{number}
        </div>
      )}
    </motion.div>
  )
}

// PropTypes for validation (optional but recommended)
PlayerSprite.displayName = 'PlayerSprite'
