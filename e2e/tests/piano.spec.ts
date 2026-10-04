import { test, expect } from '@playwright/test';

test('Piano responsiveness, glitches, and full-screen animations', async ({ page }) => {
  // 1. Go to the app
  await page.goto('http://localhost:3000');

  // Wait for the piano to render
  const pianoRoot = page.locator('.piano-fs-root');
  await expect(pianoRoot).toBeVisible();

  // 2. Test Full-Screen Animation
  const fullscreenBtn = page.getByRole('button', { name: 'Full screen' });
  await expect(fullscreenBtn).toBeVisible();

  await fullscreenBtn.click();
  // Expect it to change to "Exit full screen" and have the piano-enter animation class
  await expect(page.getByRole('button', { name: 'Exit full screen' })).toBeVisible();
  // Verify it has the fullscreen specific styling
  await expect(pianoRoot).toHaveClass(/h-screen/);

  // 3. Test Black Key Click Stability (Glitch check)
  // We locate a black key. Black keys contain text like C♯, D♯ etc.
  const blackKeyHitArea = page.locator('div.group.absolute').first();
  await expect(blackKeyHitArea).toBeVisible();

  const box = await blackKeyHitArea.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    // Dispatch pointerdown directly to the element to bypass headless mouse quirks
    await blackKeyHitArea.dispatchEvent('pointerdown');

    // The key visual element (inner div) should now have the 'translate-y-1' class applied
    const innerVisual = blackKeyHitArea.locator('div').first();
    await expect(innerVisual).toHaveClass(/(?<!:)translate-y-1/);

    // Wait a brief moment to ensure no glitch/flicker happens while holding
    await page.waitForTimeout(200);
    // Still pressed
    await expect(innerVisual).toHaveClass(/(?<!:)translate-y-1/);

    // Release
    await blackKeyHitArea.dispatchEvent('pointerup');
    // Verify it is released
    await expect(innerVisual).not.toHaveClass(/(?<!:)translate-y-1/);
  }

  // 4. Test responsiveness (latency check)
  // Check white key click
  const whiteKeyHitArea = page.locator('div.group.relative').first();
  const whiteVisual = whiteKeyHitArea.locator('div').first();

  const whiteBox = await whiteKeyHitArea.boundingBox();
  if (whiteBox) {
    // Simulating a fast tap using pointer events
    await whiteKeyHitArea.dispatchEvent('pointerdown');
    await expect(whiteVisual).toHaveClass(/(?<!:)translate-y-1/);
    await whiteKeyHitArea.dispatchEvent('pointerup');
    await expect(whiteVisual).not.toHaveClass(/(?<!:)translate-y-1/);
  }

  // 5. Exit Full Screen
  await page.getByRole('button', { name: 'Exit full screen' }).click();
  await expect(page.getByRole('button', { name: 'Full screen' })).toBeVisible();
  await expect(pianoRoot).not.toHaveClass(/h-screen/);
});
