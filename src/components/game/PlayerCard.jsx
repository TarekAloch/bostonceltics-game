import { motion } from 'framer-motion'

export default function PlayerCard({ player, team, isActive }) {
  const isCeltics = team === 'celtics'
  const isVillain = !isCeltics && player?.villain

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative ${isActive ? 'z-10' : ''}`}
    >
      <div
        className={`relative px-4 py-3 rounded-xl backdrop-blur-sm ${
          isCeltics
            ? 'bg-gradient-to-br from-[#007A33]/90 to-[#005a25]/90 border border-[#00a344]/30'
            : 'bg-gradient-to-br from-[#552583]/90 to-[#3d1a5f]/90 border border-[#552583]/30'
        } ${isActive ? 'shadow-lg' : ''}`}
        style={{
          boxShadow: isActive
            ? isCeltics
              ? '0 0 30px rgba(0,122,51,0.5), 0 0 60px rgba(0,122,51,0.2)'
              : '0 0 30px rgba(85,37,131,0.5), 0 0 60px rgba(253,185,39,0.2)'
            : 'none',
        }}
      >
        {/* Villain effect for Lakers stars */}
        {isVillain && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-t from-red-900/20 to-transparent"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Player info */}
        <div className="flex items-center gap-3">
          {/* Jersey number */}
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-['Oswald'] text-2xl font-bold ${
              isCeltics
                ? 'bg-white/10 text-white'
                : 'bg-[#FDB927]/20 text-[#FDB927]'
            }`}
          >
            #{player?.number || '00'}
          </div>

          {/* Name and position */}
          <div className="flex-1 min-w-0">
            <p className={`font-['Oswald'] text-lg font-semibold truncate ${
              isCeltics ? 'text-white' : 'text-white'
            }`}>
              {player?.name || 'Unknown'}
            </p>
            <p className={`text-sm ${
              isCeltics ? 'text-[#BA9653]' : 'text-[#FDB927]/70'
            }`}>
              {player?.position || 'POS'} • {player?.rating || 0} OVR
            </p>
          </div>

          {/* Team indicator */}
          <div className="text-2xl">
            {isCeltics ? '☘️' : '🏀'}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${
              isCeltics ? 'bg-[#007A33]' : 'bg-[#FDB927]'
            }`}
            animate={{ scaleX: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  )
}
