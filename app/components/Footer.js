define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, tslib_1, decorators_1, Widget_1, widget_1, i18n) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var CSS = {
        base: "app-footer"
    };
    var Footer = /** @class */ (function (_super) {
        tslib_1.__extends(Footer, _super);
        //--------------------------------------------------------------------------
        //
        // Variables
        //
        //--------------------------------------------------------------------------
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function Footer(props) {
            return _super.call(this, props) || this;
        }
        Footer.prototype.render = function () {
            var showFooter = this.noMap ? "hide" : null;
            return (widget_1.tsx("div", { class: showFooter },
                widget_1.tsx("button", { class: this.classes("icon-ui-maps", "btn", "btn-fill", "btn-blue", "btn-open-map", "app-button", "tablet-show"), bind: this, onclick: this._handleClick }, i18n.map.label)));
        };
        Footer.prototype._handleClick = function (event) {
            this.emit("button-clicked");
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Footer.prototype, "noMap", void 0);
        Footer = tslib_1.__decorate([
            decorators_1.subclass('app.Footer')
        ], Footer);
        return Footer;
    }((Widget_1.default)));
    return Footer;
});
//# sourceMappingURL=Footer.js.map