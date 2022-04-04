import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import AppConfig from "../ConfigurationSettings";

import { storeNode, tsx, messageBundle } from "esri/widgets/support/widget";
import { esriWidgetProps } from "../interfaces/interfaces";
const CSS = {
    base: "esri-media-ga-alert",
    optButton: "esri-media-ga-alert-button"
}
@subclass("Alert")
class Alert extends Widget {

    constructor(params: esriWidgetProps) {
        super(params);
    }
    alertNode: any = null;
    @property()
    portal: __esri.Portal = null;
    @property()
    config: AppConfig;

    @property()
    @messageBundle("instant/../t9n/common")
    bundle: any = null;
    render() {
        const enableGA = localStorage.getItem("analytics-opt-in-media") || false;

        const { googleAnalytics, googleAnalyticsKey, theme, googleAnalyticsConsent, googleAnalyticsConsentMsg } = this.config;
        let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
        const isActive = googleAnalytics && googleAnalyticsKey !== null && googleAnalyticsConsent && !enableGA ? true : false;
        return (
            <div bind={this} >
                <calcite-alert class={this.classes(CSS.base, themeClass)} afterCreate={storeNode} bind={this} data-node-ref="alertNode" intl-close={this.bundle.close} scale="s" active={isActive}>
                    <div slot="message" innerHTML={googleAnalyticsConsentMsg} ></div>
                    <calcite-button class={CSS.optButton} scale="s" slot="link" bind={this} afterCreate={this.handleClick} >{this.bundle.analyticsOptIn}</calcite-button>
                </calcite-alert>
            </div>
        );
    };
    handleClick(element) {
        element.addEventListener("click", () => {
            // Add opt-in value to local storage 
            localStorage.setItem(`analytics-opt-in-${this?.config?.telemetry?.name}`, "true");
            // update config setting to trigger GA reset and 
            // prevent dialog from showing
            this.config.googleAnalyticsConsent = false;
        });
    }
}

export = Alert;
