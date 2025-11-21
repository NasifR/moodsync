from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

# NLP imports
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

app = FastAPI()

# -------------------------------
# CORS CONFIG
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Change to ["http://localhost:3000"] for stricter production config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# LOAD STRESS MODEL
# -------------------------------
try:
    print("Loading stress model...")
    rf_model = joblib.load("stress_model.pkl")
    feature_list = joblib.load("model_features.pkl")
    print("✅ Stress model loaded!")
except Exception as e:
    print("❌ Error loading stress model:", e)
    rf_model, feature_list = None, None

# -------------------------------
# LOAD NLP EMOTION MODEL
# -------------------------------
try:
    print("Loading emotion model...")

    # Load from local folder (must contain model files)
    emotion_tokenizer = AutoTokenizer.from_pretrained("./nlp_model")
    emotion_model = AutoModelForSequenceClassification.from_pretrained("./nlp_model")

    emotion_pipeline = pipeline(
        "text-classification",
        model=emotion_model,
        tokenizer=emotion_tokenizer
    )

    label_to_emoji = {
        "Sadness": "😢",
        "Anger": "😠",
        "Love": "❤️",
        "Surprise": "😲",
        "Fear": "😱",
        "Happiness": "😄",
        "Neutral": "😐",
        "Disgust": "🤢",
        "Shame": "🙈",
        "Guilt": "😔",
        "Confusion": "😕",
        "Desire": "🔥",
        "Sarcasm": "😏"
    }

    print("✅ NLP model loaded!")

except Exception as e:
    print("❌ Error loading emotion model:", e)
    emotion_pipeline = None


# -------------------------------
# REQUEST MODELS
# -------------------------------
class StressInput(BaseModel):
    sleep_hours: float
    physical_activity_hours: float
    screen_time: float
    caffeine_intake: float
    smoking: int
    work_hours: float


class EmotionInput(BaseModel):
    text: str


# -------------------------------
# ROUTES
# -------------------------------
@app.get("/")
def root():
    return {"message": "MoodSync Backend is running!"}


# ---- STRESS PREDICTION ----
@app.post("/predict-stress")
def predict_stress(data: StressInput):
    if rf_model is None:
        return {"error": "Stress model is not loaded."}

    df = pd.DataFrame([data.dict()])[feature_list]
    prediction = rf_model.predict(df)[0]

    return {"predicted_stress_level": (prediction)}


# ---- EMOTION ANALYSIS ----
@app.post("/analyze-emotion")
def analyze_emotion(input_data: EmotionInput):
    if emotion_pipeline is None:
        return {"error": "Emotion model is not loaded."}

    result = emotion_pipeline(input_data.text)[0]
    label = result["label"].capitalize()
    emoji = label_to_emoji.get(label, "❓")

    return {
        "text": input_data.text,
        "emotion": label,
        "emoji": emoji,
        "confidence": round(result["score"], 4)
    }
