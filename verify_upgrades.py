from playwright.sync_api import Page, expect, sync_playwright
import time

def test_herp_dashboard_upgrades(page: Page):
    # 1. Navigate to the dashboard
    page.goto("http://localhost:3000")

    # 2. Wait for assessment to load
    page.wait_for_selector("text=Environmental Risk")

    # 3. Verify Community Reporting - Open Modal
    page.get_by_role("button", name="Report Hazard").click()
    expect(page.get_by_role("heading", name="Report Local Hazard")).to_be_visible()

    # 4. Fill and submit a report
    page.get_by_label("Description").fill("Localized smoke from nearby fire")
    page.get_by_role("button", name="Submit Report").click()

    # Verify modal closes
    expect(page.get_by_role("heading", name="Report Local Hazard")).not_to_be_visible()

    # 5. Verify Notification Center
    # Click bell icon
    page.get_by_role("button").filter(has=page.locator("svg.lucide-bell")).click()
    expect(page.get_by_role("heading", name="Notifications")).to_be_visible()

    # 6. Take screenshot of the upgraded dashboard
    page.screenshot(path="verification/upgraded_herp_dashboard.png", full_page=True)
    print("Screenshot saved to verification/upgraded_herp_dashboard.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_herp_dashboard_upgrades(page)
        finally:
            browser.close()
