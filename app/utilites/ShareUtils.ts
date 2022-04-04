
// esri.core
import Accessor = require("esri/core/Accessor");


// esri.core.accessorSupport
import {
    subclass,
    property
} from "esri/core/accessorSupport/decorators";

// esri.views
import MapView = require("esri/views/MapView");

//esri.geometry
import Point = require("esri/geometry/Point");

// esri.request
import esriRequest = require("esri/request");

// esri.geometry
import projection = require("esri/geometry/projection");
import SpatialReference = require("esri/geometry/SpatialReference");
import Graphic = require("esri/Graphic");

interface SearchParams {
    view: MapView
}

//----------------------------------
//
//  Shorten URL API
//
//----------------------------------
const SHORTEN_API = "https://arcg.is/prod/shorten";

@subclass("ShareUtils")
class ShareUtils extends (Accessor) {
    //----------------------------------
    //
    //  Lifecycle
    //
    //----------------------------------
    constructor(params: SearchParams) {
        super(params);
    }
    destroy() {
        this.view = null;
    }

    @property() highlight: string = null;


    //----------------------------------
    //
    //  view
    //
    //----------------------------------
    @property() view: MapView = null;



    //----------------------------------
    //
    //  shareUrl - readOnly
    //
    //----------------------------------
    @property({ readOnly: true })
    shareUrl: string = null;

    @property()
    selected: Graphic = null;
    //----------------------------------
    //
    //  Public Methods
    //
    //----------------------------------
    async generateUrl(selected): Promise<string> {
        this.selected = selected;
        const url = await this._generateShareUrl();

        const shortenedUrl = await this._shorten(url);
        this._set("shareUrl", shortenedUrl);
        return shortenedUrl;
    }

    //----------------------------------
    //
    //  Private Methods
    //
    //----------------------------------
    public async _generateShareUrl(): Promise<string> {
        const { href } = window.location;
        // If view is not ready
        if (!this.get("view.ready")) {
            return href;
        }
        // Use x/y values and the spatial reference of the view to instantiate a geometry point
        const { x, y } = this.view.center;
        const { spatialReference } = this.view;
        const centerPoint = new Point({
            x,
            y,
            spatialReference
        });
        // Use pointToConvert to project point. Once projected, pass point to generate the share URL parameters
        const point = await this._processPoint(centerPoint);

        // Add highlight url param 
        const layer = this.selected?.layer as __esri.FeatureLayer;
        if (layer) {
            this.highlight = `${layer.id}${this.selected.attributes[layer.objectIdField]}`
        }

        return this._generateShareUrlParams(point);
    }

    private async _processPoint(point: Point): Promise<__esri.Point> {
        const { isWGS84, isWebMercator } = point.spatialReference;
        // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
        if (isWGS84 || isWebMercator) {
            return point;
        }

        const outputSpatialReference = new SpatialReference({
            wkid: 4326
        });

        await projection.load();
        const projectedPoint = projection.project(
            point,
            outputSpatialReference
        ) as __esri.Point;

        return projectedPoint;
    }

    private _generateShareUrlParams(point: Point): string {
        const { href } = window.location;
        const { longitude, latitude } = point;
        if (longitude === undefined || latitude === undefined) {
            return href;
        }
        const roundedLon = this._roundValue(longitude);
        const roundedLat = this._roundValue(latitude);
        const { zoom } = this.view;
        const roundedZoom = this._roundValue(zoom);
        const path = href.split("center")[0];
        // If no "?", then append "?". Otherwise, check for "?" and "="
        const sep =
            path.indexOf("?") === -1
                ? "?"
                : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
                    ? "&"
                    : "";
        const shareParams = `${path}${sep}select=${this.highlight}&center=${roundedLon},${roundedLat}&level=${roundedZoom}`;


        // Otherwise, just return original url parameters for 2D
        return shareParams;
    }

    private async _shorten(url: string): Promise<string> {

        const request = await esriRequest(SHORTEN_API, {
            query: {
                longUrl: url,
                f: "json"
            }
        });

        const shortUrl = request.data && request.data.data && request.data.data.url;
        if (shortUrl) {
            return shortUrl;
        }
    }

    private _roundValue(val: number): number {
        return parseFloat(val.toFixed(4));
    }
}

export = ShareUtils;