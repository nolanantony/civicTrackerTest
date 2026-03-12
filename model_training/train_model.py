import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# ─────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────
print("📂 Loading dataset...")
df = pd.read_csv("civic_complaints_india.csv")
print(f"   Total records: {len(df)}\n")

# ─────────────────────────────────────────
# 2. PREPROCESS
# ─────────────────────────────────────────
print("🔧 Preprocessing...")
df = df.dropna(subset=["complaint_text", "priority_score"])

# Combine complaint text + category for richer features
df["combined_text"] = df["complaint_text"] + " " + df["category"]

X = df["combined_text"]
y = df["priority_score"]  # numeric target now (1.0 - 10.0)

print(f"   Priority score stats:")
print(f"   Min: {y.min():.2f}  Max: {y.max():.2f}  Mean: {y.mean():.2f}\n")

# ─────────────────────────────────────────
# 3. TRAIN/TEST SPLIT
# ─────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"   Training samples : {len(X_train)}")
print(f"   Testing samples  : {len(X_test)}\n")

# ─────────────────────────────────────────
# 4. TF-IDF VECTORIZATION
# ─────────────────────────────────────────
print("📊 Vectorizing text with TF-IDF...")
vectorizer = TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    stop_words="english",
    lowercase=True,
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)
print(f"   Vocabulary size: {len(vectorizer.vocabulary_)}\n")

# ─────────────────────────────────────────
# 5. TRAIN MODEL
# ─────────────────────────────────────────
print("🤖 Training Random Forest Regressor...")
model = RandomForestRegressor(
    n_estimators=200,
    max_depth=None,
    random_state=42,
    n_jobs=-1,
)
model.fit(X_train_vec, y_train)
print("   Training complete!\n")

# ─────────────────────────────────────────
# 6. EVALUATE
# ─────────────────────────────────────────
print("📈 Evaluating model...")
y_pred = model.predict(X_test_vec)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"\n   Mean Absolute Error (MAE) : {mae:.3f}  (lower is better)")
print(f"   Root Mean Squared Error   : {rmse:.3f}  (lower is better)")
print(f"   R² Score                  : {r2:.3f}   (closer to 1.0 is better)\n")


# ─────────────────────────────────────────
# 7. HELPER: score → label
# ─────────────────────────────────────────
def score_to_label(score):
    if score <= 3:
        return "Low"
    elif score <= 5:
        return "Medium"
    elif score <= 7:
        return "High"
    else:
        return "Critical"


# ─────────────────────────────────────────
# 8. SAVE MODEL & VECTORIZER
# ─────────────────────────────────────────
print("💾 Saving model and vectorizer...")
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

with open("vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

print("   model.pkl      ✅ saved")
print("   vectorizer.pkl ✅ saved\n")

# ─────────────────────────────────────────
# 9. SANITY TEST
# ─────────────────────────────────────────
print("🧪 Quick sanity test on sample complaints:\n")

test_complaints = [
    (
        "Sewage water mixing with drinking water supply near City Bus Stand. People falling sick.",
        "Water Supply",
    ),
    ("Broken bench in park near Town Hall. Needs repair.", "Parks & Public Spaces"),
    (
        "Live wire hanging near Railway Station posing electrocution risk.",
        "Power & Electricity",
    ),
    ("Large pothole on MG Road causing accidents for two-wheelers.", "Road & Potholes"),
    (
        "Stray dogs near Government School biting children. Urgent action needed.",
        "Stray Animals",
    ),
    (
        "Garbage not collected in Ward 5 for 2 weeks. Foul smell and disease risk.",
        "Garbage & Sanitation",
    ),
    (
        "Streetlight not working on NH 66 for a month. Area is pitch dark at night.",
        "Streetlights",
    ),
]

for complaint, category in test_complaints:
    combined = complaint + " " + category
    vec = vectorizer.transform([combined])
    score = round(float(model.predict(vec)[0]), 2)
    score = max(1.0, min(10.0, score))  # clamp to 1-10
    label = score_to_label(score)
    print(f"   Complaint : {complaint[:65]}...")
    print(f"   Score: {score}/10  |  Priority: {label}\n")

print("🎉 Model is ready for API integration!")
