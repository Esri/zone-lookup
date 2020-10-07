define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "ApplicationBase/support/domHelper", "esri/widgets/support/widget", "esri/core/watchUtils"], function (require, exports, tslib_1, decorators_1, Widget_1, domHelper_1, widget_1, watchUtils_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var CSS = {
        title: 'esri-header-title',
        theme: 'app-header',
        hide: 'hide',
        calciteStyles: {
            phoneColumn: 'phone-column-6',
            tabletColumn: 'tablet-column-12',
            fade: 'fade-in',
            topNav: 'top-nav',
            topNavFlex: 'top-nav-flex',
            topNavTitleFlex: 'top-nav-flex-title',
            topNavPaddingLeft: 'padding-left-half',
            topNavTitle: 'top-nav-title',
            ellipsis: 'text-fade',
            topNavList: 'top-nav-flex-list',
            left: 'left',
            right: 'right',
            button: 'btn',
            buttonTransparent: 'btn-transparent'
        },
        detailButton: 'btn-detail'
    };
    var Header = /** @class */ (function (_super) {
        tslib_1.__extends(Header, _super);
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
        function Header(props) {
            var _this = _super.call(this, props) || this;
            _this._onTitleUpdate = _this._onTitleUpdate.bind(_this);
            return _this;
        }
        Header.prototype.postInitialize = function () {
            var handle = watchUtils_1.init(this, "config.title", this._onTitleUpdate);
            this.own(handle);
        };
        Header.prototype.render = function () {
            var _a = this.config, titleLink = _a.titleLink, title = _a.title, header = _a.header;
            var showHeader = header === false ? "hide" : "show";
            var titleDiv = titleLink ? (widget_1.tsx("a", { target: "_blank", rel: "noopener", href: titleLink }, title)) : (title);
            return (widget_1.tsx("div", { class: showHeader },
                widget_1.tsx("div", { class: "panel panel-no-padding panel-no-border app-header" },
                    widget_1.tsx("header", { class: this.classes(CSS.calciteStyles.topNav, CSS.theme) },
                        widget_1.tsx("div", { class: this.classes(CSS.calciteStyles.fade) },
                            widget_1.tsx("h1", { title: title, class: this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis) }, titleDiv))))));
        };
        Header.prototype._onTitleUpdate = function () {
            var _a;
            if ((_a = this === null || this === void 0 ? void 0 : this.config) === null || _a === void 0 ? void 0 : _a.title) {
                domHelper_1.setPageTitle(this.config.title);
            }
        };
        ;
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable(["title", "titleLink", "header"])
        ], Header.prototype, "config", void 0);
        Header = tslib_1.__decorate([
            decorators_1.subclass('app.Header')
        ], Header);
        return Header;
    }((Widget_1.default)));
    return Header;
});
//# sourceMappingURL=Header.js.map