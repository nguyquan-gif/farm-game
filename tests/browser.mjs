import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { preview } from "vite";
const server = await preview({
  preview: { host: "127.0.0.1", port: 5181, strictPort: true },
});
const override = process.env.BROWSER_EXECUTABLE_PATH;
const browser = await chromium.launch({
  headless: true,
  executablePath: override || undefined,
  args: override
    ? [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--use-gl=disabled",
        "--use-angle=disabled",
        "--no-zygote",
      ]
    : [],
});
const errors = [];
const output = "test-results";
await mkdir(output, { recursive: true });
const checkWidth = async (page, label) => {
  const result = await page.evaluate(() => ({
    viewport: innerWidth,
    page: document.documentElement.scrollWidth,
    sheet: document.querySelector("dialog")
      ? {
          client: document.querySelector("dialog").clientWidth,
          scroll: document.querySelector("dialog").scrollWidth,
        }
      : null,
  }));
  assert.ok(
    result.page <= result.viewport,
    `${label}: horizontal overflow ${JSON.stringify(result)}`,
  );
  if (result.sheet)
    assert.ok(
      result.sheet.scroll <= result.sheet.client,
      `${label}: sheet overflow`,
    );
};
const close = async (page) =>
  page.getByRole("button", { name: "Đóng bảng", exact: true }).click();
const mission = async (page) => page.locator(".mission-card").click();
try {
  const page = await browser.newPage({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5181");
  await checkWidth(page, "welcome 360");
  await page.getByRole("button", { name: "Hái giỏ rau đầu tiên" }).click();
  await page.getByRole("button", { name: /^Hái rau/ }).click();
  await page.getByText("+3 rau · +12 xu", { exact: true }).waitFor();
  await checkWidth(page, "field 360");
  await page
    .getByRole("button", { name: /^Gieo hạt/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^Tưới/ }).click();
  await close(page);
  await mission(page);
  await page.getByRole("button", { name: /^Sửa đường ống/ }).click();
  await close(page);
  await mission(page);
  await page.getByRole("button", { name: /^Cho gà ăn/ }).click();
  assert.equal(await page.locator(".coop-hero.fed").count(), 1);
  await page.getByRole("button", { name: "Sang ngày mới, nhận trứng" }).click();
  await page.getByRole("button", { name: "Bắt đầu ngày 2" }).click();
  await mission(page);
  await page.getByRole("button", { name: /^Nhặt 2 trứng/ }).click();
  await close(page);
  await mission(page);
  await page.getByRole("button", { name: /^Giao đơn cho Linh/ }).click();
  await page.getByText(/^\+70 xu · \+1 ngọc/).waitFor();
  await page.getByRole("button", { name: /^Mở phiên chợ/ }).click();
  await page
    .getByRole("heading", { name: "Thung lũng lại rộn ràng!", exact: true })
    .waitFor();
  await checkWidth(page, "success 360");
  await page.screenshot({
    path: `${output}/chapter-complete-360.png`,
    fullPage: true,
      animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Viết tiếp câu chuyện", exact: true })
    .click();
  await close(page);
  await page.reload();
  assert.match(await page.locator(".mission-card").innerText(), /Chương 2/i);
  const save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("green_valley_save")),
  );
  assert.equal(save.milestones.market, true);
  assert.equal(save.energy, 2);
  assert.equal(save.day, 2);
  for (const width of [360, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    await page.getByRole("button", { name: "Nông trại", exact: true }).click();
    await checkWidth(page, `farm ${width}`);
    if (width === 360)
      await page.screenshot({ path: `${output}/farm-360.png`, fullPage: true, animations: "disabled" });
    if (width === 430)
      await page.screenshot({ path: `${output}/farm-430.png`, fullPage: true, animations: "disabled" });
    for (const name of ["Tiếp tế", "Nhật ký"]) {
      await page.getByRole("button", { name, exact: true }).click();
      await checkWidth(page, `${name} ${width}`);
    }
    await page.getByRole("button", { name: "Nông trại", exact: true }).click();
    for (const zone of [
      "Vườn rau:",
      "Chuồng gà:",
      "Bể nước:",
      "Nhà của bạn:",
      "Chợ của Linh:",
    ]) {
      await page.getByRole("button", { name: new RegExp("^" + zone) }).click();
      await checkWidth(page, `${zone} ${width}`);
      await close(page);
    }
  }
  await page.setViewportSize({ width: 360, height: 640 });
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await checkWidth(page, "settings compact");
  await page.getByRole("switch", { name: "Âm thanh thao tác" }).click();
  await page
    .getByRole("button", { name: "Đặt lại tiến trình", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Giữ nông trại của tôi", exact: true })
    .click();
  assert.match(await page.locator(".mission-card").innerText(), /Chương 2/i);
  await page
    .getByRole("button", { name: "Đặt lại tiến trình", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Xác nhận đặt lại tiến trình", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Một mùa mới đang đợi", exact: true })
    .waitFor();
  const reset = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("green_valley_save")),
  );
  assert.equal(reset.day, 1);
  assert.equal(reset.coins, 80);
  assert.equal(reset.energy, 5);
  assert.equal(reset.milestones.market, false);
  await close(page);
  await page.reload();
  assert.match(await page.locator(".mission-card").innerText(), /Chương 1/i);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".target-dot")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => !!document.activeElement.closest("dialog")),
    true,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").count(), 0);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  const grip = await page.locator(".sheet-grip").boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + 12);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + 130, { steps: 10 });
  await page.mouse.up();
  assert.equal(await page.locator("dialog").count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: Chapter 1 UI, sow/water/day loop, rewards, save/reload/reset, 7 widths, all zones/tabs, keyboard focus/Escape, swipe dismissal, reduced motion; no runtime errors.",
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
