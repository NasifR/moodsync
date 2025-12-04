from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np
from scipy.special import softmax
import os
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# NLP imports
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AutoConfig, pipeline

app = FastAPI()

# -------------------------------
# CORS CONFIG
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
# CONFIGURE GEMINI API
# -------------------------------
try:
    gemini_client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )
    print("Gemini API client configured successfully")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    gemini_client = None

SYSTEM_PROMPT = """You are MindSight Assistant, an empathetic AI wellness companion (chatbot) integrated into the MindSight emotional wellness platform. Your role is to provide personalized, supportive insights to users about their mental health, stress levels, and emotional wellbeing.

Key Guidelines:
- Be warm, empathetic, and non-judgmental in your responses
- Provide actionable, science-based wellness advice
- Keep responses concise (2-5 sentences) and conversational while being informative. Note that markdown formatting is not supported. Your responses should be in plain text.
- Use the user's data context to give personalized insights
- Never diagnose medical conditions or replace professional mental health care
- Encourage healthy habits and positive behavioral changes
- If discussing concerning patterns, gently suggest professional support

The user will ask preset questions about their stress, mood patterns, and wellness strategies. Use any provided user data (stress levels, activity, sleep patterns, etc.) to personalize your responses. You are provided the last 7 check-ins for the user in the user_context. Make references to specific dates of check-ins when discussing user data. NEVER directly disclose the user's mood score as it is provided to you. The mood score is a valence score between -1 and 1 which is mapped to Positive, Neutral, and Negative. When referring to the user's mood, use the Positive, Neutral, and Negative labels ONLY. Neutral refers to a score between -0.2 and 0.2. Positive refers to a score greater than 0.2. Negative refers to a score less than -0.2."""

# -------------------------------
# LOAD NLP EMOTION MODEL
# -------------------------------
try:
    print("Loading emotion model...")

    # Load from local folder (must contain model files)
    emotion_tokenizer = AutoTokenizer.from_pretrained("boltuix/bert-emotion")
    emotion_model = AutoModelForSequenceClassification.from_pretrained("boltuix/bert-emotion")

    emotion_pipeline = pipeline("text-classification", model=emotion_model, tokenizer=emotion_tokenizer)

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
        "Sarcasm": "😏",
    }

    print("✅ NLP model loaded!")

except Exception as e:
    print("❌ Error loading emotion model:", e)
    emotion_pipeline = None

try:
    print("Loading sentiment model...")

    model_id = "cardiffnlp/twitter-roberta-base-sentiment-latest"
    sentiment_tokenizer = AutoTokenizer.from_pretrained(model_id)
    sentiment_config = AutoConfig.from_pretrained(model_id)
    sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_id)

    print("✅ Sentiment model loaded!")

except Exception as e:
    print("❌ Error loading sentiment model:", e)
    sentiment_tokenizer = None
    sentiment_model = None


def preprocess_text(text):
    return " ".join(
        ["@user" if t.startswith("@") and len(t) > 1 else ("http" if t.startswith("http") else t) for t in text.split()]
    )


def get_sentiment_scores(text):
    if sentiment_tokenizer is None or sentiment_model is None:
        raise ValueError("Sentiment model is not loaded.")

    processed_text = preprocess_text(text)
    encoded = sentiment_tokenizer(processed_text, return_tensors="pt", truncation=True, max_length=128)
    logits = sentiment_model(**encoded).logits.detach().numpy()[0]
    probs = softmax(logits)

    return dict(negative=float(probs[0]), neutral=float(probs[1]), positive=float(probs[2]))


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


class SentimentInput(BaseModel):
    text: str


class ChatRequest(BaseModel):
    message: str
    user_context: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    error: Optional[str] = None


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

    return {"text": input_data.text, "emotion": label, "emoji": emoji, "confidence": round(result["score"], 4)}


@app.post("/analyze-sentiment")
def analyze_sentiment(input_data: SentimentInput):
    if sentiment_tokenizer is None or sentiment_model is None:
        return {"error": "Sentiment model is not loaded."}

    try:
        scores = get_sentiment_scores(input_data.text)
        valence = scores["positive"] - scores["negative"]

        return {
            "text": input_data.text,
            "valence": round(valence, 4),
        }
    except Exception as e:
        return {"error": f"Error analyzing sentiment: {str(e)}"}


def format_user_context(user_context: dict) -> str:
    if not user_context:
        return ""

    context_parts = ["\n\n=== USER DATA CONTEXT START ===\n"]

    if "total_checkins" in user_context:
        context_parts.append(f"Total Check-ins Provided: {user_context['total_checkins']}")

    if "checkins" in user_context and user_context["checkins"]:
        context_parts.append("\n--- RECENT CHECK-INS (Most Recent First) ---\n")

        for idx, checkin in enumerate(user_context["checkins"], 1):
            context_parts.append(f"\nCheck-in #{idx}:")

            for key, value in checkin.items():
                if key == "id":
                    continue

                formatted_key = key.replace("_", " ").title()
                context_parts.append(f"  {formatted_key}: {value}")

            context_parts.append("")

    context_parts.append("=== USER DATA CONTEXT END ===\n")

    return "\n".join(context_parts)


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if gemini_client is None:
        raise HTTPException(status_code=503, detail="Chat service unavailable.")

    try:
        context_info = ""
        if request.user_context:
            context_info = format_user_context(request.user_context)

        user_prompt = f"{request.message}{context_info}"

        model = "gemini-flash-latest"

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=user_prompt),
                ],
            ),
        ]

        generate_content_config = types.GenerateContentConfig(
            thinkingConfig={
                "thinkingBudget": 0,
            },
            system_instruction=[
                types.Part.from_text(text=SYSTEM_PROMPT),
            ],
        )

        response = gemini_client.models.generate_content(
            model=model,
            contents=contents,
            config=generate_content_config,
        )

        return ChatResponse(response=response.text)

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
