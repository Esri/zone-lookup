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


import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import Handles from "esri/core/Handles";
import FilterPanel from './FilterPanel';
import Search from "esri/widgets/Search";
import FeatureLayer from "esri/layers/FeatureLayer";
import { fromJSON } from "esri/geometry/support/jsonUtils";
import { tsx } from "esri/widgets/support/widget";

import esri = __esri;
import SketchViewModel from "esri/widgets/Sketch/SketchViewModel";
import GraphicsLayer from "esri/layers/GraphicsLayer";
import ConfigurationSettings from "../ConfigurationSettings";
import { init, watch, whenDefinedOnce } from "esri/core/watchUtils";
import { setPanelSize } from "../utilites/utils";


const CSS = {
    panel: "panel",
    panelNoBorder: "panel-no-border",
    searchPanel: "panel-search",
    filterPanelBar: "panel-filter-bar",
    filterButton: "filter-button",
    filterIcon: "filter",
    sketchIcon: "polygon-vertices",
    buttonLink: "btn-link",
    button: "btn",
    hide: "hide"
};

interface SearchPanelProps extends esri.WidgetProperties {
    config: ConfigurationSettings;
    view: __esri.MapView;
    filterPanel: FilterPanel;
}

@subclass("app.SearchPanel")
class SearchPanel extends (Widget) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------
    @property() config: ConfigurationSettings;
    @property() filterPanel: FilterPanel = null;
    @property() view: __esri.MapView = null;
    @property() searchWidget: Search = null;
    @property() showDrawNotification: boolean = false;
    @property() sketchTool: SketchViewModel = null;
    @property() sketchComplete: boolean = false;
    @property() sketchGeometry: __esri.Polygon = null;
    @property() sketchGraphic: __esri.Graphic = null;
    @property() state: "ready" | "loading" = "loading";

    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------

    _handles: Handles = new Handles();

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: SearchPanelProps) {
        super(props);
    }

    render() {
        const { enableFilter, enableSketchTools, panelSize, hideMap } = this.config;
        const count = this._getActiveFilters();
        const filterTitle = this.config.appBundle.tools.filter;
        const sketchTitle = this.config.appBundle.tools.sketch;

        const activeFiltersChip = count > 0 ? this._renderFilterChip(count) : null;
        const buttonClasses = CSS.filterButton;
        const showSketchNotification = this.showDrawNotification ? <div
            class={this.classes(setPanelSize(panelSize), "sketch-notification")}>
            <calcite-notice active width="full" scale="m"
                bind={this} afterCreate={(element: any) => {
                    element.addEventListener("calciteNoticeClose", () => {
                        this.showDrawNotification = false;
                        this?.sketchTool.cancel();
                    }, { once: true });
                }}>
                <div slot="title">{this.config.appBundle.tools.sketch}</div>
                <div slot="message">{this.config.appBundle.tools.sketchInstructions}</div>
                <calcite-action
                    id="sketchButton"
                    text={this.config.appBundle.cancel}
                    textEnabled
                    icon="x"
                    slot="actions-end"
                    scale="m"
                    bind={this}
                    onclick={() => {
                        this.showDrawNotification = false;
                        this?.sketchTool.cancel();
                    }}
                ></calcite-action>
            </calcite-notice>
        </div> : null;
        const filterButton = enableFilter ?
            <calcite-action
                id="filterButton"
                color="neutral"
                appearance="clear"
                scale="m"
                aria-labelledby={count > 0 ? "chip chip-label chip-tip" : null}
                class={buttonClasses}
                aria-label={filterTitle}
                bind={this}
                onclick={this._toggleFilterPanel}
                icon={CSS.filterIcon}>
                {activeFiltersChip}
            </calcite-action> : null;

        const sketchButton = enableSketchTools && !hideMap ? <calcite-action
            id="sketchButton"
            color="neutral"
            appearance="clear"
            scale="m"
            class={buttonClasses}
            aria-label={sketchTitle}
            bind={this}
            onclick={this._drawSketch}
            icon={CSS.sketchIcon}>
        </calcite-action> : null;


        return (
            <div class={this.classes(CSS.panel, CSS.searchPanel, CSS.panelNoBorder)}>
                <div class="search-container-panel">
                    {showSketchNotification}
                    <div class="search-container" bind={this} afterCreate={this._createSearch} />
                    <calcite-tooltip-manager >
                        {filterButton}
                    </calcite-tooltip-manager>
                    {sketchButton}
                </div>
            </div>

        );
    }

    _createSearch(container) {
        const { searchConfiguration, find } = this.config;
        let sources = searchConfiguration?.sources;
        if (sources) {
            sources.forEach((source) => {
                let sourceLayer = null;
                if (source?.layer?.id) sourceLayer = this.view.map.findLayerById(source.layer.id);
                if (!sourceLayer && source?.layer?.url) sourceLayer = new FeatureLayer(source?.layer?.url);
                source.layer = sourceLayer;
            });
        }

        const searchProperties: esri.widgetsSearchProperties = {
            ...{
                view: this.view,
                autoSelect: false,
                resultGraphicEnabled: false,
                popupEnabled: false,
                container
            }, ...searchConfiguration
        };

        if (searchProperties?.sources?.length > 0) {
            searchProperties.includeDefaultSources = false;
            const sources = searchProperties.sources.filter(source => {
                const prop = source as any;
                if (prop?.name === "ArcGIS World Geocoding Service") {
                    const outFields = source.outFields || ["Addr_type", "Match_addr", "StAddr", "City"];
                    prop.outFields = outFields;
                    prop.singleLineFieldName = "SingleLine";
                    return true;
                } else { return true; }
            });
            searchProperties.sources = sources;
        } else {
            searchProperties.includeDefaultSources = true;
        }

        this.searchWidget = new Search(searchProperties);
        const handle = this.searchWidget.viewModel.watch('state', (state) => {
            if (state === 'ready') {
                this.state = "ready";
                handle.remove();
                whenDefinedOnce(this.searchWidget, "allPlaceholder", () => {
                    this.searchWidget.allSources.forEach(s => {
                        if (s.placeholder === "") {
                            s.placeholder = this.searchWidget.allPlaceholder;
                        }
                    })
                });

                // If there's a find url param search for it when view is done updating 
                if (find) {
                    this._updateSearchTerm();
                }
                init(this.config, "extentSelector, extentSelectorConfig", () => {
                    if (!this.searchWidget) return;
                    this._updateSearchExtent();
                })
                watch(this.config, "searchConfiguration", (newValue, oldValue, propertyName) => {
                    if (this.searchWidget) {
                        this._updateSources(this.config?.searchConfiguration?.sources);
                    }
                });

            }
        });
    }
    _updateSearchTerm() {
        const { find, findSource } = this.config;
        this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
        if (findSource) {
            this.searchWidget.set("activeSourceIndex", 2);
        }
        const source = this.searchWidget.activeSource;

        if (!source?.filter && this.view) {
            if (!source) return
            const handle = this.searchWidget.on("search-complete", () => {
                handle.remove();
                source.filter = null;
            });

            source.filter = {
                geometry: this?.view.extent
            }
        }
        this.searchWidget.viewModel.search();
    }
    _updateSearchExtent() {
        const { extentSelector, extentSelectorConfig } = this.config;
        if (extentSelector) {
            const geometry = extentSelectorConfig?.constraints?.geometry ?? null;
            if (geometry) {
                const extent = fromJSON(geometry);
                if (extent && (extent?.type === "extent" || extent?.type === "polygon")) {
                    this.searchWidget.viewModel.allSources.forEach((source) => {
                        source.filter = {
                            geometry: extent
                        }
                    });
                }
            }
        }
    }
    _updateSources(sources) {
        let updatedSources = null;
        if (sources) {
            updatedSources = sources.filter((source) => {
                let sourceLayer = null;
                if (source?.layer?.id) sourceLayer = this.view.map.findLayerById(source.layer.id);
                if (!sourceLayer && source?.layer?.url) sourceLayer = new FeatureLayer(source?.layer?.url);
                source.layer = sourceLayer;
                const prop = source as any;
                if (prop?.name === "ArcGIS World Geocoding Service") {
                    this.searchWidget.includeDefaultSources = false;
                    const outFields = source.outFields || ["Addr_type", "Match_addr", "StAddr", "City"];
                    prop.outFields = outFields;
                    prop.singleLineFieldName = "SingleLine";
                    return true;
                } else { return true; }
            });
        }
        this.searchWidget.sources = updatedSources;
    }
    _getTips() {
        const { enableFilter, filterConfig } = this.config;
        const tips = [];

        if (!enableFilter) return;
        const filterConfigSettings = filterConfig as any;
        filterConfigSettings?.layerExpressions?.forEach(exp => {
            exp.expressions?.filter(e => {
                if (e.checked && e?.name) {
                    tips.push(e?.name);
                }
            });
        });
        return tips.length > 0 ? tips : null;
    }

    _getActiveFilters() {
        const { enableFilter, filterConfig } = this.config;
        let count = 0;
        if (!enableFilter) return;
        const filterConfigSettings = filterConfig as any;
        filterConfigSettings?.layerExpressions?.forEach(exp => {
            exp.expressions?.filter(e => {
                if (e?.checked) {
                    count++;
                }
            })
        });
        return count;
    }
    destroy() {
        this._handles.removeAll();
    }

    _renderFilterChip(count) {
        const { theme } = this.config;
        const tips = this._getTips();
        return <div class="tips">
            <calcite-tooltip scale="s" theme={theme} reference-element="filterButton" placement="auto" >
                <ul id="chip-tip">
                    {tips.map((tip, i) => {
                        return <li key={`${tip}-${i}`}>{tip}</li>
                    })}
                </ul>

            </calcite-tooltip>
            <div class="active-filters">
                <calcite-chip id="chip-count" scale="s" color="blue">
                    {count}
                </calcite-chip>
            </div>

        </div>
    }

    _toggleFilterPanel() {
        this.filterPanel.showPanel();
    }
    _drawSketch() {
        //drawNotification
        this.showDrawNotification = true;
        if (!this?.sketchTool) {
            // create it 
            const layer = new GraphicsLayer({ id: "sketchLayer" });
            if (!this?.view.map.findLayerById("sketchLayer")) {
                this.view.map.add(layer);
            }

            this.sketchTool = new SketchViewModel({
                layer,
                updateOnGraphicClick: false,
                view: this.view,
                defaultCreateOptions: {
                    hasZ: false
                }
            });

            this.sketchTool.on("create", (event) => {
                if (event.state === "complete") {
                    this.sketchComplete = true;
                    this.sketchGraphic = event.graphic;
                    this.sketchGeometry = event.graphic.geometry as __esri.Polygon;
                }
            });
        }

        this.sketchTool.create("polygon");

    }
    public updateFilterProps(propertyName: string, value: any) {
        this.filterPanel?.update(propertyName, value);
    }
    public clearSketch() {
        const layer = this?.view.map.findLayerById("sketchLayer") as __esri.GraphicsLayer;
        if (layer) {
            layer.removeAll();
        }
        if (this.sketchTool) {
            this.sketchTool.cancel();
        }
        if (this?.sketchGeometry) {
            this.sketchGeometry = null;
        }
        if (this?.sketchGraphic) this.sketchGraphic = null;
        this.showDrawNotification = false;
    }
}
export = SearchPanel;
