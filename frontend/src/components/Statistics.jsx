/**
 * Statistics.jsx
 * Confidence meter + avg confidence gauge.
 */
import { motion } from 'framer-motion'

export default function Statistics({ stats }) {
  const conf = stats?.avg_confidence ?? 0
  const pct = Math.round(conf * 100)

  const barColor =
    pct >= 75 ? '#00ff88' :
    pct >= 50 ? '#ffb300' :
    '#ff3d5a'

  return (
    <div className="glass border border-border rounded-xl p-4">
      <p className="text-xs font-mono text-muted uppercase tracking-wider mb-3">
        Avg Confidence
      </p>

      <div className="flex items-end gap-3 mb-3">
        <span className="font-display font-bold text-4xl" style={{ color: barColor }}>
          {pct}%
        </span>
        <span className="text-xs font-mono text-muted mb-1.5">
          {conf >= 0.75 ? 'HIGH' : conf >= 0.5 ? 'MED' : 'LOW'}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ backgroundColor: barColor }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex justify-between mt-1 text-muted text-[10px] font-mono">
        <span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span>
      </div>
    </div>
  )
}
