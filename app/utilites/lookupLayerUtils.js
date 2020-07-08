define(["require", "exports", "tslib", "esri/core/Collection", "esri/views/layers/support/FeatureFilter", "esri/Graphic", "esri/layers/FeatureLayer", "esri/core/promiseUtils", "esri/views/layers/support/FeatureEffect"], function (require, exports, tslib_1, Collection, FeatureFilter_1, Graphic_1, FeatureLayer_1, promiseUtils_1, FeatureEffect) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hideLookuplayers = exports.getSearchGeometry = exports.findConfiguredLookupLayers = exports.getLookupLayers = exports.getSearchLayer = void 0;
    FeatureFilter_1 = tslib_1.__importDefault(FeatureFilter_1);
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    FeatureLayer_1 = tslib_1.__importDefault(FeatureLayer_1);
    function getSearchLayer(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, searchLayer, layers, layer;
            return tslib_1.__generator(this, function (_a) {
                view = props.view, searchLayer = props.searchLayer;
                layers = searchLayer === null || searchLayer === void 0 ? void 0 : searchLayer.layers;
                layer = (layers === null || layers === void 0 ? void 0 : layers.length) && layers[0] || null;
                if (layer && (layer === null || layer === void 0 ? void 0 : layer.id)) {
                    layer = view.map.findLayerById(layer.id);
                    if ((layer === null || layer === void 0 ? void 0 : layer.type) === 'feature') {
                        if (props.hideFeaturesOnLoad)
                            hideLookuplayers([layer], props.view);
                        layer = layer;
                    }
                    else {
                        layer = null;
                    }
                }
                return [2 /*return*/, layer];
            });
        });
    }
    exports.getSearchLayer = getSearchLayer;
    function getLookupLayers(lookupLayers) {
        var returnLayers = new Collection();
        lookupLayers.forEach(function (layerItem) {
            // Add feature layers to the collection 
            if ((layerItem === null || layerItem === void 0 ? void 0 : layerItem.type) === "feature") {
                var featureLayer = layerItem;
                if (featureLayer.popupEnabled) {
                    returnLayers.add(featureLayer);
                }
            }
        });
        return returnLayers;
    }
    exports.getLookupLayers = getLookupLayers;
    function findConfiguredLookupLayers(view, config) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var lookupLayers, configuredLayers;
            return tslib_1.__generator(this, function (_b) {
                lookupLayers = new Collection();
                configuredLayers = ((_a = config.lookupLayers) === null || _a === void 0 ? void 0 : _a.layers) ? config.lookupLayers.layers : null;
                if (configuredLayers) {
                    // find the layers and add to the collection 
                    configuredLayers.forEach(function (layerItem) {
                        var layer = view.map.findLayerById(layerItem.id);
                        //await view.whenLayerView(layer);
                        // Get the sub layer 
                        if (layerItem.sublayerId) {
                            var dynamicLayer = layer;
                            var createdFeatureLayer = new FeatureLayer_1.default({
                                url: dynamicLayer.url + "/" + layerItem.sublayerId
                            });
                            createdFeatureLayer.visible = false;
                            view.map.add(createdFeatureLayer);
                            lookupLayers.add(createdFeatureLayer);
                        }
                        else {
                            lookupLayers.add(layer);
                        }
                    });
                }
                else {
                    lookupLayers = view.map.layers;
                }
                return [2 /*return*/, promiseUtils_1.resolve(lookupLayers)];
            });
        });
    }
    exports.findConfiguredLookupLayers = findConfiguredLookupLayers;
    function getSearchGeometry(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var results, view, config, searchLayer, lookupType, graphic, returnGraphic, sourceLayerGraphic, searchGeometry, query, results_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = props.results, view = props.view, config = props.config, searchLayer = props.searchLayer;
                        lookupType = config.lookupType;
                        graphic = _getResultGeometries(results);
                        if (!(lookupType !== 'geometry' || !searchLayer)) return [3 /*break*/, 1];
                        returnGraphic = graphic;
                        if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
                            returnGraphic = new Graphic_1.default({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
                        }
                        return [2 /*return*/, promiseUtils_1.resolve(returnGraphic)];
                    case 1:
                        sourceLayerGraphic = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic.clone() : null;
                        if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
                            if (sourceLayerGraphic.sourceLayer.id === searchLayer.id) {
                                // Is the search geometry from the search layer? If so use it
                                return [2 /*return*/, promiseUtils_1.resolve(graphic)];
                            }
                        }
                        searchGeometry = graphic.geometry;
                        query = searchLayer.createQuery();
                        query.geometry = searchGeometry;
                        if (searchGeometry && searchGeometry.type === 'point') {
                            query.spatialRelationship = 'within';
                        }
                        else {
                            query.spatialRelationship = 'intersects';
                        }
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
    /*function _addLocationGraphics(graphic, config, view) {
        const { includeAddressText, addressGraphicColor, includeAddressGraphic, addMarker } = config;
        // add a custom graphic at geocoded location if we have something to display
        if (graphic && graphic.geometry) {
            const geometry =
                graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
            let displayText = null;
            if (graphic && includeAddressText) {
    
                if (graphic?.attributes?.Match_addr) {
                    // replace first comma with a new line character
                    displayText = graphic.attributes.Match_addr.replace(',', '\n');
                } else if (graphic?.attributes?.name) {
                    displayText = graphic.attributes.name;
                } else if (graphic?.layer?.displayField !== '') {
                    displayText = graphic.attributes[graphic.layer.displayField] || null;
                } else if (graphic?.layer?.fields) {
                    // get the first string field?
                    graphic.layer.fields.some((field) => {
                        if (field.type === 'string') {
                            displayText = graphic.attributes[field.name];
                            return true;
                        }
                    });
                }
            }
            if (displayText && addMarker) {
                view.graphics.add(
                    new Graphic({
                        geometry,
                        symbol: new TextSymbol({
                            font: {
                                size: 10
                            },
                            text: displayText,
                            color: addressGraphicColor,
                            horizontalAlignment: 'center'
                        })
                    })
                );
            }
            if (includeAddressGraphic && addMarker) {
                view.graphics.add(
                    new Graphic({
                        geometry,
                        symbol: new TextSymbol({
                            color: addressGraphicColor,
                            text: '\ue61d', // esri-icon-map-pin
                            yoffset: 10,
                            font: {
                                size: 20,
                                family: 'calcite-web-icons'
                            }
                        })
                    })
                );
            }
        }
    }*/
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