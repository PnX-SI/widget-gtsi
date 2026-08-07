import { test, expect } from '@playwright/test';
import { Drawer } from './page/mapcontroller';
import { TaxonList } from './page/taxonlistcontroller';

test.describe('Simple list', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(
            'http://localhost:5173/#/?widgetType=list&x=6.076641082763673&y=44.55164823782743&showFilters=true&lang=en&switchModeAvailable=true'
        );
    });
    test('sort', async ({ page }) => {
        const taxonlist = new TaxonList(page);
        await taxonlist.waitForTaxonsToLoad();
        const initialCount = await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .textContent();
        await taxonlist.changeSorting('nbObservations', 'desc');
        await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .click();
        const sortedCount = await taxonlist
            .getTaxonByIndex(0)
            .getByTestId('Number of observations')
            .textContent();
        expect(parseInt(initialCount)).toBeGreaterThan(parseInt(sortedCount));
    });
    test('switchMode', async ({ page }) => {
        const taxonlist = new TaxonList(page);
        await taxonlist.waitForTaxonsToLoad();
        await taxonlist.changeMode('gallery');
        await taxonlist.waitForTaxonsToLoad();
        await taxonlist.changeMode('DetailedList');
        await taxonlist.waitForTaxonsToLoad();
    });
    const wkts = [
        'POLYGON((2.35 48.85, 2.36 48.85, 2.36 48.86, 2.35 48.86, 2.35 48.85))',
        'LINESTRING(2.35 48.85, 2.36 48.86)',
        'POINT(2.35 48.85)',
        'MULTIPOLYGON (((7.0193 44.23237, 7.00097 44.24372, 6.99498 44.27678, 6.95369 44.26743, 6.93682 44.29102, 6.88184 44.28698, 6.85792 44.31179, 6.81929 44.30536, 6.82465 44.29281, 6.80229 44.27089, 6.90304 44.19018, 6.95823 44.19701, 7.06387 44.14624, 7.19333 44.18336, 7.18833 44.20076, 7.16348 44.20799, 7.14359 44.20012, 7.0792 44.23162, 7.0193 44.23237)), ((6.79369 44.06254, 6.87595 44.02863, 6.91275 44.04675, 6.97463 44.03897, 7.0662 44.07213, 7.10909 44.07048, 7.138 44.04316, 7.20704 44.04654, 7.24311 44.06565, 7.28613 44.0408, 7.29039 44.06126, 7.31763 44.0617, 7.31896 43.97998, 7.37999 43.96715, 7.36818 43.94333, 7.39033 43.93363, 7.41017 43.84603, 7.44608 43.84019, 7.49642 43.85107, 7.51183 43.88558, 7.56141 43.89884, 7.56934 43.94756, 7.61126 43.95413, 7.66364 43.98681, 7.6631 44.01451, 7.6359 44.00059, 7.58018 44.03594, 7.62419 44.09451, 7.67457 44.11797, 7.67665 44.14222, 7.62731 44.16419, 7.61986 44.14951, 7.5642 44.15551, 7.48387 44.13418, 7.50933 44.12459, 7.49026 44.11875, 7.49657 44.09957, 7.48028 44.09099, 7.5139 44.07502, 7.485 44.06932, 7.51821 44.03601, 7.50076 44.0284, 7.51096 44.00824, 7.4607 44.01234, 7.48934 43.99063, 7.45995 43.9653, 7.47999 43.96169, 7.47888 43.93823, 7.4587 43.93322, 7.47348 43.92104, 7.41359 43.90637, 7.41699 43.98771, 7.3825 44.04532, 7.40135 44.07817, 7.37789 44.07395, 7.26305 44.126, 7.14213 44.10894, 7.04567 44.13876, 7.0306 44.12178, 7.01729 44.13604, 6.97031 44.12657, 6.90497 44.16656, 6.84628 44.13587, 6.84637 44.17874, 6.76556 44.20234, 6.76231 44.24655, 6.73936 44.22879, 6.74051 44.19954, 6.7133 44.19425, 6.72302 44.18238, 6.68591 44.18335, 6.66002 44.19562, 6.67842 44.20752, 6.67409 44.24893, 6.60873 44.28701, 6.60843 44.31957, 6.77431 44.31625, 6.80954 44.35205, 6.85939 44.37271, 6.85244 44.42005, 6.94805 44.42939, 6.86133 44.50327, 6.83394 44.49174, 6.80551 44.50632, 6.76356 44.47176, 6.77864 44.44225, 6.67745 44.43828, 6.75896 44.37108, 6.75612 44.33329, 6.66482 44.33731, 6.61875 44.38528, 6.58534 44.38886, 6.58181 44.36444, 6.54571 44.33733, 6.53254 44.28807, 6.54676 44.26574, 6.54163 44.23767, 6.59388 44.23042, 6.61572 44.17112, 6.60515 44.15821, 6.66403 44.12964, 6.6793 44.1032, 6.70434 44.09584, 6.71908 44.1183, 6.69228 44.17336, 6.81584 44.17116, 6.8237 44.12533, 6.81282 44.10679, 6.8432 44.09853, 6.8505 44.06626, 6.79369 44.06254)))',
    ];
    const xandy = 'x=6.076641082763673&y=44.55164823782743';

    test('test with geojson', async ({ page }) => {
        await page.route('*/**/api/geojson', async (route: any) => {
            const geojson = {
                type: 'Polygon',
                coordinates: [
                    [
                        [2.35, 48.85],
                        [2.36, 48.85],
                        [2.36, 48.86],
                        [2.35, 48.86],
                        [2.35, 48.85],
                    ],
                ],
            };
            await route.fulfill({ geojson });
        });
        await page.goto(
            `http://localhost:5173/#/?widgetType=list&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true&sourceGeometry=http://api.com/api/geojson`
        );
        await new TaxonList(page).waitForTaxonsToLoad();
    });

    for (const wkt of wkts) {
        test(`test with WKT = ${wkt.slice(0, 40)}`, async ({ page }) => {
            await page.goto(
                `http://localhost:5173/#/?widgetType=list&wkt=${wkt}&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true`
            );
            await new TaxonList(page).waitForTaxonsToLoad();
        });
    }
    test('with X and Y parameters', async ({ page }) => {
        await page.goto(
            `http://localhost:5173/#/?widgetType=list&${xandy}&GBIF_ENDPOINT=https://api.gbif-uat.org/v1/&showFilters=true&lang=en&switchModeAvailable=true`
        );
        await new TaxonList(page).waitForTaxonsToLoad();
    });
});
