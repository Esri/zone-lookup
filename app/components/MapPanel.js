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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Accessor", "../utilites/errorUtils", "dojo/i18n!../nls/resources", "esri/widgets/support/widget", "ApplicationBase/support/itemUtils"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, Accessor_1, errorUtils, i18n, widget_1, itemUtils_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Accessor_1 = __importDefault(Accessor_1);
    errorUtils = __importStar(errorUtils);
    var CSS = {
        miniMap: {
            panel: 'mini-map-panel'
        },
        tabletShow: 'tablet-show',
        tabletHide: 'tablet-hide',
        configApp: 'configurable-application__view-container',
        hide: 'hide',
        theme: 'app-header',
        btnOpenMap: 'btn-open-map',
        appButton: 'app-button',
        calciteStyles: {
            alert: 'alert',
            active: 'is-active',
            alertRed: 'alert-red',
            alertGreen: 'alert-green',
            alertClose: 'alert-close',
            topNav: 'top-nav',
            topNavTitle: 'top-nav-title',
            column14: 'column-14',
            leader: 'leader-0',
            trailer: 'trailer-0',
            paddingLeft: 'padding-left-0',
            paddingRight: 'padding-right-0',
            button: 'btn',
            buttonGreen: 'btn-green',
            buttonFill: 'btn-fill',
            right: 'right',
            panel: 'panel',
            iconDesc: 'icon-ui-description'
        }
    };
    var MapPanel = /** @class */ (function (_super) {
        __extends(MapPanel, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function MapPanel(props) {
            var _this = _super.call(this) || this;
            _this.mainMapAccessoryClassName = 'main-map-content';
            _this.selectedItemTitle = null;
            _this.isMobileView = false;
            var config = props.base.config;
            _this.config = config;
            return _this;
        }
        MapPanel.prototype.render = function () {
            var allClasses = [
                CSS.calciteStyles.paddingRight,
                CSS.calciteStyles.paddingLeft,
                CSS.calciteStyles.trailer,
                CSS.calciteStyles.leader,
                CSS.calciteStyles.trailer
            ];
            var mainMapClasses = [CSS.calciteStyles.column14];
            var miniMapClasses = [CSS.miniMap.panel, CSS.calciteStyles.panel];
            var mapPositionClasses = this.isMobileView
                ? this.classes.apply(this, allClasses.concat(miniMapClasses)) : this.classes.apply(this, mainMapClasses.concat(allClasses));
            var mapTabletClass = this.isMobileView ? this.classes(CSS.tabletShow) : null;
            var mapButton = this.isMobileView ? (widget_1.tsx("button", { bind: this, onclick: this.closeMap, class: this.classes(CSS.calciteStyles.button, CSS.btnOpenMap, CSS.appButton, CSS.tabletShow, CSS.calciteStyles.buttonGreen, CSS.calciteStyles.buttonFill, CSS.calciteStyles.iconDesc) }, i18n.tools.info)) : null;
            var alertMessage = this.isMobileView && this.message ? (widget_1.tsx("div", { key: "mobile-message", class: this.isMobileView && this.message ? (this.classes(CSS.calciteStyles.alert, CSS.calciteStyles.active, CSS.calciteStyles.alertRed)) : null },
                widget_1.tsx("span", { innerHTML: this.message }),
                widget_1.tsx("button", { class: this.classes(CSS.calciteStyles.alertClose), onclick: this._closeAlert },
                    widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 32 32", class: "svg-icon" },
                        widget_1.tsx("path", { d: "M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z" }))))) : null;
            return (widget_1.tsx("div", { class: mapPositionClasses, role: "application" },
                widget_1.tsx("div", { class: this.classes(CSS.configApp) },
                    widget_1.tsx("div", { class: mapTabletClass, bind: this, afterCreate: this._createMap })),
                alertMessage,
                mapButton));
        };
        MapPanel.prototype._closeAlert = function () {
            this.message = null;
            var alerts = document.getElementsByClassName('alert is-active');
            for (var j = 0; j < alerts.length; j++) {
                alerts[j].classList.remove('is-active');
            }
        };
        MapPanel.prototype._createMap = function (container) {
            return __awaiter(this, void 0, void 0, function () {
                var portalItem, appProxies, defaultViewProperties, mapContainer, viewProperties, map, _a, handler_1, rootNode, k, error_1, title;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            portalItem = this.base.results.applicationItem.value;
                            appProxies = portalItem && portalItem.applicationProxies ? portalItem.applicationProxies : null;
                            if (!this.config.zoom) {
                                this.config.components = "attribution";
                            }
                            defaultViewProperties = itemUtils_1.getConfigViewProperties(this.config);
                            mapContainer = {
                                container: container
                            };
                            viewProperties = __assign({}, defaultViewProperties, mapContainer);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, itemUtils_1.createMapFromItem({ item: this.item, appProxies: appProxies })];
                        case 2:
                            map = (_b.sent());
                            _a = this;
                            return [4 /*yield*/, itemUtils_1.createView(__assign({}, viewProperties, { map: map }))];
                        case 3:
                            _a.view = (_b.sent());
                            this.view.highlightOptions.fillOpacity = 0;
                            handler_1 = this.view.watch('extent', function () {
                                handler_1.remove();
                                _this._initialExtent = _this.view.extent.clone();
                            });
                            document.getElementById('mapDescription').innerHTML = i18n.map.description;
                            rootNode = document.getElementsByClassName('esri-view-surface');
                            for (k = 0; k < rootNode.length; k++) {
                                rootNode[k].setAttribute('aria-describedby', 'mapDescription');
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _b.sent();
                            title = (this.item && this.item.title) || ' the application';
                            errorUtils.displayError({ title: 'Error', message: "Unable to load " + title + " " });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        MapPanel.prototype.closeMap = function () {
            this.view.container.classList.add('tablet-hide');
            var mainNodes = document.getElementsByClassName('main-map-content');
            for (var j = 0; j < mainNodes.length; j++) {
                mainNodes[j].classList.remove('hide');
            }
            this.selectedItemTitle = null;
            this.isMobileView = false;
            document.getElementById('mapDescription').innerHTML = i18n.map.description;
        };
        MapPanel.prototype.clearResults = function () {
            this.message = null;
        };
        MapPanel.prototype.resetExtent = function () {
            this.view.goTo(this._initialExtent);
        };
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "base", void 0);
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "item", void 0);
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "mainMapAccessoryClassName", void 0);
        __decorate([
            decorators_1.property()
        ], MapPanel.prototype, "selectedItemTitle", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], MapPanel.prototype, "isMobileView", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], MapPanel.prototype, "message", void 0);
        MapPanel = __decorate([
            decorators_1.subclass('app.MapPanel')
        ], MapPanel);
        return MapPanel;
    }(decorators_1.declared(Widget_1.default, Accessor_1.default)));
    return MapPanel;
});
//# sourceMappingURL=MapPanel.js.map