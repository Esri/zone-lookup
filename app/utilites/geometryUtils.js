define(["require", "exports", "tslib", "esri/Graphic", "esri/Color", "esri/geometry/SpatialReference", "esri/views/support/colorUtils", "esri/geometry/geometryEngine"], function (require, exports, tslib_1, Graphic_1, Color_1, SpatialReference_1, colorUtils_1, geometryEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBasemapTheme = exports.createBufferGraphic = exports.bufferGeometry = exports.getDistances = void 0;
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    Color_1 = tslib_1.__importDefault(Color_1);
    SpatialReference_1 = tslib_1.__importDefault(SpatialReference_1);
    geometryEngine_1 = tslib_1.__importDefault(geometryEngine_1);
    function getDistances(params) {
        var location = params.location, unit = params.unit;
        params.features.forEach(function (feature) {
            var distance = geometryEngine_1.default.distance(location, feature.geometry, unit);
            if (feature && feature.attributes) {
                feature.attributes.lookupDistance = distance !== null ? distance.toFixed(2) : null;
            }
        });
    }
    exports.getDistances = getDistances;
    function bufferGeometry(params) {
        var location = params.location, distance = params.distance, unit = params.unit;
        var bp = {
            geometries: [location],
            distances: [distance],
            unit: unit
        };
        var spatialReference = location.spatialReference ||
            new SpatialReference_1.default({
                wkid: 102100
            });
        if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
            return geometryEngine_1.default.geodesicBuffer(location, distance, unit);
        }
        else {
            return geometryEngine_1.default.buffer(location, distance, unit);
        }
    }
    exports.bufferGeometry = bufferGeometry;
    function createBufferGraphic(geometry, symbolColor) {
        var color = new Color_1.default(symbolColor);
        var fillColor = color.clone();
        fillColor.a = 0.1;
        var fillSymbol = {
            type: 'simple-fill',
            color: fillColor,
            outline: {
                color: color
            }
        };
        var bufferGraphic = new Graphic_1.default({
            geometry: geometry,
            symbol: fillSymbol
        });
        return bufferGraphic;
    }
    exports.createBufferGraphic = createBufferGraphic;
    function getBasemapTheme(view) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, colorUtils_1.getBackgroundColorTheme(view)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    exports.getBasemapTheme = getBasemapTheme;
});
//# sourceMappingURL=geometryUtils.js.map