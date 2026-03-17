import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to dashboard...")
        await page.goto("http://localhost:3009/dashboard")

        print("Waiting for dashboard to load...")
        # Wait for either alert banner or stats row to be visible
        await page.wait_for_selector('h1:has-text("Good morning")', state="visible", timeout=10000)

        # Take a screenshot
        await page.screenshot(path="/home/jules/verification/dashboard_alert_fixed2.png", full_page=True)
        print("Saved screenshot to /home/jules/verification/dashboard_alert_fixed2.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
