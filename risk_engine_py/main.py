from fastapi import FastAPI, Body
from typing import Dict, Any, List

app = FastAPI(title="HERP AI Risk Engine")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "risk_engine_py"}

def generate_explanation(data: Dict[str, Any], compounds: List[str]) -> str:
    if not compounds:
        return "Environmental conditions are within normal parameters. No significant compound hazards detected."

    explanation = f"Detected {len(compounds)} significant compound hazard(s). "
    explanation += " ".join(compounds)

    if data.get("score", 0) > 70:
        explanation += " Overall risk is critically high; emergency management protocols should be considered."
    elif data.get("score", 0) > 40:
        explanation += " Precautionary measures are advised for outdoor operations."

    return explanation

@app.post("/analyze")
async def analyze_risk(data: Dict[str, Any] = Body(...)):
    """
    Analyzes compound hazards and generates natural language explanations.
    """
    weather = data.get("weather", {})
    air_quality = data.get("airQuality", {})
    pollen = data.get("pollen", {})
    soil = data.get("soil", {})
    uv_index = data.get("uvIndex", 0)

    compounds = []

    # 1. Heat + Poor Air Quality (Respiratory Stress)
    if weather.get("temp", 0) > 30 and air_quality.get("aqi", 0) > 100:
        compounds.append("Dangerous heat + air quality combo: High respiratory and cardiovascular stress.")

    # 2. High Wind + Low Soil Moisture (Dust/Fire Risk)
    if weather.get("windSpeed", 0) > 40 and soil.get("moisture", 100) < 20:
        compounds.append("High dust/wildfire spread risk: Strong winds combined with extremely dry soil.")

    # 3. High UV + High Temp (Solar/Heat Stress)
    if uv_index > 8 and weather.get("temp", 0) > 32:
        compounds.append("Extreme heat exhaustion risk: Intense solar radiation and high ambient temperature.")

    # 4. Thunderstorm + High Pollen (Thunderstorm Asthma)
    if weather.get("condition") == "Thunderstorm" and (pollen.get("grass", 0) > 3 or pollen.get("tree", 0) > 3):
        compounds.append("Thunderstorm Asthma risk: Moisture can burst pollen grains, causing severe respiratory reactions.")

    # 5. Low Visibility (Smoke/Fog) + High Wind
    wildfire = data.get("wildfire", {})
    if wildfire.get("smokeConcentration") == "High" and weather.get("windSpeed", 0) > 30:
        compounds.append("Rapid smoke dispersion: Wildfire smoke levels may fluctuate rapidly due to high winds.")

    # 6. Flash Flood Risk (Heavy Rain + Saturated Soil)
    flood = data.get("floodRisk", {})
    if flood.get("score", 0) > 60 and soil.get("moisture", 0) > 75:
        compounds.append("Flash flood alert: Saturated soil combined with heavy precipitation significantly increases runoff.")

    hazard_level = "Stable"
    if len(compounds) >= 3:
        hazard_level = "Critical"
    elif len(compounds) >= 1:
        hazard_level = "Warning"

    explanation = generate_explanation(data, compounds)

    return {
        "compound_hazards": compounds,
        "hazard_level": hazard_level,
        "explanation": explanation,
        "engine": "Python Risk Engine v2.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
