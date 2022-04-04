/*
 *   Copyright (c) 2021 Esri
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Handles", "esri/widgets/Search", "esri/layers/FeatureLayer", "esri/geometry/support/jsonUtils", "esri/widgets/support/widget", "esri/widgets/Sketch/SketchViewModel", "esri/layers/GraphicsLayer", "esri/core/watchUtils", "../utilites/utils"], function (require, exports, tslib_1, decorators_1, Widget_1, Handles_1, Search_1, FeatureLayer_1, jsonUtils_1, widget_1, SketchViewModel_1, GraphicsLayer_1, watchUtils_1, utils_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Search_1 = tslib_1.__importDefault(Search_1);
    FeatureLayer_1 = tslib_1.__importDefault(FeatureLayer_1);
    SketchViewModel_1 = tslib_1.__importDefault(SketchViewModel_1);
    GraphicsLayer_1 = tslib_1.__importDefault(GraphicsLayer_1);
    var CSS = {
        panel: "panel",
        panelNoBorder: "panel-no-border",
        searchPanel: "panel-search",
        filterPanelBar: "panel-filter-bar",
        filterButton: "filter-button",
        filterIcon: "filter",
        sketchIcon: "polygon-vertices",
        buttonLink: "btn-link",
        button: "btn",
        hide: "hide"
    };
    var SearchPanel = /** @class */ (function (_super) {
        tslib_1.__extends(SearchPanel, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function SearchPanel(props) {
            var _this = _super.call(this, props) || this;
            _this.filterPanel = null;
            _this.view = null;
            _this.searchWidget = null;
            _this.showDrawNotification = false;
            _this.sketchTool = null;
            _this.sketchComplete = false;
            _this.sketchGeometry = null;
            _this.sketchGraphic = null;
            _this.state = "loading";
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._handles = new Handles_1.default();
            return _this;
        }
        SearchPanel.prototype.render = function () {
            var _this = this;
            var _a = this.config, enableFilter = _a.enableFilter, enableSketchTools = _a.enableSketchTools, panelSize = _a.panelSize, hideMap = _a.hideMap;
            var count = this._getActiveFilters();
            var filterTitle = this.config.appBundle.tools.filter;
            var sketchTitle = this.config.appBundle.tools.sketch;
            var activeFiltersChip = count > 0 ? this._renderFilterChip(count) : null;
            var buttonClasses = CSS.filterButton;
            var showSketchNotification = this.showDrawNotification ? widget_1.tsx("div", { class: this.classes(utils_1.setPanelSize(panelSize), "sketch-notification") },
                widget_1.tsx("calcite-notice", { active: true, width: "full", scale: "m", bind: this, afterCreate: function (element) {
                        element.addEventListener("calciteNoticeClose", function () {
                            _this.showDrawNotification = false;
                            _this === null || _this === void 0 ? void 0 : _this.sketchTool.cancel();
                        }, { once: true });
                    } },
                    widget_1.tsx("div", { slot: "title" }, this.config.appBundle.tools.sketch),
                    widget_1.tsx("div", { slot: "message" }, this.config.appBundle.tools.sketchInstructions),
                    widget_1.tsx("calcite-action", { id: "sketchButton", text: this.config.appBundle.cancel, textEnabled: true, icon: "x", slot: "actions-end", scale: "m", bind: this, onclick: function () {
                            _this.showDrawNotification = false;
                            _this === null || _this === void 0 ? void 0 : _this.sketchTool.cancel();
                        } }))) : null;
            var filterButton = enableFilter ?
                widget_1.tsx("calcite-action", { id: "filterButton", color: "neutral", appearance: "clear", scale: "m", "aria-labelledby": count > 0 ? "chip chip-label chip-tip" : null, class: buttonClasses, "aria-label": filterTitle, bind: this, onclick: this._toggleFilterPanel, icon: CSS.filterIcon }, activeFiltersChip) : null;
            var sketchButton = enableSketchTools && !hideMap ? widget_1.tsx("calcite-action", { id: "sketchButton", color: "neutral", appearance: "clear", scale: "m", class: buttonClasses, "aria-label": sketchTitle, bind: this, onclick: this._drawSketch, icon: CSS.sketchIcon }) : null;
            return (widget_1.tsx("div", { class: this.classes(CSS.panel, CSS.searchPanel, CSS.panelNoBorder) },
                widget_1.tsx("div", { class: "search-container-panel" },
                    showSketchNotification,
                    widget_1.tsx("div", { class: "search-container", bind: this, afterCreate: this._createSearch }),
                    widget_1.tsx("calcite-tooltip-manager", null, filterButton),
                    sketchButton)));
        };
        SearchPanel.prototype._createSearch = function (container) {
            var _this = this;
            var _a;
            var _b = this.config, searchConfiguration = _b.searchConfiguration, find = _b.find;
            var sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
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
            var searchProperties = tslib_1.__assign({
                view: this.view,
                autoSelect: false,
                resultGraphicEnabled: false,
                popupEnabled: false,
                container: container
            }, searchConfiguration);
            if (((_a = searchProperties === null || searchProperties === void 0 ? void 0 : searchProperties.sources) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                searchProperties.includeDefaultSources = false;
                var sources_1 = searchProperties.sources.filter(function (source) {
                    var prop = source;
                    if ((prop === null || prop === void 0 ? void 0 : prop.singleLineFieldName) === null) {
                        console.log("P.name", prop.name);
                        prop.singleLineFieldName = "SingleLine";
                        console.log("Hßßßß");
                    }
                    if ((prop === null || prop === void 0 ? void 0 : prop.name) === "ArcGIS World Geocoding Service") {
                        console.log("HERE");
                        var outFields = source.outFields || ["Addr_type", "Match_addr", "StAddr", "City"];
                        prop.outFields = outFields;
                        prop.singleLineFieldName = "SingleLine";
                        return true;
                    }
                    else {
                        return true;
                    }
                });
                searchProperties.sources = sources_1;
            }
            else {
                searchProperties.includeDefaultSources = true;
            }
            this.searchWidget = new Search_1.default(searchProperties);
            var handle = this.searchWidget.viewModel.watch('state', function (state) {
                if (state === 'ready') {
                    _this.state = "ready";
                    handle.remove();
                    watchUtils_1.whenDefinedOnce(_this.searchWidget, "allPlaceholder", function () {
                        _this.searchWidget.allSources.forEach(function (s) {
                            if (s.placeholder === "") {
                                s.placeholder = _this.searchWidget.allPlaceholder;
                            }
                        });
                    });
                    // If there's a find url param search for it when view is done updating 
                    if (find) {
                        _this._updateSearchTerm();
                    }
                    watchUtils_1.init(_this.config, "extentSelector, extentSelectorConfig", function () {
                        if (!_this.searchWidget)
                            return;
                        _this._updateSearchExtent();
                    });
                    watchUtils_1.watch(_this.config, "searchConfiguration", function (newValue, oldValue, propertyName) {
                        var _a, _b;
                        if (_this.searchWidget) {
                            _this._updateSources((_b = (_a = _this.config) === null || _a === void 0 ? void 0 : _a.searchConfiguration) === null || _b === void 0 ? void 0 : _b.sources);
                        }
                    });
                }
            });
        };
        SearchPanel.prototype._updateSearchTerm = function () {
            var _a = this.config, find = _a.find, findSource = _a.findSource;
            this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
            if (findSource) {
                this.searchWidget.set("activeSourceIndex", 2);
            }
            var source = this.searchWidget.activeSource;
            if (!(source === null || source === void 0 ? void 0 : source.filter) && this.view) {
                if (!source)
                    return;
                var handle_1 = this.searchWidget.on("search-complete", function () {
                    handle_1.remove();
                    source.filter = null;
                });
                source.filter = {
                    geometry: this === null || this === void 0 ? void 0 : this.view.extent
                };
            }
            this.searchWidget.viewModel.search();
        };
        SearchPanel.prototype._updateSearchExtent = function () {
            var _a, _b;
            var _c = this.config, extentSelector = _c.extentSelector, extentSelectorConfig = _c.extentSelectorConfig;
            if (extentSelector) {
                var geometry = (_b = (_a = extentSelectorConfig === null || extentSelectorConfig === void 0 ? void 0 : extentSelectorConfig.constraints) === null || _a === void 0 ? void 0 : _a.geometry) !== null && _b !== void 0 ? _b : null;
                if (geometry) {
                    var extent_1 = jsonUtils_1.fromJSON(geometry);
                    if (extent_1 && ((extent_1 === null || extent_1 === void 0 ? void 0 : extent_1.type) === "extent" || (extent_1 === null || extent_1 === void 0 ? void 0 : extent_1.type) === "polygon")) {
                        this.searchWidget.viewModel.allSources.forEach(function (source) {
                            source.filter = {
                                geometry: extent_1
                            };
                        });
                    }
                }
            }
        };
        SearchPanel.prototype._updateSources = function (sources) {
            var _this = this;
            var updatedSources = null;
            if (sources) {
                updatedSources = sources.filter(function (source) {
                    var _a, _b, _c;
                    var sourceLayer = null;
                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.id)
                        sourceLayer = _this.view.map.findLayerById(source.layer.id);
                    if (!sourceLayer && ((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url))
                        sourceLayer = new FeatureLayer_1.default((_c = source === null || source === void 0 ? void 0 : source.layer) === null || _c === void 0 ? void 0 : _c.url);
                    source.layer = sourceLayer;
                    var prop = source;
                    if ((prop === null || prop === void 0 ? void 0 : prop.name) === "ArcGIS World Geocoding Service") {
                        _this.searchWidget.includeDefaultSources = false;
                        var outFields = source.outFields || ["Addr_type", "Match_addr", "StAddr", "City"];
                        prop.outFields = outFields;
                        prop.singleLineFieldName = "SingleLine";
                        return true;
                    }
                    else {
                        return true;
                    }
                });
            }
            this.searchWidget.sources = updatedSources;
        };
        SearchPanel.prototype._getTips = function () {
            var _a;
            var _b = this.config, enableFilter = _b.enableFilter, filterConfig = _b.filterConfig;
            var tips = [];
            if (!enableFilter)
                return;
            var filterConfigSettings = filterConfig;
            (_a = filterConfigSettings === null || filterConfigSettings === void 0 ? void 0 : filterConfigSettings.layerExpressions) === null || _a === void 0 ? void 0 : _a.forEach(function (exp) {
                var _a;
                (_a = exp.expressions) === null || _a === void 0 ? void 0 : _a.filter(function (e) {
                    if (e.checked && (e === null || e === void 0 ? void 0 : e.name)) {
                        tips.push(e === null || e === void 0 ? void 0 : e.name);
                    }
                });
            });
            return tips.length > 0 ? tips : null;
        };
        SearchPanel.prototype._getActiveFilters = function () {
            var _a;
            var _b = this.config, enableFilter = _b.enableFilter, filterConfig = _b.filterConfig;
            var count = 0;
            if (!enableFilter)
                return;
            var filterConfigSettings = filterConfig;
            (_a = filterConfigSettings === null || filterConfigSettings === void 0 ? void 0 : filterConfigSettings.layerExpressions) === null || _a === void 0 ? void 0 : _a.forEach(function (exp) {
                var _a;
                (_a = exp.expressions) === null || _a === void 0 ? void 0 : _a.filter(function (e) {
                    if (e === null || e === void 0 ? void 0 : e.checked) {
                        count++;
                    }
                });
            });
            return count;
        };
        SearchPanel.prototype.destroy = function () {
            this._handles.removeAll();
        };
        SearchPanel.prototype._renderFilterChip = function (count) {
            var theme = this.config.theme;
            var tips = this._getTips();
            return widget_1.tsx("div", { class: "tips" },
                widget_1.tsx("calcite-tooltip", { scale: "s", theme: theme, "reference-element": "filterButton", placement: "auto" },
                    widget_1.tsx("ul", { id: "chip-tip" }, tips.map(function (tip, i) {
                        return widget_1.tsx("li", { key: tip + "-" + i }, tip);
                    }))),
                widget_1.tsx("div", { class: "active-filters" },
                    widget_1.tsx("calcite-chip", { id: "chip-count", scale: "s", color: "blue" }, count)));
        };
        SearchPanel.prototype._toggleFilterPanel = function () {
            this.filterPanel.showPanel();
        };
        SearchPanel.prototype._drawSketch = function () {
            var _this = this;
            //drawNotification
            this.showDrawNotification = true;
            if (!(this === null || this === void 0 ? void 0 : this.sketchTool)) {
                // create it 
                var layer = new GraphicsLayer_1.default({ id: "sketchLayer" });
                if (!(this === null || this === void 0 ? void 0 : this.view.map.findLayerById("sketchLayer"))) {
                    this.view.map.add(layer);
                }
                this.sketchTool = new SketchViewModel_1.default({
                    layer: layer,
                    updateOnGraphicClick: false,
                    view: this.view,
                    defaultCreateOptions: {
                        hasZ: false
                    }
                });
                this.sketchTool.on("create", function (event) {
                    if (event.state === "complete") {
                        _this.sketchComplete = true;
                        _this.sketchGraphic = event.graphic;
                        _this.sketchGeometry = event.graphic.geometry;
                    }
                });
            }
            this.sketchTool.create("polygon");
        };
        SearchPanel.prototype.updateFilterProps = function (propertyName, value) {
            var _a;
            (_a = this.filterPanel) === null || _a === void 0 ? void 0 : _a.update(propertyName, value);
        };
        SearchPanel.prototype.clearSketch = function () {
            var layer = this === null || this === void 0 ? void 0 : this.view.map.findLayerById("sketchLayer");
            if (layer) {
                layer.removeAll();
            }
            if (this.sketchTool) {
                this.sketchTool.cancel();
            }
            if (this === null || this === void 0 ? void 0 : this.sketchGeometry) {
                this.sketchGeometry = null;
            }
            if (this === null || this === void 0 ? void 0 : this.sketchGraphic)
                this.sketchGraphic = null;
            this.showDrawNotification = false;
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "filterPanel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "searchWidget", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "showDrawNotification", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "sketchTool", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "sketchComplete", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "sketchGeometry", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "sketchGraphic", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], SearchPanel.prototype, "state", void 0);
        SearchPanel = tslib_1.__decorate([
            decorators_1.subclass("app.SearchPanel")
        ], SearchPanel);
        return SearchPanel;
    }((Widget_1.default)));
    return SearchPanel;
});
