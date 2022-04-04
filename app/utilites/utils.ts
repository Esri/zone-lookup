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

import { whenFalse, whenTrue } from "esri/core/watchUtils";
import { ApplicationConfig } from "TemplatesCommonLib/interfaces/applicationBase";

export interface ErrorStrings {
    title: string;
    message: string;
}
export function handleDeprecatedConfigProps(config: ApplicationConfig): ApplicationConfig {
    if (config?.exportPDF) {
        config.exportToPDF = config.exportPDF;
    }
    return config;

}
export function handleSearchTypeConfig(config: ApplicationConfig): ApplicationConfig {
    const { enableSearchLayer } = config;
    const isBoolean = 'boolean' === typeof enableSearchLayer;
    if (enableSearchLayer === null) {
        config.searchTypeSet = false;
    } else if (!isBoolean) {
        config.searchTypeSet = true;
        if (enableSearchLayer?.branchValue === "search-layer") {
            // lookup layers
            config.enableSearchLayer = true;
        } else if (enableSearchLayer?.branchValue === "search-zone") {
            // zone lookup layers 
            config.enableSearchLayer = false;
        }
    } else { config.searchTypeSet = false; }

    return config;
}
export function setPanelSize(panelSize: string) {
    let grid;
    if (panelSize === "s") {
        grid = "column-6";
    } else if (panelSize === "m") {
        grid = "column-10";
    } else {
        grid = "column-12";
    }
    return grid;
}
export function _isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}
export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function findNode(className: string): HTMLElement {

    const mainNodes = document.getElementsByClassName(className);
    let node = null;
    for (let j = 0; j < mainNodes.length; j++) {
        node = mainNodes[j] as HTMLElement;
    }
    return node ? node : null;

}

export function getRelatedLayer(layer: __esri.FeatureLayer, map: __esri.Map): __esri.FeatureLayer {
    let relatedLayer = null;
    // CHECK IF SOURCE IS IN ALLLAYERS OR ALLTABLES COLLECTIONS
    const layers = map.allLayers.filter(layer => layer.type === "feature");
    const tables = map.allTables.filter(layer => layer.type === "feature");
    // ITERATE THROUGH SELECTED LAYERS RELATIONSHIPS TO GET RELATED DATA SET
    const relationships = layer?.relationships;
    relationships?.forEach(relationship => {
        const layer = layers.find((layer: __esri.FeatureLayer) => {
            return (
                relationship?.relatedTableId === layer?.layerId &&
                layer?.relationships?.length > 0
            );
        });
        const table = tables.find((layer: __esri.FeatureLayer) => {
            return (
                relationship?.relatedTableId === layer?.layerId &&
                relationships?.length > 0
            );
        });
        relatedLayer = layer ?? table;
    });
    return relatedLayer;
}
export function handleExpandUpdated(expand) {
    whenTrue(expand, "expanded", () => {
        const mediaQuery = window.matchMedia('(max-width: 859px)');
        if (mediaQuery.matches) {
            document.body.classList.add("mobile-view-expand");
        }
    });
    whenFalse(expand, "expanded", () => {
        document.body.classList.remove("mobile-view-expand");
    });

}