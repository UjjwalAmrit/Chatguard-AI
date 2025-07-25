from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

try:
    model = joblib.load('model.pkl')
    vectorizer = joblib.load('tfidf.pkl')
    print("✅ Models loaded successfully!")
except FileNotFoundError:
    print("🔴 Error: model.pkl or tfidf.pkl not found. Make sure the files are in the same directory.")
    model = None
    vectorizer = None
except Exception as e:
    print(f"🔴 An error occurred while loading models: {e}")
    model = None
    vectorizer = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vectorizer:
        return jsonify({'error': 'Models are not loaded or failed to load. Check server logs.'}), 500

    json_data = request.get_json()
    if not json_data or 'comment' not in json_data:
        return jsonify({'error': 'Request body must be JSON and contain a "comment" field.'}), 400

    comment_text = json_data['comment']
    
    print(f"\nReceived comment: '{comment_text}'")

    try:
        vectorized_comment = vectorizer.transform([comment_text])
        prediction = model.predict(vectorized_comment)
        prediction_values = prediction[0]

        labels = {
            'toxic': bool(prediction_values[0]),
            'severe_toxic': bool(prediction_values[1]),
            'obscene': bool(prediction_values[2]),
            'threat': bool(prediction_values[3]),
            'insult': bool(prediction_values[4]),
            'identity_hate': bool(prediction_values[5])
        }

        print(f"Prediction result: {labels}")

        return jsonify(labels)

    except Exception as e:
        print(f"🔴 An error occurred during prediction: {e}")
        return jsonify({'error': 'Failed to make a prediction.'}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)