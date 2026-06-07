/**
 * Dashboard.jsx
 * Four stat cards: Active Objects, Total Detections, FPS, Processing Time.
 */
import { motion } from 'framer-motion'
import { TbUsers, TbScanEye, TbBolt, TbCpu } from 'react-icons/tb'

const cards = [
  {
    key: 'active_objects',
    label: 'Active Objects',
    icon: TbUsers,
    color: 'accent',
    format: v => v,
  },
  {
    key: 'total_detections',
    label: 'Total Detections',
    icon: TbScanEye,
    color: 'purple',
    format: v => v.toLocaleString(),
  },
  {
    key: 'fps',
    label: 'FPS',
    icon: TbBolt,
    color: 'green',
    format: v => v.toFixed(1),
  },
  {
    key: 'processing_time_ms',
    label: 'Proc. Time',
    icon: TbCpu,
    color: 'amber',
    format: v => `${v.toFixed(0)}ms`,
  },
]

const colorMap = {
  accent: { text: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/10', glow: 'glow-accent' },
  purple: { text: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/10', glow: '' },
  green:  { text: 'text-green',  border: 'border-green/20',  bg: 'bg-green/10',  glow: 'glow-green' },
  amber:  { text: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/10', glow: '' },
}

export default function Dashboard({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => {
        const c = colorMap[card.color]
        const Icon = card.icon
        const value = stats?.[card.key] ?? 0
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`glass ${c.glow} border ${c.border} rounded-xl p-4 flex flex-col gap-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${c.bg}`}>
                <Icon className={`text-base ${c.text}`} />
              </div>
            </div>
            <div className={`font-display font-bold text-3xl ${c.text}`}>
              {card.format(value)}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
