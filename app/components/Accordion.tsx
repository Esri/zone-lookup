/*
 *   Copyright (c) 2022 Esri
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */


import { tsx, messageBundle } from 'esri/widgets/support/widget';
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from "esri/widgets/Widget";

import esri = __esri;
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import { isMobile } from '../utilites/utils';

const CSS = {
    base: 'accordion',
    basejs: 'js-accordion',
    single: 'single',
    directions: 'directions-button',
    section: 'accordion-section',
    active: 'is-active',
    title: 'accordion-title',
    titleArea: 'title-area',
    count: 'accordion-count',
    content: 'accordion-content',
    button: 'btn',
    messageText: 'message-text',
    transparentButton: 'btn-transparent',
    smallButton: 'btn-small',
    accordionIcon: 'accordion-icon',
    paddingTrailer: 'padding-right-quarter',
    left: 'left',
    actions: 'accordion-actions',
    templateContent: 'template'
};
export interface AccordionProps extends __esri.WidgetProperties {
    view: esri.MapView;
    actionBarItems?: ActionButton[];
    config: ApplicationConfig;
    locale?;
}
export interface ActionButton {
    icon: string;
    id: string;
    name: string;
    tip?: string;
    class?: string;
    handleClick: (name: string, graphic: esri.Graphic) => void;
}
@subclass('esri.widgets.Accordion')
abstract class Accordion extends (Widget) {

    constructor(params?: any, parentNode?: string | Element) {
        super(params);
    }
    // Variables 
    _calciteLoaded: boolean = false;

    // Properties 
    @property() selectedItem: esri.Graphic = null;
    @property() actionBarItems: ActionButton[];

    @property() view: esri.MapView;

    @property() config: ApplicationConfig;

    @property()
    @messageBundle("lookup/app/t9n/common")
    messages = null;
    createPostText() {
        return (
            <p key="postText" class={CSS.messageText} innerHTML={this.config.resultsPanelPostText} />
        )
    }
    createPreText() {

        return (
            <p key="preText" class={CSS.messageText} innerHTML={this.config.resultsPanelPreText} />
        )
    }
    checkContent(feature: esri.Feature): boolean {
        const content = feature.viewModel.content;
        if (Array.isArray(content)) {
            if (content.length > 0 && content[0] && content[0].type === "fields") {
                let fieldType;
                const empty = content.every((c) => {
                    if (c.type === "fields") {
                        fieldType = c as esri.FieldsContent;
                        return fieldType?.fieldInfos?.length === 0 ? true : false;
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

    createActionItem(item, graphic) {
        const { theme } = this.config;
        const mobile = isMobile();
        let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
        const { id, icon, name, tip } = item;
        return (
            <calcite-button key={id} icon-end={icon} appearance="outline"
                onclick={(e) => this.actionItemClick(e, graphic, item)}
                title={tip ? tip : name}
                scale={mobile ? "l" : "m"}
                class={this.classes(CSS.directions, CSS.left, themeClass)}
            >
                {mobile ? null : name}
            </calcite-button >
        );
    }
    actionItemClick(button, graphic, item) {
        item.handleClick(button, item.id, graphic);
    }

    convertUnitText(distance, units) {
        let unit = this.messages.units[units];
        unit = unit ? unit.abbr : "mi";
        return `<span class="distance right" title="">
        (${distance} ${unit})</span>`;
    }


    abstract clear();
    abstract showToggle(): boolean;

}
export default Accordion;