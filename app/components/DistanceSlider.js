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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/i18n!../nls/resources", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, i18n, widget_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    var CSS = {
        sliderLabel: 'slider-label',
        calciteStyles: {
            slider: 'calcite-slider'
        }
    };
    var DistanceSlider = /** @class */ (function (_super) {
        __extends(DistanceSlider, _super);
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
        function DistanceSlider(props) {
            var _this = _super.call(this) || this;
            _this.currentValue = props.distance;
            return _this;
        }
        DistanceSlider.prototype.render = function () {
            return (widget_1.tsx("form", { id: "distanceSliderForm", class: this.classes(CSS.calciteStyles.slider) },
                widget_1.tsx("label", { class: CSS.sliderLabel }, i18n.tools.slider + " (" + this.currentValue + " " + this.units + ")",
                    widget_1.tsx("input", { bind: this, onchange: this._handleSliderStep, type: "range", min: this.minDistance, max: this.maxDistance, value: this.distance, step: "1", "aria-valuemin": this.minDistance, "aria-valuemax": this.maxDistance, "aria-valuenow": this.distance }))));
        };
        DistanceSlider.prototype._handleSliderStep = function (e) {
            var slider = e.target;
            this.currentValue = slider.value;
        };
        __decorate([
            decorators_1.property()
        ], DistanceSlider.prototype, "units", void 0);
        __decorate([
            decorators_1.property()
        ], DistanceSlider.prototype, "distance", void 0);
        __decorate([
            decorators_1.property()
        ], DistanceSlider.prototype, "maxDistance", void 0);
        __decorate([
            decorators_1.property()
        ], DistanceSlider.prototype, "minDistance", void 0);
        __decorate([
            widget_1.renderable(),
            decorators_1.property()
        ], DistanceSlider.prototype, "currentValue", void 0);
        DistanceSlider = __decorate([
            decorators_1.subclass('app.DistanceSlider')
        ], DistanceSlider);
        return DistanceSlider;
    }(decorators_1.declared(Widget_1.default)));
    return DistanceSlider;
});
//# sourceMappingURL=DistanceSlider.js.map