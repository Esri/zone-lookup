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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/widgets/Feature", "esri/core/Handles", "./Accordion"], function (require, exports, __extends, __decorate, decorators_1, widget_1, Feature_1, Handles_1, Accordion_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Feature_1 = __importDefault(Feature_1);
    Handles_1 = __importDefault(Handles_1);
    Accordion_1 = __importDefault(Accordion_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        single: 'single',
        section: 'accordion-section',
        groupSection: 'group-accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        count: 'group-accordion-count',
        content: 'accordion-content',
        groupContent: 'group-accordion-content',
        featureGroup: 'feature-group',
        button: 'btn',
        transparentButton: 'btn-transparent',
        smallButton: 'btn-small',
        accordionIcon: 'accordion-icon',
        groupAccordionIcon: 'group-accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        right: 'right',
        actions: 'accordion-actions',
        templateContent: 'template',
        scrollable: "scrollable-content",
    };
    var GroupedAccordion = /** @class */ (function (_super) {
        __extends(GroupedAccordion, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function GroupedAccordion(props) {
            var _this = _super.call(this) || this;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._calciteLoaded = false;
            _this._handles = new Handles_1.default();
            _this._featureCount = 0;
            if (props.featureResults) {
                props.featureResults.forEach(function (result) {
                    _this._featureCount += result.features && result.features.length;
                });
            }
            return _this;
        }
        GroupedAccordion.prototype.render = function () {
            var _this = this;
            return (widget_1.tsx("div", { key: "feature-container", afterCreate: this.updateCalcite },
                widget_1.tsx("div", { class: this.classes(CSS.base, CSS.basejs, CSS.scrollable) }, this.featureResults &&
                    this.featureResults.map(function (result, i) { return _this._createSections(result, i); }))));
        };
        GroupedAccordion.prototype._createSections = function (result, key) {
            var _this = this;
            var count = result.features && result.features.length;
            var classes = count === 1 ? [CSS.section, CSS.single, CSS.groupSection] : [CSS.section, CSS.groupSection];
            // Open section if its the first section or if there is only one feature in the section
            if (count === 1 || key === 0) {
                classes.push(CSS.active);
            }
            return (widget_1.tsx("section", { bind: this, key: "section" + key, class: this.classes(classes) },
                widget_1.tsx("h5", { class: CSS.title },
                    widget_1.tsx("span", { class: CSS.count }, count),
                    widget_1.tsx("span", { class: CSS.titleArea },
                        result.title,
                        widget_1.tsx("span", { class: this.classes(CSS.accordionIcon, CSS.groupAccordionIcon, CSS.paddingTrailer) },
                            widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 32 32", class: "svg-icon" },
                                widget_1.tsx("path", { d: "M28 9v5L16 26 4 14V9l12 12L28 9z" }))))),
                widget_1.tsx("ul", { role: 'group', class: this.classes(CSS.templateContent, CSS.content, CSS.groupContent) }, result.features &&
                    result.features.map(function (feature, i) {
                        return (widget_1.tsx("li", { role: 'menuitem', tabindex: "0", "data-feature": feature, afterCreate: _this._createFeature, class: _this.classes(CSS.featureGroup), bind: _this, key: "feature" + i }));
                    }))));
        };
        GroupedAccordion.prototype._createFeature = function (node) {
            var _this = this;
            var graphic = node['data-feature'];
            var titleNode = document.createElement("div");
            node.appendChild(titleNode);
            var container = document.createElement("div");
            var feature = new Feature_1.default({
                graphic: graphic,
                defaultPopupTemplateEnabled: true,
                map: this.view.map,
                spatialReference: this.view.spatialReference,
                visibleElements: {
                    title: false
                },
                container: container
            });
            node.appendChild(container);
            var handle = feature.watch('title', function () {
                var title = feature.get('title');
                handle.remove();
                if (graphic && graphic.attributes && graphic.attributes.lookupDistance && _this.config.includeDistance) {
                    titleNode.innerHTML += _this.convertUnitText(graphic.attributes.lookupDistance, _this.config.units);
                }
                else {
                    titleNode.innerHTML = title;
                }
            });
            node.addEventListener("click", function () {
                _this.selectedItem = graphic;
            });
        };
        GroupedAccordion.prototype.clear = function () {
            this.featureResults = null;
        };
        GroupedAccordion.prototype.showToggle = function () {
            // show toggle buttons if we have more than 2 sections? 
            return this.featureResults && this.featureResults.length && this.featureResults.length > 2;
        };
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "featureResults", void 0);
        GroupedAccordion = __decorate([
            decorators_1.subclass('app.GroupedAccordion')
        ], GroupedAccordion);
        return GroupedAccordion;
    }(decorators_1.declared(Accordion_1.default)));
    exports.default = GroupedAccordion;
});
//# sourceMappingURL=GroupedAccordion.js.map