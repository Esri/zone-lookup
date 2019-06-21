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
define(["require", "exports", "esri/core/Collection", "esri/views/layers/support/FeatureFilter", "esri/core/promiseUtils", "esri/Graphic", "esri/symbols"], function (require, exports, Collection, FeatureFilter_1, promiseUilts, Graphic_1, symbols_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    FeatureFilter_1 = __importDefault(FeatureFilter_1);
    Graphic_1 = __importDefault(Graphic_1);
    function getSearchLayer(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, searchLayer, layer, lv, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, searchLayer = props.searchLayer;
                        layer = searchLayer && searchLayer.id ? view.map.findLayerById(searchLayer.id) : null;
                        if (!(layer && layer.type === 'feature')) return [3 /*break*/, 2];
                        return [4 /*yield*/, view.whenLayerView(layer)];
                    case 1:
                        lv = (_b.sent());
                        if (props.hideFeaturesOnLoad)
                            hideLookuplayers([lv]);
                        return [2 /*return*/, lv];
                    case 2: return [2 /*return*/, null];
                    case 3:
                        if (!(layer && layer.type === 'feature')) return [3 /*break*/, 5];
                        return [4 /*yield*/, view.whenLayerView(layer)];
                    case 4:
                        _a = (_b.sent());
                        return [3 /*break*/, 6];
                    case 5:
                        _a = null;
                        _b.label = 6;
                    case 6: return [2 /*return*/, _a];
                }
            });
        });
    }
    exports.getSearchLayer = getSearchLayer;
    function getLookupLayers(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, hideFeaturesOnLoad, lookupLayers, searchableLayers, returnLayers, promises, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, hideFeaturesOnLoad = props.hideFeaturesOnLoad, lookupLayers = props.lookupLayers;
                        searchableLayers = !lookupLayers ? view.map.layers : new Collection();
                        returnLayers = [];
                        // Check to see if the user has specified a search layer
                        // otherwise just get the layers from the map
                        if (lookupLayers) {
                            lookupLayers.forEach(function (layerItem) {
                                if (layerItem.id) {
                                    var layer = view.map.findLayerById(layerItem.id);
                                    if (!layer) {
                                        //maybe its a feature collection
                                        var sublayerId = layerItem.id.lastIndexOf('_');
                                        if (sublayerId !== -1) {
                                            layerItem.id = layerItem.id.slice(0, sublayerId);
                                            layer = view.map.findLayerById(layerItem.id);
                                        }
                                    }
                                    layer && searchableLayers.add(layer);
                                }
                            });
                        }
                        promises = [];
                        // Include the search layer in the lookup layers if specified
                        searchableLayers.forEach(function (layer) {
                            if (layer && layer.type) {
                                if (layer.type === 'feature') {
                                    var flayer = layer;
                                    if (flayer.popupEnabled) {
                                        promises.push(view.whenLayerView(layer));
                                    }
                                }
                                else if (layer.type === 'map-image') {
                                    var mapLayer = layer;
                                    mapLayer.sublayers.forEach(function (sublayer) {
                                        if (sublayer.popupEnabled) {
                                            sublayer.createFeatureLayer().then(function (l) {
                                                view.map.add(l);
                                                promises.push(view.whenLayerView(l));
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        return [4 /*yield*/, promiseUilts.eachAlways(promises)];
                    case 1:
                        results = _a.sent();
                        results.forEach(function (result) {
                            if (result && result.value)
                                returnLayers.push(result.value);
                        });
                        if (hideFeaturesOnLoad)
                            hideLookuplayers(returnLayers);
                        return [2 /*return*/, returnLayers];
                }
            });
        });
    }
    exports.getLookupLayers = getLookupLayers;
    function getSearchGeometry(props) {
        return __awaiter(this, void 0, void 0, function () {
            var results, view, config, searchLayer, lookupType, graphic, returnGraphic, sourceLayerGraphic, searchGeometry, query, results_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = props.results, view = props.view, config = props.config, searchLayer = props.searchLayer;
                        lookupType = config.lookupType;
                        graphic = _getResultGeometries(results);
                        // add marker to map
                        _addLocationGraphics(graphic, config, view);
                        if (!(lookupType !== 'geometry' || !searchLayer)) return [3 /*break*/, 1];
                        returnGraphic = graphic;
                        if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
                            returnGraphic = new Graphic_1.default({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
                        }
                        return [2 /*return*/, promiseUilts.resolve(returnGraphic)];
                    case 1:
                        sourceLayerGraphic = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic : null;
                        if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
                            if (sourceLayerGraphic.sourceLayer.id === searchLayer.layer.id) {
                                // Is the search geometry from the search layer? If so use it
                                return [2 /*return*/, promiseUilts.resolve(graphic)];
                            }
                        }
                        searchGeometry = graphic.geometry;
                        query = searchLayer.layer.createQuery();
                        query.geometry = searchGeometry;
                        if (searchGeometry && searchGeometry.type === 'point') {
                            query.spatialRelationship = 'within';
                        }
                        else {
                            query.spatialRelationship = 'intersects';
                        }
                        return [4 /*yield*/, searchLayer.layer.queryFeatures(query)];
                    case 2:
                        results_1 = _a.sent();
                        return [2 /*return*/, promiseUilts.resolve(results_1 && results_1.features && results_1.features.length && results_1.features.length > 0
                                ? results_1.features[0]
                                : null)];
                }
            });
        });
    }
    exports.getSearchGeometry = getSearchGeometry;
    function _addLocationGraphics(graphic, config, view) {
        var includeAddressText = config.includeAddressText, addressGraphicColor = config.addressGraphicColor, includeAddressGraphic = config.includeAddressGraphic;
        // add a custom graphic at geocoded location if we have something to display
        if (graphic && graphic.geometry) {
            var geometry = graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
            //view.goTo(geometry);
            var displayText_1 = null;
            if (graphic && graphic.attributes && includeAddressText) {
                // TODO: At 7.3 add config option for display field
                if (graphic.attributes.Match_addr) {
                    // replace first comma with a new line character
                    displayText_1 = graphic.attributes.Match_addr.replace(',', '\n');
                }
                else if (graphic.layer && graphic.layer.displayField && graphic.layer.displayField !== '') {
                    displayText_1 = graphic.attributes[graphic.layer.displayField] || null;
                }
                else if (graphic.layer && graphic.layer.fields) {
                    // get the first string field?
                    graphic.layer.fields.some(function (field) {
                        if (field.type === 'string') {
                            displayText_1 = graphic.attributes[field.name];
                            return true;
                        }
                    });
                }
            }
            if (displayText_1) {
                view.graphics.add(new Graphic_1.default({
                    geometry: geometry,
                    symbol: new symbols_1.TextSymbol({
                        font: {
                            size: 10
                        },
                        text: displayText_1,
                        color: addressGraphicColor,
                        xoffset: 8,
                        yoffset: 4,
                        horizontalAlignment: 'left'
                    })
                }));
            }
            if (includeAddressGraphic) {
                view.graphics.add(new Graphic_1.default({
                    geometry: geometry,
                    symbol: new symbols_1.TextSymbol({
                        color: addressGraphicColor,
                        text: '\ue61d',
                        font: {
                            size: 20,
                            family: 'calcite-web-icons'
                        }
                    })
                }));
            }
        }
    }
    function _getResultGeometries(results) {
        var feature = null;
        results.results.some(function (searchResults) {
            return searchResults.results.some(function (r) {
                if (r.feature) {
                    feature = r.feature;
                    return true;
                }
                else {
                    return false;
                }
            });
        });
        return feature;
    }
    function hideLookuplayers(layers) {
        layers.forEach(function (layer) {
            layer.filter = new FeatureFilter_1.default({
                where: '1=0'
            });
        });
    }
    exports.hideLookuplayers = hideLookuplayers;
});
//# sourceMappingURL=lookupLayerUtils.js.map