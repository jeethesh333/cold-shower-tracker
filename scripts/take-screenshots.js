import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCREENSHOTS_DIR = join(__dirname, '../public/screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function takeScreenshots() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: null
  });

  try {
    // Desktop screenshot
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 800 });
    await desktopPage.goto('http://localhost:3001');
    await new Promise(r => setTimeout(r, 2000)); // Wait for animations
    await desktopPage.screenshot({
      path: join(SCREENSHOTS_DIR, 'desktop.png'),
      fullPage: false
    });

    // Mobile screenshot
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ 
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true
    });
    await mobilePage.goto('http://localhost:3001');
    await new Promise(r => setTimeout(r, 2000)); // Wait for animations
    await mobilePage.screenshot({
      path: join(SCREENSHOTS_DIR, 'mobile.png'),
      fullPage: false
    });

    console.log('Screenshots taken successfully!');
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots().catch(console.error); 