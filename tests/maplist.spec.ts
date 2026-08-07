import { test, expect } from '@playwright/test';
import { Drawer } from './page/mapcontroller';
import { TaxonList } from './page/taxonlistcontroller';

test.describe('Map list', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/#/');
    });
    test('should load map list', async ({ page }) => {
        await page.locator('.mapC').isVisible();
        await new TaxonList(page).exists();
    });
    test('test mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(1000);
        await page.getByTestId('Mobile map list widget').isVisible();
        await new TaxonList(page).exists();
        const toggle = await page.getByTestId('Mobile map list toggle');
        await toggle.click();
        await page.locator('.mapC').isVisible();
        await toggle.click();
        await new TaxonList(page).exists();
    });

    [
        'useGeoLocation',
        'drawPolygon',
        'drawRect',
        'drawMarker',
        'drawLine',
        'drawCircle',
    ].forEach((draw_function_name) => {
        test(`Draw a geometry with ${draw_function_name}`, async ({ page }) => {
            const map = await page.getByTestId('Map container');
            const drawer = new Drawer(page, map);
            await drawer[draw_function_name]();
            await new TaxonList(page).exists();
        });
    });
});
