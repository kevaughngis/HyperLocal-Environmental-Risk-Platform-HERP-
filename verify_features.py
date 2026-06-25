import asyncio
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await page.goto("http://localhost:3000", timeout=60000)
            await page.wait_for_selector("text=Environmental Risk", timeout=30000)
            # Wait for data to load
            await asyncio.sleep(5)
            await page.screenshot(path="verification/features_final.png", full_page=True)
            print("Screenshot saved to verification/features_final.png")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
