/**
 * api.js
 * Centralised Axios client for all backend calls.
 */
import axios from 'axios'

const BASE = 'http://localhost:5000'

export const api = axios.create({ baseURL: BASE, timeout: 10000 })

export const VIDEO_FEED_URL = `${BASE}/video-feed`

export const startWebcam   = ()             => api.post('/start-webcam')
export const stopFeed      = ()             => api.post('/stop-feed')
export const pauseFeed     = ()             => api.post('/pause-feed')
export const resumeFeed    = ()             => api.post('/resume-feed')
export const uploadVideo   = (formData)     => api.post('/upload-video', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const getStats      = ()             => api.get('/detection-stats')
export const getDetections = (limit = 50)  => api.get(`/recent-detections?limit=${limit}`)
export const setThreshold  = (threshold)   => api.post('/set-threshold', { threshold })
export const setClassFilter= (classes)     => api.post('/set-class-filter', { classes })
export const clearHistory  = ()             => api.post('/clear-history')
export const exportCsvUrl  = `${BASE}/export-csv`
