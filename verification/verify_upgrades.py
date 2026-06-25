from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 1440})

        try:
            # Navigate to the dashboard
            print("Navigating to dashboard...")
            page.goto("http://localhost:5174", wait_until="load")

            # Wait for the assessment to load
            print("Waiting for assessment data...")
            # We expect the risk score to change from -- to a number
            page.wait_for_selector("text=/\\d+/", timeout=30000)

            # Check for the new Satellite panel
            print("Checking for Satellite panel...")
            expect(page.get_by_role("heading", name="Satellite")).to_be_visible()

            # Check for NDVI in the Soil panel
            print("Checking for NDVI score...")
            expect(page.get_by_text("NDVI:", exact=False).first).to_be_visible()

            # Click the layers control and check for Satellite layer
            print("Checking Map Layers...")
            page.hover(".leaflet-control-layers")
            expect(page.get_by_text("Satellite", exact=True).first).to_be_visible()

            # Take a screenshot of the updated dashboard
            print("Capturing screenshot...")
            page.screenshot(path="verification/upgraded_dashboard.png", full_page=True)
            print("Screenshot saved to verification/upgraded_dashboard.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/failed_upgrade.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
