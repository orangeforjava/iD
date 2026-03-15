import { test, expect } from '@playwright/test';

import { installAppAssetRoutes } from './support/asset_routes.js';
import { visibleInspector, captureSidebarScreenshot } from './support/id_page.js';


test('investigates the provided hash URL left-panel tags section', async ({ page }, testInfo) => {
  test.setTimeout(120000);

  await installAppAssetRoutes(page);
  await page.addInitScript(() => {
    window.localStorage.setItem('sawSplash', 'true');
    window.localStorage.setItem('sawPrivacyVersion', '20201202');
  });

  await page.goto('/#disable_features=boundaries&map=17.60/40.11490/116.66732&background=Bing&id=w1036046103');
  await page.waitForFunction(() => window.iD && window.context);

  const inspector = visibleInspector(page);
  await inspector.locator('.section-preset-fields .form-field').first().waitFor({ timeout: 90000 });
  await inspector.locator('.section-raw-tag-editor').waitFor({ timeout: 90000 });

  expect(await inspector.locator('.section-preset-fields .form-field').count()).toBeGreaterThan(0);
  await expect(inspector.locator('.section-preset-fields')).toContainText('Road Number');
  await expect(inspector.locator('.section-preset-fields')).toContainText('Bike Lanes');

  const toggle = inspector.locator('.section-raw-tag-editor summary.hide-toggle-raw_tag_editor');
  await toggle.click();

  const tagList = inspector.locator('.section-raw-tag-editor .tag-list');
  await expect(tagList).toBeVisible({ timeout: 90000 });

  await expect(inspector.locator('.section-raw-tag-editor .raw-tag-option')).toHaveCount(2, { timeout: 90000 });
  await expect(inspector.locator('.section-raw-tag-editor .raw-tag-option.selected')).toHaveCount(1, { timeout: 90000 });

  await captureSidebarScreenshot(page, testInfo, 'hash-url-tags-panel.png');
});
