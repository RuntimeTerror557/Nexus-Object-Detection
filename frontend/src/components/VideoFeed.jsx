/**
 * VideoFeed.jsx
 * Displays the MJPEG stream from the Flask backend.
 * Shows a placeholder UI when the feed is not running.
 */
import { motion, AnimatePresence } from 'framer-motion'
import { TbScanEye, TbCameraOff, TbCapture } from 'react-icons/tb'
import { VIDEO_FEED_URL } from '../api'

export default function VideoFeed({ isRunning, isPaused, onScreenshot }) {
  const handleScreenshot = () => {
    // Create a temporary link to download the current MJPEG frame
    const a = document.createElement('a')
    a.href = VIDEO_FEED_URL
    a.download = `nexus_${Date.now()}.jpg`
    a.click()
    if (onScreenshot) onScreenshot()
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden glass glow-accent border border-accent/20">
      {/* Corner decorations */}
      <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-accent/60 rounded-tl z-10" />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-accent/60 rounded-tr z-10" />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-accent/60 rounded-bl z-10" />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-accent/60 rounded-br z-10" />

      <AnimatePresence mode="wait">
        {isRunning ? (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full scanline"
          >
            {/* MJPEG stream rendered as <img> — browser handles multipart */}
            <img
                src={`${VIDEO_FEED_URL}?t=${Date.now()}`}
                alt="Live detection feed"
                className="w-full h-full object-contain bg-void"
              />

            {/* Paused overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-void/70 flex items-center justify-center">
                <span className="font-display text-2xl text-accent tracking-widest animate-pulse_soft">
                  PAUSED
                </span>
              </div>
            )}

            {/* LIVE badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red/20 border border-red/40 rounded px-2 py-0.5 text-red text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse_soft" />
              REC
            </div>

            {/* Screenshot button */}
            <button
              onClick={handleScreenshot}
              className="absolute top-4 right-4 p-2 glass rounded border border-border hover:border-accent/50 hover:text-accent transition-colors"
            >
              <TbCapture className="text-lg" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted"
          >
            <TbCameraOff className="text-5xl opacity-30" />
            <div className="text-center">
              <p className="font-display text-sm tracking-widest uppercase text-muted/60">
                No Active Feed
              </p>
              <p className="text-xs font-mono mt-1 text-muted/40">
                Start webcam or upload a video file
              </p>
            </div>
            {/* Animated scanning lines decorative */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-px bg-accent/40 w-full"
                  style={{ marginTop: `${i * 60 + 20}px` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
