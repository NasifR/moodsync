from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from your frontend (adjust origin if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or ["http://localhost:3000"] for stricter setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and feature list once when the server starts
rf_model = joblib.load("stress_model.pkl")
feature_list = joblib.load("model_features.pkl")

try:
    print("Loading model files...")
    rf_model = joblib.load("stress_model.pkl")
    feature_list = joblib.load("model_features.pkl")
    print("✅ Models loaded successfully!")
except Exception as e:
    print("❌ Error loading model files:", e)


# Request body model
class UserInput(BaseModel):
    sleep_hours: float
    physical_activity_hours: float
    screen_time: float
    caffeine_intake: float
    smoking: int
    work_hours: float

@app.post("/predict")
def predict_stress(data: UserInput):
    # Convert input to DataFrame with correct column order
    df = pd.DataFrame([data.dict()])[feature_list]
    prediction = rf_model.predict(df)[0]
    return {"predicted_stress_level": prediction}

@app.get("/")
def root():
    return {"message": "Stress Prediction API is running!"}
