import { expect } from '@playwright/test';

import { installAppAssetRoutes } from './asset_routes.js';


export async function prepareIDPage(page) {
  await installAppAssetRoutes(page);

  await page.addInitScript(() => {
    window.localStorage.setItem('sawSplash', 'true');
    window.localStorage.setItem('sawPrivacyVersion', '20201202');
  });

  await page.goto('/#background=none');
  await page.waitForFunction(() => window.iD && window.context);
  await page.locator('.sidebar').waitFor();
  await expect(page.locator('.sidebar .inspector-wrap').first()).toBeAttached();
}


export async function loadLeftPanelFixture(page) {
  await page.evaluate(() => {
    const context = window.context;
    const iD = window.iD;

    const entity = iD.osmNode({
      id: 'n-1',
      loc: [0, 0],
      tags: {
        amenity: 'cafe',
        name: 'Browser Test Cafe',
        website: 'https://example.com',
        wheelchair: 'yes'
      }
    });

    context.history().merge([entity]);
    context.enter(iD.modeSelect(context, [entity.id]));
  });

  const inspector = visibleInspector(page);
  await inspector.locator('.entity-editor').waitFor();
  await inspector.locator('.section-feature-type .preset-list-button-wrap').waitFor();
  await inspector.locator('.section-preset-fields').waitFor();
}


export function visibleInspector(page) {
  return page.locator('.sidebar .inspector-wrap:not(.inspector-hidden)').first();
}


export async function expandRawTags(page) {
  const inspector = visibleInspector(page);
  const rawTagToggle = inspector.locator('.section-raw-tag-editor summary.hide-toggle-raw_tag_editor');
  const rawTagDetails = inspector.locator('.section-raw-tag-editor details.disclosure-wrap-raw_tag_editor');
  await rawTagToggle.waitFor();

  const isExpanded = await rawTagDetails.evaluate(node => node.open);
  if (!isExpanded) {
    await rawTagToggle.click();
  }

  await inspector.locator('.section-raw-tag-editor .tag-list').waitFor();
}


export async function captureSidebarScreenshot(page, testInfo, name) {
  const sidebar = visibleInspector(page);
  await expect(sidebar).toBeVisible();

  const filePath = testInfo.outputPath(name);
  await sidebar.screenshot({ path: filePath });
  await testInfo.attach(name, {
    path: filePath,
    contentType: 'image/png'
  });
}
