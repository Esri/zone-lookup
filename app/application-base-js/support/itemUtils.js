define(["require", "exports", "tslib", "esri/core/promiseUtils", "esri/core/watchUtils", "esri/views/MapView", "esri/views/SceneView", "./urlUtils"], function (require, exports, tslib_1, promiseUtils_1, watchUtils_1, MapView_1, SceneView_1, urlUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findQuery = exports.goToMarker = exports.getItemTitle = exports.createWebSceneFromItem = exports.createWebMapFromItem = exports.createMapFromItem = exports.createView = exports.getConfigViewProperties = void 0;
    MapView_1 = tslib_1.__importDefault(MapView_1);
    SceneView_1 = tslib_1.__importDefault(SceneView_1);
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    function getConfigViewProperties(config) {
        var center = config.center, components = config.components, extent = config.extent, level = config.level, viewpoint = config.viewpoint;
        var ui = components
            ? { ui: { components: urlUtils_1.parseViewComponents(components) } }
            : null;
        var cameraProps = viewpoint ? { camera: urlUtils_1.parseViewpoint(viewpoint) } : null;
        var centerProps = center ? { center: urlUtils_1.parseCenter(center) } : null;
        var zoomProps = level ? { zoom: urlUtils_1.parseLevel(level) } : null;
        var extentProps = extent ? { extent: urlUtils_1.parseExtent(extent) } : null;
        return tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, ui), cameraProps), centerProps), zoomProps), extentProps);
    }
    exports.getConfigViewProperties = getConfigViewProperties;
    function createView(properties) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var map, isWebMap, isWebScene;
            return tslib_1.__generator(this, function (_a) {
                map = properties.map;
                if (!map) {
                    return [2 /*return*/, promiseUtils_1.reject("properties does not contain a \"map\"")];
                }
                isWebMap = map.declaredClass === "esri.WebMap";
                isWebScene = map.declaredClass === "esri.WebScene";
                if (!isWebMap && !isWebScene) {
                    return [2 /*return*/, promiseUtils_1.reject("map is not a \"WebMap\" or \"WebScene\"")];
                }
                return [2 /*return*/, isWebMap ? new MapView_1.default(properties) : new SceneView_1.default(properties)];
            });
        });
    }
    exports.createView = createView;
    function createMapFromItem(options) {
        var item = options.item;
        var isWebMap = item.type === "Web Map";
        var isWebScene = item.type === "Web Scene";
        if (!isWebMap && !isWebScene) {
            return promiseUtils_1.reject();
        }
        return isWebMap
            ? createWebMapFromItem(options)
            : createWebSceneFromItem(options);
    }
    exports.createMapFromItem = createMapFromItem;
    function createWebMapFromItem(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var item, appProxies, WebMap, wm;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = options.item, appProxies = options.appProxies;
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["esri/WebMap"], resolve_1, reject_1); }).then(tslib_1.__importStar)];
                    case 1:
                        WebMap = _a.sent();
                        wm = new WebMap.default({
                            portalItem: item
                        });
                        return [4 /*yield*/, wm.load()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, wm.basemap.load()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, _updateProxiedLayers(wm, appProxies)];
                }
            });
        });
    }
    exports.createWebMapFromItem = createWebMapFromItem;
    function createWebSceneFromItem(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var item, appProxies, WebScene, ws;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = options.item, appProxies = options.appProxies;
                        return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(["esri/WebScene"], resolve_2, reject_2); }).then(tslib_1.__importStar)];
                    case 1:
                        WebScene = _a.sent();
                        ws = new WebScene.default({
                            portalItem: item
                        });
                        return [4 /*yield*/, ws.load()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, ws.basemap.load()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, _updateProxiedLayers(ws, appProxies)];
                }
            });
        });
    }
    exports.createWebSceneFromItem = createWebSceneFromItem;
    function getItemTitle(item) {
        if (item && item.title) {
            return item.title;
        }
    }
    exports.getItemTitle = getItemTitle;
    function goToMarker(marker, view) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var graphic;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!marker || !view) {
                            return [2 /*return*/, promiseUtils_1.resolve()];
                        }
                        return [4 /*yield*/, urlUtils_1.parseMarker(marker)];
                    case 1:
                        graphic = _a.sent();
                        return [4 /*yield*/, view.when()];
                    case 2:
                        _a.sent();
                        view.graphics.add(graphic);
                        view.goTo(graphic);
                        return [2 /*return*/, graphic];
                }
            });
        });
    }
    exports.goToMarker = goToMarker;
    function findQuery(query, view) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var SearchViewModel, searchVM, result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // ?find=redlands, ca
                        if (!query || !view) {
                            return [2 /*return*/, promiseUtils_1.resolve()];
                        }
                        return [4 /*yield*/, new Promise(function (resolve_3, reject_3) { require(["esri/widgets/Search/SearchViewModel"], resolve_3, reject_3); }).then(tslib_1.__importStar)];
                    case 1:
                        SearchViewModel = _a.sent();
                        searchVM = new SearchViewModel.default({
                            view: view
                        });
                        return [4 /*yield*/, searchVM.search(query)];
                    case 2:
                        result = _a.sent();
                        watchUtils_1.whenFalseOnce(view, "popup.visible", function () {
                            searchVM.destroy();
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    }
    exports.findQuery = findQuery;
    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------
    function _updateProxiedLayers(webItem, appProxies) {
        if (!appProxies) {
            return webItem;
        }
        appProxies.forEach(function (proxy) {
            webItem.allLayers.forEach(function (layer) {
                if (layer.url === proxy.sourceUrl) {
                    layer.url = proxy.proxyUrl;
                }
            });
        });
        return webItem;
    }
});
//# sourceMappingURL=itemUtils.js.map