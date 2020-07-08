/*
  Copyright 2017 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/
define(["require", "exports", "tslib", "esri/Camera", "esri/core/promiseUtils", "esri/geometry/Extent", "esri/geometry/Point", "esri/core/promiseUtils"], function (require, exports, tslib_1, Camera_1, promiseUtils_1, Extent_1, Point_1, promiseUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseMarker = exports.parseExtent = exports.parseLevel = exports.parseCenter = exports.parseViewpoint = exports.parseViewComponents = void 0;
    Camera_1 = tslib_1.__importDefault(Camera_1);
    Extent_1 = tslib_1.__importDefault(Extent_1);
    Point_1 = tslib_1.__importDefault(Point_1);
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    function parseViewComponents(components) {
        if (!components) {
            return;
        }
        return components.split(",");
    }
    exports.parseViewComponents = parseViewComponents;
    function parseViewpoint(viewpoint) {
        // ?viewpoint=cam:-122.69174973,45.53565982,358.434;117.195,59.777
        var viewpointArray = viewpoint && viewpoint.split(";");
        if (!viewpointArray || !viewpointArray.length) {
            return;
        }
        var cameraIndex = viewpointArray[0].indexOf("cam:") !== -1 ? 0 : 1;
        var tiltAndHeadingIndex = cameraIndex === 0 ? 1 : 0;
        var cameraString = viewpointArray[cameraIndex];
        var tiltAndHeadingString = viewpointArray[tiltAndHeadingIndex];
        var cameraProperties = _getCameraProperties(cameraString, tiltAndHeadingString);
        if (cameraProperties.position) {
            return new Camera_1.default(cameraProperties);
        }
        return;
    }
    exports.parseViewpoint = parseViewpoint;
    function parseCenter(center) {
        // ?center=-13044705.25,4036227.41,102113&level=12
        // ?center=-13044705.25;4036227.41;102113&level=12
        // ?center=-117.1825,34.0552&level=12
        // ?center=-117.1825;34.0552&level=12
        if (!center) {
            return null;
        }
        var centerArray = _splitURLString(center);
        var centerLength = centerArray.length;
        if (centerLength < 2) {
            return null;
        }
        var x = parseFloat(centerArray[0]);
        var y = parseFloat(centerArray[1]);
        if (isNaN(x) || isNaN(y)) {
            return null;
        }
        var wkid = centerLength === 3 ? parseInt(centerArray[2], 10) : 4326;
        return new Point_1.default({
            x: x,
            y: y,
            spatialReference: {
                wkid: wkid
            }
        });
    }
    exports.parseCenter = parseCenter;
    function parseLevel(level) {
        return level && parseInt(level, 10);
    }
    exports.parseLevel = parseLevel;
    function parseExtent(extent) {
        // ?extent=-13054125.21,4029134.71,-13032684.63,4041785.04,102100
        // ?extent=-13054125.21;4029134.71;-13032684.63;4041785.04;102100
        // ?extent=-117.2672,33.9927,-117.0746,34.1064
        // ?extent=-117.2672;33.9927;-117.0746;34.1064
        if (!extent) {
            return null;
        }
        var extentArray = _splitURLString(extent);
        var extentLength = extentArray.length;
        if (extentLength < 4) {
            return null;
        }
        var xmin = parseFloat(extentArray[0]), ymin = parseFloat(extentArray[1]), xmax = parseFloat(extentArray[2]), ymax = parseFloat(extentArray[3]);
        if (isNaN(xmin) || isNaN(ymin) || isNaN(xmax) || isNaN(ymax)) {
            return null;
        }
        var wkid = extentLength === 5 ? parseInt(extentArray[4], 10) : 4326;
        var ext = new Extent_1.default({
            xmin: xmin,
            ymin: ymin,
            xmax: xmax,
            ymax: ymax,
            spatialReference: {
                wkid: wkid
            }
        });
        return ext;
    }
    exports.parseExtent = parseExtent;
    function parseMarker(marker) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var markerArray, markerLength, modules, _a, Graphic, PopupTemplate, PictureMarkerSymbol, SimpleMarkerSymbol, x, y, content, icon_url, label, wkid, markerSymbol, point, hasPopupDetails, popupTemplate, graphic;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // ?marker=-117;34;4326;My Title;http://www.daisysacres.com/images/daisy_icon.gif;My location&level=10
                        // ?marker=-117,34,4326,My Title,http://www.daisysacres.com/images/daisy_icon.gif,My location&level=10
                        // ?marker=-13044705.25,4036227.41,102100,My Title,http://www.daisysacres.com/images/daisy_icon.gif,My location&level=10
                        // ?marker=-117,34,,My Title,http://www.daisysacres.com/images/daisy_icon.gif,My location&level=10
                        // ?marker=-117,34,,,,My location&level=10
                        // ?marker=-117,34&level=10
                        // ?marker=10406557.402,6590748.134,2526
                        if (!marker) {
                            return [2 /*return*/, promiseUtils_1.reject()];
                        }
                        markerArray = _splitURLString(marker);
                        markerLength = markerArray.length;
                        if (markerLength < 2) {
                            return [2 /*return*/, promiseUtils_1.reject()];
                        }
                        return [4 /*yield*/, promiseUtils_2.eachAlways([new Promise(function (resolve_1, reject_1) { require(["esri/Graphic"], resolve_1, reject_1); }).then(tslib_1.__importStar), new Promise(function (resolve_2, reject_2) { require(["esri/PopupTemplate"], resolve_2, reject_2); }).then(tslib_1.__importStar), new Promise(function (resolve_3, reject_3) { require(["esri/symbols/PictureMarkerSymbol"], resolve_3, reject_3); }).then(tslib_1.__importStar), new Promise(function (resolve_4, reject_4) { require(["esri/symbols/SimpleMarkerSymbol"], resolve_4, reject_4); }).then(tslib_1.__importStar)])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Graphic = _a[0], PopupTemplate = _a[1], PictureMarkerSymbol = _a[2], SimpleMarkerSymbol = _a[3];
                        x = parseFloat(markerArray[0]);
                        y = parseFloat(markerArray[1]);
                        content = markerArray[3];
                        icon_url = markerArray[4];
                        label = markerArray[5];
                        wkid = markerArray[2] ? parseInt(markerArray[2], 10) : 4326;
                        markerSymbol = icon_url
                            ? new PictureMarkerSymbol.default({
                                url: icon_url,
                                height: "32px",
                                width: "32px"
                            })
                            : new SimpleMarkerSymbol.default({
                                outline: {
                                    width: 1
                                },
                                size: 14,
                                color: [255, 255, 255, 0]
                            });
                        point = new Point_1.default({
                            x: x,
                            y: y,
                            spatialReference: {
                                wkid: wkid
                            }
                        });
                        hasPopupDetails = content || label;
                        popupTemplate = hasPopupDetails
                            ? new PopupTemplate.default({
                                title: content || null,
                                content: label || null
                            })
                            : null;
                        graphic = new Graphic.default({
                            geometry: point,
                            symbol: markerSymbol,
                            popupTemplate: popupTemplate
                        });
                        return [2 /*return*/, graphic];
                }
            });
        });
    }
    exports.parseMarker = parseMarker;
    //--------------------------------------------------------------------------
    //
    //  Private Methods
    //
    //--------------------------------------------------------------------------
    function _splitURLString(value) {
        if (!value) {
            return null;
        }
        var splitValues = value.split(";");
        return splitValues.length === 1 ? value.split(",") : splitValues;
    }
    function _getCameraPosition(camera) {
        if (!camera) {
            return null;
        }
        var cameraValues = camera.substr(4, camera.length - 4);
        var positionArray = cameraValues.split(",");
        if (positionArray.length < 3) {
            return null;
        }
        var x = parseFloat(positionArray[0]), y = parseFloat(positionArray[1]), z = parseFloat(positionArray[2]);
        var wkid = positionArray.length === 4 ? parseInt(positionArray[3], 10) : 4326;
        return new Point_1.default({
            x: x,
            y: y,
            z: z,
            spatialReference: {
                wkid: wkid
            }
        });
    }
    function _getHeadingAndTilt(headingAndTilt) {
        if (!headingAndTilt) {
            return null;
        }
        var tiltHeadingArray = headingAndTilt.split(",");
        return tiltHeadingArray.length >= 0
            ? {
                heading: parseFloat(tiltHeadingArray[0]),
                tilt: parseFloat(tiltHeadingArray[1])
            }
            : null;
    }
    function _getCameraProperties(camera, headingAndTilt) {
        var cameraPosition = _getCameraPosition(camera);
        var headingAndTiltProperties = _getHeadingAndTilt(headingAndTilt);
        return tslib_1.__assign({ position: cameraPosition }, headingAndTiltProperties);
    }
});
//# sourceMappingURL=urlUtils.js.map