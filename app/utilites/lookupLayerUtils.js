define(["require", "exports", "tslib", "esri/core/Collection", "esri/views/layers/support/FeatureFilter", "esri/Graphic", "esri/core/promiseUtils", "esri/views/layers/support/FeatureEffect"], function (require, exports, tslib_1, Collection, FeatureFilter_1, Graphic_1, promiseUtils_1, FeatureEffect) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hideLookuplayers = exports.getSearchGeometry = exports.getLookupLayers = exports.getSearchLayer = void 0;
    FeatureFilter_1 = tslib_1.__importDefault(FeatureFilter_1);
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    function getSearchLayer(props) {
        var view = props.view, searchLayer = props.searchLayer;
        var layers = searchLayer === null || searchLayer === void 0 ? void 0 : searchLayer.layers;
        var layer = (layers === null || layers === void 0 ? void 0 : layers.length) > 0 ? layers[0] : null;
        var returnLayer = null;
        if (layer && layer.id) {
            returnLayer = view.map.findLayerById(layer.id);
            if (returnLayer.type === "feature") {
                if (props.hideFeaturesOnLoad)
                    hideLookuplayers([returnLayer], props.view);
            }
        }
        return returnLayer;
    }
    exports.getSearchLayer = getSearchLayer;
    function getLookupLayers(props) {
        var view = props.view, hideFeaturesOnLoad = props.hideFeaturesOnLoad, lookupLayers = props.lookupLayers;
        var hasLookupLayers = lookupLayers && (lookupLayers === null || lookupLayers === void 0 ? void 0 : lookupLayers.length) > 0 ? true : false;
        var searchableLayers = !hasLookupLayers ? view.map.layers : new Collection();
        var returnLayers = [];
        // Get all the map layers
        if (hasLookupLayers) {
            // get any predefined layers otherwise we'll use all map layers
            lookupLayers.forEach(function (layerItem) {
                if (layerItem.id) {
                    if (layerItem.type === 'DynamicLayer') {
                        var sublayerId = layerItem.id.lastIndexOf('.');
                        if (sublayerId !== -1) {
                            var id = layerItem.id.slice(0, sublayerId);
                            var layer = view.map.findLayerById(id);
                            if (layer && searchableLayers.indexOf(layer) === -1) {
                                searchableLayers.add(layer);
                            }
                        }
                    }
                    else {
                        // feature layer
                        var layer = view.map.findLayerById(layerItem.id);
                        if (!layer) {
                            //maybe its a feature collection
                            var sublayerId = layerItem.id.lastIndexOf('_');
                            if (sublayerId !== -1) {
                                var id = layerItem.id.slice(0, sublayerId);
                                layer = view.map.findLayerById(id);
                            }
                        }
                        // disable clustering 
                        if (layer && layer.get("featureReduction")) {
                            layer.set("featureReduction", null);
                        }
                        layer && searchableLayers.add(layer);
                    }
                }
            });
        }
        // Include the search layer in the lookup layers if specified
        searchableLayers.forEach(function (layer) {
            if (layer && layer.type) {
                if (layer.type === 'feature') {
                    var flayer = layer;
                    if (flayer.popupEnabled) {
                        flayer.outFields = ["*"];
                        returnLayers.push(flayer);
                    }
                    // disable clustering 
                    if (flayer && flayer.get("featureReduction")) {
                        flayer.set("featureReduction", null);
                    }
                }
                else if (layer.type === "group") {
                    var flattendGroup = _getLayersFromGroupLayer(layer);
                    if ((flattendGroup === null || flattendGroup === void 0 ? void 0 : flattendGroup.length) > 0) {
                        flattendGroup.forEach(function (b) {
                            searchableLayers.add(b);
                        });
                    }
                }
                else if (layer.type === 'map-image') {
                    // if sub layers have been enabled during config
                    // only add those. Otherwise add all dynamic sub layers
                    var mapLayer = layer;
                    var checkSubLayer_1 = lookupLayers && lookupLayers.length && lookupLayers.length > 0 ? true : false;
                    mapLayer.sublayers &&
                        mapLayer.sublayers.forEach(function (sublayer) {
                            if (checkSubLayer_1) {
                                var configId_1 = sublayer.layer.id + "." + sublayer.id;
                                lookupLayers.forEach(function (l) {
                                    if (l.id && l.id === configId_1) {
                                        sublayer.createFeatureLayer().then(function (l) {
                                            view.map.add(l);
                                            returnLayers.push(l);
                                        });
                                        sublayer.visible = false;
                                    }
                                });
                            }
                            else {
                                sublayer.createFeatureLayer().then(function (l) {
                                    view.map.add(l);
                                    returnLayers.push(l);
                                });
                                sublayer.visible = false;
                            }
                        });
                }
            }
        });
        if (hideFeaturesOnLoad)
            hideLookuplayers(returnLayers, props.view);
        return promiseUtils_1.resolve(returnLayers);
    }
    exports.getLookupLayers = getLookupLayers;
    function getSearchGeometry(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var results, config, searchLayer, view, lookupType, graphic, displayGraphic, sourceLayerGraphic, searchGeometry, query, results_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = props.results, config = props.config, searchLayer = props.searchLayer, view = props.view;
                        lookupType = config.lookupType;
                        graphic = _getResultGeometries(results);
                        displayGraphic = graphic;
                        if (!(lookupType !== 'geometry' || !searchLayer)) return [3 /*break*/, 1];
                        if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
                            displayGraphic = new Graphic_1.default({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
                        }
                        return [2 /*return*/, promiseUtils_1.resolve(displayGraphic)];
                    case 1:
                        sourceLayerGraphic = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic.clone() : null;
                        if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
                            if (sourceLayerGraphic.sourceLayer.id === searchLayer.id) {
                                // Is the search geometry from the search layer? If so use it
                                displayGraphic = graphic;
                            }
                        }
                        searchGeometry = displayGraphic.geometry;
                        query = searchLayer.createQuery();
                        query.geometry = searchGeometry;
                        if (searchGeometry && searchGeometry.type === 'point') {
                            query.spatialRelationship = 'within';
                        }
                        else {
                            query.spatialRelationship = 'intersects';
                        }
                        query.outFields = ["*"];
                        return [4 /*yield*/, searchLayer.queryFeatures(query)];
                    case 2:
                        results_1 = _a.sent();
                        return [2 /*return*/, promiseUtils_1.resolve(results_1 && results_1.features && results_1.features.length && results_1.features.length > 0
                                ? results_1.features[0]
                                : null)];
                }
            });
        });
    }
    exports.getSearchGeometry = getSearchGeometry;
    function _getResultGeometries(results) {
        var feature = null;
        results.results.some(function (searchResults) {
            return searchResults.results.some(function (r) {
                if (r.feature) {
                    feature = r.feature;
                    //if (r.name && feature.attributes && feature.attributes.Match_addr) {
                    //feature.attributes.name = r.name;
                    //}
                    return true;
                }
                else {
                    return false;
                }
            });
        });
        return feature;
    }
    function _getLayersFromGroupLayer(group) {
        var _this = this;
        var layers = [];
        group.layers.filter(function (layer) {
            if (layer.group) {
                var innerGroup = _this._getLayersFromGroupLayer(layer.group);
                layers = tslib_1.__spreadArrays(layers, [innerGroup]);
            }
            else {
                layers.push(layer);
            }
        });
        return layers;
    }
    function hideLookuplayers(layers, view) {
        var noMap = document.body.classList.contains('no-map');
        if (noMap) {
            return;
        }
        layers.forEach(function (layer) {
            view.whenLayerView(layer).then(function (layerView) {
                //hide layers
                layerView.effect = new FeatureEffect({
                    excludedEffect: "opacity(0%)",
                    filter: new FeatureFilter_1.default({ where: '1=0' })
                });
            });
        });
    }
    exports.hideLookuplayers = hideLookuplayers;
});
//# sourceMappingURL=lookupLayerUtils.js.map