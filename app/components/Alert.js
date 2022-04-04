define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, tslib_1, decorators_1, Widget_1, widget_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var CSS = {
        base: "esri-media-ga-alert",
        optButton: "esri-media-ga-alert-button"
    };
    var Alert = /** @class */ (function (_super) {
        tslib_1.__extends(Alert, _super);
        function Alert(params) {
            var _this = _super.call(this, params) || this;
            _this.alertNode = null;
            _this.portal = null;
            _this.bundle = null;
            return _this;
        }
        Alert.prototype.render = function () {
            var enableGA = localStorage.getItem("analytics-opt-in-media") || false;
            var _a = this.config, googleAnalytics = _a.googleAnalytics, googleAnalyticsKey = _a.googleAnalyticsKey, theme = _a.theme, googleAnalyticsConsent = _a.googleAnalyticsConsent, googleAnalyticsConsentMsg = _a.googleAnalyticsConsentMsg;
            var themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
            var isActive = googleAnalytics && googleAnalyticsKey !== null && googleAnalyticsConsent && !enableGA ? true : false;
            return (widget_1.tsx("div", { bind: this },
                widget_1.tsx("calcite-alert", { class: this.classes(CSS.base, themeClass), afterCreate: widget_1.storeNode, bind: this, "data-node-ref": "alertNode", "intl-close": this.bundle.close, scale: "s", active: isActive },
                    widget_1.tsx("div", { slot: "message", innerHTML: googleAnalyticsConsentMsg }),
                    widget_1.tsx("calcite-button", { class: CSS.optButton, scale: "s", slot: "link", bind: this, afterCreate: this.handleClick }, this.bundle.analyticsOptIn))));
        };
        ;
        Alert.prototype.handleClick = function (element) {
            var _this = this;
            element.addEventListener("click", function () {
                var _a, _b;
                // Add opt-in value to local storage 
                localStorage.setItem("analytics-opt-in-" + ((_b = (_a = _this === null || _this === void 0 ? void 0 : _this.config) === null || _a === void 0 ? void 0 : _a.telemetry) === null || _b === void 0 ? void 0 : _b.name), "true");
                // update config setting to trigger GA reset and 
                // prevent dialog from showing
                _this.config.googleAnalyticsConsent = false;
            });
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Alert.prototype, "portal", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Alert.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.messageBundle("instant/../t9n/common")
        ], Alert.prototype, "bundle", void 0);
        Alert = tslib_1.__decorate([
            decorators_1.subclass("Alert")
        ], Alert);
        return Alert;
    }(Widget_1.default));
    return Alert;
});
