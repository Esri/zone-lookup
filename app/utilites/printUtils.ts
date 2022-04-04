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

import { esriWidgetProps } from "../interfaces/interfaces";
import ScaleBar from "esri/widgets/ScaleBar";
import Legend from "esri/widgets/Legend";
export function expandPopup() {
    const elements = document.getElementsByClassName("popup-block");
    for (let i = 0; i < elements.length; i++) {
        elements[i]?.setAttribute("open", "true");
    }
}

export function renderPopupContent(container) {
    // copy popup content to print div 
    const resultContainer = document.getElementById("feature-container");

    const features = resultContainer?.getElementsByClassName("feature-group-container");
    container.innerHTML = null;
    if (features?.length > 0) {
        // Test header then add split button
        const resultCount = document.createElement("h3");
        resultCount.classList.add("print-results");
        resultCount.innerHTML = document.getElementById("countDiv").innerHTML;
        container.append(resultCount);
    }

    for (var i = 0; i < features?.length; i++) {
        const popupDiv = document.createElement("div");
        popupDiv.classList.add("popup-content", "light");

        container.append(popupDiv);
        const feature = features[i].cloneNode(true);

        while (feature?.firstChild) {
            popupDiv.append(feature.firstChild)
        }
    }
}
export function generateTitle(config) {

    const printTitleArea = document.getElementById("printTitle");

    if (printTitleArea?.childNodes?.length > 0) return;

    const title = document.createElement("h1");
    title.innerHTML = config.title;

    const imageArea = document.getElementsByClassName("embed-app__header__logo");
    if (imageArea?.length > 0) {
        const logo = imageArea[0]?.cloneNode();
        printTitleArea.append(logo);
    }

    if (title) printTitleArea.appendChild(title);

}
export async function takeScreenshotAndPrint(props: esriWidgetProps, showMap: boolean) {
    const { config, view, portal } = props;

    generateTitle(config);
    const container = document.getElementById("printPopupInfo");
    const mapContainer = document.getElementById("printMapContainer");
    container?.setAttribute("display", "block");
    if (!showMap) {
        mapContainer?.classList.remove("map");
        document.body.classList.add("print-no-map");
        return Promise.resolve(renderPopupContent(container));
    } else {
        mapContainer?.classList.add("map");
        document.body.classList.remove("print-no-map");
        let options = {
            width: view?.width,
            height: view?.height
        } as __esri.MapViewTakeScreenshotOptions;

        return view?.takeScreenshot(options).then(e => {

            mapContainer.innerHTML = null;
            const img = document.createElement("img");
            img.height = e?.data?.height;
            img.width = e?.data?.width;
            img.src = e.dataUrl;

            mapContainer.append(img);

            // add scalebar outside the view 
            const scaleContainer = document.getElementById("printScalebar");
            scaleContainer.innerHTML = null;
            const scalebar = new ScaleBar({
                view,
                unit: portal?.units === "metric" ? portal?.units : "non-metric",
                container: document.createElement("div")
            });
            scaleContainer.append(scalebar?.container);
            if (config.legend) {
                const legendContainer = document.getElementById("printLegend");
                legendContainer.innerHTML = null;
                const legend = new Legend({
                    view,
                    basemapLegendVisible: false,
                    hideLayersNotInCurrentView: true,
                    style: { type: "card", layout: "side-by-side" },
                    container: document.createElement("div")
                });
                legendContainer.append(legend?.container);
            }
            renderPopupContent(container);

        });
    }
}

export function cleanupPrintPage() {
    const elements = document.getElementsByClassName("print-only");
    for (let i = 0; i < elements?.length; i++) {
        const element = elements[0];
        element.innerHTML = null;
    }
}

