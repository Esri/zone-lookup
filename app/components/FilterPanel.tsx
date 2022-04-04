/*
 *   Copyright (c) 2021 Esri
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


import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';

import { tsx, messageBundle } from 'esri/widgets/support/widget';
import FilterList from "Components/FilterList/FilterList";
import FeatureLayer from "esri/layers/FeatureLayer";
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import Collection from "esri/core/Collection";


interface FilterProps extends __esri.WidgetProperties {
    config: ApplicationConfig;
    view: __esri.MapView;
}

@subclass('app.FilterPanel')
class FilterPanel extends (Widget) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------


    @property() config: ApplicationConfig;
    @property() filterList: typeof FilterList

    @property() view: __esri.MapView;

    @property()
    @messageBundle("lookup/app/t9n/common")
    messages = null;
    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------
    _defaultString = "Select Filter";
    _filterContainer: any = null;
    _mainContainer: HTMLElement = null;
    _defaultExpressions: Collection = null;
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: FilterProps) {
        super(props);
    }
    postInitialize() {
        this._mainContainer = this.container as HTMLElement;
        // add any pre-existing def expressions
        this._defaultExpressions = new Collection();
        this?.view?.map?.layers?.forEach(layer => {
            if (layer instanceof FeatureLayer && layer.definitionExpression) {
                this._addDefinitionExpression(layer);
            } else if (layer?.type === "group") {
                const group = layer as __esri.GroupLayer;
                group.layers?.forEach(layer => {
                    if (layer instanceof FeatureLayer && layer?.definitionExpression) {
                        this._addDefinitionExpression(layer);
                    }
                });
            }
        });
    }
    _addDefinitionExpression(layer) {

        if (layer?.id && layer?.definitionExpression) {
            this._defaultExpressions.add({
                id: layer.id,
                definitionExpression: layer.definitionExpression
            });
        }

    }
    render() {

        let color, theme;
        color = theme === "light" ? "neutral" : "inverse";

        return (<div>
            <calcite-panel class={this.classes("panel-header", "main-map-content")} dismissed bind={this}
                afterCreate={this._createFilter} >
                <div slot="header-content">
                    <h3 class="filter-title">
                        <calcite-icon scale="s" icon="filter"></calcite-icon>
                        {this.config.appBundle.tools.selectFilter}
                    </h3>
                </div>
                <div slot="header-actions-end">
                    <calcite-action color={color}
                        title={this.messages.tools.filter}
                        onclick={() => { this._closePanel(); }}>
                        <calcite-icon icon="x" ></calcite-icon>
                    </calcite-action>
                </div>
            </calcite-panel>
        </div>)

    }
    _closePanel() {
        if (!this._filterContainer && !this._mainContainer) return;
        this._filterContainer.removeAttribute("dismissed");
        this._mainContainer?.classList.add("hide");

    }

    _createFilter(container) {
        this._filterContainer = container;
        const { filterConfig, theme, extentSelector, extentSelectorConfig } = this.config;
        const { map } = this.view;
        const { layerExpressions } = filterConfig || [];

        this.filterList = new FilterList({
            layerExpressions,
            optionalBtnText: this.config.bundle.close,
            optionalBtnOnClick: () => {
                this._closePanel();
            },
            theme,
            map,
            extentSelector,
            extentSelectorConfig,
            container
        });

        this._filterContainer.addEventListener("calcitePanelDismissedChange", () => {
            this._closePanel();
        });
    }
    showPanel() {
        if (!this._filterContainer && !this._mainContainer) return;
        this._filterContainer.removeAttribute("dismissed");
        this._mainContainer?.classList.remove("hide")
    }
    update(propertyName: string, value: any) {
        if (!this.filterList) return;
        if (propertyName === "theme") {
            if (this.filterList?.theme)
                this.filterList.theme = value;
        } else if (propertyName === "filterConfig") {
            if (this.filterList && value)
                this.filterList.layerExpressions = value?.layerExpressions;
        }
    }
    findDefaultExpression(layerExpression) {
        const foundItem = this._defaultExpressions.find(item => {
            return item?.id === layerExpression?.id ? true : false;
        });
        return foundItem?.definitionExpression || layerExpression?.definitionExpression || null;
    }
    addDefaultExpression(layerExpression) {

        const defaultValue = this.findDefaultExpression(layerExpression);
        if (defaultValue) {
            if (layerExpression?.definitionExpression && layerExpression?.definitionExpression !== "") {
                if (layerExpression?.definitionExpression !== defaultValue) {
                    return `${defaultValue} AND ${layerExpression?.definitionExpression}`
                } else {
                    return defaultValue;
                }

            } else {
                return defaultValue;
            }
        } else {

            return layerExpression?.definitionExpression;
        }

    }
}
export = FilterPanel;
