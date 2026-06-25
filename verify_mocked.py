from playwright.sync_api import Page, expect, sync_playwright
import json

def test_herp_dashboard_upgrades_mocked(page: Page):
    # Mock the Assessment API
    page.route("**/api/v1/assessment*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps({
            "riskScore": 75,
            "location": {"name": "Ottawa", "lat": 45.4215, "lon": -75.6972},
            "weather": {"temp": 34, "condition": "Sunny", "windSpeed": 12, "humidity": 75},
            "airQuality": {"aqi": 110, "pm25": 45},
            "uvIndex": 9,
            "pollen": {"tree": 5, "grass": 2, "weed": 1},
            "floodRisk": {"level": "Moderate", "score": 45},
            "soil": {"moisture": 80, "temperature": 22},
            "satellite": {"ndvi": 0.75, "lastPass": "2023-10-27T10:00:00Z", "cloudCover": 10},
            "wildfire": {"status": "Clear", "details": "No immediate threats"},
            "compliance": {"status": "Warning", "reminders": ["MANDATORY: Activate dust suppression"]},
            "aiRisk": {
                "hazards": ["Extreme Heat Stress"],
                "level": "Warning",
                "explanation": "Dangerous heat + humidity combo detected.",
                "trend": "Rising"
            },
            "recommendations": ["Stay hydrated", "Seek shade"]
        })
    ))

    # Mock the Reports API
    page.route("**/api/v1/reports*", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body=json.dumps([
            {
                "id": "1",
                "latitude": 45.425,
                "longitude": -75.7,
                "type": "Flooding",
                "description": "Large puddle blocking sidewalk",
                "createdAt": "2023-10-27T12:00:00Z"
            }
        ])
    ))

    # 1. Navigate to the dashboard (using the served dist)
    page.goto("http://localhost:3000")

    # 2. Wait for UI to render
    page.wait_for_selector("text=Environmental Risk")

    # 3. Verify Community Reporting button exists
    expect(page.get_by_role("button", name="Report Hazard")).to_be_visible()

    # 4. Verify Notification Bell and Badge
    expect(page.locator("svg.lucide-bell")).to_be_visible()
    # Badge should be visible since we have critical/warning notifications (1 risk + 1 compliance)
    expect(page.get_by_role("button", name="2")).to_be_visible()

    # 5. Verify Trend Indicator
    expect(page.get_by_text("Trend:")).to_be_visible()
    expect(page.get_by_text("Rising")).to_be_visible()

    # 6. Open Modal to show it works
    page.get_by_role("button", name="Report Hazard").click()
    expect(page.get_by_role("heading", name="Report Local Hazard")).to_be_visible()

    # 7. Take screenshot
    page.screenshot(path="verification/upgraded_mocked_dashboard.png", full_page=True)
    print("Screenshot saved to verification/upgraded_mocked_dashboard.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_herp_dashboard_upgrades_mocked(page)
        finally:
            browser.close()
