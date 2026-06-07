/**
 * DetectionTable.jsx
 * Scrollable table showing recent detections with track ID, class, confidence, timestamp.
 * Includes CSV export and history clear buttons.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { TbDownload, TbTrash } from 'react-icons/tb'
import { exportCsvUrl, clearHistory } from '../api'

// Colour palette matching backend tracker
const PALETTE = [
  '#ff3838','#ff9d97','#ff701f','#ffb21d','#cfcf31','#48f90a',
  '#92cc17','#3ddb86','#1a9334','#00d4bb','#2c99a8','#00c2ff',
  '#3443eb','#6473ff','#0018ec','#8438ff','#520085','#cb38ff',
  '#ff95c8','#ff37c7',
]
const trackColor = id => PALETTE[id % PALETTE.length]

// Confidence badge
function ConfBadge({ value }) {
  const pct = Math.round(value * 100)
  const color = pct >= 75 ? '#00ff88' : pct >= 50 ? '#ffb300' : '#ff3d5a'
  return (
    <span
      className="font-mono text-xs px-1.5 py-0.5 rounded"
      style={{ color, background: color + '18', border: `1px solid ${color}40` }}
    >
      {pct}%
    </span>
  )
}

export default function DetectionTable({ detections = [], onClear }) {
  const handleExport = () => window.open(exportCsvUrl, '_blank')
  const handleClear = async () => {
    await clearHistory()
    if (onClear) onClear()
  }

  return (
    <div className="glass border border-border rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          Detection Log
          <span className="ml-2 text-accent font-bold">{detections.length}</span>
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs font-mono text-muted hover:text-green border border-border hover:border-green/30 rounded px-2 py-1 transition-colors"
          >
            <TbDownload className="text-sm" /> CSV
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-mono text-muted hover:text-red border border-border hover:border-red/30 rounded px-2 py-1 transition-colors"
          >
            <TbTrash className="text-sm" /> Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto" style={{ maxHeight: '260px' }}>
        {detections.length === 0 ? (
          <div className="text-center py-10 text-muted/40 text-xs font-mono">
            No detections yet
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-panel border-b border-border">
              <tr className="text-muted font-mono uppercase tracking-wider">
                <th className="text-left px-4 py-2">Track</th>
                <th className="text-left px-4 py-2">Class</th>
                <th className="text-left px-4 py-2">Conf</th>
                <th className="text-left px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {detections.map((d, i) => (
                  <motion.tr
                    key={`${d.track_id}-${d.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2">
                      <span
                        className="font-mono font-bold text-xs px-1.5 py-0.5 rounded"
                        style={{
                          color: trackColor(d.track_id),
                          background: trackColor(d.track_id) + '20',
                          border: `1px solid ${trackColor(d.track_id)}40`,
                        }}
                      >
                        #{d.track_id}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-text capitalize">{d.class_name}</td>
                    <td className="px-4 py-2"><ConfBadge value={d.confidence} /></td>
                    <td className="px-4 py-2 font-mono text-muted/70">{d.timestamp}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
