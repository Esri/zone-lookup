var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Graphic", "esri/Color", "esri/geometry/SpatialReference", "esri/geometry/geometryEngine"], function (require, exports, Graphic_1, Color_1, SpatialReference_1, geometryEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Graphic_1 = __importDefault(Graphic_1);
    Color_1 = __importDefault(Color_1);
    SpatialReference_1 = __importDefault(SpatialReference_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
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
});
//# sourceMappingURL=geometryUtils.js.map