define(["require", "exports", "tslib", "./Accordion", "esri/core/accessorSupport/decorators", "esri/widgets/Feature", "esri/core/Handles", "esri/widgets/support/widget"], function (require, exports, tslib_1, Accordion_1, decorators_1, Feature_1, Handles_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Accordion_1 = tslib_1.__importDefault(Accordion_1);
    Feature_1 = tslib_1.__importDefault(Feature_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        single: 'single',
        section: 'accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        content: 'accordion-content',
        button: 'btn',
        transparentButton: 'btn-transparent',
        accordionIcon: 'accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        right: 'right',
        actions: 'accordion-actions',
        templateContent: 'template',
        scrollable: "scrollable-content",
        actionBar: 'action-bar'
    };
    var FeatureAccordion = /** @class */ (function (_super) {
        tslib_1.__extends(FeatureAccordion, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function FeatureAccordion(props) {
            var _this = _super.call(this, props) || this;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._handles = new Handles_1.default();
            _this._screenshot = null;
            return _this;
        }
        FeatureAccordion.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { afterCreate: this._accordionCreated, bind: this, class: this.classes(CSS.base, CSS.basejs, CSS.scrollable) }, this.features &&
                this.features.map(function (graphic, i) { return _this._renderFeatureWidget(graphic, _this.features.length, i); })));
        };
        FeatureAccordion.prototype._accordionCreated = function (container) {
            var _a;
            this.updateCalcite();
            // if screenshot is enabled set custom prop 
            if (((_a = this.config) === null || _a === void 0 ? void 0 : _a.screenshot) && !this._screenshot) {
                if (this === null || this === void 0 ? void 0 : this.view) {
                    var expand = this.view.ui.find("screenshotExpand");
                    if (expand) {
                        this._screenshot = expand.content;
                        if (this._screenshot) {
                            this._screenshot.custom.element = container;
                        }
                    }
                }
            }
        };
        FeatureAccordion.prototype._renderFeatureWidget = function (graphic, count, index) {
            // Add active class to all sections if there are less than 2. If there are
            // more than 2 just add to the first feature
            var _this = this;
            return count && count > 0 ? (widget_1.tsx("div", { key: "feature-content" },
                widget_1.tsx("section", { "data-feature": graphic, afterCreate: this._createFeature, bind: this, key: "section" + index, class: this.classes(CSS.section, count <= 2 || (count > 2 && index === 0) ? CSS.active : null, count === 1 ? CSS.single : null) },
                    widget_1.tsx("h4", { class: CSS.title },
                        widget_1.tsx("span", { class: this.classes(CSS.accordionIcon, CSS.paddingTrailer) },
                            widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 32 32", class: "svg-icon" },
                                widget_1.tsx("path", { d: "M28 9v5L16 26 4 14V9l12 12L28 9z" }))),
                        widget_1.tsx("span", { class: CSS.titleArea })),
                    widget_1.tsx("div", { key: "btn" + index, class: this.classes(CSS.content) },
                        widget_1.tsx("nav", { class: this.classes(CSS.actionBar) }, this.actionBarItems &&
                            this.actionBarItems.length > 0 &&
                            this.actionBarItems.map(function (item) { return _this._createActionItem(item, graphic); })),
                        widget_1.tsx("div", { class: CSS.templateContent }))))) : null;
        };
        FeatureAccordion.prototype._createFeature = function (node) {
            var _this = this;
            if (node instanceof HTMLElement) {
                var titleNode_1 = node.querySelector("." + CSS.titleArea);
                var container_1 = node.querySelector("." + CSS.templateContent);
                titleNode_1 &&
                    titleNode_1.parentElement &&
                    titleNode_1.parentElement.addEventListener('click', function () { return _this._selectAccordionSection(node, graphic_1); });
                container_1 && container_1.addEventListener('click', function () { return _this._selectAccordionSection(node, graphic_1); });
                var graphic_1 = node['data-feature'];
                var feature_1 = new Feature_1.default({
                    graphic: graphic_1,
                    defaultPopupTemplateEnabled: true,
                    map: this.view.map,
                    spatialReference: this.view.spatialReference,
                    visibleElements: {
                        title: false
                    },
                    container: container_1
                });
                var handleContent_1 = feature_1.viewModel.watch("content", function () {
                    handleContent_1.remove();
                    var empty = _this.checkContent(feature_1);
                    if (empty) {
                        if (container_1.parentElement && container_1.parentElement.parentElement) {
                            container_1.parentElement.parentElement.classList.add("no-content");
                        }
                    }
                });
                var handle_1 = feature_1.watch('title', function () {
                    var title = feature_1.get('title');
                    handle_1.remove();
                    if (graphic_1 && graphic_1.attributes && graphic_1.attributes.lookupDistance && _this.config.includeDistance) {
                        title += _this.convertUnitText(graphic_1.attributes.lookupDistance, _this.config.units);
                    }
                    titleNode_1.innerHTML = title;
                    feature_1.graphic.setAttribute('app-accordion-title', feature_1.get('title'));
                });
            }
        };
        FeatureAccordion.prototype._selectAccordionSection = function (node, graphic) {
            var selectedClassName = 'accordion-section-selected';
            //only apply selection style if more than one feature is selected
            if (this.features && this.features.length && this.features.length > 1) {
                var mainNodes = document.getElementsByClassName(selectedClassName);
                for (var j = 0; j < mainNodes.length; j++) {
                    mainNodes[j].classList.remove(selectedClassName);
                }
                if (node && node.parentElement) {
                    node.parentElement.classList.add(selectedClassName);
                }
            }
            this.selectedItem = graphic;
        };
        FeatureAccordion.prototype._createActionItem = function (item, graphic) {
            var _this = this;
            return (widget_1.tsx("button", { onclick: function () { return _this._handleActionItemClick(graphic, item); }, class: this.classes(CSS.button, CSS.transparentButton, CSS.right, item.icon, item.class) }, item.name));
        };
        FeatureAccordion.prototype._handleActionItemClick = function (graphic, item) {
            item.handleClick(item.id, graphic);
        };
        FeatureAccordion.prototype.clear = function () {
            this.features = null;
        };
        FeatureAccordion.prototype.showToggle = function () {
            return this.features && this.features.length && this.features.length > 2;
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "features", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "sectionCount", void 0);
        FeatureAccordion = tslib_1.__decorate([
            decorators_1.subclass('app.FeatureAccordion')
        ], FeatureAccordion);
        return FeatureAccordion;
    }((Accordion_1.default)));
    exports.default = FeatureAccordion;
});
//# sourceMappingURL=FeatureAccordion.js.map