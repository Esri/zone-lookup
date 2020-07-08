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
import { findConfiguredLookupLayers, getLookupLayers, getSearchLayer, getSearchGeometry } from './utilites/lookupLayerUtils';
import { init, watch, whenFalseOnce } from "esri/core/watchUtils";

import { setPageDirection, setPageLocale } from './application-base-js/support/domHelper';
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
import Telemetry from 'telemetry/telemetry.dojo';
import LookupGraphics = require('./components/LookupGraphics');
import FeatureLayer from 'esri/layers/FeatureLayer';

import i18n = require('dojo/i18n!./nls/resources');

import esri = __esri;
import { apply } from 'dojo/behavior';
import { search } from 'dojo/text!*';
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
	telemetry: Telemetry = null;
	searchWidget: Search = null;
	view: esri.MapView;
	mapPanel: MapPanel = null;
	_detailPanel: DetailPanel = null;
	_handles: Handles = new Handles();
	// DisplayLookupResults is the component that handles displaying the popup content
	// using the Feature widget for the features that match the lookup search requirements
	lookupResults: DisplayLookupResults;
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

		this._handles.add(init(this._appConfig, ["theme", "applySharedTheme"], () => {
			this.handleThemeUpdates();
		}), "configuration");

		// Setup Telemetry
		if (config.telemetry) {
			let options = config.telemetry.prod;
			if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
				// use devext credentials
				options = config.telemetry.devext;
			} else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
				// or qa
				options = config.telemetry.qaext;
			}
			this.telemetry = new Telemetry({
				portal,
				disabled: options.disabled,
				debug: options.debug,
				amazon: options.amazon
			});
			this.telemetry.logPageView();
		}

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
			this.telemetry.logError({
				error
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

			this._addHeader(item);

			this._addDetails();

			this._addFooter();

			this.view.popup = null;
			document.body.classList.remove(CSS.loading);
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

		this._appConfig.title = this._appConfig.title || item.title;
		const headerComponent = new Header({
			config: this._appConfig,
			container: document.createElement("div")
		});

		const sidePanel = document.getElementById("sidePanel");
		sidePanel.insertBefore(headerComponent.container as HTMLElement, sidePanel.firstChild);
	}
	async _addWidgets() {
		// Add esri widgets to the app (legend, home etc)
		addMapComponents({
			view: this.view,
			config: this._appConfig,
			portal: this.base.portal
		});

		this._setupFeatureSearchType();
	}
	async _setupFeatureSearchType() {
		const { config } = this.base;
		// Determine search lookup type
		if (!config.enableSearchLayer) {
			this.base.config.searchLayer = null;
		}
		const lookupGraphics = new LookupGraphics({
			view: this.view,
			config: this._appConfig
		});
		this._handles.add(init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], (value, oldValue, propertyName) => {
			lookupGraphics.updateGraphics(propertyName, value);
		}), "configuration");
		// Get configured search layers or if none are configured get
		// all the feature layers in the map

		const configuredLayers = await findConfiguredLookupLayers(this.view, config);
		const lookupLayers: esri.Collection<esri.FeatureLayer> = getLookupLayers(configuredLayers)
		const lookupProps = {
			config,
			view: this.view,
			lookupLayers,
			searchLayer: this._appConfig.enableSearchLayer && this._appConfig.searchLayer ? this._appConfig.searchLayer : null,
			hideFeaturesOnLoad: this._appConfig.hideLookupLayers
		};
		const searchLayer: __esri.FeatureLayer = await getSearchLayer(lookupProps);
		this.lookupResults = new DisplayLookupResults({
			lookupLayers,
			lookupGraphics,
			searchLayer,
			config: this._appConfig,
			view: this.view,
			mapPanel: this.mapPanel,
			container: 'resultsPanel'
		});

		this._handles.add(watch(this._appConfig, ["lookupLayers", "enableSearchLayer", "searchLayer"], async (value, oldValue, propertyName) => {
			if (propertyName === "lookupLayers") {
				// Lookup layers have been modified. Update results to 
				// only show included layers 
				config.lookupLayers = value;
				const configuredLayers = await findConfiguredLookupLayers(this.view, config);

				this.lookupResults.lookupLayers = await getLookupLayers(configuredLayers);
				if (this._results) this._displayResults(this._results);
			}
			if (propertyName === "searchLayer" || propertyName === "enableSearchLayer") {
				let searchLayer: __esri.FeatureLayer = null;
				if (propertyName === "enableSearchLayer") {
					searchLayer = await getSearchLayer({
						view: this.view,
						lookupLayers,
						searchLayer: value,
						hideFeaturesOnLoad: this._appConfig.hideLookupLayers
					});
				}
				this.lookupResults.searchLayer = searchLayer;
				if (this._results) this._displayResults(this._results);
			}

		}), "configuration");

		this._addSearchWidget();


		this._cleanUpHandles();
	}

	_addSearchWidget() {
		const { searchConfiguration, find, findSource } = this._appConfig;
		let sources = searchConfiguration?.sources;
		if (sources) {
			sources.forEach((source) => {
				if (source?.layer?.url) {
					source.layer = new FeatureLayer(source?.layer?.url);
				}
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
		if (find) {
			whenFalseOnce(this.view, "updating", () => {
				this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
				if (findSource) {
					this.searchWidget.activeSourceIndex = findSource;
				}
				this.searchWidget.viewModel.search();
			});
		}

		const handle = this.searchWidget.viewModel.watch('state', (state) => {

			if (state === 'ready') {
				handle.remove();
				// conditionally hide on tablet
				if (!this.view.container.classList.contains('tablet-show')) {
					this.view.container.classList.add('tablet-hide');
				}
				// force search within map if nothing is configured
				if (!searchConfiguration) {
					this.searchWidget.viewModel.allSources.forEach((source) => {
						source.withinViewEnabled = true;
					});
				}
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

			this.searchWidget.search(e.mapPoint).then((response: any) => {
				if (response && response.numResults < 1) {
					this._displayNoResultsMessage(e.mapPoint);
				}
				if (response && response.numErrors && response.numErrors > 0) {
					this._displayNoResultsMessage(e.mapPoint);
				}
			});
		});
	}
	_displayNoResultsMessage(geometry: esri.Geometry) {
		// display no results message
		const g = new Graphic({ geometry });
		this._generateSearchResults(g);
		this.searchWidget.activeMenu = null;
	}
	async _generateSearchResults(location: esri.Graphic) {
		// collapse the detail panel when results are found
		if (this._detailPanel) {
			this._detailPanel.collapse();
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
			const index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
			this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);
			const searchLayer = (this.lookupResults?.searchLayer) || null;
			// Get search geometry and add address location to the map
			const feature = await getSearchGeometry({
				searchLayer,
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
		.shared-theme .text-fade:after {
			background: linear-gradient(to left, ${header.background}, 40%, transparent 100%);
		  }
		  html[dir="rtl"] .light .text-fade:after {
			background: linear-gradient(to right, ${header.background}, 40%, transparent 100%);
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

	_cleanUpHandles() {
		// if we aren't in the config experience remove all handlers after load
		if (!this._appConfig.withinConfigurationExperience) {
			this._handles.remove("configuration");
		}
	}
}
export = LocationApp;
