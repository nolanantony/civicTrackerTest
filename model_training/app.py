import pickle
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# ─────────────────────────────────────────
# LOAD MODEL & VECTORIZER
# ─────────────────────────────────────────
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

print("✅ Model and vectorizer loaded successfully!")

# ─────────────────────────────────────────
# HELPER FUNCTIONS
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

def detect_category(text):
    """Simple keyword-based category detection."""
    text_lower = text.lower()
    categories = {
        "Water Supply":         ["water", "pipe", "sewage", "drainage", "tanker", "supply", "contaminated"],
        "Road & Potholes":      ["pothole", "road", "highway", "divider", "speed breaker", "tar", "asphalt"],
        "Garbage & Sanitation": ["garbage", "waste", "trash", "dustbin", "sanitation", "dump", "litter"],
        "Flooding & Drainage":  ["flood", "waterlog", "drain", "overflow", "manhole", "storm"],
        "Power & Electricity":  ["electricity", "power", "electric", "wire", "transformer", "voltage", "light"],
        "Streetlights":         ["streetlight", "street light", "lamp", "dark", "lighting"],
        "Stray Animals":        ["stray", "dog", "cattle", "animal", "cow", "pig", "bite"],
        "Encroachment":         ["encroach", "illegal", "footpath", "pavement", "construction", "vendor"],
        "Noise Pollution":      ["noise", "loud", "speaker", "sound", "music", "horn"],
        "Parks & Public Spaces":["park", "garden", "bench", "playground", "public space"],
    }
    for category, keywords in categories.items():
        if any(kw in text_lower for kw in keywords):
            return category
    return "General"

# ─────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Civic Issue Priority API is running!",
        "endpoints": {
            "POST /prioritize": "Predict priority of a single complaint",
            "POST /prioritize-batch": "Predict priority for multiple complaints",
            "GET /health": "Health check"
        }
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/prioritize", methods=["POST"])
def prioritize():
    """
    Accepts a single complaint and returns priority score + label + category.

    Request body:
    {
        "complaint": "Large pothole on MG Road causing accidents",
        "category": "Road & Potholes"   <-- optional
    }

    Response:
    {
        "complaint": "...",
        "category": "Road & Potholes",
        "priority_score": 7.68,
        "priority_label": "Critical"
    }
    """
    data = request.get_json()

    if not data or "complaint" not in data:
        return jsonify({"error": "Missing 'complaint' field in request body"}), 400

    complaint = data["complaint"].strip()
    if not complaint:
        return jsonify({"error": "Complaint text cannot be empty"}), 400

    # Use provided category or auto-detect
    category = data.get("category", detect_category(complaint))

    # Vectorize and predict
    combined = complaint + " " + category
    vec = vectorizer.transform([combined])
    score = float(model.predict(vec)[0])
    score = round(max(1.0, min(10.0, score)), 2)  # clamp to 1-10
    label = score_to_label(score)

    return jsonify({
        "complaint": complaint,
        "category": category,
        "priority_score": score,
        "priority_label": label,
    })


@app.route("/prioritize-batch", methods=["POST"])
def prioritize_batch():
    """
    Accepts multiple complaints and returns them sorted by priority (highest first).

    Request body:
    {
        "complaints": [
            {"id": "1", "complaint": "Pothole on MG Road causing accidents"},
            {"id": "2", "complaint": "Broken bench in park"},
            {"id": "3", "complaint": "Live wire near railway station"}
        ]
    }

    Response:
    {
        "results": [
            {"id": "3", "complaint": "...", "priority_score": 9.1, "priority_label": "Critical", "category": "..."},
            ...
        ]
    }
    """
    data = request.get_json()

    if not data or "complaints" not in data:
        return jsonify({"error": "Missing 'complaints' field in request body"}), 400

    complaints = data["complaints"]
    if not isinstance(complaints, list) or len(complaints) == 0:
        return jsonify({"error": "'complaints' must be a non-empty list"}), 400

    results = []
    for item in complaints:
        complaint = item.get("complaint", "").strip()
        if not complaint:
            continue
        category = item.get("category", detect_category(complaint))
        combined = complaint + " " + category
        vec = vectorizer.transform([combined])
        score = float(model.predict(vec)[0])
        score = round(max(1.0, min(10.0, score)), 2)
        label = score_to_label(score)

        results.append({
            "id": item.get("id", None),
            "complaint": complaint,
            "category": category,
            "priority_score": score,
            "priority_label": label,
        })

    # Sort by priority score descending (most urgent first)
    results.sort(key=lambda x: x["priority_score"], reverse=True)

    return jsonify({
        "total": len(results),
        "results": results
    })


# ─────────────────────────────────────────
# RUN
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting Civic Issue Priority API...")
    app.run(debug=True, host="0.0.0.0", port=5000)
