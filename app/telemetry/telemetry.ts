import ArcGISTelemetry from "../telemetry/telemetry.dojo.min";
import ConfigurationSettings from '../ConfigurationSettings';
import { create } from 'esri/core/promiseUtils';



export interface TelemetryInstance {
    startWorkflow: (name: string, payload?: WorkflowPayload) => any;
    stepWorkflow: (name: string, step: string, payload?: WorkflowPayload) => void;
    cancelWorkflow: (name: string, payload?: WorkflowPayload) => void;
    endWorkflow: (name: string, payload?: WorkflowPayload) => void;
    getWorkflow: (name: string) => any;
    logEvent: (payload: EventPayload) => boolean;
    logError: (payload: ErrorPayload) => void;
    logPageView: (page?: string) => void;
    update: (settings: any) => void;
    removeScripts: () => void;
    disabled: boolean;
}
export interface TelemetrySettings {
    portal: __esri.Portal,
    config: ConfigurationSettings,
    appName: string
}
export interface TelemetryOptions {
    search: boolean;
    viewToggle: boolean;
    sortOrderToggle: boolean;
    filterToggle: boolean;
}

export interface EventPayload extends TelemetryAttributes, TelemetryMetrics {
    /** defaults to "other", telemetry supplies this for its methods (ie. "pageView" and "workflow") */
    eventType?: string;
    /** General area of concern for this event ("Menu", "Search") */
    category?: string;
    /** User action that caused this event ("click", etc) */
    action?: string;
    /** English-language text label for this event (ex name of the menu item the user clicked) */
    label?: string;
    /** Telemetry will automatically run this value through `JSON.stringify()` */
    json?: any;
    details?: string;
}

export interface WorkflowPayload extends TelemetryAttributes, TelemetryMetrics {
    /** sent to the server as "label": https://devtopia.esri.com/WebGIS/arcgis-telemetry.js/issues/87 */
    details?: string;
}

export interface ErrorPayload {
    /** message of the error */
    error: string;
    /** status code number or lookup */
    statusCode?: string;
    /** optional url requested prior to fail */
    urlRequested?: string;
}

/**
 * Attributes that can be stored in DB
 * https://devtopia.esri.com/WebGIS/arcgis-telemetry.js/wiki#supported-attributes
 */
interface TelemetryAttributes {
    browserWebGLCapabilities?: string;
    datasetId?: string;
    attribute?: string;
    serviceQuery?: string;
    searchQuery?: string;
    objectId?: string;
    facetValue?: string;
    statusCode?: string;
    pageUrl?: string;
}

/**
 * Metrics that can be stored in DB
 * https://devtopia.esri.com/WebGIS/arcgis-telemetry.js/wiki#supported-metrics
 */
interface TelemetryMetrics {
    duration?: number;
    position?: number;
    size?: number;
    number?: number;
    count?: number;
}

interface ArcGISTelemetryApp {
    name: string;
    id: string;
    version: string;
}

interface ArcGISTelemetryCredentials {
    userPoolID: string;
    app: ArcGISTelemetryApp;
}

class Telemetry {
    private static _instance: TelemetryInstance;
    private static gaids = ["ga1", "ga2"];
    public static async init(settings: TelemetrySettings, useCache?: boolean): Promise<TelemetryInstance> {
        return create(async (resolve, reject) => {

            const { portal, config } = settings;

            const { googleAnalytics, googleAnalyticsKey } = config;

            this._instance = null;
            await this._loadGoogleAnalytics(settings);

            const options = {
                disabled: false,
                portal,
                amazon: this._getAmazonCredentials(settings),
                google: false,
                debug: this._getEnvironment(portal.portalHostname) === "dev" ? true : false
            }
            if (googleAnalytics && googleAnalyticsKey) {
                options.google = true;
            }
            const telemetry = new ArcGISTelemetry(options) as TelemetryInstance;

            this._instance = telemetry;
            this._instance?.disabled ? resolve() : resolve(telemetry);

        });
    }

    private static _getAmazonCredentials(settings: any): ArcGISTelemetryCredentials {
        const envCredentials = settings.config.telemetry;
        if (!envCredentials) return;
        const env: string = this._getEnvironment(settings.portal.portalHostname);
        const userPoolID = envCredentials[env].amazon.userPoolID;
        const id = envCredentials[env].amazon.app.id;
        const name = envCredentials.name;
        const version = envCredentials.version;

        return {
            userPoolID,
            app: {
                name,
                id,
                version
            }
        };
    }
    private static async _loadGoogleAnalytics(settings: any) {

        return create((resolve, reject) => {
            if (settings.portal?.eueiEnabled === false) {
                resolve();
                return;
            }
            const { googleAnalytics, googleAnalyticsKey } = settings.config;
            const scriptsExist = this._googleScripts();
            // remove scripts if GA is disabled 
            if (!googleAnalytics && scriptsExist) {
                this.removeScripts();
                resolve();
            }

            // don't add scripts if already there             
            if (googleAnalytics && googleAnalyticsKey && !scriptsExist) {
                const gaScript = document.createElement('script');
                gaScript.setAttribute('async', 'true');
                gaScript.setAttribute('src', `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsKey}`);
                gaScript.id = this.gaids[0];
                const gaScript2 = document.createElement('script');
                gaScript2.id = this.gaids[1];
                gaScript2.innerText = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag(\'js\', new Date());gtag(\'config\', \'${googleAnalyticsKey}\');`;

                document.head.appendChild(gaScript);
                document.head.appendChild(gaScript2);
                let timeStart = Date.now();
                const TIMEOUT = 6000;

                let _isLoaded = function () {
                    if (Date.now() - timeStart > TIMEOUT) {
                        reject('Timeout. Google analytics not injected!');
                    }
                    if (window['ga'] && window['ga'].create) {
                        resolve(window['ga']);
                    } else {
                        setTimeout(_isLoaded, 1000);
                    }
                };
                _isLoaded();
            } else {
                resolve();
            }
        });

    }
    static _googleScripts() {
        const alreadyLoaded = this.gaids.every(id => {
            return document.getElementById(id) !== null ? true : false;
        });
        return alreadyLoaded;
    }
    public static removeScripts() {
        this.gaids.forEach(id => {
            const gaScript = document.getElementById(id);
            gaScript?.parentNode.removeChild(gaScript);
        });
    }

    public update(settings) {
        // todo remove tracker and ga scripts if false ga or null id 
        /*this._instance.trackers = this._instance.trackers.filter((tracker: any) => {
			return tracker.name !== "google";
		}) as [];
		console.log("T", this._telemetry)*/
    }
    private static _getEnvironment(hostname: string): string {
        const h = hostname.replace("www.", "");
        if (document.location.hostname.indexOf("arcgis.com") === -1) { return "dev" } else {
            return (h === "arcgis.com" && "prod") || (h === "qaext.arcgis.com" && "qa") || "dev";
        }

    }
}

export default Telemetry;