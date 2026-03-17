import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to inventory...")
        await page.goto("http://localhost:3011/dashboard/inventory")

        print("Waiting for inventory to load...")
        await page.wait_for_selector('button:has-text("Reserve for event")', state="visible", timeout=10000)

        print("Clicking Reserve for event on the first available item...")
        await page.click('button:has-text("Reserve for event")')

        await page.wait_for_selector('input[placeholder="Search events by client name..."]', state="visible")

        print("Typing in search to find an event...")
        await page.fill('input[placeholder="Search events by client name..."]', "Isabel")

        # Wait for the results container and the specific result to appear
        await page.wait_for_selector('div.border-rose-200.rounded-xl.overflow-hidden', state="visible")

        print("Waiting for search results...")
        await asyncio.sleep(2) # Give it a moment to render

        await page.screenshot(path="/home/jules/verification/inventory_modal_1.png", full_page=True)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
