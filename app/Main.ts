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

import * as errorUtils from './utilites/errorUtils';
import * as esriWidgetUtils from './utilites/esriWidgetUtils';
import * as lookupLayerUtils from './utilites/lookupLayerUtils';

import { setPageDirection, setPageLocale, setPageTitle } from 'ApplicationBase/support/domHelper';

import ApplicationBase from 'ApplicationBase/ApplicationBase';
import DetailPanel from './components/DetailPanel';
import DisplayLookupResults from './components/DisplayLookupResults';
import Graphic from 'esri/Graphic';
import Handles from 'esri/core/Handles';
import Header from './components/Header';
import MapPanel from './components/MapPanel';
import Search from 'esri/widgets/Search';
import Telemetry from 'telemetry/telemetry.dojo';

import watchUtils = require('esri/core/watchUtils');

import i18n = require('dojo/i18n!./nls/resources');

import esri = __esri;
const CSS = {
	loading: 'configurable-application--loading'
};


import FeatureLayer = require('esri/layers/FeatureLayer');

class LocationApp {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
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
		this._applySharedTheme(base);

		setPageLocale(base.locale);
		setPageDirection(base.direction);

		this.base = base;

		const { config, results, portal } = base;

		config.helperServices = { ...base.portal.helperServices };

		const { webMapItems } = results;

		if (config.noMap) {
			document.body.classList.add('no-map');
		}
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
			errorUtils.displayError({
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
			this._addHeader(item);
			this.view.popup = null;
			document.body.classList.remove(CSS.loading);
			this._addWidgets(config);
		});
	}
	_addHeader(item: esri.PortalItem) {
		const { config } = this.base;
		// Add a page header
		config.title = config.title || item.title;
		setPageTitle(config.title);
		let detailTitle = config.detailTitle;
		let detailContent = config.detailContent;
		if (config.appid === '') {
			if (!detailTitle) {
				detailTitle = i18n.onboarding.title;
			}
			if (!detailContent) {
				detailContent = i18n.onboarding.content;
			}
		}

		if (detailTitle || detailContent || config.socialSharing) {
			this._detailPanel = new DetailPanel({
				title: detailTitle || null,
				content: detailContent,
				view: this.view,
				sharing: config.socialSharing,
				container: document.getElementById('detailPanel')
			});
		}

		const header = new Header({
			title: config.title,
			titleLink: config.titleLink,
			container: 'header'
		});
	}
	async _addWidgets(config) {
		// Add esri widgets to the app (legend, home etc)
		esriWidgetUtils.addMapComponents({
			view: this.view,
			config,
			portal: this.base.portal
		});

		this._setupFeatureSearchType();
	}
	async _setupFeatureSearchType() {
		const { config } = this.base;
		// Determine search lookup type
		if (!config.searchLayerLookup) {
			this.base.config.searchLayer = false;
		}
		const lookupType = !config.searchLayerLookup || config.lookupType === 'geometry' ? 'geometry' : 'distance';
		this.base.config.lookupType = lookupType;

		if (lookupType === 'distance') {
			// Add a slider and set props
			const Slider = await import('./components/DistanceSlider');
			if (!Slider) {
				return;
			}
			const { distance, units, minDistance, maxDistance } = config;
			const distanceSlider = new Slider.default({
				distance,
				units,
				minDistance,
				maxDistance,
				container: 'distanceOptions'
			});
			const key = 'distance-slider';
			this._handles.remove(key);
			this._handles.add(
				distanceSlider.watch('currentValue', () => {
					this.base.config.distance = distanceSlider.currentValue;
					if (this.searchWidget && this.searchWidget.searchTerm) {
						this.searchWidget.search();
					}
				}),
				key
			);
		}

		// Get configured search layers or if none are configured get
		// all the feature layers in the map

		let parsedLayers = config.lookupLayers ? JSON.parse(config.lookupLayers) : null;
		if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
			parsedLayers = null;
		}

		const lookupProps = {
			view: this.view,
			lookupLayers: parsedLayers,
			searchLayer: config.searchLayer,
			hideFeaturesOnLoad: config.hideLookupLayers
		};


		const [lookupLayers, searchLayer] = await Promise.all([
			lookupLayerUtils.getLookupLayers(lookupProps),
			lookupLayerUtils.getSearchLayer(lookupProps)
		]);
		this.lookupResults = new DisplayLookupResults({
			lookupLayers,
			searchLayer,
			config: this.base.config,
			view: this.view,
			mapPanel: this.mapPanel,
			container: 'resultsPanel'
		});
		this._addSearchWidget();
		//Add open map button
		if (!config.noMap) {
			const openMapButton = document.createElement('button');
			//Unable to add multiple classes in IE11

			openMapButton.classList.add("icon-ui-maps");
			openMapButton.classList.add("btn");
			openMapButton.classList.add("btn-fill");
			openMapButton.classList.add("btn-green");
			openMapButton.classList.add("btn-open-map");
			openMapButton.classList.add("app-button");
			openMapButton.classList.add("tablet-show");
			openMapButton.innerHTML = i18n.map.label;
			document.getElementById('bottomNav').appendChild(openMapButton);
			openMapButton.addEventListener('click', () => {
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
	}

	_addSearchWidget() {
		const { searchConfig, find, findSource } = this.base.config;
		const searchProperties: esri.widgetsSearchProperties = {
			view: this.view,
			resultGraphicEnabled: false,
			autoSelect: false,
			popupEnabled: false,
			container: 'search'
		};
		if (searchConfig) {
			const { sources, activeSourceIndex, enableSearchingAll } = searchConfig;
			if (sources) {
				searchProperties.sources = sources.filter((source) => {
					if (source.flayerId && source.url) {
						const layer = this.view.map.findLayerById(source.flayerId);
						source.layer = layer ? layer : new FeatureLayer(source.url);
					}
					if (source.hasOwnProperty('enableSuggestions')) {
						source.suggestionsEnabled = source.enableSuggestions;
					}
					if (source.hasOwnProperty('searchWithinMap')) {
						source.withinViewEnabled = source.searchWithinMap;
					}

					return source;
				});
			}
			if (searchProperties.sources && searchProperties.sources.length && searchProperties.sources.length > 0) {
				searchProperties.includeDefaultSources = false;
			}
			searchProperties.searchAllEnabled =
				enableSearchingAll && enableSearchingAll === false ? false : true;
			if (
				activeSourceIndex != null && activeSourceIndex != undefined &&
				searchProperties?.sources.length >= activeSourceIndex
			) {
				searchProperties.activeSourceIndex = activeSourceIndex;
			}
		}
		this.searchWidget = new Search(searchProperties);
		// If there's a find url param search for it
		if (find) {
			watchUtils.whenFalseOnce(this.view, "updating", () => {
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
				if (!searchConfig) {
					this.searchWidget.viewModel.allSources.forEach((source) => {
						source.withinViewEnabled = true;
					});
				}
			}
		});

		this.searchWidget.on('search-clear', () => {
			this._cleanUpResults();
			this.mapPanel.resetExtent();
			// Remove find url param
			this._updateUrlParam();
		});

		this.searchWidget.on('search-complete', async (results) => {
			this._cleanUpResults();
			if (results.numResults > 0) {
				// Add find url param
				const index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
				this._updateUrlParam(encodeURIComponent(this.searchWidget.searchTerm), index);
				const searchLayer = (this.lookupResults && this.lookupResults.searchLayer) || null;
				// Get search geometry and add address location to the map

				const feature = await lookupLayerUtils.getSearchGeometry({
					searchLayer,
					config: this.base.config,
					view: this.view,
					results
				});
				this._generateSearchResults(feature);

			}
		});
		// We also want to search for locations when users click on the map
		this.view.on('click', async (e) => {
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

		const distance = (this.base.config && this.base.config.distance) || 0;
		this.lookupResults && this.lookupResults.queryFeatures(location, distance);
	}

	_cleanUpResults() {
		// Clear the lookup results displayed in the side panel
		this.lookupResults && this.lookupResults.clearResults();
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
	_applySharedTheme(base) {
		const { config } = base;
		// Build and insert style
		const styles = [];
		styles.push(config.headerBackground ? `.app-header{background:${config.headerBackground};}` : null);
		styles.push(
			config.headerColor
				? `.app-header a{color:${config.headerColor};}.app-header{color:${config.headerColor};}.toolbar-buttons{color:${config.headerColor}}`
				: null
		);
		styles.push(
			config.buttonBackground
				? `.app-button{background:${config.buttonBackground}; border-color:${config.buttonBackground};}.app-button.btn-green{background:${config.buttonBackground};border-color:${config.buttonBackground};} #detailPanel .svg-icon{color:${config.buttonBackground};} }`
				: null
		);
		styles.push(
			config.buttonColor
				? `.app-button{color:${config.buttonColor};}.app-button.btn-green{color:${config.buttonColor};}};`
				: null
		);

		const style = document.createElement('style');
		style.appendChild(document.createTextNode(styles.join('')));
		document.getElementsByTagName('head')[0].appendChild(style);
	}
}
export = LocationApp;
