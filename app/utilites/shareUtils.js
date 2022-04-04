define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/geometry/Point", "esri/request", "esri/geometry/projection", "esri/geometry/SpatialReference"], function (require, exports, tslib_1, Accessor, decorators_1, Point, esriRequest, projection, SpatialReference) {
    "use strict";
    //----------------------------------
    //
    //  Shorten URL API
    //
    //----------------------------------
    var SHORTEN_API = "https://arcg.is/prod/shorten";
    var ShareUtils = /** @class */ (function (_super) {
        tslib_1.__extends(ShareUtils, _super);
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        function ShareUtils(params) {
            var _this = _super.call(this, params) || this;
            _this.highlight = null;
            //----------------------------------
            //
            //  view
            //
            //----------------------------------
            _this.view = null;
            //----------------------------------
            //
            //  shareUrl - readOnly
            //
            //----------------------------------
            _this.shareUrl = null;
            _this.selected = null;
            return _this;
        }
        ShareUtils.prototype.destroy = function () {
            this.view = null;
        };
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        ShareUtils.prototype.generateUrl = function (selected) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var url, shortenedUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.selected = selected;
                            return [4 /*yield*/, this._generateShareUrl()];
                        case 1:
                            url = _a.sent();
                            return [4 /*yield*/, this._shorten(url)];
                        case 2:
                            shortenedUrl = _a.sent();
                            this._set("shareUrl", shortenedUrl);
                            return [2 /*return*/, shortenedUrl];
                    }
                });
            });
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        ShareUtils.prototype._generateShareUrl = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var href, _b, x, y, spatialReference, centerPoint, point, layer;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            href = window.location.href;
                            // If view is not ready
                            if (!this.get("view.ready")) {
                                return [2 /*return*/, href];
                            }
                            _b = this.view.center, x = _b.x, y = _b.y;
                            spatialReference = this.view.spatialReference;
                            centerPoint = new Point({
                                x: x,
                                y: y,
                                spatialReference: spatialReference
                            });
                            return [4 /*yield*/, this._processPoint(centerPoint)];
                        case 1:
                            point = _c.sent();
                            layer = (_a = this.selected) === null || _a === void 0 ? void 0 : _a.layer;
                            if (layer) {
                                this.highlight = "" + layer.id + this.selected.attributes[layer.objectIdField];
                            }
                            return [2 /*return*/, this._generateShareUrlParams(point)];
                    }
                });
            });
        };
        ShareUtils.prototype._processPoint = function (point) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, isWGS84, isWebMercator, outputSpatialReference, projectedPoint;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = point.spatialReference, isWGS84 = _a.isWGS84, isWebMercator = _a.isWebMercator;
                            // If spatial reference is WGS84 or Web Mercator, use longitude/latitude values to generate the share URL parameters
                            if (isWGS84 || isWebMercator) {
                                return [2 /*return*/, point];
                            }
                            outputSpatialReference = new SpatialReference({
                                wkid: 4326
                            });
                            return [4 /*yield*/, projection.load()];
                        case 1:
                            _b.sent();
                            projectedPoint = projection.project(point, outputSpatialReference);
                            return [2 /*return*/, projectedPoint];
                    }
                });
            });
        };
        ShareUtils.prototype._generateShareUrlParams = function (point) {
            var href = window.location.href;
            var longitude = point.longitude, latitude = point.latitude;
            if (longitude === undefined || latitude === undefined) {
                return href;
            }
            var roundedLon = this._roundValue(longitude);
            var roundedLat = this._roundValue(latitude);
            var zoom = this.view.zoom;
            var roundedZoom = this._roundValue(zoom);
            var path = href.split("center")[0];
            // If no "?", then append "?". Otherwise, check for "?" and "="
            var sep = path.indexOf("?") === -1
                ? "?"
                : path.indexOf("?") !== -1 && path.indexOf("=") !== -1
                    ? "&"
                    : "";
            var shareParams = "" + path + sep + "select=" + this.highlight + "&center=" + roundedLon + "," + roundedLat + "&level=" + roundedZoom;
            // Otherwise, just return original url parameters for 2D
            return shareParams;
        };
        ShareUtils.prototype._shorten = function (url) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var request, shortUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, esriRequest(SHORTEN_API, {
                                query: {
                                    longUrl: url,
                                    f: "json"
                                }
                            })];
                        case 1:
                            request = _a.sent();
                            shortUrl = request.data && request.data.data && request.data.data.url;
                            if (shortUrl) {
                                return [2 /*return*/, shortUrl];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        ShareUtils.prototype._roundValue = function (val) {
            return parseFloat(val.toFixed(4));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareUtils.prototype, "highlight", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareUtils.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property({ readOnly: true })
        ], ShareUtils.prototype, "shareUrl", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ShareUtils.prototype, "selected", void 0);
        ShareUtils = tslib_1.__decorate([
            decorators_1.subclass("ShareUtils")
        ], ShareUtils);
        return ShareUtils;
    }((Accessor)));
    return ShareUtils;
});
