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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addMapComponents(props) {
        return __awaiter(this, void 0, void 0, function () {
            var config, view;
            return __generator(this, function (_a) {
                config = props.config, view = props.view;
                if (config.zoom && config.zoomPosition !== 'top-left') {
                    view.ui.move('zoom', config.zoomPosition);
                }
                if (config.home)
                    addHome(props);
                if (config.legend)
                    addLegend(props);
                if (config.scalebar)
                    addScaleBar(props);
                if (config.basemapToggle)
                    addBasemap(props);
                return [2 /*return*/];
            });
        });
    }
    exports.addMapComponents = addMapComponents;
    function moveComponent(props) {
        var mainNodes = document.getElementsByClassName(props.className);
        var node = null;
        for (var j = 0; j < mainNodes.length; j++) {
            node = mainNodes[j];
        }
        if (node) {
            var direction = props.mobile ? 'manual' : props.config.legendPosition;
            props.mobile ? node.classList.add('mobile') : node.classList.remove('mobile');
            props.view.ui.move(node, direction);
        }
    }
    exports.moveComponent = moveComponent;
    function addBasemap(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, config, BasemapToggle, bmToggle, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config;
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(['esri/widgets/BasemapToggle'], resolve_1, reject_1); }).then(__importStar)];
                    case 1:
                        BasemapToggle = _b.sent();
                        if (!BasemapToggle) return [3 /*break*/, 4];
                        bmToggle = new BasemapToggle.default({
                            view: view
                        });
                        if (!config.altBasemap) return [3 /*break*/, 3];
                        _a = bmToggle;
                        return [4 /*yield*/, _getBasemap(config.altBasemap)];
                    case 2:
                        _a.nextBasemap = (_b.sent());
                        _b.label = 3;
                    case 3:
                        view.ui.add(bmToggle, config.basemapTogglePosition);
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.addBasemap = addBasemap;
    function _getBasemap(id) {
        return __awaiter(this, void 0, void 0, function () {
            var Basemap, basemap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(["esri/Basemap"], resolve_2, reject_2); }).then(__importStar)];
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
        return __awaiter(this, void 0, void 0, function () {
            var view, config, Home;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config;
                        return [4 /*yield*/, new Promise(function (resolve_3, reject_3) { require(['esri/widgets/Home'], resolve_3, reject_3); }).then(__importStar)];
                    case 1:
                        Home = _a.sent();
                        if (Home) {
                            view.ui.add(new Home.default({ view: view }), config.homePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addHome = addHome;
    function addLegend(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, config, _a, Legend, Expand, legend, expand, container;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config;
                        return [4 /*yield*/, Promise.all([new Promise(function (resolve_4, reject_4) { require(['esri/widgets/Legend'], resolve_4, reject_4); }).then(__importStar), new Promise(function (resolve_5, reject_5) { require(['esri/widgets/Expand'], resolve_5, reject_5); }).then(__importStar)])];
                    case 1:
                        _a = _b.sent(), Legend = _a[0], Expand = _a[1];
                        if (Legend && Expand) {
                            legend = new Legend.default({
                                view: view,
                                style: {
                                    type: 'card'
                                }
                            });
                            expand = new Expand.default({
                                view: view,
                                group: config.legendPosition,
                                mode: 'floating',
                                content: legend
                            });
                            view.ui.add(expand, config.legendPosition);
                            if (config.legendOpenAtStart) {
                                expand.expand();
                            }
                            container = expand.container;
                            container.classList.add('legend-expand');
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addLegend = addLegend;
    function addScaleBar(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, portal, config, ScaleBar, scalebar;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config;
                        return [4 /*yield*/, new Promise(function (resolve_6, reject_6) { require(['esri/widgets/ScaleBar'], resolve_6, reject_6); }).then(__importStar)];
                    case 1:
                        ScaleBar = _a.sent();
                        if (ScaleBar) {
                            scalebar = new ScaleBar.default({
                                view: view,
                                unit: portal.units === 'metric' ? portal.units : 'non-metric'
                            });
                            view.ui.add(scalebar, config.scalebarPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addScaleBar = addScaleBar;
});
//# sourceMappingURL=esriWidgetUtils.js.map