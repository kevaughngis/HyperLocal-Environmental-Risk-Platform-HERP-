from playwright.sync_api import sync_playwright, expect
import time

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the frontend
        try:
            page.goto("http://localhost:5173") # Default Vite port

            # Wait for data to load
            page.wait_for_selector("text=Environmental Risk")

            # Take a screenshot
            page.screenshot(path="verification/integrated_dashboard.png", full_page=True)
            print("Screenshot saved to verification/integrated_dashboard.png")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
