from fastapi import FastAPI, Body
from typing import Dict, Any, List, Optional
import math

app = FastAPI(title="HERP AI Risk Engine v4.0 - Cognitive Intelligence")

# Enhanced Knowledge Base with Contextual Severity
KNOWLEDGE_BASE = {
    "Respiratory Stress": {
        "description": "Synergistic interaction between high ambient temperature and elevated PM2.5/Ozone levels.",
        "impact_score": 1.5,
        "advice": [
            "Immediate reduction in outdoor physical exertion.",
            "Utilize indoor air filtration systems with HEPA standards.",
            "Maintain hydration to support mucosal defenses."
        ]
    },
    "Dust/Fire Spread": {
        "description": "Critical atmospheric instability: low fuel moisture coupled with high-velocity wind vectors.",
        "impact_score": 2.0,
        "advice": [
            "Total fire ban in effect; avoid any spark-generating activity.",
            "Secure all loose infrastructure and lightweight debris.",
            "Maintain high situational awareness for rapid fire ignition."
        ]
    },
    "Solar/Heat Stress": {
        "description": "Hyperthermic risk: Extreme shortwave radiation exceeding biological thermal regulation limits.",
        "impact_score": 1.8,
        "advice": [
            "Strict limitation of direct sun exposure between 10 AM and 4 PM.",
            "Use of high-grade reflective clothing and SPF 50+ protection.",
            "Proactive cooling measures (active cooling vests or cold immersion)."
        ]
    },
    "Thunderstorm Asthma": {
        "description": "Aero-biological hazard: Pollen osmotic rupture during storm events creating inhalable sub-micron particles.",
        "impact_score": 2.5,
        "advice": [
            "Total avoidance of outdoor air during and for 3 hours post-storm.",
            "Strict adherence to asthma management plans; rescue medication readiness.",
            "Ensure indoor air filtration is operating at maximum capacity."
        ]
    },
    "Rapid Smoke Dispersion": {
        "description": "Dynamic particulate transport: Wildfire smoke plumes being redistributed by high-level atmospheric currents.",
        "impact_score": 1.6,
        "advice": [
            "Real-time monitoring of local AQI sensors is mandatory.",
            "N95/P100 respirators required for any unavoidable outdoor transit.",
            "Seal building envelopes to prevent particulate infiltration."
        ]
    },
    "Flash Flood Alert": {
        "description": "Hydro-geological threat: Precipitative volume exceeding soil infiltration capacity (saturation point reached).",
        "impact_score": 2.2,
        "advice": [
            "Immediate evacuation from low-lying areas and watershed proximity.",
            "Avoid all water-crossings; floodwaters possess extreme kinetic energy.",
            "Monitor structural integrity of foundations in sloped terrains."
        ]
    },
    "Air Stagnation": {
        "description": "Atmospheric Inversion: Subsiding air trapping pollutants in the planetary boundary layer.",
        "impact_score": 1.4,
        "advice": [
            "Mandatory emission reduction; avoid idling or wood-burning.",
            "Limit physical activity to reduce respiratory ventilation rate.",
            "Expect multi-day duration of degraded air quality conditions."
        ]
    },
    "Extreme Heat Stress": {
        "description": "Critical Wet-Bulb Temperature: Humidity levels preventing evaporative cooling (latent heat fatigue).",
        "impact_score": 2.3,
        "advice": [
            "Cease all outdoor work immediately.",
            "Access specialized cooling centers if residential AC is unavailable.",
            "Monitor core body temperature; seek medical help for confusion or cessation of sweating."
        ]
    }
}

def calculate_nonlinear_risk(base_score: float, multipliers: List[float]) -> float:
    """
    Applies non-linear scaling to risk scores based on hazard multipliers.
    A single multiplier increases risk, but multiple multipliers amplify each other.
    """
    if not multipliers:
        return base_score

    # Cumulative impact formula: 1 - product(1 - risk_i)
    # Scaled to HERP 0-100 range
    impact = 1.0
    for m in multipliers:
        # Normalize multiplier to a 0.0-0.5 impact range for the formula
        normalized_m = min(0.5, (m - 1.0) / 3.0)
        impact *= (1.0 - normalized_m)

    combined_risk = (1.0 - impact) * 100
    return min(100, max(base_score, combined_risk))

def generate_cognitive_narrative(compounds: List[str], score: float) -> str:
    """
    Generates a sophisticated, high-level intelligence briefing.
    """
    if not compounds:
        return f"Environmental status: Optimized. System is operating within nominal parameters with a safety score of {100 - score:.1f}%. No immediate interventions required."

    severity_map = {
        "Critical": "URGENT INTELLIGENCE BRIEFING",
        "Warning": "ENVIRONMENTAL ADVISORY",
        "Stable": "SITUATIONAL SUMMARY"
    }

    level = "Stable"
    if score > 80: level = "Critical"
    elif score > 50: level = "Warning"

    narrative = f"[{severity_map[level]}] \n"
    narrative += f"Our cognitive engine has identified {len(compounds)} non-linear environmental hazard correlations. "
    narrative += "Current atmospheric and terrestrial data indicate a significant deviation from baseline safety protocols. "

    for hazard in compounds:
        details = KNOWLEDGE_BASE.get(hazard)
        if details:
            narrative += f"\n- {hazard.upper()}: {details['description']}"

    narrative += f"\n\nStrategic recommendation: Deploy proactive safety measures immediately. Overall System Risk Index is currently {score:.1f}/100."
    return narrative

@app.get("/health")
async def health():
    return {"status": "ok", "service": "risk_engine_py", "version": "4.0.0", "mode": "Cognitive Intelligence"}

@app.post("/analyze")
async def analyze_risk(data: Dict[str, Any] = Body(...)):
    weather = data.get("weather", {})
    air_quality = data.get("airQuality", {})
    pollen = data.get("pollen", {})
    soil = data.get("soil", {})
    uv_index = data.get("uvIndex", 0)
    flood = data.get("floodRisk", {})

    compounds = []
    multipliers = []

    # Detection Logic
    if weather.get("temp", 0) > 30 and air_quality.get("aqi", 0) > 100:
        compounds.append("Respiratory Stress")
        multipliers.append(KNOWLEDGE_BASE["Respiratory Stress"]["impact_score"])

    if weather.get("windSpeed", 0) > 40 and soil.get("moisture", 100) < 20:
        compounds.append("Dust/Fire Spread")
        multipliers.append(KNOWLEDGE_BASE["Dust/Fire Spread"]["impact_score"])

    if uv_index > 8 and weather.get("temp", 0) > 32:
        compounds.append("Solar/Heat Stress")
        multipliers.append(KNOWLEDGE_BASE["Solar/Heat Stress"]["impact_score"])

    if weather.get("condition") == "Thunderstorm" and (pollen.get("grass", 0) > 3 or pollen.get("tree", 0) > 3):
        compounds.append("Thunderstorm Asthma")
        multipliers.append(KNOWLEDGE_BASE["Thunderstorm Asthma"]["impact_score"])

    if flood.get("score", 0) > 60 and soil.get("moisture", 0) > 75:
        compounds.append("Flash Flood Alert")
        multipliers.append(KNOWLEDGE_BASE["Flash Flood Alert"]["impact_score"])

    if weather.get("windSpeed", 0) < 5 and air_quality.get("aqi", 0) > 120:
        compounds.append("Air Stagnation")
        multipliers.append(KNOWLEDGE_BASE["Air Stagnation"]["impact_score"])

    if weather.get("temp", 0) > 33 and weather.get("humidity", 0) > 70:
        compounds.append("Extreme Heat Stress")
        multipliers.append(KNOWLEDGE_BASE["Extreme Heat Stress"]["impact_score"])

    # Calculate State-of-the-art Risk Score
    base_risk = data.get("score", 0)
    final_score = calculate_nonlinear_risk(base_risk, multipliers)

    hazard_level = "Stable"
    if final_score > 75: hazard_level = "Critical"
    elif final_score > 40: hazard_level = "Warning"

    narratives = []
    for h in compounds:
        details = KNOWLEDGE_BASE.get(h)
        narratives.append({
            "hazard": h,
            "description": details["description"],
            "recommendations": details["advice"],
            "impact_multiplier": details["impact_score"]
        })

    cognitive_narrative = generate_cognitive_narrative(compounds, final_score)

    # Trend prediction based on rate of change (simulated)
    trend = "Stable"
    if final_score > 60 or weather.get("windSpeed", 0) > 50:
        trend = "Rising (Rapid)"
    elif final_score < 20:
        trend = "Falling"

    return {
        "compound_hazards": compounds,
        "hazard_level": hazard_level,
        "risk_score": final_score,
        "narratives": narratives,
        "briefing": cognitive_narrative,
        "trend": trend,
        "engine": "Python Risk Engine v4.0 (Cognitive)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
