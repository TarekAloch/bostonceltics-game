import { motion } from 'framer-motion'

/**
 * HalftimeScreen - Display stats comparison at halftime
 *
 * Shows score, key stats comparison, and continue button
 *
 * @param {Object} state - Game state with score and stats
 * @param {Function} onContinue - Handler to start 2nd half
 *
 * Usage:
 * <HalftimeScreen state={gameState} onContinue={() => startSecondHalf()} />
 */
export default function HalftimeScreen({ state, onContinue }) {
  const { score, stats } = state

  // Calculate shooting percentages
  const celticsStats = stats?.celtics || {}
  const lakersStats = stats?.lakers || {}

  const celticsFGP = celticsStats.fga > 0
    ? ((celticsStats.fg / celticsStats.fga) * 100).toFixed(1)
    : '0.0'

  const lakersFGP = lakersStats.fga > 0
    ? ((lakersStats.fg / lakersStats.fga) * 100).toFixed(1)
    : '0.0'

  const celtics3PP = celticsStats.threesA > 0
    ? ((celticsStats.threes / celticsStats.threesA) * 100).toFixed(1)
    : '0.0'

  const lakers3PP = lakersStats.threesA > 0
    ? ((lakersStats.threes / lakersStats.threesA) * 100).toFixed(1)
    : '0.0'

  const statsRows = [
    {
      label: 'Field Goal %',
      celtics: `${celticsFGP}%`,
      celticsRaw: parseFloat(celticsFGP),
      lakers: `${lakersFGP}%`,
      lakersRaw: parseFloat(lakersFGP),
    },
    {
      label: '3-Point %',
      celtics: `${celtics3PP}%`,
      celticsRaw: parseFloat(celtics3PP),
      lakers: `${lakers3PP}%`,
      lakersRaw: parseFloat(lakers3PP),
    },
    {
      label: 'Steals',
      celtics: celticsStats.steals || 0,
      celticsRaw: celticsStats.steals || 0,
      lakers: lakersStats.steals || 0,
      lakersRaw: lakersStats.steals || 0,
    },
    {
      label: 'Blocks',
      celtics: celticsStats.blocks || 0,
      celticsRaw: celticsStats.blocks || 0,
      lakers: lakersStats.blocks || 0,
      lakersRaw: lakersStats.blocks || 0,
    },
  ]

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#0A1612] via-[#0d1a15] to-[#0A1612] overflow-hidden flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #007A33 0px,
              #007A33 2px,
              transparent 2px,
              transparent 10px
            )`,
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl mx-auto px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-['Oswald'] text-6xl md:text-8xl font-bold text-[#BA9653] tracking-wider mb-2 drop-shadow-[0_0_30px_rgba(186,150,83,0.5)]">
            HALFTIME
          </h1>
          <p className="text-white/60 text-lg font-['Oswald'] tracking-widest">
            TD GARDEN • BOSTON, MA
          </p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center items-center gap-8 mb-12"
        >
          {/* Celtics Score */}
          <div className="flex items-center gap-4">
            <span className="text-5xl">☘️</span>
            <div className="text-right">
              <p className="text-[#007A33] font-['Oswald'] text-lg tracking-wider">CELTICS</p>
              <p className="font-['Oswald'] text-6xl font-bold text-white tabular-nums">
                {score?.celtics || 0}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-20 bg-white/20" />

          {/* Lakers Score */}
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-[#552583] font-['Oswald'] text-lg tracking-wider">LAKERS</p>
              <p className="font-['Oswald'] text-6xl font-bold text-white tabular-nums">
                {score?.lakers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#552583] to-[#FDB927] flex items-center justify-center text-xl font-bold text-white">
              LA
            </div>
          </div>
        </motion.div>

        {/* Stats Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden shadow-2xl mb-8"
        >
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-white/10 bg-white/5">
            <div className="col-span-2 text-right">
              <p className="text-[#007A33] font-['Oswald'] text-sm tracking-wider">CELTICS</p>
            </div>
            <div className="col-span-3 text-center">
              <p className="text-[#BA9653] font-['Oswald'] text-sm tracking-wider">STAT</p>
            </div>
            <div className="col-span-2 text-left">
              <p className="text-[#552583] font-['Oswald'] text-sm tracking-wider">LAKERS</p>
            </div>
          </div>

          {/* Stats Rows */}
          {statsRows.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
              className="grid grid-cols-7 gap-4 p-4 border-b border-white/5 last:border-none hover:bg-white/5 transition-colors"
            >
              {/* Celtics value */}
              <div className="col-span-2 text-right">
                <p
                  className={`font-['Oswald'] text-2xl font-bold tabular-nums ${
                    stat.celticsRaw > stat.lakersRaw
                      ? 'text-[#007A33]'
                      : stat.celticsRaw === stat.lakersRaw
                      ? 'text-white/70'
                      : 'text-white/40'
                  }`}
                >
                  {stat.celtics}
                </p>
              </div>

              {/* Stat label */}
              <div className="col-span-3 text-center flex items-center justify-center">
                <p className="text-white/80 font-['Oswald'] text-sm tracking-wider">
                  {stat.label}
                </p>
              </div>

              {/* Lakers value */}
              <div className="col-span-2 text-left">
                <p
                  className={`font-['Oswald'] text-2xl font-bold tabular-nums ${
                    stat.lakersRaw > stat.celticsRaw
                      ? 'text-[#FDB927]'
                      : stat.lakersRaw === stat.celticsRaw
                      ? 'text-white/70'
                      : 'text-white/40'
                  }`}
                >
                  {stat.lakers}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="relative px-12 py-4 bg-gradient-to-r from-[#007A33] to-[#005a25] rounded-xl font-['Oswald'] text-2xl font-bold text-white tracking-wider shadow-lg hover:shadow-xl transition-shadow"
            style={{
              boxShadow: '0 10px 40px rgba(0,122,51,0.4)',
            }}
          >
            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none"
              animate={{
                opacity: [0, 1, 0],
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
            Continue to 2nd Half
          </motion.button>
        </motion.div>

        {/* Bottom branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-white/30 text-sm font-['Oswald'] tracking-widest">
            PRESENTED BY TD GARDEN
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
