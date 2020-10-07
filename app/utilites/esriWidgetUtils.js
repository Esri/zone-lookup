define(["require", "exports", "tslib", "esri/core/watchUtils", "esri/core/promiseUtils", "esri/core/Handles", "esri/widgets/Expand", "dojo/i18n!../nls/resources", "ApplicationBase/support/widgetConfigUtils/basemapToggle"], function (require, exports, tslib_1, watchUtils_1, promiseUtils_1, Handles_1, Expand_1, i18n, basemapToggle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addScaleBar = exports.addLegend = exports.addHome = exports.addBasemap = exports.addZoom = exports.addScreenshot = exports.addMapComponents = void 0;
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Expand_1 = tslib_1.__importDefault(Expand_1);
    function addMapComponents(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config;
            return tslib_1.__generator(this, function (_a) {
                config = props.config;
                this._handles = new Handles_1.default();
                this._handles.add([watchUtils_1.init(config, ["home", "homePosition"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addHome(props);
                    }),
                    watchUtils_1.init(config, ["mapZoom", "mapZoomPosition"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addZoom(props);
                    }),
                    watchUtils_1.init(config, ["legend", "legendPosition", "legendOpenAtStart", "legendConfig"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addLegend(props);
                    }),
                    watchUtils_1.init(config, ["screenshot", "screenshotPosition"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addScreenshot(props);
                    }),
                    watchUtils_1.init(config, ["scalebar", "scalebarPosition"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addScaleBar(props);
                    }),
                    watchUtils_1.init(config, ["nextBasemap", "basemapTogglePosition", "basemapToggle"], function (newValue, oldValue, propertyName) {
                        props.propertyName = propertyName;
                        addBasemap(props);
                    })], "configuration");
                if (!config.withinConfigurationExperience) {
                    this._handles.remove("configuration");
                }
                return [2 /*return*/];
            });
        });
    }
    exports.addMapComponents = addMapComponents;
    function addScreenshot(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, screenshot, screenshotPosition, legend, Screenshot, node, content, screenshotExpand;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        screenshot = config.screenshot, screenshotPosition = config.screenshotPosition, legend = config.legend;
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["Components/Screenshot/Screenshot"], resolve_1, reject_1); }).then(tslib_1.__importStar)];
                    case 1:
                        Screenshot = _a.sent();
                        node = view.ui.find("screenshotExpand");
                        if (!screenshot) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        // move the node if it exists 
                        if (propertyName === "screenshotPosition" && node) {
                            view.ui.move(node, screenshotPosition);
                        }
                        else if (propertyName === "screenshot") {
                            content = new Screenshot.default({
                                view: view,
                                enableLegendOption: legend ? true : false,
                                enablePopupOption: false,
                                includeLayoutOption: true,
                                custom: {
                                    label: i18n.tools.screenshotResults,
                                    element: document.getElementById("resultsPanel")
                                },
                                includePopupInScreenshot: false,
                                includeCustomInScreenshot: false,
                                includeLegendInScreenshot: false
                            });
                            screenshotExpand = new Expand_1.default({
                                id: "screenshotExpand",
                                content: content,
                                mode: "floating",
                                expandTooltip: i18n.tools.screenshot,
                                view: view
                            });
                            view.ui.add(screenshotExpand, screenshotPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addScreenshot = addScreenshot;
    function addZoom(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, mapZoom, mapZoomPosition, Zoom, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        mapZoom = config.mapZoom, mapZoomPosition = config.mapZoomPosition;
                        return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(["esri/widgets/Zoom"], resolve_2, reject_2); }).then(tslib_1.__importStar)];
                    case 1:
                        Zoom = _a.sent();
                        node = _findNode("esri-zoom");
                        if (!mapZoom) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && !mapZoom)
                            view.ui.remove(node);
                        if (propertyName === "mapZoomPosition" && node) {
                            view.ui.move(node, mapZoomPosition);
                        }
                        else if (propertyName === "mapZoom" && !node) {
                            view.ui.add(new Zoom.default({ view: view }), mapZoomPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addZoom = addZoom;
    function addBasemap(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, basemapTogglePosition, basemapToggle, node, _a, originalBasemap, nextBasemap, BasemapToggle, bmToggle;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        basemapTogglePosition = config.basemapTogglePosition, basemapToggle = config.basemapToggle;
                        node = view.ui.find("basemapWidget");
                        return [4 /*yield*/, basemapToggle_1.getBasemaps(props)];
                    case 1:
                        _a = _b.sent(), originalBasemap = _a.originalBasemap, nextBasemap = _a.nextBasemap;
                        // If basemapToggle isn't enabled remove the widget if it exists and exit 
                        if (!basemapToggle) {
                            if (node) {
                                view.ui.remove(node);
                                node.destroy();
                            }
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, new Promise(function (resolve_3, reject_3) { require(["esri/widgets/BasemapToggle"], resolve_3, reject_3); }).then(tslib_1.__importStar)];
                    case 2:
                        BasemapToggle = _b.sent();
                        if (!BasemapToggle)
                            return [2 /*return*/];
                        // Move the basemap toggle widget if it exists 
                        if (propertyName === "basemapTogglePosition" && node) {
                            view.ui.move(node, basemapTogglePosition);
                        }
                        // Add the basemap toggle widget if its enabled or if a different basemap was 
                        // specified
                        if (propertyName === "basemapToggle" && !node) {
                            bmToggle = new BasemapToggle.default({
                                view: view,
                                nextBasemap: nextBasemap,
                                id: "basemapWidget"
                            });
                            basemapToggle_1.resetBasemapsInToggle(bmToggle, originalBasemap, nextBasemap);
                            view.ui.add(bmToggle, basemapTogglePosition);
                        }
                        else if (node && (propertyName === "nextBasemap" || propertyName === "basemapSelector")) {
                            if (propertyName === "nextBasemap" || propertyName === "basemapSelector") {
                                basemapToggle_1.resetBasemapsInToggle(node, originalBasemap, nextBasemap);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addBasemap = addBasemap;
    function _getBasemap(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var Basemap, basemap;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve_4, reject_4) { require(["esri/Basemap"], resolve_4, reject_4); }).then(tslib_1.__importStar)];
                    case 1:
                        Basemap = _a.sent();
                        if (!Basemap) {
                            return [2 /*return*/];
                        }
                        basemap = Basemap.default.fromId(id);
                        if (!!basemap) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Basemap.default({
                                portalItem: {
                                    id: id
                                }
                            }).loadAll()];
                    case 2:
                        basemap = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, basemap];
                }
            });
        });
    }
    function addHome(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, home, homePosition, Home, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        home = config.home, homePosition = config.homePosition;
                        return [4 /*yield*/, new Promise(function (resolve_5, reject_5) { require(['esri/widgets/Home'], resolve_5, reject_5); }).then(tslib_1.__importStar)];
                    case 1:
                        Home = _a.sent();
                        node = _findNode("esri-home");
                        if (!home) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && !home)
                            view.ui.remove(node);
                        if (propertyName === "homePosition" && node) {
                            view.ui.move(node, homePosition);
                        }
                        else if (propertyName === "home") {
                            view.ui.add(new Home.default({ view: view }), homePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addHome = addHome;
    function addLegend(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, legend, legendPosition, legendOpenAtStart, legendConfig, modules, _a, Legend, Expand, node, content, legendExpand, l;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        legend = config.legend, legendPosition = config.legendPosition, legendOpenAtStart = config.legendOpenAtStart, legendConfig = config.legendConfig;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([new Promise(function (resolve_6, reject_6) { require(["esri/widgets/Legend"], resolve_6, reject_6); }).then(tslib_1.__importStar), new Promise(function (resolve_7, reject_7) { require(["esri/widgets/Expand"], resolve_7, reject_7); }).then(tslib_1.__importStar)])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Legend = _a[0], Expand = _a[1];
                        node = view.ui.find("legendExpand");
                        if (!legend) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        // move the node if it exists 
                        if (propertyName === "legendPosition" && node) {
                            view.ui.move(node, legendPosition);
                        }
                        else if (propertyName === "legend") {
                            content = new Legend.default({
                                style: legendConfig.style,
                                view: view
                            });
                            legendExpand = new Expand.default({
                                id: "legendExpand",
                                content: content,
                                mode: "floating",
                                group: legendPosition,
                                view: view
                            });
                            view.ui.add(legendExpand, legendPosition);
                        }
                        else if (propertyName === "legendOpenAtStart" && node) {
                            node.expanded = legendOpenAtStart;
                        }
                        else if (propertyName === "legendConfig" && node) {
                            l = node.content;
                            if (legendConfig === null || legendConfig === void 0 ? void 0 : legendConfig.style) {
                                l.style = legendConfig.style;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addLegend = addLegend;
    function addScaleBar(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, portal, config, propertyName, scalebar, scalebarPosition, ScaleBar, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config, propertyName = props.propertyName;
                        scalebar = config.scalebar, scalebarPosition = config.scalebarPosition;
                        return [4 /*yield*/, new Promise(function (resolve_8, reject_8) { require(["esri/widgets/ScaleBar"], resolve_8, reject_8); }).then(tslib_1.__importStar)];
                    case 1:
                        ScaleBar = _a.sent();
                        node = _findNode("esri-scale-bar");
                        if (!scalebar) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        // move the node if it exists 
                        if (propertyName === "scalebarPosition" && node) {
                            view.ui.move(node, scalebarPosition);
                        }
                        else if (propertyName === "scalebar") {
                            view.ui.add(new ScaleBar.default({
                                view: view,
                                unit: (portal === null || portal === void 0 ? void 0 : portal.units) === "metric" ? portal === null || portal === void 0 ? void 0 : portal.units : "non-metric"
                            }), scalebarPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addScaleBar = addScaleBar;
    function _findNode(className) {
        var mainNodes = document.getElementsByClassName(className);
        var node = null;
        for (var j = 0; j < mainNodes.length; j++) {
            node = mainNodes[j];
        }
        return node ? node : null;
    }
});
//# sourceMappingURL=esriWidgetUtils.js.map