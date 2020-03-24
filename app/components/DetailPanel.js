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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "../components/Share/Share", "../components/Share/Share/ShareFeatures", "esri/core/watchUtils", "esri/core/Handles", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, Share_1, ShareFeatures_1, watchUtils, Handles, widget_1, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = __importDefault(Widget_1);
    Share_1 = __importDefault(Share_1);
    ShareFeatures_1 = __importDefault(ShareFeatures_1);
    var CSS = {
        calciteStyles: {
            right: 'right',
            left: 'left',
            fontSize2: 'font-size--2',
            paddingTrailer: 'padding-right-1',
            panel: 'panel',
            panelNoPadding: 'panel-no-padding',
            btn: 'btn',
            btnFill: 'btn-fill',
            btnTransparent: 'btn-transparent',
            phoneHide: 'phone-hide'
        },
        svgIcon: 'svg-icon',
        detailsTitle: 'details-title',
        detailsContent: 'details-content',
        hide: 'hide',
        details: 'detail'
    };
    var DetailPanel = /** @class */ (function (_super) {
        __extends(DetailPanel, _super);
        function DetailPanel(props) {
            var _this = _super.call(this) || this;
            _this.shareWidget = null;
            _this.view = null;
            _this._handles = new Handles();
            return _this;
        }
        Object.defineProperty(DetailPanel.prototype, "state", {
            //----------------------------------
            //
            //  state - readOnly
            //
            //----------------------------------
            get: function () {
                var ready = this.get('view.ready');
                return ready ? 'ready' : 'loading';
            },
            enumerable: true,
            configurable: true
        });
        DetailPanel.prototype.initialize = function () {
            var _this = this;
            if (this.sharing) {
                var setupShare_1 = 'setup-share';
                this._handles.add(watchUtils.whenOnce(this, 'view.ready', function () {
                    var shareFeatures = new ShareFeatures_1.default({
                        copyToClipboard: true,
                        embedMap: false
                    });
                    _this.shareWidget = new Share_1.default({
                        view: _this.view,
                        shareFeatures: shareFeatures,
                        container: document.createElement('div'),
                        isDefault: true
                    });
                    _this._handles.remove(setupShare_1);
                }), setupShare_1);
            }
        };
        DetailPanel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        DetailPanel.prototype.render = function () {
            var socialShare = this.sharing && this.shareWidget ? (widget_1.tsx("div", { bind: this.shareWidget.container, afterCreate: this._attachToNode, class: this.classes(CSS.calciteStyles.phoneHide) })) : null;
            return (widget_1.tsx("div", { bind: this, class: this.classes(CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding) },
                widget_1.tsx("button", { bind: this, "aria-label": i18n.tools.info, title: i18n.tools.close, onclick: this._hidePanel, class: this.classes(CSS.details, CSS.calciteStyles.btnFill, CSS.calciteStyles.btn, CSS.calciteStyles.btnTransparent) },
                    widget_1.tsx("svg", { class: this.classes(CSS.svgIcon), xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 32 32" },
                        widget_1.tsx("path", { d: "M2 24l14-14 14 14H2z" }))),
                widget_1.tsx("h3", { class: this.classes(CSS.detailsTitle) }, this.title),
                widget_1.tsx("p", { class: this.classes(CSS.detailsContent), innerHTML: this.content }),
                socialShare));
        };
        DetailPanel.prototype._hidePanel = function (e) {
            var container = this.container;
            e.target.title = container.classList.contains("collapse") ? i18n.tools.close : i18n.tools.infoTip;
            container.classList.toggle('collapse');
        };
        DetailPanel.prototype._toggleButton = function () {
            // Show the header button
            var nodes = document.getElementsByClassName('btn-detail');
            for (var j = 0; j < nodes.length; j++) {
                nodes[j].classList.toggle('hide');
            }
        };
        DetailPanel.prototype._attachToNode = function (node) {
            var content = this;
            node.appendChild(content);
        };
        DetailPanel.prototype.collapse = function () {
            var container = this.container;
            container.classList.add('collapse');
        };
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "content", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "sharing", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "shareWidget", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "view", void 0);
        __decorate([
            decorators_1.property({
                dependsOn: ['view.ready'],
                readOnly: true
            })
        ], DetailPanel.prototype, "state", null);
        DetailPanel = __decorate([
            decorators_1.subclass('app.DetailPanel')
        ], DetailPanel);
        return DetailPanel;
    }(decorators_1.declared(Widget_1.default)));
    exports.default = DetailPanel;
});
//# sourceMappingURL=DetailPanel.js.map