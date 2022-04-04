define(["require", "exports", "tslib", "esri/widgets/support/widget", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "TemplatesCommonLib/functionality/a11y"], function (require, exports, tslib_1, widget_1, decorators_1, Widget_1, watchUtils_1, a11y_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var base = "esri-page";
    var CSS = {
        base: base,
        title: base + "__title-text",
        subtitle: base + "__subtitle-text",
        textContainer: base + "__text-container",
        scrollContainer: base + "__scroll-container",
        scrollText: base + "__scroll-text",
        backToCoverPage: base + "__back-to-cover-page"
    };
    var Page = /** @class */ (function (_super) {
        tslib_1.__extends(Page, _super);
        function Page(props) {
            var _this = _super.call(this, props) || this;
            _this.showScrollTop = true;
            _this.title = null;
            _this.titleColor = null;
            _this.subtitle = null;
            _this.subtitleColor = null;
            _this.background = null;
            _this.buttonText = null;
            _this.buttonTextColor = null;
            _this.portal = null;
            _this.messages = null;
            _this._appContainer = document.getElementById("appMain");
            _this._token = null;
            return _this;
        }
        Page.prototype.postInitialize = function () {
            var _this = this;
            this._handleDefaultMessages();
            this._handleDocBodyStyles();
            this._addPageToBody();
            this.own([
                watchUtils_1.whenTrueOnce(this, "showScrollTop", function () {
                    _this._handleShowScrollTop();
                }),
                watchUtils_1.whenOnce(this, "portal.credential.token", function () {
                    _this.handleBackgroundImgToken();
                    _this.own([watchUtils_1.on(_this.portal, "credential", "token-change", function () {
                            _this.handleBackgroundImgToken();
                        })]);
                })
            ]);
        };
        Page.prototype.destroy = function () {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "0";
            document.body.style.transition = "";
        };
        Page.prototype.render = function () {
            var _a, _b, _c;
            var textContainer = this._renderTextContainer();
            var scrollContainer = this._renderScrollContainer();
            var styles = ((_a = this.background) === null || _a === void 0 ? void 0 : _a.backgroundType) === "image"
                ? this._getBackgroundStyles()
                : {
                    backgroundColor: ((_b = this.background) === null || _b === void 0 ? void 0 : _b.backgroundColor) ? (_c = this.background) === null || _c === void 0 ? void 0 : _c.backgroundColor : "#0079c1",
                    backgroundImage: "unset"
                };
            return (widget_1.tsx("div", { class: CSS.base, styles: styles },
                textContainer,
                scrollContainer));
        };
        Page.prototype._getBackgroundStyles = function () {
            var _a;
            var backgroundImage = this.background.backgroundImage;
            var backgroundImageVal = (backgroundImage === null || backgroundImage === void 0 ? void 0 : backgroundImage.url) ? this._token
                ? "url('" + (backgroundImage === null || backgroundImage === void 0 ? void 0 : backgroundImage.url) + "?token=" + this._token + "')"
                : "url('" + (backgroundImage === null || backgroundImage === void 0 ? void 0 : backgroundImage.url) + "')"
                : "none";
            return {
                backgroundImage: backgroundImageVal,
                backgroundSize: "cover",
                backgroundColor: backgroundImage ? "unset" : ((_a = this.background) === null || _a === void 0 ? void 0 : _a.backgroundColor) ? this.background.backgroundColor : "#0079c1"
            };
        };
        Page.prototype._renderTextContainer = function () {
            var _a = this, title = _a.title, titleColor = _a.titleColor, subtitle = _a.subtitle, subtitleColor = _a.subtitleColor;
            return (widget_1.tsx("div", { class: CSS.textContainer },
                widget_1.tsx("h1", { class: CSS.title, style: "color:" + titleColor }, title),
                widget_1.tsx("span", { class: CSS.subtitle, style: "color:" + subtitleColor }, subtitle)));
        };
        Page.prototype._renderScrollContainer = function () {
            return (widget_1.tsx("div", { class: CSS.scrollContainer },
                widget_1.tsx("button", { onclick: this._handleScroll.bind(this), label: this.buttonText, title: this.buttonText, style: "color:" + this.buttonTextColor },
                    widget_1.tsx("span", { class: CSS.scrollText }, this.buttonText),
                    widget_1.tsx("calcite-icon", { icon: "chevron-down", style: "color:" + this.buttonTextColor, scale: "l" }))));
        };
        Page.prototype._addPageToBody = function () {
            document.body.insertBefore(this.container, document.body.childNodes[0]);
        };
        Page.prototype._handleDefaultMessages = function () {
            var _a = this.messages, title = _a.title, subtitle = _a.subtitle, buttonText = _a.buttonText;
            if (!this.title) {
                this.title = title;
            }
            if (!this.subtitle) {
                this.subtitle = subtitle;
            }
            if (!this.buttonText) {
                this.buttonText = buttonText;
            }
        };
        Page.prototype._handleDocBodyStyles = function () {
            document.documentElement.style.overflowX = "unset";
            document.documentElement.style.overflowY = "unset";
            document.documentElement.style.overflow = "unset";
            document.body.style.display = "block";
            document.body.style.overflowX = "unset";
            document.body.style.overflowY = "unset";
            document.body.style.overflow = "hidden";
            document.body.style.position = "relative";
            document.body.style.top = "0";
            if (a11y_1.prefersReducedMotion()) {
                document.body.style.transition = "none";
            }
            else {
                document.body.style.transition = "top 0.5s ease 0s";
            }
        };
        Page.prototype._handleShowScrollTop = function () {
            var _this = this;
            var fabElement = document.createElement("calcite-fab");
            fabElement.classList.add(CSS.backToCoverPage);
            fabElement.icon = "chevron-up";
            fabElement.textEnabled = true;
            var backToCoverPage = this.messages.backToCoverPage;
            fabElement.label = backToCoverPage;
            fabElement.title = backToCoverPage;
            fabElement.onclick = function () {
                _this._scrollBackToCoverPage();
            };
            document.body.appendChild(fabElement);
        };
        Page.prototype._scrollBackToCoverPage = function () {
            var _a;
            (_a = this._appContainer) === null || _a === void 0 ? void 0 : _a.classList.add("hide");
            document.body.style.top = "0";
        };
        Page.prototype._handleScroll = function () {
            var _a;
            (_a = this._appContainer) === null || _a === void 0 ? void 0 : _a.classList.remove("hide");
            document.body.style.top = "-100%";
        };
        Page.prototype.handleBackgroundImgToken = function () {
            this._token = this.portal.get("credential.token");
            this.scheduleRender();
        };
        Page.prototype.handleRefreshToken = function () {
            var now = new Date();
            var before = new Date(this === null || this === void 0 ? void 0 : this.portal.get("credential.expires"));
            if (before < now) {
                var credential = this.portal.get("portal.credential");
                credential.refreshToken();
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "showScrollTop", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "titleColor", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "subtitle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "subtitleColor", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "background", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "buttonText", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "buttonTextColor", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Page.prototype, "portal", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.messageBundle("lookup/app/components/Page/t9n/resources")
        ], Page.prototype, "messages", void 0);
        Page = tslib_1.__decorate([
            decorators_1.subclass("Page")
        ], Page);
        return Page;
    }(Widget_1.default));
    return Page;
});
