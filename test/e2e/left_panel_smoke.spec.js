import { test, expect } from '@playwright/test';

import {
  captureSidebarScreenshot,
  expandRawTags,
  loadLeftPanelFixture,
  prepareIDPage,
  visibleInspector
} from './support/id_page.js';


test('renders a visible left-panel entity editor', async ({ page }, testInfo) => {
  await prepareIDPage(page);
  await loadLeftPanelFixture(page);

  const inspector = visibleInspector(page);

  await expect(inspector.locator('.section-feature-type .preset-list-button-wrap')).toContainText('Cafe');
  await expect(inspector.locator('.section-preset-fields .grouped-items-area')).toBeVisible();
  expect(await inspector.locator('.section-preset-fields .form-field').count()).toBeGreaterThan(0);
  await expect(inspector.locator('.section-preset-fields')).toContainText('Name');
  await expect(inspector.locator('.section-preset-fields')).toContainText('Website');

  await captureSidebarScreenshot(page, testInfo, 'left-panel-overview.png');
});


test('keeps raw tags usable in the browser', async ({ page }, testInfo) => {
  await prepareIDPage(page);
  await loadLeftPanelFixture(page);
  await expandRawTags(page);

  const inspector = visibleInspector(page);

  await expect(inspector.locator('.section-preset-fields')).toContainText('Name');
  await expect(inspector.locator('.section-raw-tag-editor .raw-tag-option')).toHaveCount(2);
  await expect(inspector.locator('.section-raw-tag-editor .tag-list')).toBeVisible();
  await expect(inspector.locator('.section-raw-tag-editor .tag-list li')).toHaveCount(5);

  await captureSidebarScreenshot(page, testInfo, 'left-panel-raw-tags.png');
});
