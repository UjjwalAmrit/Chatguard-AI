# machine_learning/api.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Load models ONCE at startup ---
try:
    model = joblib.load('model.pkl')
    vectorizer = joblib.load('tfidf.pkl')
    print("✅ Models loaded successfully!")
except Exception as e:
    print(f"🔴 Error loading models: {e}")
    model = None
    vectorizer = None

# --- Define the prediction endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    if not model or not vectorizer:
        return jsonify({'error': 'Models are not loaded'}), 500

    # Get the comment from the request JSON
    json_data = request.get_json()
    if not json_data or 'comment' not in json_data:
        return jsonify({'error': 'Missing "comment" in request body'}), 400

    comment = json_data['comment']

    # Vectorize the input and make a prediction
    vectorized_comment = vectorizer.transform([comment])
    prediction = model.predict(vectorized_comment)
    probabilities = model.predict_proba(vectorized_comment)

    # Create a JSON response
    labels = {
        'toxic': bool(prediction[0][0]),
        'severe_toxic': bool(prediction[0][1]),
        'obscene': bool(prediction[0][2]),
        'threat': bool(prediction[0][3]),
        'insult': bool(prediction[0][4]),
        'identity_hate': bool(prediction[0][5])
    }

    return jsonify(labels)

# --- Run the Flask app ---
if __name__ == '__main__':
    # Use port 5000 by convention for development APIs
    app.run(host="0.0.0.0", port=5000,debug=False)