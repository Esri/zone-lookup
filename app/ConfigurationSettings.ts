import {
    property,
    subclass
} from "esri/core/accessorSupport/decorators";

import Accessor from "esri/core/Accessor";
import { ApplicationConfig } from "ApplicationBase/interfaces";

type UIPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-leading"
    | "top-trailing"
    | "bottom-leading"
    | "bottom-trailing";

type PanelType = "details" | "legend" | "popup";
@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends (Accessor) {
    @property()
    webmap: string;

    @property()
    hideMap: boolean;

    @property()
    header: boolean;

    @property()
    theme: string;

    @property()
    applySharedTheme: boolean;

    @property()
    title: string;

    @property()
    titleLink: string;

    @property()
    introductionTitle: string;

    @property()
    introductionContent: string;

    @property()
    socialSharing: boolean;

    @property()
    mapZoom: boolean;

    @property()
    mapZoomPosition: UIPosition;

    @property()
    home: boolean;

    @property()
    homePosition: UIPosition;

    @property()
    legend: boolean;

    @property()
    legendPosition: UIPosition;

    @property()
    legendOpenAtStart: boolean;

    @property()
    scalebar: boolean;

    @property()
    scalebarPosition: UIPosition;

    @property()
    basemapToggle: boolean;

    @property()
    basemapTogglePosition: UIPosition;

    @property()
    nextBasemap: string;

    @property()
    searchConfiguration: any;

    @property()
    find: string;

    @property()
    findSource: any;

    @property()
    lookupLayers: any;

    @property()
    searchLayer: any;

    @property()
    enableSearchLayer: boolean;

    @property()
    displayUnmatchedResults: string;

    @property()
    groupResultsByLayer: boolean;

    @property()
    noResultsMessage: string;

    @property()
    resultsPanelPreText: string;

    @property()
    resultsPanelPostText: string

    @property()
    autoZoomFirstResult: boolean;

    @property()
    includeAddressGraphic: boolean;
    @property()
    includeAddressText: boolean;
    @property()
    addressGraphicColor: string;

    @property()
    hideLookupLayers: boolean;

    @property()
    mapPin: boolean;

    @property()
    mapPinLabel: boolean;

    @property()
    withinConfigurationExperience: boolean =
        window.location !== window.parent.location;

    _storageKey = "config-values";
    _draft: ApplicationConfig = null;
    _draftMode: boolean = false;
    constructor(params?: ApplicationConfig) {

        super(params);
        this._draft = params?.draft;
        this._draftMode = params?.mode === "draft";
    }
    initialize() {
        if (this.withinConfigurationExperience || this._draftMode) {
            // Apply any draft properties
            if (this._draft) {
                Object.assign(this, this._draft);
            }

            window.addEventListener(
                "message",
                function (e) {
                    this._handleConfigurationUpdates(e);
                }.bind(this),
                false
            );
        }
    }

    _handleConfigurationUpdates(e) {
        if (e?.data?.type === "cats-app") {
            Object.assign(this, e.data);
        }
    }
    mixinConfig() {

    }
}
export = ConfigurationSettings;
