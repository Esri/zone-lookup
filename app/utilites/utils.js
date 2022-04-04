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
define(["require", "exports", "esri/core/watchUtils"], function (require, exports, watchUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleExpandUpdated = exports.getRelatedLayer = exports.findNode = exports.isMobile = exports._isTouchDevice = exports.setPanelSize = exports.handleSearchTypeConfig = exports.handleDeprecatedConfigProps = void 0;
    function handleDeprecatedConfigProps(config) {
        if (config === null || config === void 0 ? void 0 : config.exportPDF) {
            config.exportToPDF = config.exportPDF;
        }
        return config;
    }
    exports.handleDeprecatedConfigProps = handleDeprecatedConfigProps;
    function handleSearchTypeConfig(config) {
        var enableSearchLayer = config.enableSearchLayer;
        var isBoolean = 'boolean' === typeof enableSearchLayer;
        if (enableSearchLayer === null) {
            config.searchTypeSet = false;
        }
        else if (!isBoolean) {
            config.searchTypeSet = true;
            if ((enableSearchLayer === null || enableSearchLayer === void 0 ? void 0 : enableSearchLayer.branchValue) === "search-layer") {
                // lookup layers
                config.enableSearchLayer = true;
            }
            else if ((enableSearchLayer === null || enableSearchLayer === void 0 ? void 0 : enableSearchLayer.branchValue) === "search-zone") {
                // zone lookup layers 
                config.enableSearchLayer = false;
            }
        }
        else {
            config.searchTypeSet = false;
        }
        return config;
    }
    exports.handleSearchTypeConfig = handleSearchTypeConfig;
    function setPanelSize(panelSize) {
        var grid;
        if (panelSize === "s") {
            grid = "column-6";
        }
        else if (panelSize === "m") {
            grid = "column-10";
        }
        else {
            grid = "column-12";
        }
        return grid;
    }
    exports.setPanelSize = setPanelSize;
    function _isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0));
    }
    exports._isTouchDevice = _isTouchDevice;
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    exports.isMobile = isMobile;
    function findNode(className) {
        var mainNodes = document.getElementsByClassName(className);
        var node = null;
        for (var j = 0; j < mainNodes.length; j++) {
            node = mainNodes[j];
        }
        return node ? node : null;
    }
    exports.findNode = findNode;
    function getRelatedLayer(layer, map) {
        var relatedLayer = null;
        // CHECK IF SOURCE IS IN ALLLAYERS OR ALLTABLES COLLECTIONS
        var layers = map.allLayers.filter(function (layer) { return layer.type === "feature"; });
        var tables = map.allTables.filter(function (layer) { return layer.type === "feature"; });
        // ITERATE THROUGH SELECTED LAYERS RELATIONSHIPS TO GET RELATED DATA SET
        var relationships = layer === null || layer === void 0 ? void 0 : layer.relationships;
        relationships === null || relationships === void 0 ? void 0 : relationships.forEach(function (relationship) {
            var layer = layers.find(function (layer) {
                var _a;
                return ((relationship === null || relationship === void 0 ? void 0 : relationship.relatedTableId) === (layer === null || layer === void 0 ? void 0 : layer.layerId) &&
                    ((_a = layer === null || layer === void 0 ? void 0 : layer.relationships) === null || _a === void 0 ? void 0 : _a.length) > 0);
            });
            var table = tables.find(function (layer) {
                return ((relationship === null || relationship === void 0 ? void 0 : relationship.relatedTableId) === (layer === null || layer === void 0 ? void 0 : layer.layerId) &&
                    (relationships === null || relationships === void 0 ? void 0 : relationships.length) > 0);
            });
            relatedLayer = layer !== null && layer !== void 0 ? layer : table;
        });
        return relatedLayer;
    }
    exports.getRelatedLayer = getRelatedLayer;
    function handleExpandUpdated(expand) {
        watchUtils_1.whenTrue(expand, "expanded", function () {
            var mediaQuery = window.matchMedia('(max-width: 859px)');
            if (mediaQuery.matches) {
                document.body.classList.add("mobile-view-expand");
            }
        });
        watchUtils_1.whenFalse(expand, "expanded", function () {
            document.body.classList.remove("mobile-view-expand");
        });
    }
    exports.handleExpandUpdated = handleExpandUpdated;
});
