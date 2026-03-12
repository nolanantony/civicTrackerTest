import pandas as pd
import numpy as np
import random

random.seed(42)
np.random.seed(42)

# --- CITIES ---
cities = {
    "Karnataka": [
        "Mangalore",
        "Bengaluru",
        "Mysuru",
        "Hubli",
        "Dharwad",
        "Udupi",
        "Belagavi",
    ],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur"],
    "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
}

# Flatten city list with state info
city_list = [
    (city, state)
    for state, cities_in_state in cities.items()
    for city in cities_in_state
]


# --- CATEGORIES AND TEMPLATES ---
# Format: (complaint_templates, base_priority_min, base_priority_max)
complaint_data = {
    "Road & Potholes": {
        "priority_range": (4, 9),
        "templates": [
            "Large pothole on {road} causing accidents and vehicle damage.",
            "Road near {landmark} has been damaged for {duration} and needs urgent repair.",
            "Multiple potholes on {road} making it dangerous for two-wheelers.",
            "Road cave-in near {landmark} blocking half the lane.",
            "Broken road divider on {road} causing traffic hazards.",
            "Speed breaker on {road} is broken and causing accidents at night.",
            "Newly laid road near {landmark} already has cracks and potholes after one monsoon.",
            "Road flooding and pothole issue near {landmark} during heavy rains.",
        ],
        "urgency_keywords": ["accident", "dangerous", "blocking", "cave-in", "hazard"],
    },
    "Water Supply": {
        "priority_range": (5, 10),
        "templates": [
            "No water supply in {area} for {duration}. Residents facing severe shortage.",
            "Contaminated water being supplied in {area}. People falling sick.",
            "Water pipe burst near {landmark} causing waterlogging and wastage.",
            "Low water pressure in {area} making it difficult for upper floor residents.",
            "Water tanker not arriving on schedule in {area} for {duration}.",
            "Sewage mixing with drinking water supply near {landmark}.",
            "Underground water pipe leakage near {road} wasting thousands of litres daily.",
            "No water supply during summer in {area}. Urgent action needed.",
        ],
        "urgency_keywords": [
            "contaminated",
            "sick",
            "sewage",
            "burst",
            "no water",
            "shortage",
        ],
    },
    "Garbage & Sanitation": {
        "priority_range": (3, 8),
        "templates": [
            "Garbage not collected in {area} for {duration}. Foul smell and disease risk.",
            "Illegal dumping near {landmark} creating health hazard for residents.",
            "Overflowing dustbin near {road} not cleared for days.",
            "Open garbage burning near {area} causing air pollution.",
            "No garbage collection vehicle visiting {area} since {duration}.",
            "Waste dumped in open plot near {landmark} attracting mosquitoes and rats.",
            "Public toilet near {landmark} in extremely unhygienic condition.",
            "Drainage blocked due to garbage accumulation near {road}.",
        ],
        "urgency_keywords": [
            "disease",
            "health hazard",
            "burning",
            "mosquitoes",
            "rats",
            "unhygienic",
        ],
    },
    "Streetlights": {
        "priority_range": (3, 7),
        "templates": [
            "Streetlights not working on {road} for {duration}. Area is pitch dark at night.",
            "All streetlights near {landmark} have been non-functional since {duration}.",
            "Broken streetlight pole on {road} posing risk to pedestrians.",
            "No streetlights in {area} leading to increased crime and accidents.",
            "Streetlights on {road} are on during daytime and off at night.",
            "Faulty wiring in streetlight near {landmark} causing sparks.",
        ],
        "urgency_keywords": ["crime", "accidents", "sparks", "dark", "risk"],
    },
    "Flooding & Drainage": {
        "priority_range": (5, 10),
        "templates": [
            "Severe flooding in {area} after rains. Water entering homes.",
            "Blocked drain near {landmark} causing waterlogging on {road}.",
            "Storm drain overflowing near {area} due to garbage blockage.",
            "Flooded underpass near {landmark} dangerous for vehicles.",
            "Open drain near {road} causing flooding and accident risk.",
            "Drainage system in {area} collapsed causing sewage overflow.",
            "Flash flooding in {area} every monsoon. No permanent solution taken.",
            "Manhole cover missing near {landmark} causing flooding and safety risk.",
        ],
        "urgency_keywords": [
            "flooding",
            "homes",
            "sewage",
            "collapsed",
            "dangerous",
            "missing manhole",
        ],
    },
    "Encroachment": {
        "priority_range": (3, 7),
        "templates": [
            "Illegal encroachment on footpath near {landmark} blocking pedestrian access.",
            "Shop owner in {area} occupying road space illegally for {duration}.",
            "Unauthorized construction near {road} blocking traffic movement.",
            "Encroachment on government land near {landmark} for {duration}.",
            "Vendors occupying entire footpath near {road} forcing pedestrians onto road.",
            "Illegal parking lot set up on public land near {landmark}.",
        ],
        "urgency_keywords": ["blocking", "illegal", "forcing", "unauthorized"],
    },
    "Stray Animals": {
        "priority_range": (4, 8),
        "templates": [
            "Large pack of stray dogs in {area} attacking pedestrians and children.",
            "Stray cattle blocking {road} causing traffic jams and accidents.",
            "Stray dogs near {landmark} school biting children. Urgent action needed.",
            "Injured stray animal on {road} needs rescue.",
            "Stray pigs near {area} creating sanitation issues and health risk.",
            "Aggressive stray dog pack near {landmark} making it unsafe to walk at night.",
        ],
        "urgency_keywords": [
            "attacking",
            "biting",
            "children",
            "aggressive",
            "unsafe",
            "accident",
        ],
    },
    "Power & Electricity": {
        "priority_range": (4, 9),
        "templates": [
            "No electricity in {area} for {duration}. Urgent restoration needed.",
            "Fallen electric pole on {road} near {landmark}. Extremely dangerous.",
            "Live wire hanging near {landmark} posing electrocution risk.",
            "Frequent power cuts in {area} for {duration} affecting daily life.",
            "Transformer explosion near {road}. Area without power.",
            "Illegal electrical connections near {area} causing fire hazard.",
            "Electric meter box damaged near {landmark} causing sparks and risk of fire.",
        ],
        "urgency_keywords": [
            "live wire",
            "electrocution",
            "explosion",
            "fire",
            "fallen pole",
            "dangerous",
        ],
    },
    "Noise Pollution": {
        "priority_range": (2, 6),
        "templates": [
            "Loudspeaker noise from {landmark} disturbing residents in {area} late at night.",
            "Construction work near {road} happening beyond permitted hours causing noise.",
            "Industrial noise from factory near {area} disturbing sleep of residents.",
            "Unauthorized event with loud music near {landmark} in {area}.",
            "Continuous horn honking near {road} due to traffic signal issue.",
        ],
        "urgency_keywords": ["late at night", "sleep", "disturbing"],
    },
    "Parks & Public Spaces": {
        "priority_range": (2, 5),
        "templates": [
            "Park in {area} not maintained for {duration}. Overgrown and unusable.",
            "Broken benches and lights in park near {landmark}.",
            "Public toilet in {area} park locked and inaccessible to users.",
            "Encroachment on park land near {landmark} reducing public space.",
            "Children's play equipment in {area} park broken and dangerous.",
            "Park in {area} taken over by antisocial elements at night.",
        ],
        "urgency_keywords": ["broken", "dangerous", "antisocial"],
    },
}

# --- HELPER FILLERS ---
roads = [
    "MG Road",
    "NH 66",
    "Bunts Hostel Road",
    "Lalbagh Road",
    "Brigade Road",
    "Mysore Road",
    "Hosur Road",
    "Anna Salai",
    "FC Road",
    "Linking Road",
    "SV Road",
    "Ring Road",
    "Outer Ring Road",
    "Old Airport Road",
    "Tumkur Road",
    "Residency Road",
    "Commercial Street",
    "KR Road",
    "Malleshwaram Circle Road",
]

landmarks = [
    "City Bus Stand",
    "Railway Station",
    "Town Hall",
    "District Hospital",
    "Government School",
    "Primary Health Centre",
    "Municipal Office",
    "Market Area",
    "Vegetable Market",
    "Fish Market",
    "Community Hall",
    "Temple Junction",
    "Church Road Junction",
    "Mosque Area",
    "Post Office",
    "Police Station",
    "Taluk Office",
    "Ward Office",
    "Anganwadi Centre",
    "Public Library",
    "City Park",
    "Lake Area",
    "River Bridge",
]

areas = [
    "Ward 1",
    "Ward 5",
    "Ward 12",
    "Ward 18",
    "Ward 23",
    "Kodialbail",
    "Hampankatta",
    "Kadri",
    "Bikarnakatte",
    "Bejai",
    "Attavar",
    "Falnir",
    "Kankanady",
    "Balmatta",
    "Urwa",
    "Jayanagar",
    "Koramangala",
    "Indiranagar",
    "Whitefield",
    "HSR Layout",
    "Andheri",
    "Bandra",
    "Kurla",
    "Thane",
    "Vashi",
    "T Nagar",
    "Adyar",
    "Velachery",
    "Tambaram",
    "Porur",
    "Begumpet",
    "Secunderabad",
    "LB Nagar",
    "Dilsukhnagar",
    "Kukatpally",
]

durations = [
    "3 days",
    "a week",
    "2 weeks",
    "a month",
    "2 months",
    "6 months",
    "over a year",
    "several weeks",
    "many months",
    "the past 10 days",
]


def fill_template(template):
    return template.format(
        road=random.choice(roads),
        landmark=random.choice(landmarks),
        area=random.choice(areas),
        duration=random.choice(durations),
    )


def get_priority_score(category, text, base_min, base_max):
    score = random.uniform(base_min, base_max)
    urgency_keywords = complaint_data[category]["urgency_keywords"]
    text_lower = text.lower()
    # Boost score for urgency keywords
    keyword_hits = sum(1 for kw in urgency_keywords if kw in text_lower)
    score = min(10.0, score + keyword_hits * 0.3)
    return round(score, 2)


def score_to_label(score):
    if score <= 3:
        return "Low"
    elif score <= 5:
        return "Medium"
    elif score <= 7:
        return "High"
    else:
        return "Critical"


# --- GENERATE DATA ---
records = []
samples_per_category = 250  # ~2500 total across 10 categories

for category, data in complaint_data.items():
    templates = data["templates"]
    p_min, p_max = data["priority_range"]

    for _ in range(samples_per_category):
        template = random.choice(templates)
        complaint_text = fill_template(template)
        city, state = random.choice(city_list)
        priority_score = get_priority_score(category, complaint_text, p_min, p_max)
        priority_label = score_to_label(priority_score)

        records.append(
            {
                "complaint_text": complaint_text,
                "category": category,
                "city": city,
                "state": state,
                "priority_score": priority_score,
                "priority_label": priority_label,
            }
        )

# Shuffle
df = pd.DataFrame(records)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# --- STATS ---
print(f"Total records: {len(df)}")
print(f"\nCategory distribution:\n{df['category'].value_counts()}")
print(f"\nPriority label distribution:\n{df['priority_label'].value_counts()}")
print(f"\nSample rows:")
print(df.head(5).to_string())

# --- SAVE ---
df.to_csv("civic_complaints_india.csv", index=False)
print("\n✅ Dataset saved to civic_complaints_india.csv")
