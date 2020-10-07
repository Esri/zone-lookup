/*
  Copyright 2019 Esri
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
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Accessor", "esri/Graphic", "esri/core/Handles", "esri/symbols", "../utilites/geometryUtils", "esri/Color", "esri/layers/FeatureLayer"], function (require, exports, tslib_1, decorators_1, Accessor, Graphic_1, Handles_1, symbols_1, geometryUtils_1, Color_1, FeatureLayer_1) {
    "use strict";
    Graphic_1 = tslib_1.__importDefault(Graphic_1);
    Handles_1 = tslib_1.__importDefault(Handles_1);
    Color_1 = tslib_1.__importDefault(Color_1);
    FeatureLayer_1 = tslib_1.__importDefault(FeatureLayer_1);
    var LookupGraphics = /** @class */ (function (_super) {
        tslib_1.__extends(LookupGraphics, _super);
        function LookupGraphics(props) {
            var _this = _super.call(this, props) || this;
            _this.view = null;
            _this.graphic = null;
            // Graphic colors 
            _this._lightColor = "#595959";
            _this._darkColor = "#fff";
            // Graphics created and managed by this class 
            _this._graphicMarker = null;
            _this._graphicLabel = null;
            _this._theme = null;
            _this._handles = null;
            _this._geometry = null;
            _this._handles = new Handles_1.default();
            return _this;
        }
        ;
        LookupGraphics.prototype.initialize = function () {
        };
        LookupGraphics.prototype.updateGraphics = function (propName, enabled) {
            if (this.graphic) {
                if (propName === "mapPinLabel") {
                    this._createGraphicLabel();
                }
                if (propName === "mapPin") {
                    this._createGraphicMarker();
                }
            }
        };
        LookupGraphics.prototype._createGraphicMarker = function () {
            var _a, _b;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_c) {
                    if (this._graphicMarker) {
                        // remove the existing graphic
                        this.view.graphics.remove(this._graphicMarker);
                    }
                    if (!this.config.mapPin)
                        return [2 /*return*/];
                    if ((_a = this.graphic) === null || _a === void 0 ? void 0 : _a.geometry) {
                        // create the graphic 
                        this._graphicMarker = new Graphic_1.default({
                            geometry: (_b = this.graphic) === null || _b === void 0 ? void 0 : _b.geometry,
                            symbol: new symbols_1.TextSymbol({
                                color: this._theme,
                                haloColor: this._theme,
                                text: '\ue61d',
                                yoffset: 10,
                                font: {
                                    size: 20,
                                    family: 'calcite-web-icons'
                                }
                            })
                        });
                        this.view.graphics.add(this._graphicMarker);
                    }
                    return [2 /*return*/];
                });
            });
        };
        LookupGraphics.prototype._createGraphicLabel = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var address;
                return tslib_1.__generator(this, function (_b) {
                    if (this._graphicLabel) {
                        // remove existing then create new
                        this.view.graphics.remove(this._graphicLabel);
                    }
                    if (!this.config.mapPinLabel)
                        return [2 /*return*/];
                    address = this._getAddressText();
                    // create the graphic 
                    this._graphicLabel = new Graphic_1.default({
                        geometry: this.graphic.geometry,
                        symbol: new symbols_1.TextSymbol({
                            font: {
                                size: 12
                            },
                            text: address,
                            haloColor: ((_a = this._theme) === null || _a === void 0 ? void 0 : _a.toHex()) === this._lightColor ? this._darkColor : this._lightColor,
                            haloSize: "1px",
                            color: this._theme,
                            horizontalAlignment: 'center'
                        })
                    });
                    this.view.graphics.add(this._graphicLabel);
                    return [2 /*return*/];
                });
            });
        };
        LookupGraphics.prototype._getAddressText = function () {
            var _this = this;
            var _a, _b, _c, _d, _e;
            // Everytime the graphic changes let's get the address text if 
            // include address text is enabled. 
            var address = null;
            if ((_b = (_a = this.graphic) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.Match_addr) {
                // replace first comma with a new line character
                address = this.graphic.attributes.Match_addr.replace(',', '\n');
            }
            else if ((_d = (_c = this.graphic) === null || _c === void 0 ? void 0 : _c.attributes) === null || _d === void 0 ? void 0 : _d.name) {
                address = this.graphic.attributes.name;
            }
            else if (((_e = this.graphic) === null || _e === void 0 ? void 0 : _e.layer) instanceof FeatureLayer_1.default) {
                if (this.graphic.layer.displayField !== null && this.graphic.layer.displayField !== "") {
                    address = this.graphic.attributes[this.graphic.layer.displayField] || null;
                }
                else {
                    // get the first string field
                    this.graphic.layer.fields.some(function (field) {
                        if (field.type === 'string') {
                            address = _this.graphic.attributes[field.name];
                            return true;
                        }
                    });
                }
            }
            return address;
        };
        LookupGraphics.prototype._updateTheme = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var theme;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, geometryUtils_1.getBasemapTheme(this.view)];
                        case 1:
                            theme = _a.sent();
                            this._theme = (theme === "light") ? new Color_1.default(this._lightColor) : new Color_1.default(this._darkColor);
                            return [2 /*return*/];
                    }
                });
            });
        };
        LookupGraphics.prototype.addGraphics = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this._theme) return [3 /*break*/, 2];
                            return [4 /*yield*/, this._updateTheme()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            this._createGraphicLabel();
                            this._createGraphicMarker();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LookupGraphics.prototype.clearGraphics = function () {
            // remove all added graphics 
            if (this._graphicLabel)
                this.view.graphics.remove(this._graphicLabel);
            if (this._graphicMarker)
                this.view.graphics.remove(this._graphicMarker);
            this._graphicLabel = null;
            this._graphicMarker = null;
            this.graphic = null;
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], LookupGraphics.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LookupGraphics.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], LookupGraphics.prototype, "graphic", void 0);
        LookupGraphics = tslib_1.__decorate([
            decorators_1.subclass('LookupGraphics')
        ], LookupGraphics);
        return LookupGraphics;
    }((Accessor)));
    return LookupGraphics;
});
//# sourceMappingURL=LookupGraphics.js.map