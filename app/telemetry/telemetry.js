define(["require", "exports", "tslib", "../telemetry/telemetry.dojo.min", "esri/core/promiseUtils"], function (require, exports, tslib_1, telemetry_dojo_min_1, promiseUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    telemetry_dojo_min_1 = tslib_1.__importDefault(telemetry_dojo_min_1);
    var Telemetry = /** @class */ (function () {
        function Telemetry() {
        }
        Telemetry.init = function (settings, useCache) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, promiseUtils_1.create(function (resolve, reject) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var portal, config, googleAnalytics, googleAnalyticsKey, options, telemetry;
                            var _a;
                            return tslib_1.__generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        portal = settings.portal, config = settings.config;
                                        googleAnalytics = config.googleAnalytics, googleAnalyticsKey = config.googleAnalyticsKey;
                                        this._instance = null;
                                        return [4 /*yield*/, this._loadGoogleAnalytics(settings)];
                                    case 1:
                                        _b.sent();
                                        options = {
                                            disabled: false,
                                            portal: portal,
                                            amazon: this._getAmazonCredentials(settings),
                                            google: false,
                                            debug: this._getEnvironment(portal.portalHostname) === "dev" ? true : false
                                        };
                                        if (googleAnalytics && googleAnalyticsKey) {
                                            options.google = true;
                                        }
                                        telemetry = new telemetry_dojo_min_1.default(options);
                                        this._instance = telemetry;
                                        ((_a = this._instance) === null || _a === void 0 ? void 0 : _a.disabled) ? resolve() : resolve(telemetry);
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                });
            });
        };
        Telemetry._getAmazonCredentials = function (settings) {
            var envCredentials = settings.config.telemetry;
            if (!envCredentials)
                return;
            var env = this._getEnvironment(settings.portal.portalHostname);
            var userPoolID = envCredentials[env].amazon.userPoolID;
            var id = envCredentials[env].amazon.app.id;
            var name = envCredentials.name;
            var version = envCredentials.version;
            return {
                userPoolID: userPoolID,
                app: {
                    name: name,
                    id: id,
                    version: version
                }
            };
        };
        Telemetry._loadGoogleAnalytics = function (settings) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, promiseUtils_1.create(function (resolve, reject) {
                            var _a;
                            if (((_a = settings.portal) === null || _a === void 0 ? void 0 : _a.eueiEnabled) === false) {
                                resolve();
                                return;
                            }
                            var _b = settings.config, googleAnalytics = _b.googleAnalytics, googleAnalyticsKey = _b.googleAnalyticsKey;
                            var scriptsExist = _this._googleScripts();
                            // remove scripts if GA is disabled 
                            if (!googleAnalytics && scriptsExist) {
                                _this.removeScripts();
                                resolve();
                            }
                            // don't add scripts if already there             
                            if (googleAnalytics && googleAnalyticsKey && !scriptsExist) {
                                var gaScript = document.createElement('script');
                                gaScript.setAttribute('async', 'true');
                                gaScript.setAttribute('src', "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsKey);
                                gaScript.id = _this.gaids[0];
                                var gaScript2 = document.createElement('script');
                                gaScript2.id = _this.gaids[1];
                                gaScript2.innerText = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '" + googleAnalyticsKey + "');";
                                document.head.appendChild(gaScript);
                                document.head.appendChild(gaScript2);
                                var timeStart_1 = Date.now();
                                var TIMEOUT_1 = 6000;
                                var _isLoaded_1 = function () {
                                    if (Date.now() - timeStart_1 > TIMEOUT_1) {
                                        reject('Timeout. Google analytics not injected!');
                                    }
                                    if (window['ga'] && window['ga'].create) {
                                        resolve(window['ga']);
                                    }
                                    else {
                                        setTimeout(_isLoaded_1, 1000);
                                    }
                                };
                                _isLoaded_1();
                            }
                            else {
                                resolve();
                            }
                        })];
                });
            });
        };
        Telemetry._googleScripts = function () {
            var alreadyLoaded = this.gaids.every(function (id) {
                return document.getElementById(id) !== null ? true : false;
            });
            return alreadyLoaded;
        };
        Telemetry.removeScripts = function () {
            this.gaids.forEach(function (id) {
                var gaScript = document.getElementById(id);
                gaScript === null || gaScript === void 0 ? void 0 : gaScript.parentNode.removeChild(gaScript);
            });
        };
        Telemetry.prototype.update = function (settings) {
            // todo remove tracker and ga scripts if false ga or null id 
            /*this._instance.trackers = this._instance.trackers.filter((tracker: any) => {
                return tracker.name !== "google";
            }) as [];
            console.log("T", this._telemetry)*/
        };
        Telemetry._getEnvironment = function (hostname) {
            var h = hostname.replace("www.", "");
            if (document.location.hostname.indexOf("arcgis.com") === -1) {
                return "dev";
            }
            else {
                return (h === "arcgis.com" && "prod") || (h === "qaext.arcgis.com" && "qa") || "dev";
            }
        };
        Telemetry.gaids = ["ga1", "ga2"];
        return Telemetry;
    }());
    exports.default = Telemetry;
});
//# sourceMappingURL=telemetry.js.map