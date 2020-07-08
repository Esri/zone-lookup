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
define(["require", "exports", "tslib", "./utilites/errorUtils", "./utilites/esriWidgetUtils", "./utilites/lookupLayerUtils", "esri/core/watchUtils", "./application-base-js/support/domHelper", "./ConfigurationSettings", "./components/DetailPanel", "./components/DisplayLookupResults", "esri/Graphic", "esri/core/Handles", "./components/Header", "./components/Footer", "./components/MapPanel", "esri/widgets/Search", "telemetry/telemetry.dojo", "./components/LookupGraphics", "esri/layers/FeatureLayer", "dojo/i18n!./nls/resources"], function (require, exports, tslib_1, errorUtils_1, esriWidgetUtils_1, lookupLayerUtils_1, watchUtils_1, domHelper_1, ConfigurationSettings_1, DetailPanel_1, DisplayLookupResults_1, Graphic_1, Handles_1, Header_1, Footer_1, MapPanel_1, Search_1, telemetry_dojo_1, LookupGraphics, FeatureLayer_1, i18n) {
    "use strict";
    ConfigurationSettings_1 = tslib_1.__importDefault(ConfigurationSettings_1);
    DetailPanel_1 = tslib_1.__importDefault(DetailPanel_1);
    DisplayLookupResults_1 = tslib_1.__importDefault(DisplayLookupResults_1);
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Header_1 = tslib_1.__importDefault(Header_1);
    Footer_1 = tslib_1.__importDefault(Footer_1);
    MapPanel_1 = tslib_1.__importDefault(MapPanel_1);
    Search_1 = tslib_1.__importDefault(Search_1);
    telemetry_dojo_1 = tslib_1.__importDefault(telemetry_dojo_1);
    FeatureLayer_1 = tslib_1.__importDefault(FeatureLayer_1);
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
            this.telemetry = null;
            this.searchWidget = null;
            this.mapPanel = null;
            this._detailPanel = null;
            this._handles = new Handles_1.default();
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
            this._handles.add(watchUtils_1.init(this._appConfig, ["theme", "applySharedTheme"], function () {
                _this.handleThemeUpdates();
            }), "configuration");
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
                errorUtils_1.displayError({
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
                // Watch and update properties that affect the 
                // way results are displayed
                _this._handles.add(watchUtils_1.init(_this._appConfig, ["displayUnmatchedResults", "groupResultsByLayer"], function () {
                    if (_this._results) {
                        _this._displayResults(_this._results);
                    }
                }), "configuration");
                _this._addHeader(item);
                _this._addDetails();
                _this._addFooter();
                _this.view.popup = null;
                document.body.classList.remove(CSS.loading);
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
            this._appConfig.title = this._appConfig.title || item.title;
            var headerComponent = new Header_1.default({
                config: this._appConfig,
                container: document.createElement("div")
            });
            var sidePanel = document.getElementById("sidePanel");
            sidePanel.insertBefore(headerComponent.container, sidePanel.firstChild);
        };
        LocationApp.prototype._addWidgets = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Add esri widgets to the app (legend, home etc)
                    esriWidgetUtils_1.addMapComponents({
                        view: this.view,
                        config: this._appConfig,
                        portal: this.base.portal
                    });
                    this._setupFeatureSearchType();
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._setupFeatureSearchType = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var config, lookupGraphics, configuredLayers, lookupLayers, lookupProps, searchLayer;
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = this.base.config;
                            // Determine search lookup type
                            if (!config.enableSearchLayer) {
                                this.base.config.searchLayer = null;
                            }
                            lookupGraphics = new LookupGraphics({
                                view: this.view,
                                config: this._appConfig
                            });
                            this._handles.add(watchUtils_1.init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], function (value, oldValue, propertyName) {
                                lookupGraphics.updateGraphics(propertyName, value);
                            }), "configuration");
                            return [4 /*yield*/, lookupLayerUtils_1.findConfiguredLookupLayers(this.view, config)];
                        case 1:
                            configuredLayers = _a.sent();
                            lookupLayers = lookupLayerUtils_1.getLookupLayers(configuredLayers);
                            lookupProps = {
                                config: config,
                                view: this.view,
                                lookupLayers: lookupLayers,
                                searchLayer: this._appConfig.enableSearchLayer && this._appConfig.searchLayer ? this._appConfig.searchLayer : null,
                                hideFeaturesOnLoad: this._appConfig.hideLookupLayers
                            };
                            return [4 /*yield*/, lookupLayerUtils_1.getSearchLayer(lookupProps)];
                        case 2:
                            searchLayer = _a.sent();
                            this.lookupResults = new DisplayLookupResults_1.default({
                                lookupLayers: lookupLayers,
                                lookupGraphics: lookupGraphics,
                                searchLayer: searchLayer,
                                config: this._appConfig,
                                view: this.view,
                                mapPanel: this.mapPanel,
                                container: 'resultsPanel'
                            });
                            this._handles.add(watchUtils_1.watch(this._appConfig, ["lookupLayers", "enableSearchLayer", "searchLayer"], function (value, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var configuredLayers_1, _a, searchLayer_1;
                                return tslib_1.__generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!(propertyName === "lookupLayers")) return [3 /*break*/, 3];
                                            // Lookup layers have been modified. Update results to 
                                            // only show included layers 
                                            config.lookupLayers = value;
                                            return [4 /*yield*/, lookupLayerUtils_1.findConfiguredLookupLayers(this.view, config)];
                                        case 1:
                                            configuredLayers_1 = _b.sent();
                                            _a = this.lookupResults;
                                            return [4 /*yield*/, lookupLayerUtils_1.getLookupLayers(configuredLayers_1)];
                                        case 2:
                                            _a.lookupLayers = _b.sent();
                                            if (this._results)
                                                this._displayResults(this._results);
                                            _b.label = 3;
                                        case 3:
                                            if (!(propertyName === "searchLayer" || propertyName === "enableSearchLayer")) return [3 /*break*/, 6];
                                            searchLayer_1 = null;
                                            if (!(propertyName === "enableSearchLayer")) return [3 /*break*/, 5];
                                            return [4 /*yield*/, lookupLayerUtils_1.getSearchLayer({
                                                    view: this.view,
                                                    lookupLayers: lookupLayers,
                                                    searchLayer: value,
                                                    hideFeaturesOnLoad: this._appConfig.hideLookupLayers
                                                })];
                                        case 4:
                                            searchLayer_1 = _b.sent();
                                            _b.label = 5;
                                        case 5:
                                            this.lookupResults.searchLayer = searchLayer_1;
                                            if (this._results)
                                                this._displayResults(this._results);
                                            _b.label = 6;
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); }), "configuration");
                            this._addSearchWidget();
                            this._cleanUpHandles();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addSearchWidget = function () {
            var _this = this;
            var _a;
            var _b = this._appConfig, searchConfiguration = _b.searchConfiguration, find = _b.find, findSource = _b.findSource;
            var sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
            if (sources) {
                sources.forEach(function (source) {
                    var _a, _b;
                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                        source.layer = new FeatureLayer_1.default((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                    }
                });
            }
            var searchProperties = tslib_1.__assign({
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
            this._handles.add(watchUtils_1.init(this._appConfig, ["searchConfiguration.sources", "searchConfiguration.activeSourceIndex", "searchConfiguration.searchAllEnabled"], function (value, oldValue, propertyName) {
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
            if (find) {
                watchUtils_1.whenFalseOnce(this.view, "updating", function () {
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
                    if (!searchConfiguration) {
                        _this.searchWidget.viewModel.allSources.forEach(function (source) {
                            source.withinViewEnabled = true;
                        });
                    }
                }
            });
            this.searchWidget.on('search-clear', function () {
                _this._cleanUpResults();
                // Remove find url param
                _this._updateUrlParam();
                _this.mapPanel.resetExtent();
            });
            this.searchWidget.on('search-complete', function (results) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this._displayResults(results);
                    return [2 /*return*/];
                });
            }); });
            // We also want to search for locations when users click on the map
            this.view.on('click', function (e) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    if ((_b = (_a = this.base) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.searchLayer) {
                        this._cleanUpResults();
                    }
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // collapse the detail panel when results are found
                    if (this._detailPanel) {
                        this._detailPanel.collapse();
                    }
                    this.lookupResults && this.lookupResults.queryFeatures(location, 0);
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._displayResults = function (results) {
            var _a, _b;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var index, searchLayer, feature;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            this._results = results;
                            if (!((_a = this.base.config) === null || _a === void 0 ? void 0 : _a.searchLayer)) {
                                this._cleanUpResults();
                            }
                            if (!(results.numResults > 0)) return [3 /*break*/, 2];
                            this._results = results;
                            index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
                            this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);
                            searchLayer = ((_b = this.lookupResults) === null || _b === void 0 ? void 0 : _b.searchLayer) || null;
                            return [4 /*yield*/, lookupLayerUtils_1.getSearchGeometry({
                                    searchLayer: searchLayer,
                                    config: this._appConfig,
                                    view: this.view,
                                    results: results
                                })];
                        case 1:
                            feature = _c.sent();
                            this._generateSearchResults(feature);
                            _c.label = 2;
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
                styles.push(".shared-theme .app-header{\n\t\t\tbackground:" + header.background + ";\n\t\t}\n\t\t.shared-theme .text-fade:after {\n\t\t\tbackground: linear-gradient(to left, " + header.background + ", 40%, transparent 100%);\n\t\t  }\n\t\t  html[dir=\"rtl\"] .light .text-fade:after {\n\t\t\tbackground: linear-gradient(to right, " + header.background + ", 40%, transparent 100%);\n\t\t  }\n\t\t");
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