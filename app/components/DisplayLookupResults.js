var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Accessor", "esri/core/Handles", "esri/widgets/support/widget", "../utilites/geometryUtils", "esri/core/promiseUtils", "esri/tasks/support/Query", "esri/views/layers/support/FeatureFilter", "esri/views/layers/support/FeatureEffect", "./FeatureAccordion", "./GroupedAccordion", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, Accessor_1, Handles_1, widget_1, geometryUtils, promiseUtils, Query_1, FeatureFilter_1, FeatureEffect_1, FeatureAccordion_1, GroupedAccordion_1, i18n) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Accessor_1 = __importDefault(Accessor_1);
    Handles_1 = __importDefault(Handles_1);
    geometryUtils = __importStar(geometryUtils);
    promiseUtils = __importStar(promiseUtils);
    Query_1 = __importDefault(Query_1);
    FeatureFilter_1 = __importDefault(FeatureFilter_1);
    FeatureEffect_1 = __importDefault(FeatureEffect_1);
    FeatureAccordion_1 = __importDefault(FeatureAccordion_1);
    GroupedAccordion_1 = __importDefault(GroupedAccordion_1);
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
        __extends(DisplayLookupResults, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function DisplayLookupResults(props) {
            var _this = _super.call(this) || this;
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
            //_multipleResults: number = 0;
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
            var distance = props.config.distance;
            _this.distance = distance || 0;
            return _this;
        }
        DisplayLookupResults.prototype.render = function () {
            var loader = this.state === 'loading' ? (widget_1.tsx("div", { key: "loader", class: "loader is-active padding-leader-3 padding-trailer-3" },
                widget_1.tsx("div", { key: "loaderBars", class: "loader-bars" }),
                widget_1.tsx("div", { key: "loaderText", class: "loader-text" },
                    i18n.load.label,
                    "..."))) : null;
            var ready = this.state === 'ready' || false;
            var _a = this.config, resultsPanelPreText = _a.resultsPanelPreText, resultsPanelPostText = _a.resultsPanelPostText;
            // No Results 
            var errorText = null;
            if (this._empty && ready) {
                errorText = this.config.noResultsMessage || i18n.noFeatures;
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
            var _a = this, _featureResults = _a._featureResults, config = _a.config, view = _a.view;
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
                    features_1 = this._accordion.features.length && this._accordion.features.length > 0 ? this._accordion.features : null;
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
            var promises = [];
            if (!location) {
                this.state = 'init';
                this._featureResults = [];
                promiseUtils.resolve();
            }
            else {
                this._createBuffer(location.geometry);
                // Highlight search layer
                this._searchHighlight(location);
                this.lookupLayers.forEach(function (layer) {
                    var query = _this._createQuery(layer, location);
                    _this._applyLayerEffectAndFilter(layer, query);
                    if (!layer) {
                        _this.state = 'init';
                        return promiseUtils.resolve();
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
                        _this._applyLayerEffectAndFilter(layer, query);
                        promises.push(promiseUtils.resolve({ features: [location], title: layer && layer.title ? layer.title : null, id: layer && layer.id ? layer.id : null }));
                    }
                    else {
                        _this.view.whenLayerView(layer).then(function (layerView) {
                            if (layerView) {
                                promises.push(layerView.layer.queryFeatures(query).then(function (results) {
                                    _this._applyLayerEffectAndFilter(layer, query);
                                    return {
                                        features: results.features,
                                        title: layer && layer.title ? layer.title : null,
                                        id: layer && layer.id ? layer.id : null
                                    };
                                }));
                            }
                        });
                    }
                });
            }
            return Promise.all(promises).then(function (results) {
                _this._featureResults = [];
                var groupResultsByLayer = _this.config.groupResultsByLayer;
                // Loop through the feaures 
                results.forEach(function (result) {
                    // do we have features? 
                    if (result.features && result.features.length && result.features.length > 0) {
                        if (groupResultsByLayer) {
                            _this._sortFeatures(result.features);
                            _this._featureResults.push({
                                title: result.title,
                                features: result.features
                            });
                        }
                        else {
                            // each feature is its own section 
                            var features_2 = [];
                            results.forEach(function (result) { features_2.push.apply(features_2, result.features); });
                            _this._sortFeatures(features_2);
                            _this._featureResults = [{
                                    features: features_2,
                                    title: null,
                                    grouped: false
                                }];
                        }
                    }
                });
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
                var sr = void 0;
                switch (layerGeometryType) {
                    case 'point':
                        sr = 'contains';
                    case 'polygon':
                        sr = 'contains';
                        break;
                    case 'polyline':
                        sr = 'intersects';
                        break;
                    default:
                        sr = 'intersects';
                        break;
                }
                query.spatialRelationship = sr;
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
        DisplayLookupResults.prototype._createBuffer = function (location) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, lookupType, drawBuffer, portal, units, bufferSymbolColor, buffer;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this.config, lookupType = _a.lookupType, drawBuffer = _a.drawBuffer, portal = _a.portal, units = _a.units, bufferSymbolColor = _a.bufferSymbolColor;
                            if (!(lookupType === 'distance' && drawBuffer)) return [3 /*break*/, 2];
                            buffer = geometryUtils.bufferGeometry({
                                location: location,
                                portal: portal,
                                distance: this.distance,
                                unit: units
                            });
                            this._bufferGraphic = geometryUtils.createBufferGraphic(buffer, bufferSymbolColor);
                            return [4 /*yield*/, this.view.graphics.add(this._bufferGraphic)];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        DisplayLookupResults.prototype._searchHighlight = function (graphic) {
            var _this = this;
            var lookupType = this.config.lookupType;
            if (this.searchLayer && lookupType === 'geometry') {
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
                    graphic.layer.id &&
                    this.searchLayer &&
                    this.searchLayer.id &&
                    graphic.layer.id === this.searchLayer.id) {
                    queryFilter.where = this.searchLayer.objectIdField + " = " + graphic.attributes[this.searchLayer.objectIdField];
                }
                else {
                    queryFilter.geometry =
                        graphic.geometry.type === 'polygon' ? graphic.geometry.extent.center : graphic.geometry;
                }
                this._applyLayerEffectAndFilter(this.searchLayer, queryFilter);
            }
        };
        DisplayLookupResults.prototype._sortFeatures = function (features) {
            var _a = this.config, includeDistance = _a.includeDistance, units = _a.units, portal = _a.portal;
            if (includeDistance && this.location) {
                // add distance val to the features and sort array by distance
                geometryUtils.getDistances({
                    location: this.location.geometry,
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
            //const { hideLookupLayers } = this.config;
            var hideLayers = this.config.hideLookupLayers;
            this._empty = true;
            this._bufferGraphic && this.view && this.view.graphics.remove(this._bufferGraphic);
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
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DisplayLookupResults.prototype, "location", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "mapPanel", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "distance", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "searchLayer", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "lookupLayers", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DisplayLookupResults.prototype, "state", void 0);
        DisplayLookupResults = __decorate([
            decorators_1.subclass('app.DisplayLookupResults')
        ], DisplayLookupResults);
        return DisplayLookupResults;
    }(decorators_1.declared(Widget_1.default, Accessor_1.default)));
    return DisplayLookupResults;
});
//# sourceMappingURL=DisplayLookupResults.js.map