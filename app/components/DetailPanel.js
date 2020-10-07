define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "../components/Share/Share", "../components/Share/Share/ShareFeatures", "esri/core/watchUtils", "esri/core/Handles", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, tslib_1, decorators_1, Widget_1, Share_1, ShareFeatures_1, watchUtils_1, Handles_1, widget_1, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = tslib_1.__importDefault(Widget_1);
    Share_1 = tslib_1.__importDefault(Share_1);
    ShareFeatures_1 = tslib_1.__importDefault(ShareFeatures_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
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
        tslib_1.__extends(DetailPanel, _super);
        function DetailPanel(props) {
            var _this = _super.call(this, props) || this;
            _this.shareWidget = null;
            _this.view = null;
            _this._handles = new Handles_1.default();
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
            enumerable: false,
            configurable: true
        });
        DetailPanel.prototype.initialize = function () {
            var _this = this;
            var setupShare = 'setup-share';
            this._handles.add(watchUtils_1.whenOnce(this, 'view.ready', function () {
                var shareFeatures = new ShareFeatures_1.default({
                    copyToClipboard: true,
                    embedMap: false,
                });
                _this.shareWidget = new Share_1.default({
                    view: _this.view,
                    shareFeatures: shareFeatures,
                    container: document.createElement('div'),
                    isDefault: true
                });
                _this._handles.remove(setupShare);
            }), setupShare);
        };
        DetailPanel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        DetailPanel.prototype.render = function () {
            var _a = this.config, share = _a.share, introductionContent = _a.introductionContent, introductionTitle = _a.introductionTitle;
            var show = share || introductionTitle || introductionContent ? "" : "hide";
            var socialShare = share && this.shareWidget ? (widget_1.tsx("div", { bind: this.shareWidget.container, afterCreate: this._attachToNode, class: this.classes(CSS.calciteStyles.phoneHide) })) : null;
            return (widget_1.tsx("div", { bind: this, class: this.classes(show, CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding) },
                widget_1.tsx("button", { bind: this, "aria-label": i18n.tools.info, title: i18n.tools.close, onclick: this._hidePanel, class: this.classes(CSS.details, CSS.calciteStyles.btnFill, CSS.calciteStyles.btn, CSS.calciteStyles.btnTransparent) },
                    widget_1.tsx("svg", { class: this.classes(CSS.svgIcon), xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 32 32" },
                        widget_1.tsx("path", { d: "M2 24l14-14 14 14H2z" }))),
                widget_1.tsx("h3", { class: this.classes(CSS.detailsTitle) }, introductionTitle),
                widget_1.tsx("p", { class: this.classes(CSS.detailsContent), innerHTML: introductionContent }),
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
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable(["introductionTitle", "introductionContent", "socialSharing"])
        ], DetailPanel.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "shareWidget", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ['view.ready'],
                readOnly: true
            })
        ], DetailPanel.prototype, "state", null);
        DetailPanel = tslib_1.__decorate([
            decorators_1.subclass('app.DetailPanel')
        ], DetailPanel);
        return DetailPanel;
    }((Widget_1.default)));
    exports.default = DetailPanel;
});
//# sourceMappingURL=DetailPanel.js.map