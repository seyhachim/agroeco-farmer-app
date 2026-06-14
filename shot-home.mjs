import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
await page.goto("http://localhost:3001/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "home-screenshot.png" });
await browser.close();
console.log("done", errors);
