# MindSight

**MindSight** is a full-stack web application that uses **AI and machine learning** to help users better understand their **stress, mood, and emotional well-being.**
Instead of just collecting journal entries and survey data, MindSight turns daily check-ins into **meaningful insights and visual patterns.**


## **Project Overview**

Many mental health and journaling apps only store data without explaining what it means.
MindSight solves this by analyzing both:

* **Lifestyle data** (sleep, screen time, caffeine, exercise)

* **Text-based journal entries**

Using machine learning and natural language processing (NLP), the platform identifies **emotional patterns, stress trends, and possible triggers** over time


## **Key Features**
* Daily lifestyle and mood check-ins

* Journal entry analysis using NLP

* Interactive dashboard with charts and trends

* Stress level prediction using machine learning

* Secure authentication and user-specific data storage

* Weekly stress and emotion visualizations
  
## **How It Works**
1. **User Input**
   - Daily survey
   - Optional journal entry

2. **Backend Processing**
   - Stress prediction (numeric data)
   - Emotion detection (text analysis)

3. **Data Storage**
   - Results stored securely in the database

4. **Dashboard Output**
   - Stress trends
   - Emotion distributions
   - Historical patterns

##  **Tech Stack**

**Frontend**

* **Next.js + React**

* **Tailwind CSS, Radix UI, Framer Motion**

* **Recharts** for data visualization

**Backend & ML**     
* **FastAPI (Python)**

* **BERT-based NLP model** for emotion detection

* **Random Forest** for stress prediction

* **Google Colab** for model training (GPU support)

**Database & Auth**

* **Firebase Authentication**

* **Cloud Firestore** for secure user data storage

## **Machine Learning Models**
* **Emotion Detection**
Uses a pretrained **BERT transformer model** to analyze journal text and identify emotional tone.

* **Stress Prediction**
Uses structured lifestyle data (sleep, caffeine, screen time, etc.) to estimate stress levels.

Pretrained models were chosen for **better performance, reliability, and scalability** compared to custom-trained models 
