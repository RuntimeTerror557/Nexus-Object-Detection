"""
routes.py
---------
Flask API endpoint definitions.
Handles video upload, streaming, stats and detection history.
"""

import os
import time
import csv
import io
import threading
from datetime import datetime
from flask import Blueprint, Response, request, jsonify, send_file

from detector import ObjectDetector
from tracker import ObjectTracker
import cv2
import numpy as np

# ---------------------------------------------------------------------------
# Module-level shared state (protected by lock where necessary)
# ---------------------------------------------------------------------------

api = Blueprint("api", __name__)

detector = ObjectDetector()
tracker = ObjectTracker()

# Video source: 0 = webcam, str = file path
video_source = None
cap: cv2.VideoCapture | None = None
cap_lock = threading.Lock()

# Streaming control flags
is_running = False
is_paused = False

# Statistics
stats = {
    "total_detections": 0,
    "active_objects": 0,
    "fps": 0.0,
    "processing_time_ms": 0.0,
    "avg_confidence": 0.0,
}

# Recent detection history (max 200 entries)
detection_history: list[dict] = []
MAX_HISTORY = 200

# Colour palette for track IDs (BGR)
PALETTE = [
    (255, 56, 56), (255, 157, 151), (255, 112, 31), (255, 178, 29),
    (207, 210, 49), (72, 249, 10), (146, 204, 23), (61, 219, 134),
    (26, 147, 52), (0, 212, 187), (44, 153, 168), (0, 194, 255),
    (52, 69, 147), (100, 115, 255), (0, 24, 236), (132, 56, 255),
    (82, 0, 133), (203, 56, 255), (255, 149, 200), (255, 55, 199),
]

def _get_color(track_id) -> tuple:
    return PALETTE[int(track_id) % len(PALETTE)]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _open_source(source):
    """Open a cv2.VideoCapture for webcam (0) or file path."""
    global cap
    if cap and cap.isOpened():
        cap.release()
    cap = cv2.VideoCapture(source)
    tracker.reset()
    return cap.isOpened()


def _draw_overlays(frame: np.ndarray, tracked_objects: list) -> np.ndarray:
    """Draw bounding boxes, labels, and trajectory trails on the frame."""
    for obj in tracked_objects:
        tid = obj["track_id"]
        x1, y1, x2, y2 = obj["bbox"]
        label = obj["class_name"]
        conf = obj["confidence"]
        trail = obj["trail"]
        color = _get_color(tid)

        # Draw trail (trajectory history)
        for i in range(1, len(trail)):
            if trail[i - 1] and trail[i]:
                thickness = max(1, int(3 * (i / len(trail))))
                cv2.line(frame, trail[i - 1], trail[i], color, thickness)

        # Bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Label background
        label_text = f"#{tid} {label} {conf*100:.0f}%"
        (tw, th), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
        cv2.rectangle(frame, (x1, y1 - th - baseline - 6), (x1 + tw + 4, y1), color, -1)

        # Label text
        cv2.putText(
            frame, label_text,
            (x1 + 2, y1 - baseline - 2),
            cv2.FONT_HERSHEY_SIMPLEX, 0.55,
            (0, 0, 0), 1, cv2.LINE_AA
        )

    return frame


def _record_detections(tracked_objects: list):
    """Append tracked objects to detection history."""
    global detection_history
    ts = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    for obj in tracked_objects:
        detection_history.append({
            "track_id": obj["track_id"],
            "class_name": obj["class_name"],
            "confidence": obj["confidence"],
            "timestamp": ts,
        })
    # Trim to max size
    if len(detection_history) > MAX_HISTORY:
        detection_history = detection_history[-MAX_HISTORY:]


# ---------------------------------------------------------------------------
# Frame generator (MJPEG stream)
# ---------------------------------------------------------------------------

def generate_frames():
    """Generator that yields MJPEG frames for the /video-feed endpoint."""
    global is_running, is_paused, stats

    prev_time = time.time()
    frame_count = 0
    fps_accum = 0.0

    while is_running:
        if is_paused:
            time.sleep(0.05)
            continue

        with cap_lock:
            if cap is None or not cap.isOpened():
                break
            ret, frame = cap.read()

        if not ret:
            # For video files: loop back; for webcam: stop
            if isinstance(video_source, str):
                with cap_lock:
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue
            break

        t_start = time.time()

        # --- Detection ---
        raw_detections = detector.detect(frame)

        # --- Tracking ---
        tracked_objects = tracker.update(raw_detections, frame)

        # --- Draw overlays ---
        frame = _draw_overlays(frame, tracked_objects)

        # --- Update stats ---
        t_end = time.time()
        proc_ms = (t_end - t_start) * 1000

        now = time.time()
        elapsed = now - prev_time
        frame_count += 1
        if elapsed >= 0.5:
            fps_accum = frame_count / elapsed
            frame_count = 0
            prev_time = now

        confidences = [o["confidence"] for o in tracked_objects] or [0]
        stats.update({
            "total_detections": stats["total_detections"] + len(raw_detections),
            "active_objects": len(tracked_objects),
            "fps": round(fps_accum, 1),
            "processing_time_ms": round(proc_ms, 1),
            "avg_confidence": round(sum(confidences) / len(confidences), 3),
        })

        # --- Record history ---
        _record_detections(tracked_objects)

        # --- Encode and yield JPEG ---
        _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" +
            buffer.tobytes() +
            b"\r\n"
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@api.route("/start-webcam", methods=["POST"])
def start_webcam():
    global video_source, is_running, is_paused
    video_source = 0
    if not _open_source(0):
        return jsonify({"error": "Cannot open webcam"}), 500
    stats["total_detections"] = 0
    is_running = True
    is_paused = False
    return jsonify({"status": "webcam started"})


@api.route("/stop-feed", methods=["POST"])
def stop_feed():
    global is_running, cap
    is_running = False
    with cap_lock:
        if cap:
            cap.release()
            cap = None
    return jsonify({"status": "stopped"})


@api.route("/pause-feed", methods=["POST"])
def pause_feed():
    global is_paused
    is_paused = True
    return jsonify({"status": "paused"})


@api.route("/resume-feed", methods=["POST"])
def resume_feed():
    global is_paused
    is_paused = False
    return jsonify({"status": "resumed"})


@api.route("/upload-video", methods=["POST"])
def upload_video():
    global video_source, is_running, is_paused
    if "video" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["video"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Save uploaded file
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, file.filename)
    file.save(filepath)

    video_source = filepath
    if not _open_source(filepath):
        return jsonify({"error": "Cannot open video file"}), 500

    stats["total_detections"] = 0
    is_running = True
    is_paused = False
    return jsonify({"status": "video uploaded", "filename": file.filename})


@api.route("/video-feed")
def video_feed():
    """MJPEG streaming endpoint consumed by the frontend <img> tag."""
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@api.route("/detection-stats")
def detection_stats():
    return jsonify({**stats, "is_running": is_running, "is_paused": is_paused})


@api.route("/recent-detections")
def recent_detections():
    limit = int(request.args.get("limit", 50))
    return jsonify(detection_history[-limit:][::-1])  # newest first


@api.route("/set-threshold", methods=["POST"])
def set_threshold():
    data = request.get_json()
    threshold = data.get("threshold", 0.4)
    detector.set_confidence_threshold(threshold)
    return jsonify({"threshold": detector.confidence_threshold})


@api.route("/set-class-filter", methods=["POST"])
def set_class_filter():
    data = request.get_json()
    classes = data.get("classes", [])
    detector.set_class_filter(classes)
    return jsonify({"active_filter": detector.class_filter})


@api.route("/export-csv")
def export_csv():
    """Export detection history as a downloadable CSV file."""
    si = io.StringIO()
    writer = csv.DictWriter(si, fieldnames=["timestamp", "track_id", "class_name", "confidence"])
    writer.writeheader()
    writer.writerows(detection_history)
    output = io.BytesIO(si.getvalue().encode())
    output.seek(0)
    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"detections_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )


@api.route("/clear-history", methods=["POST"])
def clear_history():
    global detection_history
    detection_history = []
    stats["total_detections"] = 0
    return jsonify({"status": "cleared"})
