import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');


function repoPath(...parts) {
  return path.join(repoRoot, ...parts);
}


function fulfillJSON(route, data) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(data)
  });
}


export async function installAppAssetRoutes(page) {
  await page.route('**/dist/data/imagery.min.json', route => fulfillJSON(route, []));
  await page.route('**/dist/data/keepRight.min.json', route => fulfillJSON(route, {}));
  await page.route('**/dist/data/qa_data.min.json', route => fulfillJSON(route, { osmose: { icons: {} } }));

  await page.route('https://cdn.jsdelivr.net/npm/@openstreetmap/id-tagging-schema@*/package.json', route => {
    return route.fulfill({ path: repoPath('node_modules', '@openstreetmap', 'id-tagging-schema', 'package.json') });
  });

  await page.route('https://cdn.jsdelivr.net/npm/@openstreetmap/id-tagging-schema@*/dist/*.json', route => {
    const url = new URL(route.request().url());
    const filename = path.basename(url.pathname);
    return route.fulfill({ path: repoPath('node_modules', '@openstreetmap', 'id-tagging-schema', 'dist', filename) });
  });

  await page.route('https://cdn.jsdelivr.net/npm/osm-community-index@*/dist/json/*.json', route => {
    const url = new URL(route.request().url());
    const filename = path.basename(url.pathname);
    return route.fulfill({ path: repoPath('node_modules', 'osm-community-index', 'dist', 'json', filename) });
  });

  await page.route('https://cdn.jsdelivr.net/npm/wmf-sitematrix@*/data/wikipedia.min.json', route => {
    return fulfillJSON(route, []);
  });
}
