define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Accessor"], function (require, exports, tslib_1, decorators_1, Accessor_1) {
    "use strict";
    Accessor_1 = tslib_1.__importDefault(Accessor_1);
    var ConfigurationSettings = /** @class */ (function (_super) {
        tslib_1.__extends(ConfigurationSettings, _super);
        function ConfigurationSettings(params) {
            var _this = _super.call(this, params) || this;
            _this.withinConfigurationExperience = window.location !== window.parent.location;
            _this._storageKey = "config-values";
            _this._draft = null;
            _this._draftMode = false;
            _this._draft = params === null || params === void 0 ? void 0 : params.draft;
            _this._draftMode = (params === null || params === void 0 ? void 0 : params.mode) === "draft";
            return _this;
        }
        ConfigurationSettings.prototype.initialize = function () {
            if (this.withinConfigurationExperience || this._draftMode) {
                // Apply any draft properties
                if (this._draft) {
                    Object.assign(this, this._draft);
                }
                window.addEventListener("message", function (e) {
                    this._handleConfigurationUpdates(e);
                }.bind(this), false);
            }
        };
        ConfigurationSettings.prototype._handleConfigurationUpdates = function (e) {
            var _a;
            if (((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.type) === "cats-app") {
                Object.assign(this, e.data);
            }
        };
        ConfigurationSettings.prototype.mixinConfig = function () {
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "webmap", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "hideMap", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "extentSelectorConfig", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "extentSelector", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "header", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "theme", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "applySharedTheme", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "titleLink", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "introductionTitle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "introductionContent", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "socialSharing", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoom", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoomPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "home", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "homePosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legend", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legendPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legendOpenAtStart", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legendConfig", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "scalebar", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "scalebarPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapToggle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapTogglePosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "nextBasemap", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapSelector", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchConfiguration", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "find", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "findSource", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "lookupLayers", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "enableSearchLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "displayUnmatchedResults", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "groupResultsByLayer", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "noResultsMessage", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "resultsPanelPreText", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "resultsPanelPostText", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "autoZoomFirstResult", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "includeAddressGraphic", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "includeAddressText", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "addressGraphicColor", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "hideLookupLayers", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapPin", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapPinLabel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "share", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customCSS", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "googleAnalytics", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "googleAnalyticsKey", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "screenshot", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "screenshotPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "withinConfigurationExperience", void 0);
        ConfigurationSettings = tslib_1.__decorate([
            decorators_1.subclass("app.ConfigurationSettings")
        ], ConfigurationSettings);
        return ConfigurationSettings;
    }((Accessor_1.default)));
    return ConfigurationSettings;
});
//# sourceMappingURL=ConfigurationSettings.js.map