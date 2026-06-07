"""
app.py
------
Flask application factory and entry point.
Runs the CORS-enabled API server on port 5000.
"""

from flask import Flask
from flask_cors import CORS
from routes import api

def create_app():
    app = Flask(__name__)
    # Allow all origins during local development
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(api)
    return app

if __name__ == "__main__":
    app = create_app()
    # threaded=True so MJPEG stream and REST calls run concurrently
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
