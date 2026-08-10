const puppeteer = require("puppeteer");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function clickText(page, text) {
  const h = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll("button, a")];
    return els.find((e) => e.textContent.trim().toLowerCase().includes(t.toLowerCase()));
  }, text);
  const el = h.asElement(); if (el) { await el.click(); return true; } return false;
}
async function clickAria(page, label) {
  return page.evaluate((l) => { const b=[...document.querySelectorAll('button')].find(e=>e.getAttribute('aria-label')===l); if(b){b.click(); return true;} return false; }, label);
}
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERR: " + e.message));
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await sleep(3800);
  await clickText(page, "show me what you made");
  await sleep(2600);

  // cat close-up (shading + shadow)
  const b0 = await page.evaluate(() => { const b=document.querySelector('button[aria-label="a little cat"]'); if(!b)return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y)}; });
  if (b0) await page.screenshot({ path: "cat-new.png", clip: { x: Math.max(0,b0.x-30), y: Math.max(0,b0.y-46), width: 175, height: 155 } });

  // go to reveal (The gift), shake open
  await clickAria(page, "The gift");
  await sleep(1400);
  for (let i=0;i<4;i++){ await clickAria(page,"Shake the gift open"); await sleep(700); }
  await sleep(1600);
  await page.screenshot({ path: "cake-whole.png" });
  const hasCake = await page.evaluate(() => !!document.querySelector('button[aria-label="cut the cake"]'));
  console.log("cake present:", hasCake);

  // cut the cake
  await clickAria(page, "cut the cake");
  await sleep(650);
  await page.screenshot({ path: "cake-cut.png" });

  // did it advance? (cut calls next() after ~1.4s) — check the cake is gone / scene changed
  await sleep(1600);
  const advanced = await page.evaluate(() => !document.querySelector('button[aria-label="cut the cake"]'));
  console.log("advanced after cut:", advanced);
  console.log("ERRORS:", errs.length ? errs.join("\n") : "none");
  await browser.close();
})();
