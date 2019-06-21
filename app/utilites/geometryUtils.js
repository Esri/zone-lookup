var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Graphic", "esri/Color", "esri/geometry/SpatialReference", "esri/geometry/geometryEngineAsync"], function (require, exports, Graphic_1, Color_1, SpatialReference_1, geometryEngineAsync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Graphic_1 = __importDefault(Graphic_1);
    Color_1 = __importDefault(Color_1);
    SpatialReference_1 = __importDefault(SpatialReference_1);
    geometryEngineAsync_1 = __importDefault(geometryEngineAsync_1);
    function getDistances(params) {
        var location = params.location, unit = params.unit;
        var promises = [];
        params.features.forEach(function (feature) {
            promises.push(geometryEngineAsync_1.default.distance(location, feature.geometry, unit));
        });
        return Promise.all(promises).then(function (results) {
            results.map(function (result, index) {
                var f = params.features[index];
                if (f && f.attributes) {
                    f.attributes.lookupDistance = result.toFixed(2);
                }
            });
        });
    }
    exports.getDistances = getDistances;
    function bufferGeometry(params) {
        return __awaiter(this, void 0, void 0, function () {
            var location, distance, unit, spatialReference;
            return __generator(this, function (_a) {
                location = params.location, distance = params.distance, unit = params.unit;
                spatialReference = location.spatialReference ||
                    new SpatialReference_1.default({
                        wkid: 102100
                    });
                if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
                    return [2 /*return*/, geometryEngineAsync_1.default.geodesicBuffer(location, distance, unit)];
                }
                else {
                    return [2 /*return*/, geometryEngineAsync_1.default.buffer(location, distance, unit)];
                }
                return [2 /*return*/];
            });
        });
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