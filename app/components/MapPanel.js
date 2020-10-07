define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "../utilites/errorUtils", "dojo/i18n!../nls/resources", "esri/widgets/support/widget", "ApplicationBase/support/itemUtils"], function (require, exports, tslib_1, decorators_1, Widget_1, errorUtils, i18n, widget_1, itemUtils_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    errorUtils = tslib_1.__importStar(errorUtils);
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
            buttonGreen: 'btn-blue',
            buttonFill: 'btn-fill',
            right: 'right',
            panel: 'panel',
            iconDesc: 'icon-ui-description'
        }
    };
    var MapPanel = /** @class */ (function (_super) {
        tslib_1.__extends(MapPanel, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function MapPanel(props) {
            var _this = _super.call(this, props) || this;
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
                ? this.classes.apply(this, tslib_1.__spreadArrays(allClasses, miniMapClasses)) : this.classes.apply(this, tslib_1.__spreadArrays(mainMapClasses, allClasses));
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var portalItem, appProxies, defaultViewProperties, components, mapContainer, viewProperties, map, _a, handler_1, rootNode, k, error_1, title;
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            portalItem = this.base.results.applicationItem.value;
                            appProxies = portalItem && portalItem.applicationProxies ? portalItem.applicationProxies : null;
                            if (!this.config.zoom) {
                                this.config.components = "attribution";
                            }
                            defaultViewProperties = itemUtils_1.getConfigViewProperties(this.config);
                            components = ["attribution"];
                            mapContainer = {
                                container: container
                            };
                            viewProperties = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, defaultViewProperties), { ui: { components: components } }), mapContainer);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, itemUtils_1.createMapFromItem({ item: this.item, appProxies: appProxies })];
                        case 2:
                            map = (_b.sent());
                            _a = this;
                            return [4 /*yield*/, itemUtils_1.createView(tslib_1.__assign(tslib_1.__assign({}, viewProperties), { map: map }))];
                        case 3:
                            _a.view = (_b.sent());
                            this.view.highlightOptions.fillOpacity = 0;
                            handler_1 = this.view.watch('extent', function () {
                                var _a;
                                handler_1.remove();
                                _this._initialExtent = (_a = _this.view) === null || _a === void 0 ? void 0 : _a.extent.clone();
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
            var _a;
            if (this._initialExtent) {
                (_a = this.view) === null || _a === void 0 ? void 0 : _a.goTo(this._initialExtent);
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "base", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "item", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "mainMapAccessoryClassName", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], MapPanel.prototype, "selectedItemTitle", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], MapPanel.prototype, "isMobileView", void 0);
        tslib_1.__decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], MapPanel.prototype, "message", void 0);
        MapPanel = tslib_1.__decorate([
            decorators_1.subclass('app.MapPanel')
        ], MapPanel);
        return MapPanel;
    }((Widget_1.default)));
    return MapPanel;
});
//# sourceMappingURL=MapPanel.js.map