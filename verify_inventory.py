import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating to inventory...")
        await page.goto("http://localhost:3010/dashboard/inventory")

        print("Waiting for inventory to load...")
        await page.wait_for_selector('button:has-text("Reserve for event")', state="visible", timeout=10000)

        print("Clicking Reserve for event on the first available item...")
        await page.click('button:has-text("Reserve for event")')

        await page.wait_for_selector('input[placeholder="Search events by client name..."]', state="visible")

        # Take a screenshot
        await page.screenshot(path="/home/jules/verification/inventory_modal_1.png", full_page=True)

        print("Typing in search to find an event...")
        await page.fill('input[placeholder="Search events by client name..."]', "Isabel")

        await page.wait_for_selector('text=Isabel', state="visible")
        # Find first event result (which is a button inside the modal that's not 'Change' or 'Cancel')
        await page.click('.w-full.text-left.p-3')

        # Wait for checking availability to finish
        try:
            await page.wait_for_selector('text=Checking availability...', state="hidden", timeout=5000)
        except:
            pass

        # Take another screenshot
        await page.screenshot(path="/home/jules/verification/inventory_modal_2.png", full_page=True)
        print("Saved screenshot to /home/jules/verification/inventory_modal_2.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
