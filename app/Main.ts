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

import { displayError } from './utilites/errorUtils';
import { addMapComponents } from './utilites/esriWidgetUtils';
import { getLookupLayers, getSearchLayer, getSearchGeometry } from './utilites/lookupLayerUtils';
import { init, whenDefinedOnce, watch } from "esri/core/watchUtils";

import { setPageDirection, setPageLocale } from 'ApplicationBase/support/domHelper';
import ConfigurationSettings from "./ConfigurationSettings";
import ApplicationBase from 'ApplicationBase/ApplicationBase';
import DetailPanel from './components/DetailPanel';
import DisplayLookupResults from './components/DisplayLookupResults';
import Graphic from 'esri/Graphic';
import Handles from 'esri/core/Handles';
import Header from './components/Header';
import Footer from "./components/Footer";
import MapPanel from './components/MapPanel';
import Search from 'esri/widgets/Search';

import LookupGraphics = require('./components/LookupGraphics');
import FeatureLayer from 'esri/layers/FeatureLayer';
import Telemetry, { TelemetryInstance } from "./telemetry/telemetry";

import i18n = require('dojo/i18n!./nls/resources');

import esri = __esri;
import { eachAlways } from 'esri/core/promiseUtils';
import { fromJSON } from "esri/geometry/support/jsonUtils";

const CSS = {
	loading: 'configurable-application--loading'
};

class LocationApp {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	_appConfig: ConfigurationSettings = null;
	_telemetry: TelemetryInstance = null;
	searchWidget: Search = null;
	view: esri.MapView;
	mapPanel: MapPanel = null;
	_detailPanel: DetailPanel = null;
	_handles: Handles = new Handles();
	// DisplayLookupResults is the component that handles displaying the popup content
	// using the Feature widget for the features that match the lookup search requirements
	lookupResults: DisplayLookupResults;
	lookupGraphics: LookupGraphics = null;
	//----------------------------------
	//  ApplicationBase
	//----------------------------------
	base: ApplicationBase = null;
	_results: Graphic[] = null;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------

	public init(base: ApplicationBase): void {
		if (!base) {
			console.error('ApplicationBase is not defined');
			return;
		}
		this._updateMapVisibility(base.config);

		setPageLocale(base.locale);
		setPageDirection(base.direction);

		this.base = base;

		const { config, results, portal } = base;

		config.helperServices = { ...base.portal.helperServices };

		const { webMapItems } = results;
		this._createSharedTheme();
		this._appConfig = new ConfigurationSettings(config);

		this._handleTelemetry();
		this._handles.add(init(this._appConfig, ["theme", "applySharedTheme"], () => {
			this.handleThemeUpdates();
		}), "configuration");



		// Get web map
		const allItems = webMapItems.map((item) => {
			return item;
		});
		let validWebMapItems = [];
		allItems.forEach((response) => {
			if (response && response.error) {
				return;
			}
			validWebMapItems.push(response.value);
		});
		const item = validWebMapItems[0];

		if (!item) {
			const error = 'Could not load an item to display';
			displayError({
				title: 'Error',
				message: error
			});
			return;
		}
		this.mapPanel = new MapPanel({
			item,
			base: this.base,
			container: 'mapPanel'
		});

		const panelHandle = this.mapPanel.watch('view', () => {
			panelHandle.remove();
			this.view = this.mapPanel.view;

			// Watch and update properties that affect the 
			// way results are displayed
			this._handles.add(init(this._appConfig, ["displayUnmatchedResults", "groupResultsByLayer"], () => {
				if (this._results) {
					this._displayResults(this._results);
				}
			}), "configuration");

			this.view.when(() => {
				this._addHeader(item);
				this._addDetails();

				this._addFooter();
				this.view.popup = null;
			});

			document.body.classList.remove(CSS.loading);

			this._handles.add(init(this._appConfig, "customCSS", (newValue, oldValue, propertyName) => {
				this._handleCustomCSS();
			}));

			this._addWidgets();
		});
	}
	_addFooter() {
		const container = document.createElement("div");
		document.getElementById("sidePanel").appendChild(container);
		const footer = new Footer({
			noMap: this._appConfig.hideMap,
			container
		});

		this._handles.add(init(this._appConfig, "hideMap", () => {
			this._updateMapVisibility(this._appConfig);
		}), "configuration");
		footer.on("button-clicked", () => {
			this.mapPanel.isMobileView = true;

			this.view.container.classList.remove('tablet-hide');
			//update the maps describedby item
			document.getElementById('mapDescription').innerHTML = i18n.map.miniMapDescription;
			const mainNodes = document.getElementsByClassName('main-map-content');
			for (let j = 0; j < mainNodes.length; j++) {
				mainNodes[j].classList.add('hide');
			}
			// if view size increases to greater than tablet close button if not already closed
			const resizeListener = () => {
				this.mapPanel.closeMap();
				window.removeEventListener("resize", resizeListener);
			}
			window.addEventListener("resize", resizeListener);
		});

	}
	_updateMapVisibility(config) {
		const hide = config.hideMap;
		const hideMapClass = "no-map";
		const mapClassList = document.body.classList;
		hide ? mapClassList.add(hideMapClass) : mapClassList.remove(hideMapClass);
	}
	_addDetails() {
		const appid = this.base.config.appid;
		let { introductionTitle, introductionContent } = this._appConfig;
		if (appid === '') {
			if (!introductionTitle) this._appConfig.introductionTitle = i18n.onboarding.title;
			if (!introductionContent) this._appConfig.introductionContent = i18n.onboarding.content;
		}
		this._detailPanel = new DetailPanel({
			config: this._appConfig,
			view: this.view,
			container: document.getElementById('detailPanel')
		});
	}
	_addHeader(item) {

		this._appConfig.title = this._appConfig.title || item.title || null;
		const headerComponent = new Header({
			config: this._appConfig,
			container: document.createElement("div")
		});

		const sidePanel = document.getElementById("sidePanel");
		sidePanel.insertBefore(headerComponent.container as HTMLElement, sidePanel.firstChild);
	}
	async _addWidgets() {
		await this.view.when();
		// Add esri widgets to the app (legend, home etc)
		addMapComponents({
			view: this.view,
			config: this._appConfig,
			portal: this.base.portal
		});
		this._handles.add(
			init(this._appConfig, "extentSelector, extentSelectorConfig", (value, oldValue, propertyName) => {
				if (this._appConfig?.extentSelector && this._appConfig?.extentSelectorConfig) {
					let constraints = this._appConfig?.extentSelectorConfig || null;
					const geometry = constraints?.geometry;
					if (geometry) {
						const extent = fromJSON(geometry);
						if (extent && (extent?.type === "extent" || extent?.type === "polygon")) {
							constraints.geometry = extent;
							this.view.goTo(extent, false).catch(() => { });
							this.searchWidget?.viewModel?.allSources?.forEach((source) => {
								source.filter = {
									geometry: extent
								}
							});
						}
					} else {
						constraints.geometry = null;
						this.searchWidget?.viewModel?.allSources?.forEach((source) => {
							source.filter = null;
						});
					}
					this.view.constraints = constraints;
				} else {
					this.view.constraints.geometry = null;
					this.view.constraints.minZoom = -1;
					this.view.constraints.maxZoom = -1;
					this.view.constraints.minScale = 0;
					this.view.constraints.maxScale = 0;

					this?.mapPanel?.resetExtent();

				}
			}), "configuration");

		this._setupFeatureSearchType();
	}
	async _setupFeatureSearchType() {
		const { config } = this.base;
		// Determine search lookup type
		if (!config.enableSearchLayer) {
			this.base.config.searchLayer = null;
		}
		this.lookupGraphics = new LookupGraphics({
			view: this.view,
			config: this._appConfig
		});

		this._handles.add(init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], (value, oldValue, propertyName) => {
			this.lookupGraphics.updateGraphics(propertyName, value);
		}), "configuration");
		// Get configured search layers or if none are configured get
		// all the feature layers in the map

		const lookupProps = {
			config,
			view: this.view,
			searchLayer: this._appConfig.enableSearchLayer && this._appConfig.searchLayer ? this._appConfig.searchLayer : null,
			hideFeaturesOnLoad: this._appConfig.hideLookupLayers
		};
		const searchLayer = getSearchLayer(lookupProps);
		this.lookupResults = new DisplayLookupResults({
			lookupGraphics: this.lookupGraphics,
			searchLayer,
			config: this._appConfig,
			view: this.view,
			mapPanel: this.mapPanel,
			container: 'resultsPanel'
		});

		this._handles.add(init(this._appConfig, ["lookupLayers", "enableSearchLayer", "searchLayer"], async (value, oldValue, propertyName) => {
			if (propertyName === "lookupLayers") {
				// Lookup layers have been modified. Update results to 
				// only show included layers 
				config.lookupLayers = value;
				//const configuredLayers = await findConfiguredLookupLayers(this.view, config);
				let parsedLayers = this._appConfig.lookupLayers?.layers ? this._appConfig.lookupLayers.layers : null;

				if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
					parsedLayers = null;
				}

				const lookupLayers = await getLookupLayers({
					view: this.view,
					lookupLayers: parsedLayers,
					hideFeaturesOnLoad: this._appConfig.hideLookupLayers
				});
				this.lookupResults.lookupLayers = lookupLayers;

				if (this._results) this._displayResults(this._results);
			}
			if (propertyName === "searchLayer" || propertyName === "enableSearchLayer") {
				//let searchLayer = null;
				//if (propertyName === "enableSearchLayer") {
				const searchLayer = getSearchLayer({
					view: this.view,
					searchLayer: this._appConfig.searchLayer,
					hideFeaturesOnLoad: this._appConfig.hideLookupLayers
				});
				//}

				this.lookupResults.searchLayer = this._appConfig.enableSearchLayer && searchLayer ? searchLayer : null;
				if (this._results) this._displayResults(this._results);
			}

		}), "configuration");
		// need to make sure layers are loaded before search

		this._addSearchWidget();


		this._cleanUpHandles();
	}

	async _addSearchWidget() {
		const { searchConfiguration, extentSelector, extentSelectorConfig } = this._appConfig;
		let sources = searchConfiguration?.sources;

		if (sources) {
			sources.forEach((source) => {
				let sourceLayer = null;
				if (source?.layer?.id) sourceLayer = this.view.map.findLayerById(source.layer.id);
				if (!sourceLayer && source?.layer?.url) sourceLayer = new FeatureLayer(source?.layer?.url);
				source.layer = sourceLayer;
			});
		}

		const searchProperties: esri.widgetsSearchProperties = {
			...{
				view: this.view,
				resultGraphicEnabled: false,
				autoSelect: false,
				popupEnabled: false,
				container: "search"
			}, ...searchConfiguration
		};

		if (searchProperties?.sources?.length > 0) {

			searchProperties.includeDefaultSources = false;
		}

		this.searchWidget = new Search(searchProperties);


		const handle = this.searchWidget.viewModel.watch('state', (state) => {

			if (state === 'ready') {
				this._handles.add(init(this._appConfig, ["searchConfiguration.sources", "searchConfiguration.activeSourceIndex", "searchConfiguration.searchAllEnabled"], (value, oldValue, propertyName) => {
					if (propertyName === "searchConfiguration.activeSourceIndex") {
						this.searchWidget.activeSourceIndex = value;
					}
					if (propertyName === "searchConfiguration.searchAllEnabled") {
						this.searchWidget.searchAllEnabled = value;
					}
					if (propertyName === "searchConfiguration.sources") {
						if (value) {
							value.forEach((source) => {
								if (source?.layer?.url) {
									source.layer = new FeatureLayer(source?.layer?.url);
								}
							});
						}
						this.searchWidget.sources = value;
					}

				}), "configuration");

				// If there's a find url param search for it
				init(this._appConfig, ["find", "findSource"], () => {

					const { find, findSource } = this._appConfig;
					if (find) {

						if (!this.searchWidget?.viewModel) return;


						this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
						if (findSource) {
							this.searchWidget.activeSourceIndex = findSource;
						}
						this.searchWidget.viewModel.search();

					}
				});
				this.searchWidget.on('search-clear', () => {
					this._cleanUpResults();
					// Remove find url param
					this._updateUrlParam();
					this.mapPanel.resetExtent();
				});

				this.searchWidget.on('search-complete', async (results) => {

					this._displayResults(results)
				});
				// We also want to search for locations when users click on the map
				this.view.on('click', async (e) => {
					if (this.base?.config?.searchLayer) {
						this._cleanUpResults();
					}

					this.searchWidget.search(e.mapPoint);
				});

				handle.remove();
				// conditionally hide on tablet
				if (!this.view.container.classList.contains('tablet-show')) {
					this.view.container.classList.add('tablet-hide');
				}
				// force search within map if nothing is configured
				if (extentSelector) {
					const geometry = extentSelectorConfig?.geometry || null;
					if (geometry) {
						const extent = fromJSON(geometry);
						if (extent && (extent?.type === "extent" || extent?.type === "polygon")) {
							this.searchWidget.viewModel.allSources.forEach((source) => {
								source.filter = {
									geometry: extent
								}
							});
						}
					}
				} else if (!searchConfiguration) {
					this.searchWidget.viewModel.allSources.forEach((source) => {
						source.withinViewEnabled = true;
					});
				}
			}
		});


	} async createTelemetry() {
		const { portal } = this.base;
		this._telemetry = await Telemetry.init({ portal, config: this._appConfig, appName: "config-demo" });
		this._telemetry?.logPageView();


	}
	private _handleTelemetry() {
		// Wait until both are defined 
		eachAlways([whenDefinedOnce(this._appConfig, "googleAnalytics"),
		whenDefinedOnce(this._appConfig, "googleAnalyticsKey")]

		).then(() => {
			this.createTelemetry();
			this._handles.add([
				watch(this._appConfig, ["googleAnalytics", "googleAnalyticsKey"], (newValue, oldValue, propertyName) => {
					this.createTelemetry();
				}),
			], "configuration");

		});
	}

	async _generateSearchResults(location: esri.Graphic) {
		// collapse the detail panel when results are found
		if (this._detailPanel) {
			this._detailPanel.collapse();
		}

		if (location?.attributes?.length === 0 && this?.searchWidget?.searchTerm) {
			location.attributes.Match_addr = this.searchWidget.searchTerm;
		}

		this.lookupResults && this.lookupResults.queryFeatures(location, 0);
	}
	async _displayResults(results) {
		this._results = results;

		if (!this.base.config?.searchLayer) {
			this._cleanUpResults();
		}

		if (results.numResults > 0) {
			this._results = results;
			// Add find url param
			if (this._appConfig.mapPin || this._appConfig.mapPinLabel) {
				this.lookupGraphics.updateGraphics("mapPin", this._appConfig.mapPin)
				this.lookupGraphics.updateGraphics("mapPinLabel", this._appConfig.mapPinLabel);
			}
			const index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
			this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);

			// Get search geometry and add address location to the map
			const feature = await getSearchGeometry({
				searchLayer: this.lookupResults.searchLayer || null,
				config: this._appConfig,
				view: this.view,
				results
			});
			this._generateSearchResults(feature);
		}
	}
	_cleanUpResults() {
		// Clear the lookup results displayed in the side panel
		this.lookupResults && this.lookupResults.clearResults();
		this._results = null;
		this.view.graphics.removeAll();
		this.mapPanel && this.mapPanel.clearResults();
	}
	_updateUrlParam(searchTerm?, index?) {
		if ('URLSearchParams' in window) {
			const params = new URLSearchParams(document.location.search);
			if (searchTerm) {
				if (index && (index > 0 || index === 0)) {
					params.set('findSource', index);
				} else {
					params.delete('findSource');
				}
				params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
			} else {
				params.delete('find');
				params.delete('findSource');
			}
			window.history.replaceState({}, '', `${location.pathname}?${params}`);
		}
	}
	private _createSharedTheme() {
		// use shared theme colors for header and buttons 
		const sharedTheme = this.base?.portal?.portalProperties?.sharedTheme;
		if (!sharedTheme) {
			return;
		}
		const { header, button } = sharedTheme;
		const styles = [];

		// Build and insert style
		if (header?.background) styles.push(`.shared-theme .app-header{
			background:${header.background};
		}
		.shared-theme .text-fade:after, .shared-theme .light .text-fade:after, .shared-theme .dark .text-fade:after {
			background: linear-gradient(to left, ${header.background}, 40%, transparent 80%);
		  }
		  html[dir="rtl"] .shared-theme .text-fade:before, .shared-theme .light .text-fade:before,  .shared-theme .dark .text-fade:after {
			background: linear-gradient(to right, ${header.background}, 40%, transparent 80%);
		  }
		`);

		if (header?.text) styles.push(`.shared-theme .app-header a{
			color:${header.text};
		} 
		.shared-theme .app-header{
			color:${header.text};
		} 
		.shared-theme .toolbar-buttons{color:${header.text}}`);

		if (button?.background) styles.push(`.shared-theme .app-button{
			background:${button.background};
			 border-color:${button.background};
			}
			.shared-theme .app-button.btn-blue{
				background:${button.background};
				border-color:${button.background};
			} 
			.shared-theme #detailPanel .svg-icon{
				color:${button.background};}
			 }`);
		if (button?.text)
			styles.push(`.shared-theme .app-button{
				color:${button.text};
			}
			.shared-theme .app-button.btn-blue{color:${button.text};}
		};`);


		if (styles && styles.length && styles.length > 0) {
			const style = document.createElement('style');
			style.appendChild(document.createTextNode(styles.join('')));
			document.getElementsByTagName('head')[0].appendChild(style);
		}


	}
	handleThemeUpdates() {
		// Check for a preferred color scheme and then
		// monitor updates to that color scheme and the
		// configuration panel updates.
		const { theme, applySharedTheme } = this._appConfig;
		if (theme) {
			const style = document.getElementById("esri-stylesheet") as any;
			style.href = style.href.indexOf("light") !== -1 ? style.href.replace(/light/g, theme) : style.href.replace(/dark/g, theme);
			// add light/dark class
			document.body.classList.add(theme === "light" ? "light" : "dark");

			document.body.classList.remove(theme === "light" ? "dark" : "light");
		}
		applySharedTheme ? document.body.classList.add("shared-theme") : document.body.classList.remove("shared-theme");
	}
	private _handleCustomCSS(): void {
		const customCSSStyleSheet = document.getElementById("customCSS");

		if (customCSSStyleSheet) {
			customCSSStyleSheet.remove();
		}

		const styles = document.createElement("style");
		styles.id = "customCSS";
		styles.type = "text/css";
		const styleTextNode = document.createTextNode(
			this._appConfig.customCSS
		);
		styles.appendChild(styleTextNode);
		document.head.appendChild(styles);
	}
	_cleanUpHandles() {
		// if we aren't in the config experience remove all handlers after load
		if (!this._appConfig.withinConfigurationExperience) {
			this._handles.remove("configuration");
		}
	}
}
export = LocationApp;
