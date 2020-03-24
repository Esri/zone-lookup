var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, widget_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
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
            ellipsis: 'text-ellipsis',
            topNavList: 'top-nav-flex-list',
            left: 'left',
            right: 'right',
            button: 'btn',
            buttonTransparent: 'btn-transparent'
        },
        detailButton: 'btn-detail'
    };
    var Header = /** @class */ (function (_super) {
        __extends(Header, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function Header(props) {
            return _super.call(this) || this;
        }
        Header.prototype.render = function () {
            var title = this.titleLink ? (widget_1.tsx("a", { target: "_blank", rel: "noopener", href: this.titleLink }, this.title)) : (this.title);
            return (widget_1.tsx("header", { class: this.classes(CSS.calciteStyles.topNav, CSS.theme) },
                widget_1.tsx("div", { class: this.classes(CSS.calciteStyles.fade) },
                    widget_1.tsx("h1", { class: this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis) }, title))));
        };
        __decorate([
            decorators_1.property()
        ], Header.prototype, "titleLink", void 0);
        __decorate([
            decorators_1.property()
        ], Header.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], Header.prototype, "detailPanelProps", void 0);
        Header = __decorate([
            decorators_1.subclass('app.Header')
        ], Header);
        return Header;
    }(decorators_1.declared(Widget_1.default)));
    return Header;
});
//# sourceMappingURL=Header.js.map