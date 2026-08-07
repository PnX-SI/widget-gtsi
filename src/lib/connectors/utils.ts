import { CONNECTORS } from './connectors';
import { GbifConnector } from './gbif';
import { GeoNatureConnector } from './geonature';
import { GbifFacetConnector } from './gbiffacet';
import { Connector } from './connector';
import { simplify, truncate } from '@turf/turf';
import { Feature, Polygon, MultiPolygon } from 'geojson';
import { GeoJSONMultiPolygon, GeoJSONPolygon } from 'wellknown';

type ConnectorParams = Record<string, any>;

export function getConnector(
    connectorName: keyof typeof CONNECTORS = 'GBIF',
    params: ConnectorParams = {}
): Connector {
    switch (connectorName) {
        case CONNECTORS.GBIF:
            return new GbifConnector(params);
        case CONNECTORS.GeoNature:
            return new GeoNatureConnector(params);
        case CONNECTORS.GBIF_FACET:
            return new GbifFacetConnector(params);
        default:
            return new GbifFacetConnector(params);
    }
}

/**
 Simplify a polygon by removing points while keeping the total number of points below a certain threshold (190).
 * The simplification is done by the turf.js simplify algorithm.
 * Coordinates are rounded to 5 decimal places.
 * @param {Polygon | MultiPolygon} geometry - The geometry to simplify.
 * @param {number} [initialTolerance=0.001] - The initial tolerance for the simplification algorithm.
 * @param {number} [threshold=190] - The maximum number of coordinates in the simplified polygon.
 * @returns {Polygon | MultiPolygon} The simplified polygon or multi-polygon.
 */
export function simplifyPolygon(
    geometry: Polygon | MultiPolygon,
    initialTolerance = 0.001,
    threshold = 190
): Polygon | MultiPolygon {
    let tolerance = initialTolerance;

    const feature: Feature<Polygon | MultiPolygon> = {
        type: 'Feature',
        properties: {},
        geometry,
    };

    let simplifiedFeature = simplify(feature, {
        tolerance,
        highQuality: true,
    });

    let totalPoints = countCoordinates(simplifiedFeature.geometry);
    let iterations = 0;

    while (totalPoints > threshold && iterations < 20) {
        tolerance *= 10;

        simplifiedFeature = simplify(feature, {
            tolerance,
            highQuality: true,
        });

        totalPoints = countCoordinates(simplifiedFeature.geometry);
        iterations++;
    }

    return truncate(simplifiedFeature.geometry, {
        precision: 5,
        coordinates: 2,
    });
}

/**
 * Count the total number of coordinates in a polygon or multi-polygon.
 * @param {Polygon | MultiPolygon} geometry - The polygon or multi-polygon to count the coordinates of.
 * @returns {number} The total number of coordinates in the polygon or multi-polygon.
 */
function countCoordinates(geometry: Polygon | MultiPolygon): number {
    if (geometry.type === 'Polygon') {
        return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
    }

    // MultiPolygon
    return geometry.coordinates.reduce(
        (sum, polygon) =>
            sum + polygon.reduce((ringSum, ring) => ringSum + ring.length, 0),
        0
    );
}

/**
 * Remove holes (inner rings) from a polygon or multi-polygon, keeping only the outer rings.
 * @param {Polygon | MultiPolygon} geometry - The geometry to remove holes from.
 * @returns {Polygon | MultiPolygon} The geometry with only outer rings.
 */
export function removeHoles(
    geometry: Polygon | MultiPolygon | GeoJSONMultiPolygon | GeoJSONPolygon
): Polygon | MultiPolygon {
    if (geometry.type === 'Polygon') {
        // In the GeoJSON, the first coordinates set is the outer ring
        // of the polygon
        // https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
        if (geometry.coordinates.length === 0) {
            throw new Error('Invalid polygon: no coordinates');
        }
        return {
            type: 'Polygon',
            coordinates: [geometry.coordinates[0]],
        };
    }

    // Pour un MultiPolygon
    return {
        type: 'MultiPolygon',
        coordinates: geometry.coordinates.map((polygon) => {
            if (polygon.length === 0) {
                throw new Error(
                    'Invalid polygon in multi-polygon: no coordinates'
                );
            }
            return [polygon[0]];
        }),
    };
}
