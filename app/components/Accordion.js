define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "calcite-web/dist/js/calcite-web"], function (require, exports, tslib_1, decorators_1, Widget_1, calcite_web_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        single: 'single',
        section: 'accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        count: 'accordion-count',
        content: 'accordion-content',
        button: 'btn',
        transparentButton: 'btn-transparent',
        smallButton: 'btn-small',
        accordionIcon: 'accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        right: 'right',
        actions: 'accordion-actions',
        templateContent: 'template'
    };
    var Accordion = /** @class */ (function (_super) {
        tslib_1.__extends(Accordion, _super);
        function Accordion(params, parentNode) {
            var _this = _super.call(this, params) || this;
            // Variables 
            _this._calciteLoaded = false;
            // Properties 
            _this.selectedItem = null;
            return _this;
        }
        // Methods
        Accordion.prototype.updateCalcite = function () {
            if (!this._calciteLoaded) {
                calcite_web_1.accordion();
                this._calciteLoaded = true;
            }
        };
        Accordion.prototype.checkContent = function (feature) {
            var content = feature.viewModel.content;
            if (Array.isArray(content)) {
                if (content.length > 0 && content[0] && content[0].type === "fields") {
                    var fieldType_1;
                    var empty = content.every(function (c) {
                        var _a;
                        if (c.type === "fields") {
                            fieldType_1 = c;
                            return ((_a = fieldType_1 === null || fieldType_1 === void 0 ? void 0 : fieldType_1.fieldInfos) === null || _a === void 0 ? void 0 : _a.length) === 0 ? true : false;
                        }
                        else if (c.type === "attachments") {
                            fieldType_1 = c;
                            return !fieldType_1.attachmentInfos ? true : false;
                        }
                        else if (c.type === "media") {
                            fieldType_1 = c;
                            return fieldType_1.mediaInfos.length === 0 ? true : false;
                        }
                        else if (c.type === "text") {
                            fieldType_1 = c;
                            return !fieldType_1.text || fieldType_1.text === "" ? true : false;
                        }
                        else {
                            return false;
                        }
                    });
                    return empty;
                }
            }
            else {
                return null;
            }
        };
        Accordion.prototype.convertUnitText = function (distance, units) {
            return "<span class=\"distance right\">(" + distance + " " + units + ")</span>";
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Accordion.prototype, "selectedItem", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Accordion.prototype, "actionBarItems", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Accordion.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Accordion.prototype, "config", void 0);
        Accordion = tslib_1.__decorate([
            decorators_1.subclass('esri.widgets.Accordion')
        ], Accordion);
        return Accordion;
    }((Widget_1.default)));
    exports.default = Accordion;
});
//# sourceMappingURL=Accordion.js.map