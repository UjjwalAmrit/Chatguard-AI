import pickle
import re
import sys
import json
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)


with open("machine_learning/model.pkl", "rb") as f:
    model = pickle.load(f)

with open("machine_learning/tfidf.pkl", "rb") as f:
    tfidf = pickle.load(f)


label_cols = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']


stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    """Clean input text: lowercase, remove non-letters, lemmatize, remove stopwords."""
    text = str(text).lower()
    text = re.sub(r'[^a-z\s]', '', text) 
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(word) for word in tokens if word not in stop_words]
    return ' '.join(tokens)

def predict(comment):
    """Clean, vectorize, and predict the toxicity of a comment."""
    cleaned = clean_text(comment)
    vectorized = tfidf.transform([cleaned])
    prediction = model.predict(vectorized)[0]
    result = {label: bool(prediction[i]) for i, label in enumerate(label_cols)}
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide a comment as an argument."}))
        sys.exit(1)

    input_comment = sys.argv[1]
    result = predict(input_comment)
    print(json.dumps(result))
