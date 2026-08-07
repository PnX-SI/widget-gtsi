import { test, expect } from '@playwright/test';
import { Drawer } from './page/mapcontroller';
import { TaxonList } from './page/taxonlistcontroller';
async function drawGeometry(page) {
    const map = await page
        .getByTestId('Parameters list div')
        .getByTestId('Map container');

    const drawer = new Drawer(page, map);
    await drawer.drawPolygon();
}

async function waitForLoading(page) {
    await page.getByText('Chargement en cours');
}

async function checkForParameterChange(page, key, value) {
    const currentUrl = await page.url();
    await expect(currentUrl).toContain(`${key}=${value}`);
}

test.describe('Form parameters testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/config?widgetType=mapList&lang=fr');
    });

    test('enable/disable filter', async ({ page }) => {
        const checkBox = await page.getByTestId(
            'Show/Hide results filters checkbox'
        );
        const searchForm = await page.getByTestId('Search taxon input form');
        const searchButton = await page.getByTestId('Search taxon button');

        await checkBox.uncheck();
        await expect(searchForm).toBeHidden();
        await checkBox.check();
        await expect(searchButton).toBeVisible();
        await searchButton.click();
        await expect(searchForm).toBeVisible();
    });

    test('Search zone editable', async ({ page }) => {
        const checkBox = await page.getByTestId(
            'Show/Hide drawing tools checkbox'
        );

        await checkBox.uncheck();
        const drawPolygonLink = page
            .getByTestId('Preview area')
            .getByRole('link', { name: 'Draw a rectangle' });
        await expect(drawPolygonLink).toBeHidden();
        await checkBox.check();
        await expect(drawPolygonLink).toBeVisible();
    });

    test('BufferSize parameter', async ({ page }) => {
        await page.getByTestId('Buffer selection form').fill('10');
        await page.waitForTimeout(500);
        checkForParameterChange(page, 'buffer', 10);
    });

    test('Change date parameter', async ({ page }) => {
        await page
            .getByRole('textbox', { name: /Date min/ })
            .fill('2025-07-17');
        await page
            .getByRole('textbox', { name: /Date max/ })
            .fill('2025-07-19');
        waitForLoading(page);
        await page.waitForTimeout(500);
        checkForParameterChange(page, 'dateMin', '2025-07-17');
        checkForParameterChange(page, 'dateMax', '2025-07-19');
    });

    test('Select taxon class', async ({ page }) => {
        const buttons = [
            { name: 'Button to select Mammalia', param: 'Mammalia' },
            { name: 'Button to select Insecta', param: 'Insecta' },
        ];

        for (const button of buttons) {
            await page.getByRole('button', { name: button.name }).click();
            await checkForParameterChange(page, 'class', button.param);
        }
    });

    test('Set GeoJSON', async ({ page }) => {
        const urlGeoJSON = 'http://test.com/fichier.geojson';
        await page.getByTestId('GeoJSON form').fill(urlGeoJSON);
        await page.waitForTimeout(200);
        await checkForParameterChange(page, 'sourceGeometry', urlGeoJSON);
    });

    test('Change url to taxon detail', async ({ page }) => {
        const urlTaxonDetail = 'http://test.com/species/{taxonID}';
        await page.getByTestId('Custom detail page form').fill(urlTaxonDetail);
        await page.waitForTimeout(200);
        await checkForParameterChange(page, 'customDetailPage', urlTaxonDetail);
    });

    test('Change display mode for the taxon list', async ({ page }) => {
        await drawGeometry(page);
        await page.waitForTimeout(10000);
        const modeSelect = await page.getByTestId('Mode select form');

        // Test gallery mode
        await modeSelect.selectOption('gallery');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'mode', 'gallery');

        // Test detailed list mode
        await modeSelect.selectOption('detailedList');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'mode', 'detailedList');
    });

    test('Toggle taxon list mode switch', async ({ page }) => {
        const checkBox = await page.getByTestId(
            'Show/Hide taxon list mode switch'
        );

        // Enable switch mode
        await checkBox.check();
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'switchModeAvailable', 'true');

        // Disable switch mode
        await checkBox.uncheck();
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'switchModeAvailable', 'false');
    });

    test('Change widget type', async ({ page }) => {
        const widgetTypeSelect = await page.getByTestId(
            'Widget type selection form'
        );

        // Test list widget type
        await widgetTypeSelect.selectOption('list');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'widgetType', 'list');

        // Test mapList widget type
        await widgetTypeSelect.selectOption('mapList');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'widgetType', 'mapList');
    });

    test('Change number of taxon per line', async ({ page }) => {
        const input = await page.getByTestId('Number of taxon per line form');

        await input.fill('5');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'nbTaxonPerLine', '5');

        await input.fill('3');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'nbTaxonPerLine', '3');
    });

    test('Change number of displayed species', async ({ page }) => {
        const input = await page.getByTestId(
            'Number of displayed species form'
        );

        await input.fill('20');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'nbDisplayedSpecies', 20);

        await input.fill('2');
        const taxonlist = new TaxonList(page);
        await taxonlist.waitForTaxonsToLoad();
        await expect(taxonlist.getTaxonCount()).resolves.toBeLessThanOrEqual(2);
    });

    test('Change primary color', async ({ page }) => {
        const colorPicker = await page.getByTestId('Primary color form');

        // Test using text input
        await colorPicker.fill('FF5733');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'primaryColor', 'FF5733');

        const footer = await page.getByTestId('Data source credits');
        await expect(footer).toHaveAttribute(
            'style',
            expect.stringContaining(`color: #FF5733;`)
        );
        // Test using color picker
        await colorPicker.fill('00FF00');
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'primaryColor', '00FF00');
    });

    test('Toggle filters on list', async ({ page }) => {
        const checkBox = await page.getByTestId(
            'Show/Hide filters on list checkbox'
        );

        // Enable filters on list
        await checkBox.check();
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'filtersOnList', true);

        const filters = await page.getByTestId('Taxon list filters');
        await expect(filters).toHaveClass(/overlap-filter/);

        // Disable filters on list
        await checkBox.uncheck();
        await page.waitForTimeout(500);
        await checkForParameterChange(page, 'filtersOnList', false);
    });

    test('Refresh parameters button clears all settings', async ({ page }) => {
        // Set some parameters
        await page.getByTestId('Buffer selection form').fill('10');
        await page.getByTestId('Number of taxon per line form').fill('5');
        await page.waitForTimeout(500);

        // Click refresh button
        const refreshButton = await page.getByTestId(
            'Refresh parameters button'
        );
        await refreshButton.click();
        await page.waitForTimeout(500);

        // Verify parameters are reset (URL should not contain custom values)
        const currentUrl = await page.url();
        await expect(currentUrl).not.toContain('buffer=10');
        await expect(currentUrl).not.toContain('nbTaxonPerLine=5');
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
            const map = await page
                .getByTestId('Parameters list div')
                .getByTestId('Map container');

            const drawer = new Drawer(page, map);
            await drawer[draw_function_name]();
            waitForLoading(page);
        });
    });
});
