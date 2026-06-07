"""
tracker.py
----------
Deep SORT object tracking module.
Assigns persistent track IDs across frames and maintains trajectory history.
"""

from deep_sort_realtime.deepsort_tracker import DeepSort
import numpy as np
from collections import defaultdict, deque


class ObjectTracker:
    """
    Wraps Deep SORT to track objects across video frames.
    Maintains a trajectory history (trail) for each track ID.
    """

    # Max trajectory points to store per track
    MAX_TRAIL_LEN = 30

    def __init__(self, max_age: int = 30, n_init: int = 2):
        """
        max_age  – frames a track persists without being matched
        n_init   – consecutive detections before a track is confirmed
        """
        self.tracker = DeepSort(
            max_age=max_age,
            n_init=n_init,
            nms_max_overlap=1.0,
            max_cosine_distance=0.3,
        )
        # trail_history[track_id] = deque of (cx, cy) center points
        self.trail_history: dict[int, deque] = defaultdict(
            lambda: deque(maxlen=self.MAX_TRAIL_LEN)
        )
        self.active_ids: set[int] = set()

    def update(self, detections: list, frame: np.ndarray) -> list:
        """
        Feed raw YOLO detections into Deep SORT.

        detections – list of dicts from detector.py
        frame      – current BGR frame (used for appearance features)

        Returns a list of dicts:
            {
                'track_id':   int,
                'bbox':       [x1, y1, x2, y2],
                'class_name': str,
                'confidence': float,
                'trail':      [(cx, cy), ...]   # trajectory history
            }
        """
        # Reformat detections for Deep SORT:  ([left, top, w, h], confidence, class_name)
        ds_inputs = []
        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            w, h = x2 - x1, y2 - y1
            ds_inputs.append(([x1, y1, w, h], det["confidence"], det["class_name"]))

        # Update tracker
        tracks = self.tracker.update_tracks(ds_inputs, frame=frame)

        tracked_objects = []
        current_ids = set()

        for track in tracks:
            if not track.is_confirmed():
                continue

            track_id = track.track_id
            ltrb = track.to_ltrb()  # [left, top, right, bottom]
            x1, y1, x2, y2 = map(int, ltrb)

            # Compute center point and store in trail
            cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
            self.trail_history[track_id].append((cx, cy))

            current_ids.add(track_id)

            tracked_objects.append({
                "track_id": track_id,
                "bbox": [x1, y1, x2, y2],
                "class_name": track.get_det_class() or "unknown",
                "confidence": round(track.get_det_conf() or 0.0, 3),
                "trail": list(self.trail_history[track_id]),
            })

        # Clean up stale trails for IDs not seen recently
        stale_ids = self.active_ids - current_ids
        for sid in stale_ids:
            if sid in self.trail_history:
                del self.trail_history[sid]

        self.active_ids = current_ids
        return tracked_objects

    def reset(self):
        """Reset tracker state (called when switching video sources)."""
        self.tracker = DeepSort(max_age=30, n_init=2, nms_max_overlap=1.0, max_cosine_distance=0.3)
        self.trail_history.clear()
        self.active_ids.clear()
