from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")  # <- enable CORS for SocketIO

# Load models
try:
    model = joblib.load('model.pkl')
    vectorizer = joblib.load('tfidf.pkl')
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"🔴 Failed to load models: {e}")
    model = None
    vectorizer = None

# Handle incoming socket message
@socketio.on('comment')  # <- listens for 'comment' events
def handle_comment(data):
    comment = data.get('comment')
    print(f"\n🔵 Received comment via socket: {comment}")

    if not model or not vectorizer:
        emit('reply', {'error': 'Model not loaded'})
        return

    try:
        vec = vectorizer.transform([comment])
        prediction = model.predict(vec)[0]
        labels = {
            'toxic': bool(prediction[0]),
            'severe_toxic': bool(prediction[1]),
            'obscene': bool(prediction[2]),
            'threat': bool(prediction[3]),
            'insult': bool(prediction[4]),
            'identity_hate': bool(prediction[5])
        }
        print(f"🟢 Prediction result: {labels}")
        emit('reply', labels)
    except Exception as e:
        print(f"🔴 Error during prediction: {e}")
        emit('reply', {'error': 'Prediction failed'})

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
