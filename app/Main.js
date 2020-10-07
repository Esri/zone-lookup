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
define(["require", "exports", "tslib", "./utilites/errorUtils", "./utilites/esriWidgetUtils", "./utilites/lookupLayerUtils", "esri/core/watchUtils", "ApplicationBase/support/domHelper", "./ConfigurationSettings", "./components/DetailPanel", "./components/DisplayLookupResults", "esri/core/Handles", "./components/Header", "./components/Footer", "./components/MapPanel", "esri/widgets/Search", "./components/LookupGraphics", "esri/layers/FeatureLayer", "./telemetry/telemetry", "dojo/i18n!./nls/resources", "esri/core/promiseUtils", "esri/geometry/support/jsonUtils"], function (require, exports, tslib_1, errorUtils_1, esriWidgetUtils_1, lookupLayerUtils_1, watchUtils_1, domHelper_1, ConfigurationSettings_1, DetailPanel_1, DisplayLookupResults_1, Handles_1, Header_1, Footer_1, MapPanel_1, Search_1, LookupGraphics, FeatureLayer_1, telemetry_1, i18n, promiseUtils_1, jsonUtils_1) {
    "use strict";
    ConfigurationSettings_1 = tslib_1.__importDefault(ConfigurationSettings_1);
    DetailPanel_1 = tslib_1.__importDefault(DetailPanel_1);
    DisplayLookupResults_1 = tslib_1.__importDefault(DisplayLookupResults_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Header_1 = tslib_1.__importDefault(Header_1);
    Footer_1 = tslib_1.__importDefault(Footer_1);
    MapPanel_1 = tslib_1.__importDefault(MapPanel_1);
    Search_1 = tslib_1.__importDefault(Search_1);
    FeatureLayer_1 = tslib_1.__importDefault(FeatureLayer_1);
    telemetry_1 = tslib_1.__importDefault(telemetry_1);
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
            this._appConfig = null;
            this._telemetry = null;
            this.searchWidget = null;
            this.mapPanel = null;
            this._detailPanel = null;
            this._handles = new Handles_1.default();
            this.lookupGraphics = null;
            //----------------------------------
            //  ApplicationBase
            //----------------------------------
            this.base = null;
            this._results = null;
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
            this._updateMapVisibility(base.config);
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var config = base.config, results = base.results, portal = base.portal;
            config.helperServices = tslib_1.__assign({}, base.portal.helperServices);
            var webMapItems = results.webMapItems;
            this._createSharedTheme();
            this._appConfig = new ConfigurationSettings_1.default(config);
            this._handleTelemetry();
            this._handles.add(watchUtils_1.init(this._appConfig, ["theme", "applySharedTheme"], function () {
                _this.handleThemeUpdates();
            }), "configuration");
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
                errorUtils_1.displayError({
                    title: 'Error',
                    message: error
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
                // Watch and update properties that affect the 
                // way results are displayed
                _this._handles.add(watchUtils_1.init(_this._appConfig, ["displayUnmatchedResults", "groupResultsByLayer"], function () {
                    if (_this._results) {
                        _this._displayResults(_this._results);
                    }
                }), "configuration");
                _this.view.when(function () {
                    _this._addHeader(item);
                    _this._addDetails();
                    _this._addFooter();
                    _this.view.popup = null;
                });
                document.body.classList.remove(CSS.loading);
                _this._handles.add(watchUtils_1.init(_this._appConfig, "customCSS", function (newValue, oldValue, propertyName) {
                    _this._handleCustomCSS();
                }));
                _this._addWidgets();
            });
        };
        LocationApp.prototype._addFooter = function () {
            var _this = this;
            var container = document.createElement("div");
            document.getElementById("sidePanel").appendChild(container);
            var footer = new Footer_1.default({
                noMap: this._appConfig.hideMap,
                container: container
            });
            this._handles.add(watchUtils_1.init(this._appConfig, "hideMap", function () {
                _this._updateMapVisibility(_this._appConfig);
            }), "configuration");
            footer.on("button-clicked", function () {
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
        };
        LocationApp.prototype._updateMapVisibility = function (config) {
            var hide = config.hideMap;
            var hideMapClass = "no-map";
            var mapClassList = document.body.classList;
            hide ? mapClassList.add(hideMapClass) : mapClassList.remove(hideMapClass);
        };
        LocationApp.prototype._addDetails = function () {
            var appid = this.base.config.appid;
            var _a = this._appConfig, introductionTitle = _a.introductionTitle, introductionContent = _a.introductionContent;
            if (appid === '') {
                if (!introductionTitle)
                    this._appConfig.introductionTitle = i18n.onboarding.title;
                if (!introductionContent)
                    this._appConfig.introductionContent = i18n.onboarding.content;
            }
            this._detailPanel = new DetailPanel_1.default({
                config: this._appConfig,
                view: this.view,
                container: document.getElementById('detailPanel')
            });
        };
        LocationApp.prototype._addHeader = function (item) {
            this._appConfig.title = this._appConfig.title || item.title || null;
            var headerComponent = new Header_1.default({
                config: this._appConfig,
                container: document.createElement("div")
            });
            var sidePanel = document.getElementById("sidePanel");
            sidePanel.insertBefore(headerComponent.container, sidePanel.firstChild);
        };
        LocationApp.prototype._addWidgets = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.view.when()];
                        case 1:
                            _a.sent();
                            // Add esri widgets to the app (legend, home etc)
                            esriWidgetUtils_1.addMapComponents({
                                view: this.view,
                                config: this._appConfig,
                                portal: this.base.portal
                            });
                            this._handles.add(watchUtils_1.init(this._appConfig, "extentSelector, extentSelectorConfig", function (value, oldValue, propertyName) {
                                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                                if (((_a = _this._appConfig) === null || _a === void 0 ? void 0 : _a.extentSelector) && ((_b = _this._appConfig) === null || _b === void 0 ? void 0 : _b.extentSelectorConfig)) {
                                    var constraints = ((_c = _this._appConfig) === null || _c === void 0 ? void 0 : _c.extentSelectorConfig) || null;
                                    var geometry = constraints === null || constraints === void 0 ? void 0 : constraints.geometry;
                                    if (geometry) {
                                        var extent_1 = jsonUtils_1.fromJSON(geometry);
                                        if (extent_1 && ((extent_1 === null || extent_1 === void 0 ? void 0 : extent_1.type) === "extent" || (extent_1 === null || extent_1 === void 0 ? void 0 : extent_1.type) === "polygon")) {
                                            constraints.geometry = extent_1;
                                            _this.view.goTo(extent_1, false).catch(function () { });
                                            (_f = (_e = (_d = _this.searchWidget) === null || _d === void 0 ? void 0 : _d.viewModel) === null || _e === void 0 ? void 0 : _e.allSources) === null || _f === void 0 ? void 0 : _f.forEach(function (source) {
                                                source.filter = {
                                                    geometry: extent_1
                                                };
                                            });
                                        }
                                    }
                                    else {
                                        constraints.geometry = null;
                                        (_j = (_h = (_g = _this.searchWidget) === null || _g === void 0 ? void 0 : _g.viewModel) === null || _h === void 0 ? void 0 : _h.allSources) === null || _j === void 0 ? void 0 : _j.forEach(function (source) {
                                            source.filter = null;
                                        });
                                    }
                                    _this.view.constraints = constraints;
                                }
                                else {
                                    _this.view.constraints.geometry = null;
                                    _this.view.constraints.minZoom = -1;
                                    _this.view.constraints.maxZoom = -1;
                                    _this.view.constraints.minScale = 0;
                                    _this.view.constraints.maxScale = 0;
                                    (_k = _this === null || _this === void 0 ? void 0 : _this.mapPanel) === null || _k === void 0 ? void 0 : _k.resetExtent();
                                }
                            }), "configuration");
                            this._setupFeatureSearchType();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._setupFeatureSearchType = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var config, lookupProps, searchLayer;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    config = this.base.config;
                    // Determine search lookup type
                    if (!config.enableSearchLayer) {
                        this.base.config.searchLayer = null;
                    }
                    this.lookupGraphics = new LookupGraphics({
                        view: this.view,
                        config: this._appConfig
                    });
                    this._handles.add(watchUtils_1.init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], function (value, oldValue, propertyName) {
                        _this.lookupGraphics.updateGraphics(propertyName, value);
                    }), "configuration");
                    lookupProps = {
                        config: config,
                        view: this.view,
                        searchLayer: this._appConfig.enableSearchLayer && this._appConfig.searchLayer ? this._appConfig.searchLayer : null,
                        hideFeaturesOnLoad: this._appConfig.hideLookupLayers
                    };
                    searchLayer = lookupLayerUtils_1.getSearchLayer(lookupProps);
                    this.lookupResults = new DisplayLookupResults_1.default({
                        lookupGraphics: this.lookupGraphics,
                        searchLayer: searchLayer,
                        config: this._appConfig,
                        view: this.view,
                        mapPanel: this.mapPanel,
                        container: 'resultsPanel'
                    });
                    this._handles.add(watchUtils_1.init(this._appConfig, ["lookupLayers", "enableSearchLayer", "searchLayer"], function (value, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var parsedLayers, lookupLayers, searchLayer_1;
                        var _a;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!(propertyName === "lookupLayers")) return [3 /*break*/, 2];
                                    // Lookup layers have been modified. Update results to 
                                    // only show included layers 
                                    config.lookupLayers = value;
                                    parsedLayers = ((_a = this._appConfig.lookupLayers) === null || _a === void 0 ? void 0 : _a.layers) ? this._appConfig.lookupLayers.layers : null;
                                    if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
                                        parsedLayers = null;
                                    }
                                    return [4 /*yield*/, lookupLayerUtils_1.getLookupLayers({
                                            view: this.view,
                                            lookupLayers: parsedLayers,
                                            hideFeaturesOnLoad: this._appConfig.hideLookupLayers
                                        })];
                                case 1:
                                    lookupLayers = _b.sent();
                                    this.lookupResults.lookupLayers = lookupLayers;
                                    if (this._results)
                                        this._displayResults(this._results);
                                    _b.label = 2;
                                case 2:
                                    if (propertyName === "searchLayer" || propertyName === "enableSearchLayer") {
                                        searchLayer_1 = lookupLayerUtils_1.getSearchLayer({
                                            view: this.view,
                                            searchLayer: this._appConfig.searchLayer,
                                            hideFeaturesOnLoad: this._appConfig.hideLookupLayers
                                        });
                                        //}
                                        this.lookupResults.searchLayer = this._appConfig.enableSearchLayer && searchLayer_1 ? searchLayer_1 : null;
                                        if (this._results)
                                            this._displayResults(this._results);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }), "configuration");
                    // need to make sure layers are loaded before search
                    this._addSearchWidget();
                    this._cleanUpHandles();
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._addSearchWidget = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _b, searchConfiguration, extentSelector, extentSelectorConfig, sources, searchProperties, handle;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    _b = this._appConfig, searchConfiguration = _b.searchConfiguration, extentSelector = _b.extentSelector, extentSelectorConfig = _b.extentSelectorConfig;
                    sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
                    if (sources) {
                        sources.forEach(function (source) {
                            var _a, _b, _c;
                            var sourceLayer = null;
                            if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.id)
                                sourceLayer = _this.view.map.findLayerById(source.layer.id);
                            if (!sourceLayer && ((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url))
                                sourceLayer = new FeatureLayer_1.default((_c = source === null || source === void 0 ? void 0 : source.layer) === null || _c === void 0 ? void 0 : _c.url);
                            source.layer = sourceLayer;
                        });
                    }
                    searchProperties = tslib_1.__assign({
                        view: this.view,
                        resultGraphicEnabled: false,
                        autoSelect: false,
                        popupEnabled: false,
                        container: "search"
                    }, searchConfiguration);
                    if (((_a = searchProperties === null || searchProperties === void 0 ? void 0 : searchProperties.sources) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                        searchProperties.includeDefaultSources = false;
                    }
                    this.searchWidget = new Search_1.default(searchProperties);
                    handle = this.searchWidget.viewModel.watch('state', function (state) {
                        if (state === 'ready') {
                            _this._handles.add(watchUtils_1.init(_this._appConfig, ["searchConfiguration.sources", "searchConfiguration.activeSourceIndex", "searchConfiguration.searchAllEnabled"], function (value, oldValue, propertyName) {
                                if (propertyName === "searchConfiguration.activeSourceIndex") {
                                    _this.searchWidget.activeSourceIndex = value;
                                }
                                if (propertyName === "searchConfiguration.searchAllEnabled") {
                                    _this.searchWidget.searchAllEnabled = value;
                                }
                                if (propertyName === "searchConfiguration.sources") {
                                    if (value) {
                                        value.forEach(function (source) {
                                            var _a, _b;
                                            if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                                                source.layer = new FeatureLayer_1.default((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                                            }
                                        });
                                    }
                                    _this.searchWidget.sources = value;
                                }
                            }), "configuration");
                            // If there's a find url param search for it
                            watchUtils_1.init(_this._appConfig, ["find", "findSource"], function () {
                                var _a;
                                var _b = _this._appConfig, find = _b.find, findSource = _b.findSource;
                                if (find) {
                                    if (!((_a = _this.searchWidget) === null || _a === void 0 ? void 0 : _a.viewModel))
                                        return;
                                    _this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
                                    if (findSource) {
                                        _this.searchWidget.activeSourceIndex = findSource;
                                    }
                                    _this.searchWidget.viewModel.search();
                                }
                            });
                            _this.searchWidget.on('search-clear', function () {
                                _this._cleanUpResults();
                                // Remove find url param
                                _this._updateUrlParam();
                                _this.mapPanel.resetExtent();
                            });
                            _this.searchWidget.on('search-complete', function (results) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                return tslib_1.__generator(this, function (_a) {
                                    this._displayResults(results);
                                    return [2 /*return*/];
                                });
                            }); });
                            // We also want to search for locations when users click on the map
                            _this.view.on('click', function (e) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var _a, _b;
                                return tslib_1.__generator(this, function (_c) {
                                    if ((_b = (_a = this.base) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.searchLayer) {
                                        this._cleanUpResults();
                                    }
                                    this.searchWidget.search(e.mapPoint);
                                    return [2 /*return*/];
                                });
                            }); });
                            handle.remove();
                            // conditionally hide on tablet
                            if (!_this.view.container.classList.contains('tablet-show')) {
                                _this.view.container.classList.add('tablet-hide');
                            }
                            // force search within map if nothing is configured
                            if (extentSelector) {
                                var geometry = (extentSelectorConfig === null || extentSelectorConfig === void 0 ? void 0 : extentSelectorConfig.geometry) || null;
                                if (geometry) {
                                    var extent_2 = jsonUtils_1.fromJSON(geometry);
                                    if (extent_2 && ((extent_2 === null || extent_2 === void 0 ? void 0 : extent_2.type) === "extent" || (extent_2 === null || extent_2 === void 0 ? void 0 : extent_2.type) === "polygon")) {
                                        _this.searchWidget.viewModel.allSources.forEach(function (source) {
                                            source.filter = {
                                                geometry: extent_2
                                            };
                                        });
                                    }
                                }
                            }
                            else if (!searchConfiguration) {
                                _this.searchWidget.viewModel.allSources.forEach(function (source) {
                                    source.withinViewEnabled = true;
                                });
                            }
                        }
                    });
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype.createTelemetry = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var portal, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            portal = this.base.portal;
                            _b = this;
                            return [4 /*yield*/, telemetry_1.default.init({ portal: portal, config: this._appConfig, appName: "config-demo" })];
                        case 1:
                            _b._telemetry = _c.sent();
                            (_a = this._telemetry) === null || _a === void 0 ? void 0 : _a.logPageView();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._handleTelemetry = function () {
            var _this = this;
            // Wait until both are defined 
            promiseUtils_1.eachAlways([watchUtils_1.whenDefinedOnce(this._appConfig, "googleAnalytics"),
                watchUtils_1.whenDefinedOnce(this._appConfig, "googleAnalyticsKey")]).then(function () {
                _this.createTelemetry();
                _this._handles.add([
                    watchUtils_1.watch(_this._appConfig, ["googleAnalytics", "googleAnalyticsKey"], function (newValue, oldValue, propertyName) {
                        _this.createTelemetry();
                    }),
                ], "configuration");
            });
        };
        LocationApp.prototype._generateSearchResults = function (location) {
            var _a, _b;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_c) {
                    // collapse the detail panel when results are found
                    if (this._detailPanel) {
                        this._detailPanel.collapse();
                    }
                    if (((_a = location === null || location === void 0 ? void 0 : location.attributes) === null || _a === void 0 ? void 0 : _a.length) === 0 && ((_b = this === null || this === void 0 ? void 0 : this.searchWidget) === null || _b === void 0 ? void 0 : _b.searchTerm)) {
                        location.attributes.Match_addr = this.searchWidget.searchTerm;
                    }
                    this.lookupResults && this.lookupResults.queryFeatures(location, 0);
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._displayResults = function (results) {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var index, feature;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            this._results = results;
                            if (!((_a = this.base.config) === null || _a === void 0 ? void 0 : _a.searchLayer)) {
                                this._cleanUpResults();
                            }
                            if (!(results.numResults > 0)) return [3 /*break*/, 2];
                            this._results = results;
                            // Add find url param
                            if (this._appConfig.mapPin || this._appConfig.mapPinLabel) {
                                this.lookupGraphics.updateGraphics("mapPin", this._appConfig.mapPin);
                                this.lookupGraphics.updateGraphics("mapPinLabel", this._appConfig.mapPinLabel);
                            }
                            index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
                            this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);
                            return [4 /*yield*/, lookupLayerUtils_1.getSearchGeometry({
                                    searchLayer: this.lookupResults.searchLayer || null,
                                    config: this._appConfig,
                                    view: this.view,
                                    results: results
                                })];
                        case 1:
                            feature = _b.sent();
                            this._generateSearchResults(feature);
                            _b.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._cleanUpResults = function () {
            // Clear the lookup results displayed in the side panel
            this.lookupResults && this.lookupResults.clearResults();
            this._results = null;
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
        LocationApp.prototype._createSharedTheme = function () {
            var _a, _b, _c;
            // use shared theme colors for header and buttons 
            var sharedTheme = (_c = (_b = (_a = this.base) === null || _a === void 0 ? void 0 : _a.portal) === null || _b === void 0 ? void 0 : _b.portalProperties) === null || _c === void 0 ? void 0 : _c.sharedTheme;
            if (!sharedTheme) {
                return;
            }
            var header = sharedTheme.header, button = sharedTheme.button;
            var styles = [];
            // Build and insert style
            if (header === null || header === void 0 ? void 0 : header.background)
                styles.push(".shared-theme .app-header{\n\t\t\tbackground:" + header.background + ";\n\t\t}\n\t\t.shared-theme .text-fade:after, .shared-theme .light .text-fade:after, .shared-theme .dark .text-fade:after {\n\t\t\tbackground: linear-gradient(to left, " + header.background + ", 40%, transparent 80%);\n\t\t  }\n\t\t  html[dir=\"rtl\"] .shared-theme .text-fade:before, .shared-theme .light .text-fade:before,  .shared-theme .dark .text-fade:after {\n\t\t\tbackground: linear-gradient(to right, " + header.background + ", 40%, transparent 80%);\n\t\t  }\n\t\t");
            if (header === null || header === void 0 ? void 0 : header.text)
                styles.push(".shared-theme .app-header a{\n\t\t\tcolor:" + header.text + ";\n\t\t} \n\t\t.shared-theme .app-header{\n\t\t\tcolor:" + header.text + ";\n\t\t} \n\t\t.shared-theme .toolbar-buttons{color:" + header.text + "}");
            if (button === null || button === void 0 ? void 0 : button.background)
                styles.push(".shared-theme .app-button{\n\t\t\tbackground:" + button.background + ";\n\t\t\t border-color:" + button.background + ";\n\t\t\t}\n\t\t\t.shared-theme .app-button.btn-blue{\n\t\t\t\tbackground:" + button.background + ";\n\t\t\t\tborder-color:" + button.background + ";\n\t\t\t} \n\t\t\t.shared-theme #detailPanel .svg-icon{\n\t\t\t\tcolor:" + button.background + ";}\n\t\t\t }");
            if (button === null || button === void 0 ? void 0 : button.text)
                styles.push(".shared-theme .app-button{\n\t\t\t\tcolor:" + button.text + ";\n\t\t\t}\n\t\t\t.shared-theme .app-button.btn-blue{color:" + button.text + ";}\n\t\t};");
            if (styles && styles.length && styles.length > 0) {
                var style = document.createElement('style');
                style.appendChild(document.createTextNode(styles.join('')));
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        };
        LocationApp.prototype.handleThemeUpdates = function () {
            // Check for a preferred color scheme and then
            // monitor updates to that color scheme and the
            // configuration panel updates.
            var _a = this._appConfig, theme = _a.theme, applySharedTheme = _a.applySharedTheme;
            if (theme) {
                var style = document.getElementById("esri-stylesheet");
                style.href = style.href.indexOf("light") !== -1 ? style.href.replace(/light/g, theme) : style.href.replace(/dark/g, theme);
                // add light/dark class
                document.body.classList.add(theme === "light" ? "light" : "dark");
                document.body.classList.remove(theme === "light" ? "dark" : "light");
            }
            applySharedTheme ? document.body.classList.add("shared-theme") : document.body.classList.remove("shared-theme");
        };
        LocationApp.prototype._handleCustomCSS = function () {
            var customCSSStyleSheet = document.getElementById("customCSS");
            if (customCSSStyleSheet) {
                customCSSStyleSheet.remove();
            }
            var styles = document.createElement("style");
            styles.id = "customCSS";
            styles.type = "text/css";
            var styleTextNode = document.createTextNode(this._appConfig.customCSS);
            styles.appendChild(styleTextNode);
            document.head.appendChild(styles);
        };
        LocationApp.prototype._cleanUpHandles = function () {
            // if we aren't in the config experience remove all handlers after load
            if (!this._appConfig.withinConfigurationExperience) {
                this._handles.remove("configuration");
            }
        };
        return LocationApp;
    }());
    return LocationApp;
});
//# sourceMappingURL=Main.js.map