from fastapi import FastAPI, Body
from typing import Dict, Any, List

app = FastAPI(title="HERP AI Risk Engine")

KNOWLEDGE_BASE = {
    "Respiratory Stress": {
        "description": "High temperature and poor air quality lead to increased ozone at ground level, stressing the lungs and heart.",
        "advice": [
            "Limit outdoor activities to early morning or late evening.",
            "Stay in air-conditioned environments.",
            "Keep windows closed and use HEPA air purifiers."
        ]
    },
    "Dust/Fire Spread": {
        "description": "Strong winds on dry soil can create dust storms and accelerate the spread of any active fires.",
        "advice": [
            "Secure loose outdoor objects.",
            "Avoid any activities that could cause sparks (e.g., outdoor welding, burning debris).",
            "Be prepared for rapid evacuation if smoke is visible."
        ]
    },
    "Solar/Heat Stress": {
        "description": "Intense UV radiation combined with high heat significantly increases the risk of skin damage and heat exhaustion.",
        "advice": [
            "Wear protective clothing, wide-brimmed hats, and UV-blocking sunglasses.",
            "Apply SPF 50+ sunscreen every 2 hours.",
            "Drink at least 500ml of water per hour."
        ]
    },
    "Thunderstorm Asthma": {
        "description": "Moisture from storms can cause pollen grains to burst into tiny particles that penetrate deeper into the lungs.",
        "advice": [
            "Stay indoors during the storm and for 2 hours following.",
            "Keep all windows and doors shut.",
            "Ensure rescue inhalers (if prescribed) are easily accessible."
        ]
    },
    "Rapid Smoke Dispersion": {
        "description": "High winds are moving wildfire smoke unpredictably, causing air quality to drop suddenly.",
        "advice": [
            "Monitor real-time AQI sensors frequently.",
            "Use N95 or P100 masks if you must go outdoors.",
            "Switch car air conditioning to recirculation mode."
        ]
    },
    "Flash Flood Alert": {
        "description": "Saturated soil cannot absorb more rain, leading to immediate surface runoff and rising water levels.",
        "advice": [
            "Do not drive through flooded roads (Turn Around, Don't Drown).",
            "Move valuables to higher floors.",
            "Monitor local stream gauges and emergency broadcasts."
        ]
    },
    "Air Stagnation": {
        "description": "Lack of wind is trapping pollutants near the ground, leading to dangerous build-up of smog.",
        "advice": [
            "Avoid using wood-burning stoves or fireplaces.",
            "Carpool or use public transit to reduce emissions.",
            "Sensitive groups should avoid all outdoor exertion."
        ]
    },
    "Extreme Heat Stress": {
        "description": "High humidity prevents sweat from evaporating, making it impossible for the body to cool itself effectively.",
        "advice": [
            "Take frequent cool showers or baths.",
            "Eat small, light meals frequently.",
            "Check on elderly neighbors and vulnerable individuals."
        ]
    }
}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "risk_engine_py", "version": "3.0.0"}

def generate_enhanced_narrative(compounds: List[str]) -> List[Dict[str, Any]]:
    narratives = []
    for hazard in compounds:
        details = KNOWLEDGE_BASE.get(hazard, {
            "description": "Specific environmental hazard detected.",
            "advice": ["Exercise caution and follow local official guidance."]
        })
        narratives.append({
            "hazard": hazard,
            "description": details["description"],
            "recommendations": details["advice"]
        })
    return narratives

@app.post("/analyze")
async def analyze_risk(data: Dict[str, Any] = Body(...)):
    weather = data.get("weather", {})
    air_quality = data.get("airQuality", {})
    pollen = data.get("pollen", {})
    soil = data.get("soil", {})
    uv_index = data.get("uvIndex", 0)

    compounds = []

    if weather.get("temp", 0) > 30 and air_quality.get("aqi", 0) > 100:
        compounds.append("Respiratory Stress")

    if weather.get("windSpeed", 0) > 40 and soil.get("moisture", 100) < 20:
        compounds.append("Dust/Fire Spread")

    if uv_index > 8 and weather.get("temp", 0) > 32:
        compounds.append("Solar/Heat Stress")

    if weather.get("condition") == "Thunderstorm" and (pollen.get("grass", 0) > 3 or pollen.get("tree", 0) > 3):
        compounds.append("Thunderstorm Asthma")

    wildfire = data.get("wildfire", {})
    if wildfire.get("smokeConcentration") == "High" and weather.get("windSpeed", 0) > 30:
        compounds.append("Rapid Smoke Dispersion")

    flood = data.get("floodRisk", {})
    if flood.get("score", 0) > 60 and soil.get("moisture", 0) > 75:
        compounds.append("Flash Flood Alert")

    if weather.get("windSpeed", 0) < 5 and air_quality.get("aqi", 0) > 120:
        compounds.append("Air Stagnation")

    if weather.get("temp", 0) > 33 and weather.get("humidity", 0) > 70:
        compounds.append("Extreme Heat Stress")

    hazard_level = "Stable"
    if len(compounds) >= 3:
        hazard_level = "Critical"
    elif len(compounds) >= 1:
        hazard_level = "Warning"

    narratives = generate_enhanced_narrative(compounds)

    # Trend analysis
    trend = "Stable"
    if len(compounds) > 2 or weather.get("windSpeed", 0) > 45:
        trend = "Rising"
    elif len(compounds) == 0 and weather.get("temp", 0) < 25:
        trend = "Falling"

    return {
        "compound_hazards": compounds,
        "hazard_level": hazard_level,
        "narratives": narratives,
        "trend": trend,
        "engine": "Python Risk Engine v3.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
