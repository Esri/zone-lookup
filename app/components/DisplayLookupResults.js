define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "../utilites/geometryUtils", "esri/core/promiseUtils", "./GroupedAccordion", "./FeatureAccordion", "esri/views/layers/support/FeatureEffect", "esri/views/layers/support/FeatureFilter", "esri/core/Handles", "esri/tasks/support/Query", "esri/widgets/Widget", "dojo/i18n!../nls/resources"], function (require, exports, tslib_1, decorators_1, widget_1, geometryUtils_1, promiseUtils_1, GroupedAccordion_1, FeatureAccordion_1, FeatureEffect_1, FeatureFilter_1, Handles_1, Query_1, Widget_1, i18n) {
    "use strict";
    GroupedAccordion_1 = tslib_1.__importDefault(GroupedAccordion_1);
    FeatureAccordion_1 = tslib_1.__importDefault(FeatureAccordion_1);
    FeatureEffect_1 = tslib_1.__importDefault(FeatureEffect_1);
    FeatureFilter_1 = tslib_1.__importDefault(FeatureFilter_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Query_1 = tslib_1.__importDefault(Query_1);
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var CSS = {
        calciteStyles: {
            clearBtn: 'btn-transparent',
            smallBtn: 'btn-small',
            button: 'btn',
            right: 'right',
            trailerHalf: 'margin-right-half',
            leaderFull: 'margin-left-1',
            leaderHalf: 'leader-half'
        },
        messageText: 'message-text',
        openItems: 'open-items',
        collapseItems: 'collapse-items',
        toggleContentTools: 'toggle-content-tools',
        toggleContentBtn: 'toggle-content-btn'
    };
    var DisplayLookupResults = /** @class */ (function (_super) {
        tslib_1.__extends(DisplayLookupResults, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function DisplayLookupResults(props) {
            var _this = _super.call(this, props) || this;
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            _this.lookupGraphics = null;
            _this.searchLayer = null;
            _this.lookupLayers = null;
            _this.state = 'init';
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._featureResults = null;
            _this._empty = true;
            _this._zoomFactor = 4;
            _this._viewPoint = null;
            _this._accordion = null;
            _this._bufferGraphic = null;
            _this._handles = new Handles_1.default();
            if (props.view && props.view.viewpoint) {
                _this._viewPoint = props.view.viewpoint.clone();
            }
            else {
                // wait for view point
                var key_1 = 'viewpoint-watch';
                _this._handles.add(props.view.watch('viewpoint', function () {
                    _this._handles.remove(key_1);
                    _this._viewPoint = props.view.viewpoint.clone();
                }));
            }
            return _this;
        }
        DisplayLookupResults.prototype.render = function () {
            var loader = this.state === 'loading' ? (widget_1.tsx("div", { key: "loader", class: "loader is-active padding-leader-3 padding-trailer-3" },
                widget_1.tsx("div", { key: "loaderBars", class: "loader-bars" }),
                widget_1.tsx("div", { key: "loaderText", class: "loader-text" },
                    i18n.load.label,
                    "..."))) : null;
            var ready = this.state === 'ready' || false;
            var _a = this.config, resultsPanelPreText = _a.resultsPanelPreText, resultsPanelPostText = _a.resultsPanelPostText, noResultsMessage = _a.noResultsMessage;
            // No Results 
            var errorText = null;
            if (this._empty && ready) {
                errorText = noResultsMessage || i18n.noFeatures;
                if (this.mapPanel && this.mapPanel.isMobileView) {
                    // Add no results message to the map in mobile view
                    this.mapPanel.message = errorText;
                }
            }
            var accordion = ready ? (widget_1.tsx("div", { key: "accordion" },
                widget_1.tsx("p", { key: "errorText", class: CSS.messageText, innerHTML: errorText }),
                widget_1.tsx("div", { key: "detailAccordion", bind: this, afterCreate: !this._empty ? this._addDetailAccordion : null }))) : null;
            var toggleLinks = this._featureResults ? this.createToggleLinks() : null;
            var preText = resultsPanelPreText ? this.createPreText() : null;
            var postText = resultsPanelPostText ? this.createPostText() : null;
            return (widget_1.tsx("div", { key: "loader" },
                loader,
                toggleLinks,
                preText,
                accordion,
                postText));
        };
        DisplayLookupResults.prototype._addDetailAccordion = function (container) {
            var _this = this;
            var _a, _b;
            var _c = this, _featureResults = _c._featureResults, config = _c.config, view = _c.view;
            var eventHandler = this._handleActionItem.bind(this);
            var actionItems = [];
            if (config.showDirections) {
                actionItems.push({
                    icon: 'icon-ui-directions',
                    id: 'directions',
                    name: 'Directions',
                    handleClick: eventHandler
                });
            }
            if (this.config.groupResultsByLayer) {
                this._accordion = new GroupedAccordion_1.default({
                    actionBarItems: actionItems,
                    featureResults: _featureResults,
                    config: config,
                    view: view,
                    container: container
                });
            }
            else if (this._featureResults && this._featureResults.length && this._featureResults.length > 0) {
                var featureResults = _featureResults[0];
                var features = featureResults.features ? featureResults.features : null;
                this._accordion = new FeatureAccordion_1.default({
                    actionBarItems: actionItems,
                    features: features,
                    config: config,
                    view: view,
                    container: container
                });
            }
            // Auto zoom to features
            if (this.config.autoZoomFirstResult) {
                var features_1;
                if (this._accordion instanceof FeatureAccordion_1.default) {
                    features_1 = ((_b = (_a = this._accordion) === null || _a === void 0 ? void 0 : _a.features) === null || _b === void 0 ? void 0 : _b.length) > 0 ? this._accordion.features : null;
                }
                else if (this._accordion instanceof GroupedAccordion_1.default) {
                    this._accordion.featureResults.some(function (result) {
                        if (result.features && result.features.length && result.features.length > 0) {
                            features_1 = result.features;
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                }
                if (features_1) {
                    this.mapPanel.view && features_1 && this.mapPanel.view.goTo(features_1);
                }
            }
            this._accordion.watch('selectedItem', function () {
                if (_this._accordion.selectedItem) {
                    _this._highlightFeature(_this._accordion.selectedItem);
                    _this._zoomToFeature(_this._accordion.selectedItem);
                    _this.mapPanel.selectedItemTitle =
                        _this._accordion.selectedItem.attributes['app-accordion-title'] || null;
                }
                _this._accordion.selectedItem = null;
            });
        };
        DisplayLookupResults.prototype._handleActionItem = function (name, selected) {
            // TODO: Eventually we'll support directions
        };
        DisplayLookupResults.prototype.queryFeatures = function (location, distance) {
            var _this = this;
            this.distance = distance;
            this.state = 'loading';
            this.location = location;
            this.lookupGraphics.graphic = location;
            var promises = [];
            if (!location) {
                this.state = 'init';
                this._featureResults = [];
                promises.push(promiseUtils_1.resolve());
            }
            else {
                // Highlight search layer
                this.lookupGraphics.addGraphics();
                this._searchHighlight(location);
                this.lookupLayers.forEach(function (layer) {
                    var query = _this._createQuery(layer, location);
                    _this._applyLayerEffectAndFilter(layer, query);
                    if (!layer) {
                        _this.state = 'init';
                        return promiseUtils_1.resolve();
                    }
                    var performQuery = true;
                    // If the search geometry is from the lookup layer we don't
                    // need to query. This can happen when a feature layer locator is
                    // setup or when the search layer is included in the results layers.
                    if (layer && location.layer) {
                        if (layer.id === location.layer.id) {
                            performQuery = false;
                            _this._applyLayerEffectAndFilter(layer, {
                                where: layer.objectIdField + " = " + location.attributes[layer.objectIdField] + " "
                            });
                        }
                    }
                    if (!performQuery) {
                        promises.push(promiseUtils_1.resolve({ features: [location], title: layer && layer.title ? layer.title : null, id: layer && layer.id ? layer.id : null }));
                    }
                    else {
                        promises.push(layer.queryFeatures(query).then(function (results) {
                            return promiseUtils_1.resolve({
                                features: results.features,
                                title: layer && layer.title ? layer.title : null,
                                id: layer && layer.id ? layer.id : null
                            });
                        }).catch(function (error) {
                            console.log("Error loading layer", error);
                            return promiseUtils_1.resolve();
                        }));
                        _this._applyLayerEffectAndFilter(layer, query);
                    }
                });
            }
            return Promise.all(promises).then(function (results) {
                _this._featureResults = [];
                var groupResultsByLayer = _this.config.groupResultsByLayer;
                // Loop through the feaures 
                if (results) {
                    results.forEach(function (result) {
                        // do we have features?
                        var _a;
                        if ((result === null || result === void 0 ? void 0 : result.features) && ((_a = result.features) === null || _a === void 0 ? void 0 : _a.length) && result.features.length > 0) {
                            if (groupResultsByLayer) {
                                //this._sortFeatures(result.features);
                                _this._featureResults.push({
                                    title: result.title,
                                    features: result.features
                                });
                            }
                            else {
                                // each feature is its own section 
                                var features_2 = [];
                                results.forEach(function (result) {
                                    if (result === null || result === void 0 ? void 0 : result.features) {
                                        features_2.push.apply(features_2, result.features);
                                    }
                                });
                                //this._sortFeatures(features);
                                _this._featureResults = [{
                                        features: features_2,
                                        title: null,
                                        grouped: false
                                    }];
                            }
                        }
                    });
                }
                _this._empty = _this._featureResults ? _this._featureResults.every(function (result) {
                    return result.features && result.features.length && result.features.length > 0 ? false : true;
                }) : true;
                _this.state = 'ready';
            });
        };
        DisplayLookupResults.prototype._createQuery = function (layer, location) {
            var _a = this.config, lookupType = _a.lookupType, relationship = _a.relationship, units = _a.units;
            var geometry = location.geometry;
            var query = layer && typeof layer['createQuery'] === 'function'
                ? layer.createQuery()
                : new Query_1.default();
            var layerGeometryType = layer && layer ? layer.geometryType : null;
            query.geometry = geometry;
            // If we don't have a search layer defined use a point lookup.
            if (lookupType === 'distance' || (lookupType === 'geometry' && !this.searchLayer)) {
                // Find features that are within x distance of search geometry
                query.spatialRelationship = relationship;
                query.distance = this.distance;
                query.units = units;
            }
            else if (lookupType === 'geometry') {
                query.spatialRelationship = layerGeometryType === "polygon" ? "contains" : "intersects";
            }
            return query;
        };
        DisplayLookupResults.prototype._applyLayerEffectAndFilter = function (layer, query) {
            var geometry = query.geometry, units = query.units, spatialRelationship = query.spatialRelationship, where = query.where;
            var props = {
                geometry: geometry,
                distance: this.distance,
                units: units,
                spatialRelationship: spatialRelationship,
                where: where
            };
            if (this.distance) {
                props.distance = this.distance;
            }
            if (units) {
                props.units = units;
            }
            var gray = 'grayscale(100%)';
            var sepia = 'sepia(100%)';
            // Filter the displayed features
            var displayUnmatchedResults = this.config.displayUnmatchedResults;
            if (layer && layer.type === "feature") {
                this.view.whenLayerView(layer).then(function (layerView) {
                    var filter = new FeatureFilter_1.default(props);
                    var effect = new FeatureEffect_1.default({ filter: filter });
                    if (!displayUnmatchedResults || displayUnmatchedResults === 'hide') {
                        layerView.filter = filter;
                        effect.filter = filter;
                    }
                    else {
                        effect.excludedEffect = displayUnmatchedResults === 'gray' ? gray : sepia;
                    }
                    layerView.effect = effect;
                });
            }
        };
        DisplayLookupResults.prototype._searchHighlight = function (graphic) {
            var _this = this;
            var _a, _b, _c;
            var lookupType = this.config.lookupType;
            if ((this === null || this === void 0 ? void 0 : this.searchLayer) && lookupType === 'geometry') {
                var key_2 = 'search-layer-handle';
                this._handles.remove(key_2);
                this.view.whenLayerView(this.searchLayer).then(function (layerView) {
                    _this._handles.add(layerView.highlight(graphic), key_2);
                });
                // graphic
                var queryFilter = {
                    distance: 0,
                    units: null,
                    geometry: null,
                    where: null
                };
                if (
                //	hideLookupLayers &&
                graphic.layer &&
                    graphic.layer.id && ((_a = this === null || this === void 0 ? void 0 : this.searchLayer) === null || _a === void 0 ? void 0 : _a.id) &&
                    graphic.layer.id === this.searchLayer.id) {
                    queryFilter.where = ((_b = this.searchLayer) === null || _b === void 0 ? void 0 : _b.objectIdField) + " = " + graphic.attributes[(_c = this.searchLayer) === null || _c === void 0 ? void 0 : _c.objectIdField];
                }
                else {
                    queryFilter.geometry =
                        graphic.geometry.type === 'polygon' ? graphic.geometry.extent.center : graphic.geometry;
                }
                this._applyLayerEffectAndFilter(this === null || this === void 0 ? void 0 : this.searchLayer, queryFilter);
            }
        };
        DisplayLookupResults.prototype._sortFeatures = function (features) {
            var _a = this.config, includeDistance = _a.includeDistance, units = _a.units, portal = _a.portal;
            // TODO: We really want the search location here so reconfigure
            // the app to include the searched location. 
            if (includeDistance && this.location) {
                // add distance val to the features and sort array by distance
                var location_1 = this.location.geometry;
                if (this.location.geometry && this.location.geometry.type && this.location.geometry.type === "polygon") {
                    var g = this.location.geometry;
                    location_1 = g.centroid;
                }
                geometryUtils_1.getDistances({
                    location: location_1,
                    portal: portal,
                    distance: this.distance || 0,
                    unit: units,
                    features: features
                });
                // sort the features based on the distance
                features.sort(function (a, b) {
                    if (a.attributes.lookupDistance > b.attributes.lookupDistance) {
                        return 1;
                    }
                    if (a.attributes.lookupDistance < b.attributes.lookupDistance) {
                        return -1;
                    }
                    return 0;
                });
            }
        };
        DisplayLookupResults.prototype.clearResults = function () {
            var _this = this;
            var hideLayers = this.config.hideLookupLayers;
            this._empty = true;
            this.lookupGraphics.clearGraphics();
            //this._bufferGraphic && this.view && this.view.graphics.remove(this._bufferGraphic);
            this._accordion && this._accordion.clear();
            this.lookupLayers &&
                this.lookupLayers.forEach(function (layer) {
                    _this.view.whenLayerView(layer).then(function (layerView) {
                        layerView.effect = null;
                        layerView.filter = null;
                        if (hideLayers) {
                            layerView.effect = new FeatureEffect_1.default({
                                excludedEffect: "opacity(0%)",
                                filter: new FeatureFilter_1.default({ where: '1=0' })
                            });
                        }
                    });
                });
            if (this.searchLayer) {
                this.view.whenLayerView(this.searchLayer).then(function (layerView) {
                    layerView.effect = null;
                    layerView.filter = null;
                    if (hideLayers) {
                        layerView.effect = new FeatureEffect_1.default({
                            excludedEffect: "opacity(0%)",
                            filter: new FeatureFilter_1.default({ where: '1=0' })
                        });
                    }
                });
            }
            this.clearHighlights();
            this.state = 'init';
        };
        DisplayLookupResults.prototype.clearHighlights = function () {
            this._handles.removeAll();
        };
        DisplayLookupResults.prototype._highlightFeature = function (graphic) {
            var _this = this;
            this.clearHighlights();
            this.view.whenLayerView(graphic.layer).then(function (layerView) {
                _this._handles.add(layerView.highlight(graphic));
            });
        };
        DisplayLookupResults.prototype._zoomToFeature = function (graphic) {
            var view = this.view;
            var zoomFactor = 4;
            var zoomScale = this.config.zoomScale ? this.config.zoomScale : view.scale / zoomFactor;
            var geometry = graphic.geometry;
            var isPoint = geometry && geometry.type === 'point';
            var useZoomScale = this.config.zoomScale || (isPoint && this._viewPoint.scale === view.scale) ? true : false;
            // config.zoomScale let's app configurer have control over zoom behavior
            this.view.goTo({ target: geometry, scale: useZoomScale ? zoomScale : undefined });
            this._highlightFeature(graphic);
        };
        DisplayLookupResults.prototype.destroy = function () {
            this.clearResults();
            this.clearHighlights();
        };
        DisplayLookupResults.prototype.createPostText = function () {
            return this.config.resultsPanelPostText && !this._empty ? (widget_1.tsx("p", { key: "postText", class: CSS.messageText, innerHTML: this.config.resultsPanelPostText })) : null;
        };
        DisplayLookupResults.prototype.createPreText = function () {
            return this.config.resultsPanelPreText && !this._empty ? (widget_1.tsx("p", { key: "preText", class: CSS.messageText, innerHTML: this.config.resultsPanelPreText })) : null;
        };
        DisplayLookupResults.prototype.createToggleLinks = function () {
            return this._accordion && this._accordion.showToggle() ? (widget_1.tsx("div", { key: "toggleBar", class: this.classes(CSS.toggleContentTools, CSS.calciteStyles.leaderHalf) },
                widget_1.tsx("button", { key: "open", class: this.classes(CSS.calciteStyles.button, CSS.calciteStyles.trailerHalf, CSS.calciteStyles.right, CSS.toggleContentBtn, CSS.calciteStyles.clearBtn, CSS.calciteStyles.smallBtn), onclick: this._openItems }, i18n.tools.open),
                widget_1.tsx("button", { key: "close", class: this.classes(CSS.calciteStyles.button, CSS.calciteStyles.trailerHalf, CSS.calciteStyles.leaderFull, CSS.calciteStyles.right, CSS.toggleContentBtn, CSS.calciteStyles.clearBtn, CSS.calciteStyles.smallBtn), onclick: this._closeItems }, i18n.tools.collapse))) : null;
        };
        DisplayLookupResults.prototype._openItems = function () {
            // IE 11 doesn't have support for Array.from 
            var elements = document.getElementsByClassName('accordion-section');
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.add("is-active");
            }
        };
        DisplayLookupResults.prototype._closeItems = function () {
            var elements = document.getElementsByClassName('accordion-section');
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove("is-active");
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "lookupGraphics", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisplayLookupResults.prototype, "location", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable(["groupResultsByLayer", "resultsPanelPostText", "resultsPanelPreText", "noResultsMessage", "autoZoomFirstResult"])
        ], DisplayLookupResults.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "mapPanel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "distance", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DisplayLookupResults.prototype, "searchLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            decorators_1.property()
        ], DisplayLookupResults.prototype, "lookupLayers", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DisplayLookupResults.prototype, "state", void 0);
        DisplayLookupResults = tslib_1.__decorate([
            decorators_1.subclass('app.DisplayLookupResults')
        ], DisplayLookupResults);
        return DisplayLookupResults;
    }((Widget_1.default)));
    return DisplayLookupResults;
});
//# sourceMappingURL=DisplayLookupResults.js.map