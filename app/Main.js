/*
  Copyright 2017 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./utilites/errorUtils", "./utilites/esriWidgetUtils", "./utilites/lookupLayerUtils", "ApplicationBase/support/domHelper", "./components/DetailPanel", "./components/DisplayLookupResults", "esri/Graphic", "esri/core/Handles", "./components/Header", "./components/MapPanel", "esri/widgets/Search", "telemetry/telemetry.dojo", "esri/core/watchUtils", "dojo/i18n!./nls/resources", "esri/layers/FeatureLayer"], function (require, exports, errorUtils, esriWidgetUtils, lookupLayerUtils, domHelper_1, DetailPanel_1, DisplayLookupResults_1, Graphic_1, Handles_1, Header_1, MapPanel_1, Search_1, telemetry_dojo_1, watchUtils, i18n, FeatureLayer) {
    "use strict";
    errorUtils = __importStar(errorUtils);
    esriWidgetUtils = __importStar(esriWidgetUtils);
    lookupLayerUtils = __importStar(lookupLayerUtils);
    DetailPanel_1 = __importDefault(DetailPanel_1);
    DisplayLookupResults_1 = __importDefault(DisplayLookupResults_1);
    Graphic_1 = __importDefault(Graphic_1);
    Handles_1 = __importDefault(Handles_1);
    Header_1 = __importDefault(Header_1);
    MapPanel_1 = __importDefault(MapPanel_1);
    Search_1 = __importDefault(Search_1);
    telemetry_dojo_1 = __importDefault(telemetry_dojo_1);
    var CSS = {
        loading: 'configurable-application--loading'
    };
    var LocationApp = /** @class */ (function () {
        function LocationApp() {
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            this.telemetry = null;
            this.searchWidget = null;
            this.mapPanel = null;
            this._detailPanel = null;
            this._handles = new Handles_1.default();
            //----------------------------------
            //  ApplicationBase
            //----------------------------------
            this.base = null;
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        LocationApp.prototype.init = function (base) {
            var _this = this;
            if (!base) {
                console.error('ApplicationBase is not defined');
                return;
            }
            this._applySharedTheme(base);
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var config = base.config, results = base.results, portal = base.portal;
            config.helperServices = __assign({}, base.portal.helperServices);
            var webMapItems = results.webMapItems;
            if (config.noMap) {
                document.body.classList.add('no-map');
            }
            // Setup Telemetry
            if (config.telemetry) {
                var options = config.telemetry.prod;
                if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
                    // use devext credentials
                    options = config.telemetry.devext;
                }
                else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
                    // or qa
                    options = config.telemetry.qaext;
                }
                this.telemetry = new telemetry_dojo_1.default({
                    portal: portal,
                    disabled: options.disabled,
                    debug: options.debug,
                    amazon: options.amazon
                });
                this.telemetry.logPageView();
            }
            // Get web map
            var allItems = webMapItems.map(function (item) {
                return item;
            });
            var validWebMapItems = [];
            allItems.forEach(function (response) {
                if (response && response.error) {
                    return;
                }
                validWebMapItems.push(response.value);
            });
            var item = validWebMapItems[0];
            if (!item) {
                var error = 'Could not load an item to display';
                errorUtils.displayError({
                    title: 'Error',
                    message: error
                });
                this.telemetry.logError({
                    error: error
                });
                return;
            }
            this.mapPanel = new MapPanel_1.default({
                item: item,
                base: this.base,
                container: 'mapPanel'
            });
            var panelHandle = this.mapPanel.watch('view', function () {
                panelHandle.remove();
                _this.view = _this.mapPanel.view;
                _this._addHeader(item);
                _this.view.popup = null;
                document.body.classList.remove(CSS.loading);
                _this._addWidgets(config);
            });
        };
        LocationApp.prototype._addHeader = function (item) {
            var config = this.base.config;
            // Add a page header
            config.title = config.title || item.title;
            domHelper_1.setPageTitle(config.title);
            var detailTitle = config.detailTitle;
            var detailContent = config.detailContent;
            if (config.appid === '') {
                if (!detailTitle) {
                    detailTitle = i18n.onboarding.title;
                }
                if (!detailContent) {
                    detailContent = i18n.onboarding.content;
                }
            }
            if (detailTitle || detailContent || config.socialSharing) {
                this._detailPanel = new DetailPanel_1.default({
                    title: detailTitle || null,
                    content: detailContent,
                    view: this.view,
                    sharing: config.socialSharing,
                    container: document.getElementById('detailPanel')
                });
            }
            var header = new Header_1.default({
                title: config.title,
                titleLink: config.titleLink,
                container: 'header'
            });
        };
        LocationApp.prototype._addWidgets = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Add esri widgets to the app (legend, home etc)
                    esriWidgetUtils.addMapComponents({
                        view: this.view,
                        config: config,
                        portal: this.base.portal
                    });
                    this._setupFeatureSearchType();
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._setupFeatureSearchType = function () {
            return __awaiter(this, void 0, void 0, function () {
                var config, lookupType, Slider, distance, units, minDistance, maxDistance, distanceSlider_1, key, parsedLayers, lookupProps, _a, lookupLayers, searchLayer, openMapButton;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            config = this.base.config;
                            // Determine search lookup type
                            if (!config.searchLayerLookup) {
                                this.base.config.searchLayer = false;
                            }
                            lookupType = !config.searchLayerLookup || config.lookupType === 'geometry' ? 'geometry' : 'distance';
                            this.base.config.lookupType = lookupType;
                            if (!(lookupType === 'distance')) return [3 /*break*/, 2];
                            return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['./components/DistanceSlider'], resolve_1, reject_1); }).then(__importStar)];
                        case 1:
                            Slider = _b.sent();
                            if (!Slider) {
                                return [2 /*return*/];
                            }
                            distance = config.distance, units = config.units, minDistance = config.minDistance, maxDistance = config.maxDistance;
                            distanceSlider_1 = new Slider.default({
                                distance: distance,
                                units: units,
                                minDistance: minDistance,
                                maxDistance: maxDistance,
                                container: 'distanceOptions'
                            });
                            key = 'distance-slider';
                            this._handles.remove(key);
                            this._handles.add(distanceSlider_1.watch('currentValue', function () {
                                _this.base.config.distance = distanceSlider_1.currentValue;
                                if (_this.searchWidget && _this.searchWidget.searchTerm) {
                                    _this.searchWidget.search();
                                }
                            }), key);
                            _b.label = 2;
                        case 2:
                            parsedLayers = config.lookupLayers ? JSON.parse(config.lookupLayers) : null;
                            if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
                                parsedLayers = null;
                            }
                            lookupProps = {
                                view: this.view,
                                lookupLayers: parsedLayers,
                                searchLayer: config.searchLayer,
                                hideFeaturesOnLoad: config.hideLookupLayers
                            };
                            return [4 /*yield*/, Promise.all([
                                    lookupLayerUtils.getLookupLayers(lookupProps),
                                    lookupLayerUtils.getSearchLayer(lookupProps)
                                ])];
                        case 3:
                            _a = _b.sent(), lookupLayers = _a[0], searchLayer = _a[1];
                            this.lookupResults = new DisplayLookupResults_1.default({
                                lookupLayers: lookupLayers,
                                searchLayer: searchLayer,
                                config: this.base.config,
                                view: this.view,
                                mapPanel: this.mapPanel,
                                container: 'resultsPanel'
                            });
                            this._addSearchWidget();
                            //Add open map button
                            if (!config.noMap) {
                                openMapButton = document.createElement('button');
                                //Unable to add multiple classes in IE11
                                openMapButton.classList.add("icon-ui-maps");
                                openMapButton.classList.add("btn");
                                openMapButton.classList.add("btn-fill");
                                openMapButton.classList.add("btn-green");
                                openMapButton.classList.add("btn-open-map");
                                openMapButton.classList.add("app-button");
                                openMapButton.classList.add("tablet-show");
                                openMapButton.innerHTML = i18n.map.label;
                                document.getElementById('bottomNav').appendChild(openMapButton);
                                openMapButton.addEventListener('click', function () {
                                    _this.mapPanel.isMobileView = true;
                                    _this.view.container.classList.remove('tablet-hide');
                                    //update the maps describedby item
                                    document.getElementById('mapDescription').innerHTML = i18n.map.miniMapDescription;
                                    var mainNodes = document.getElementsByClassName('main-map-content');
                                    for (var j = 0; j < mainNodes.length; j++) {
                                        mainNodes[j].classList.add('hide');
                                    }
                                    // if view size increases to greater than tablet close button if not already closed
                                    var resizeListener = function () {
                                        _this.mapPanel.closeMap();
                                        window.removeEventListener("resize", resizeListener);
                                    };
                                    window.addEventListener("resize", resizeListener);
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addSearchWidget = function () {
            var _this = this;
            var _a = this.base.config, searchConfig = _a.searchConfig, find = _a.find, findSource = _a.findSource;
            var searchProperties = {
                view: this.view,
                resultGraphicEnabled: false,
                autoSelect: false,
                popupEnabled: false,
                container: 'search'
            };
            if (searchConfig) {
                var sources = searchConfig.sources, activeSourceIndex = searchConfig.activeSourceIndex, enableSearchingAll = searchConfig.enableSearchingAll;
                if (sources) {
                    searchProperties.sources = sources.filter(function (source) {
                        if (source.flayerId && source.url) {
                            var layer = _this.view.map.findLayerById(source.flayerId);
                            source.layer = layer ? layer : new FeatureLayer(source.url);
                        }
                        if (source.hasOwnProperty('enableSuggestions')) {
                            source.suggestionsEnabled = source.enableSuggestions;
                        }
                        if (source.hasOwnProperty('searchWithinMap')) {
                            source.withinViewEnabled = source.searchWithinMap;
                        }
                        return source;
                    });
                }
                if (searchProperties.sources && searchProperties.sources.length && searchProperties.sources.length > 0) {
                    searchProperties.includeDefaultSources = false;
                }
                searchProperties.searchAllEnabled =
                    enableSearchingAll && enableSearchingAll === false ? false : true;
                if (activeSourceIndex != null && activeSourceIndex != undefined &&
                    (searchProperties === null || searchProperties === void 0 ? void 0 : searchProperties.sources.length) >= activeSourceIndex) {
                    searchProperties.activeSourceIndex = activeSourceIndex;
                }
            }
            this.searchWidget = new Search_1.default(searchProperties);
            // If there's a find url param search for it
            if (find) {
                watchUtils.whenFalseOnce(this.view, "updating", function () {
                    _this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
                    if (findSource) {
                        _this.searchWidget.activeSourceIndex = findSource;
                    }
                    _this.searchWidget.viewModel.search();
                });
            }
            var handle = this.searchWidget.viewModel.watch('state', function (state) {
                if (state === 'ready') {
                    handle.remove();
                    // conditionally hide on tablet
                    if (!_this.view.container.classList.contains('tablet-show')) {
                        _this.view.container.classList.add('tablet-hide');
                    }
                    // force search within map if nothing is configured
                    if (!searchConfig) {
                        _this.searchWidget.viewModel.allSources.forEach(function (source) {
                            source.withinViewEnabled = true;
                        });
                    }
                }
            });
            this.searchWidget.on('search-clear', function () {
                _this._cleanUpResults();
                _this.mapPanel.resetExtent();
                // Remove find url param
                _this._updateUrlParam();
            });
            this.searchWidget.on('search-complete', function (results) { return __awaiter(_this, void 0, void 0, function () {
                var index, searchLayer, feature;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._cleanUpResults();
                            if (!(results.numResults > 0)) return [3 /*break*/, 2];
                            index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
                            this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);
                            searchLayer = (this.lookupResults && this.lookupResults.searchLayer) || null;
                            return [4 /*yield*/, lookupLayerUtils.getSearchGeometry({
                                    searchLayer: searchLayer,
                                    config: this.base.config,
                                    view: this.view,
                                    results: results
                                })];
                        case 1:
                            feature = _a.sent();
                            this._generateSearchResults(feature);
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
            // We also want to search for locations when users click on the map
            this.view.on('click', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    this.searchWidget.search(e.mapPoint).then(function (response) {
                        if (response && response.numResults < 1) {
                            _this._displayNoResultsMessage(e.mapPoint);
                        }
                        if (response && response.numErrors && response.numErrors > 0) {
                            _this._displayNoResultsMessage(e.mapPoint);
                        }
                    });
                    return [2 /*return*/];
                });
            }); });
        };
        LocationApp.prototype._displayNoResultsMessage = function (geometry) {
            // display no results message
            var g = new Graphic_1.default({ geometry: geometry });
            this._generateSearchResults(g);
            this.searchWidget.activeMenu = null;
        };
        LocationApp.prototype._generateSearchResults = function (location) {
            return __awaiter(this, void 0, void 0, function () {
                var distance;
                return __generator(this, function (_a) {
                    // collapse the detail panel when results are found
                    if (this._detailPanel) {
                        this._detailPanel.collapse();
                    }
                    distance = (this.base.config && this.base.config.distance) || 0;
                    this.lookupResults && this.lookupResults.queryFeatures(location, distance);
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._cleanUpResults = function () {
            // Clear the lookup results displayed in the side panel
            this.lookupResults && this.lookupResults.clearResults();
            this.view.graphics.removeAll();
            this.mapPanel && this.mapPanel.clearResults();
        };
        LocationApp.prototype._updateUrlParam = function (searchTerm, index) {
            if ('URLSearchParams' in window) {
                var params = new URLSearchParams(document.location.search);
                if (searchTerm) {
                    if (index && (index > 0 || index === 0)) {
                        params.set('findSource', index);
                    }
                    else {
                        params.delete('findSource');
                    }
                    params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
                }
                else {
                    params.delete('find');
                    params.delete('findSource');
                }
                window.history.replaceState({}, '', location.pathname + "?" + params);
            }
        };
        LocationApp.prototype._applySharedTheme = function (base) {
            var config = base.config;
            // Build and insert style
            var styles = [];
            styles.push(config.headerBackground ? ".app-header{background:" + config.headerBackground + ";}" : null);
            styles.push(config.headerColor
                ? ".app-header a{color:" + config.headerColor + ";}.app-header{color:" + config.headerColor + ";}.toolbar-buttons{color:" + config.headerColor + "}"
                : null);
            styles.push(config.buttonBackground
                ? ".app-button{background:" + config.buttonBackground + "; border-color:" + config.buttonBackground + ";}.app-button.btn-green{background:" + config.buttonBackground + ";border-color:" + config.buttonBackground + ";} #detailPanel .svg-icon{color:" + config.buttonBackground + ";} }"
                : null);
            styles.push(config.buttonColor
                ? ".app-button{color:" + config.buttonColor + ";}.app-button.btn-green{color:" + config.buttonColor + ";}};"
                : null);
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(styles.join('')));
            document.getElementsByTagName('head')[0].appendChild(style);
        };
        return LocationApp;
    }());
    return LocationApp;
});
//# sourceMappingURL=Main.js.map