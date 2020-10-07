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


import { property, subclass } from 'esri/core/accessorSupport/decorators';
import Accessor = require('esri/core/Accessor');
import Graphic from "esri/Graphic";
import Handles from "esri/core/Handles";
import { TextSymbol } from 'esri/symbols';
import { getBasemapTheme } from '../utilites/geometryUtils';
import Color from 'esri/Color';
import FeatureLayer from "esri/layers/FeatureLayer";
import ConfigurationSettings = require('../ConfigurationSettings');
interface LookupGraphicsProps {
    config: ConfigurationSettings;
    view: __esri.MapView;
    graphic?: __esri.Graphic;
}

@subclass('LookupGraphics')
class LookupGraphics extends (Accessor) {
    @property() config: ConfigurationSettings;
    @property()
    view: __esri.MapView = null;
    @property()
    graphic: Graphic = null;


    // Graphic colors 
    _lightColor = "#595959";
    _darkColor = "#fff";
    // Graphics created and managed by this class 
    _graphicMarker: Graphic = null;
    _graphicLabel: Graphic = null;;
    _theme: Color = null;
    _handles: Handles = null;
    _geometry: __esri.Geometry = null;
    constructor(props: LookupGraphicsProps) {
        super(props);
        this._handles = new Handles();
    }
    initialize() {

    }
    public updateGraphics(propName: string, enabled: boolean) {
        if (this.graphic) {
            if (propName === "mapPinLabel") {
                this._createGraphicLabel();
            }
            if (propName === "mapPin") {
                this._createGraphicMarker();
            }
        }
    }
    private async _createGraphicMarker() {
        if (this._graphicMarker) {
            // remove the existing graphic
            this.view.graphics.remove(this._graphicMarker);
        }
        if (!this.config.mapPin) return;
        if (this.graphic?.geometry) {
            // create the graphic 
            this._graphicMarker = new Graphic({
                geometry: this.graphic?.geometry,
                symbol: new TextSymbol({
                    color: this._theme,
                    haloColor: this._theme,

                    text: '\ue61d',// esri-icon-map-pin
                    yoffset: 10,
                    font: {
                        size: 20,
                        family: 'calcite-web-icons'
                    }
                })
            });
            this.view.graphics.add(this._graphicMarker);
        }
    }

    private async _createGraphicLabel() {
        if (this._graphicLabel) {
            // remove existing then create new
            this.view.graphics.remove(this._graphicLabel);
        }
        if (!this.config.mapPinLabel) return;
        const address = this._getAddressText();
        // create the graphic 
        this._graphicLabel = new Graphic({
            geometry: this.graphic.geometry,
            symbol: new TextSymbol({
                font: {
                    size: 12
                },
                text: address,
                haloColor: this._theme?.toHex() === this._lightColor ? this._darkColor : this._lightColor,
                haloSize: "1px",
                color: this._theme,
                horizontalAlignment: 'center'
            })
        });

        this.view.graphics.add(this._graphicLabel);

    }

    private _getAddressText(): string {
        // Everytime the graphic changes let's get the address text if 
        // include address text is enabled. 
        let address = null;
        if (this.graphic?.attributes?.Match_addr) {
            // replace first comma with a new line character
            address = this.graphic.attributes.Match_addr.replace(',', '\n');
        } else if (this.graphic?.attributes?.name) {
            address = this.graphic.attributes.name;
        } else if (this.graphic?.layer instanceof FeatureLayer) {
            if (this.graphic.layer.displayField !== null && this.graphic.layer.displayField !== "") {
                address = this.graphic.attributes[this.graphic.layer.displayField] || null;
            } else {

                // get the first string field
                this.graphic.layer.fields.some((field) => {
                    if (field.type === 'string') {
                        address = this.graphic.attributes[field.name];
                        return true;
                    }
                });
            }
        }
        return address;

    }

    private async _updateTheme() {
        const theme = await getBasemapTheme(this.view);
        this._theme = (theme === "light") ? new Color(this._lightColor) : new Color(this._darkColor);
    }
    public async addGraphics() {
        if (!this._theme) await this._updateTheme();
        this._createGraphicLabel();
        this._createGraphicMarker();
    }
    public clearGraphics() {
        // remove all added graphics 
        if (this._graphicLabel) this.view.graphics.remove(this._graphicLabel);
        if (this._graphicMarker) this.view.graphics.remove(this._graphicMarker);
        this._graphicLabel = null;
        this._graphicMarker = null;
        this.graphic = null;
    }

}

export = LookupGraphics;
