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
define(["require", "exports", "tslib", "esri/widgets/ScaleBar", "esri/widgets/Legend"], function (require, exports, tslib_1, ScaleBar_1, Legend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanupPrintPage = exports.takeScreenshotAndPrint = exports.generateTitle = exports.renderPopupContent = exports.expandPopup = void 0;
    ScaleBar_1 = tslib_1.__importDefault(ScaleBar_1);
    Legend_1 = tslib_1.__importDefault(Legend_1);
    function expandPopup() {
        var _a;
        var elements = document.getElementsByClassName("popup-block");
        for (var i = 0; i < elements.length; i++) {
            (_a = elements[i]) === null || _a === void 0 ? void 0 : _a.setAttribute("open", "true");
        }
    }
    exports.expandPopup = expandPopup;
    function renderPopupContent(container) {
        // copy popup content to print div 
        var resultContainer = document.getElementById("feature-container");
        var features = resultContainer === null || resultContainer === void 0 ? void 0 : resultContainer.getElementsByClassName("feature-group-container");
        container.innerHTML = null;
        if ((features === null || features === void 0 ? void 0 : features.length) > 0) {
            // Test header then add split button
            var resultCount = document.createElement("h3");
            resultCount.classList.add("print-results");
            resultCount.innerHTML = document.getElementById("countDiv").innerHTML;
            container.append(resultCount);
        }
        for (var i = 0; i < (features === null || features === void 0 ? void 0 : features.length); i++) {
            var popupDiv = document.createElement("div");
            popupDiv.classList.add("popup-content", "light");
            container.append(popupDiv);
            var feature = features[i].cloneNode(true);
            while (feature === null || feature === void 0 ? void 0 : feature.firstChild) {
                popupDiv.append(feature.firstChild);
            }
        }
    }
    exports.renderPopupContent = renderPopupContent;
    function generateTitle(config) {
        var _a, _b;
        var printTitleArea = document.getElementById("printTitle");
        if (((_a = printTitleArea === null || printTitleArea === void 0 ? void 0 : printTitleArea.childNodes) === null || _a === void 0 ? void 0 : _a.length) > 0)
            return;
        var title = document.createElement("h1");
        title.innerHTML = config.title;
        var imageArea = document.getElementsByClassName("embed-app__header__logo");
        if ((imageArea === null || imageArea === void 0 ? void 0 : imageArea.length) > 0) {
            var logo = (_b = imageArea[0]) === null || _b === void 0 ? void 0 : _b.cloneNode();
            printTitleArea.append(logo);
        }
        if (title)
            printTitleArea.appendChild(title);
    }
    exports.generateTitle = generateTitle;
    function takeScreenshotAndPrint(props, showMap) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, view, portal, container, mapContainer, options;
            return tslib_1.__generator(this, function (_a) {
                config = props.config, view = props.view, portal = props.portal;
                generateTitle(config);
                container = document.getElementById("printPopupInfo");
                mapContainer = document.getElementById("printMapContainer");
                container === null || container === void 0 ? void 0 : container.setAttribute("display", "block");
                if (!showMap) {
                    mapContainer === null || mapContainer === void 0 ? void 0 : mapContainer.classList.remove("map");
                    document.body.classList.add("print-no-map");
                    return [2 /*return*/, Promise.resolve(renderPopupContent(container))];
                }
                else {
                    mapContainer === null || mapContainer === void 0 ? void 0 : mapContainer.classList.add("map");
                    document.body.classList.remove("print-no-map");
                    options = {
                        width: view === null || view === void 0 ? void 0 : view.width,
                        height: view === null || view === void 0 ? void 0 : view.height
                    };
                    return [2 /*return*/, view === null || view === void 0 ? void 0 : view.takeScreenshot(options).then(function (e) {
                            var _a, _b;
                            mapContainer.innerHTML = null;
                            var img = document.createElement("img");
                            img.height = (_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.height;
                            img.width = (_b = e === null || e === void 0 ? void 0 : e.data) === null || _b === void 0 ? void 0 : _b.width;
                            img.src = e.dataUrl;
                            mapContainer.append(img);
                            // add scalebar outside the view 
                            var scaleContainer = document.getElementById("printScalebar");
                            scaleContainer.innerHTML = null;
                            var scalebar = new ScaleBar_1.default({
                                view: view,
                                unit: (portal === null || portal === void 0 ? void 0 : portal.units) === "metric" ? portal === null || portal === void 0 ? void 0 : portal.units : "non-metric",
                                container: document.createElement("div")
                            });
                            scaleContainer.append(scalebar === null || scalebar === void 0 ? void 0 : scalebar.container);
                            if (config.legend) {
                                var legendContainer = document.getElementById("printLegend");
                                legendContainer.innerHTML = null;
                                var legend = new Legend_1.default({
                                    view: view,
                                    basemapLegendVisible: false,
                                    hideLayersNotInCurrentView: true,
                                    style: { type: "card", layout: "side-by-side" },
                                    container: document.createElement("div")
                                });
                                legendContainer.append(legend === null || legend === void 0 ? void 0 : legend.container);
                            }
                            renderPopupContent(container);
                        })];
                }
                return [2 /*return*/];
            });
        });
    }
    exports.takeScreenshotAndPrint = takeScreenshotAndPrint;
    function cleanupPrintPage() {
        var elements = document.getElementsByClassName("print-only");
        for (var i = 0; i < (elements === null || elements === void 0 ? void 0 : elements.length); i++) {
            var element = elements[0];
            element.innerHTML = null;
        }
    }
    exports.cleanupPrintPage = cleanupPrintPage;
});
