var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Accessor", "esri/widgets/support/widget", "esri/widgets/Feature", "esri/core/Handles", "calcite-web/dist/js/calcite-web"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, Accessor_1, widget_1, Feature_1, Handles_1, calcite_web_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = __importDefault(Widget_1);
    Accessor_1 = __importDefault(Accessor_1);
    Feature_1 = __importDefault(Feature_1);
    Handles_1 = __importDefault(Handles_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        section: 'accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        content: 'accordion-content',
        button: 'btn',
        transparentButton: 'btn-transparent',
        smallButton: 'btn-small',
        accordionIcon: 'accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        right: 'right',
        actions: 'accordion-actions',
        templateContent: 'template',
        actionBar: 'action-bar',
        distance: 'distance'
    };
    var FeatureAccordion = /** @class */ (function (_super) {
        __extends(FeatureAccordion, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function FeatureAccordion(props) {
            var _this = _super.call(this) || this;
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            _this.selectedItem = null;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._calciteLoaded = false;
            _this._handles = new Handles_1.default();
            return _this;
        }
        FeatureAccordion.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { afterCreate: this._updateCalcite, class: this.classes(CSS.base, CSS.basejs) }, this.features &&
                this.features.map(function (graphic, i) { return _this._renderFeatureWidget(graphic, _this.features.length, i); })));
        };
        FeatureAccordion.prototype._renderFeatureWidget = function (graphic, count, index) {
            // Add active class to all sections if there are less than 2. If there are
            // more than 2 just add to the first feature
            var _this = this;
            return count && count > 0 ? (widget_1.tsx("div", { key: "feature-content" },
                widget_1.tsx("section", { "data-feature": graphic, afterCreate: this._createFeature, bind: this, key: "section" + index, class: this.classes(CSS.section, count <= 2 || (count > 2 && index === 0) ? CSS.active : null) },
                    widget_1.tsx("h4", { class: CSS.title },
                        widget_1.tsx("span", { class: this.classes(CSS.accordionIcon, CSS.paddingTrailer) },
                            widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 32 32", class: "svg-icon" },
                                widget_1.tsx("path", { d: "M28 9v5L16 26 4 14V9l12 12L28 9z" }))),
                        widget_1.tsx("span", { class: CSS.titleArea })),
                    widget_1.tsx("div", { key: "btn" + index, class: CSS.content },
                        widget_1.tsx("nav", { class: this.classes(CSS.actionBar) }, this.actionBarItems &&
                            this.actionBarItems.length > 0 &&
                            this.actionBarItems.map(function (item) { return _this._createActionItem(item, graphic); })),
                        widget_1.tsx("div", { class: CSS.templateContent }))))) : null;
        };
        FeatureAccordion.prototype._createFeature = function (node) {
            var _this = this;
            if (node instanceof HTMLElement) {
                var titleNode_1 = node.querySelector("." + CSS.titleArea);
                var container = node.querySelector("." + CSS.templateContent);
                titleNode_1 &&
                    titleNode_1.parentElement &&
                    titleNode_1.parentElement.addEventListener('click', function () { return _this.__selectAccordionSection(node, graphic_1); });
                container && container.addEventListener('click', function () { return _this.__selectAccordionSection(node, graphic_1); });
                var graphic_1 = node['data-feature'];
                var feature_1 = new Feature_1.default({
                    graphic: graphic_1,
                    defaultPopupTemplateEnabled: true,
                    map: this.view.map,
                    spatialReference: this.view.spatialReference,
                    container: container
                });
                var handle_1 = feature_1.watch('title', function () {
                    var title = feature_1.get('title');
                    handle_1.remove();
                    if (graphic_1 && graphic_1.attributes && graphic_1.attributes.lookupDistance && _this.config.includeDistance) {
                        title += _this._convertUnitText(graphic_1.attributes.lookupDistance, _this.config.units);
                    }
                    titleNode_1.innerHTML = title;
                    feature_1.graphic.setAttribute('app-accordion-title', feature_1.get('title'));
                });
            }
        };
        FeatureAccordion.prototype.__selectAccordionSection = function (node, graphic) {
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
        FeatureAccordion.prototype._convertUnitText = function (distance, units) {
            return "<span class=\"distance right\">" + distance + " " + units + "</span>";
        };
        FeatureAccordion.prototype._createActionItem = function (item, graphic) {
            var _this = this;
            return (widget_1.tsx("button", { onclick: function () { return _this._handleActionItemClick(graphic, item); }, class: this.classes(CSS.button, CSS.transparentButton, CSS.right, item.icon, item.class) }, item.name));
        };
        FeatureAccordion.prototype._handleActionItemClick = function (graphic, item) {
            item.handleClick(item.id, graphic);
        };
        FeatureAccordion.prototype._updateCalcite = function () {
            if (!this._calciteLoaded) {
                calcite_web_1.accordion();
                this._calciteLoaded = true;
            }
        };
        __decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "selectedItem", void 0);
        __decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "actionBarItems", void 0);
        __decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "features", void 0);
        __decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], FeatureAccordion.prototype, "config", void 0);
        FeatureAccordion = __decorate([
            decorators_1.subclass('app.FeatureAccordion')
        ], FeatureAccordion);
        return FeatureAccordion;
    }(decorators_1.declared(Widget_1.default, Accessor_1.default)));
    exports.default = FeatureAccordion;
});
//# sourceMappingURL=FeatureAccordion.js.map