/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import Accessor from "esri/core/Accessor";
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import Widget from "esri/widgets/Widget";
import { accordion } from 'calcite-web/dist/js/calcite-web';
import i18n = require('dojo/i18n!../nls/resources');

import esri = __esri;


const CSS = {
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
export interface AccordionProps extends __esri.WidgetProperties {
    view: esri.MapView;
    actionBarItems?: ActionButton[];
    config: ApplicationConfig;
}
export interface ActionButton {
    icon: string;
    id: string;
    name: string;
    class?: string;
    handleClick: (name: string, graphic: esri.Graphic) => void;
}
@subclass('esri.widgets.Accordion')
abstract class Accordion extends declared(Widget) {

    constructor(params?: any, parentNode?: string | Element) {
        super();
    }
    // Variables 
    _calciteLoaded: boolean = false;

    // Properties 
    @property() selectedItem: esri.Graphic = null;
    @property() actionBarItems: ActionButton[];

    @property() view: esri.MapView;

    @property() config: ApplicationConfig;
    // Methods
    updateCalcite() {
        if (!this._calciteLoaded) {
            accordion();
            this._calciteLoaded = true;
        }
    }
    checkContent(feature: esri.Feature): boolean {
        const content = feature.viewModel.content;
        if (Array.isArray(content)) {
            if (content.length > 0 && content[0] && content[0].type === "fields") {
                let fieldType;
                const empty = content.every((c) => {
                    if (c.type === "fields") {
                        fieldType = c as esri.FieldsContent;
                        return fieldType.fieldInfos.length === 0 ? true : false;
                    } else if (c.type === "attachments") {
                        fieldType = c as esri.AttachmentsContent;
                        return !fieldType.attachmentInfos ? true : false;
                    } else if (c.type === "media") {
                        fieldType = c as esri.MediaContent;
                        return fieldType.mediaInfos.length === 0 ? true : false;
                    } else if (c.type === "text") {
                        fieldType = c as esri.TextContent;
                        return !fieldType.text || fieldType.text === "" ? true : false;
                    } else {
                        return false;
                    }
                })
                return empty;
            }
        } else {
            return null;
        }
    }

    convertUnitText(distance, units) {
        return `<span class="distance right">(${distance} ${units})</span>`;
    }
    abstract clear();
    abstract showToggle(): boolean;

}
export default Accordion;