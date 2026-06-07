/**
 * Navbar.jsx
 * Top navigation bar with logo, title, and live status indicator.
 */
import { motion } from 'framer-motion'
import { TbScanEye } from 'react-icons/tb'

export default function Navbar({ isRunning }) {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-border"
    >
      {/* Logo + title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <TbScanEye className="text-accent text-2xl" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse_soft" />
        </div>
        <div>
          <span className="font-display font-bold text-lg tracking-wide text-white">NEXUS</span>
          <span className="ml-2 text-xs font-mono text-muted uppercase tracking-widest">
            Object Detection System
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span
          className={`w-2 h-2 rounded-full ${
            isRunning ? 'bg-green animate-pulse_soft' : 'bg-muted'
          }`}
        />
        <span className={isRunning ? 'text-green' : 'text-muted'}>
          {isRunning ? 'LIVE' : 'STANDBY'}
        </span>

        <span className="ml-4 text-muted border border-border rounded px-2 py-0.5">
          YOLOv8 · DeepSORT
        </span>
      </div>
    </motion.nav>
  )
}
