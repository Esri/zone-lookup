
import { property, subclass } from 'esri/core/accessorSupport/decorators';
import { renderable, tsx } from 'esri/widgets/support/widget';
import { getDistances } from '../utilites/geometryUtils';
import { resolve } from 'esri/core/promiseUtils';

import GroupedAccordion, { FeatureResults } from './GroupedAccordion';
import { ActionButton } from "./Accordion";
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import FeatureAccordion from './FeatureAccordion';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import Handles from 'esri/core/Handles';
import MapPanel from './MapPanel';
import Query from 'esri/tasks/support/Query';
import Widget from 'esri/widgets/Widget';

import i18n = require('dojo/i18n!../nls/resources');
import esri = __esri;
import ConfigurationSettings = require('../ConfigurationSettings');
import LookupGraphics = require('./LookupGraphics');



type State = 'init' | 'loading' | 'ready';

interface DisplayLookupResultsProps extends esri.WidgetProperties {
	view: esri.MapView;
	lookupLayers?: esri.FeatureLayer[];
	lookupGraphics?: LookupGraphics;
	searchLayer?: esri.FeatureLayer;
	config: ConfigurationSettings;
	mapPanel: MapPanel;
}
const CSS = {
	calciteStyles: {
		clearBtn: 'btn-transparent',
		smallBtn: 'btn-small',
		button: 'btn',
		right: 'right',
		trailerHalf: 'margin-right-half',
		leaderFull: 'margin-left-1',
		leaderHalf: 'leader-half'
	},
	messageText: 'message-text',
	openItems: 'open-items',
	collapseItems: 'collapse-items',
	toggleContentTools: 'toggle-content-tools',
	toggleContentBtn: 'toggle-content-btn'
};
@subclass('app.DisplayLookupResults')
class DisplayLookupResults extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() lookupGraphics = null;
	@renderable()
	@property()
	location: esri.Graphic;
	@property() view: esri.MapView;

	@property()
	@renderable(["groupResultsByLayer", "resultsPanelPostText", "resultsPanelPreText", "noResultsMessage", "autoZoomFirstResult"])
	config: ApplicationConfig;

	@property() mapPanel: MapPanel;

	@property() distance: number;
	@property()
	@renderable()
	searchLayer: esri.FeatureLayer = null;
	@property()
	@property() lookupLayers: esri.FeatureLayer[] = null;

	@property()
	@renderable()
	state: State = 'init';
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_featureResults: FeatureResults[] = null;
	_empty: boolean = true;
	_zoomFactor: number = 4;
	_viewPoint: esri.Viewpoint = null;
	_accordion: GroupedAccordion | FeatureAccordion = null;
	_bufferGraphic: esri.Graphic = null;
	_handles: Handles = new Handles();

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: DisplayLookupResultsProps) {
		super(props);

		if (props.view && props.view.viewpoint) {
			this._viewPoint = props.view.viewpoint.clone();
		} else {
			// wait for view point
			const key = 'viewpoint-watch';
			this._handles.add(
				props.view.watch('viewpoint', () => {
					this._handles.remove(key);
					this._viewPoint = props.view.viewpoint.clone();
				})
			);
		}
	}

	render() {
		const loader =
			this.state === 'loading' ? (
				<div key="loader" class="loader is-active padding-leader-3 padding-trailer-3">
					<div key="loaderBars" class="loader-bars" />
					<div key="loaderText" class="loader-text">
						{i18n.load.label}...
					</div>
				</div>
			) : null;

		const ready = this.state === 'ready' || false;

		const { resultsPanelPreText, resultsPanelPostText, noResultsMessage } = this.config;
		// No Results 
		let errorText: string = null;
		if (this._empty && ready) {
			errorText = noResultsMessage || i18n.noFeatures;
			if (this.mapPanel && this.mapPanel.isMobileView) {
				// Add no results message to the map in mobile view
				this.mapPanel.message = errorText;
			}
		}
		const accordion = ready ? (
			<div key="accordion">
				<p key="errorText" class={CSS.messageText} innerHTML={errorText} />
				<div key="detailAccordion" bind={this} afterCreate={!this._empty ? this._addDetailAccordion : null} />
			</div>
		) : null;
		const toggleLinks = this._featureResults ? this.createToggleLinks() : null;

		const preText = resultsPanelPreText ? this.createPreText() : null;
		const postText = resultsPanelPostText ? this.createPostText() : null;
		return (
			<div key="loader">
				{loader}
				{toggleLinks}
				{preText}
				{accordion}
				{postText}
			</div>
		);
	}

	_addDetailAccordion(container: HTMLElement) {
		const { _featureResults, config, view } = this;
		const eventHandler = this._handleActionItem.bind(this);
		let actionItems: ActionButton[] = [];
		if (config.showDirections) {
			actionItems.push({
				icon: 'icon-ui-directions',
				id: 'directions',
				name: 'Directions',
				handleClick: eventHandler
			});
		}
		if (this.config.groupResultsByLayer) {
			this._accordion = new GroupedAccordion({
				actionBarItems: actionItems,
				featureResults: _featureResults,
				config,
				view,
				container
			});
		} else if (this._featureResults && this._featureResults.length && this._featureResults.length > 0) {
			const featureResults = _featureResults[0];
			const features = featureResults.features ? featureResults.features : null;
			this._accordion = new FeatureAccordion({
				actionBarItems: actionItems,
				features,
				config,
				view,
				container
			});

		}
		// Auto zoom to features
		if (this.config.autoZoomFirstResult) {
			let features;
			if (this._accordion instanceof FeatureAccordion) {
				features = this._accordion?.features?.length > 0 ? this._accordion.features : null;
			} else if (this._accordion instanceof GroupedAccordion) {
				this._accordion.featureResults.some(result => {
					if (result.features && result.features.length && result.features.length > 0) {
						features = result.features;
						return true;
					} else {
						return false;
					}
				})
			}
			if (features) {
				this.mapPanel.view && features && this.mapPanel.view.goTo(features);
			}
		}

		this._accordion.watch('selectedItem', () => {
			if (this._accordion.selectedItem) {
				this._highlightFeature(this._accordion.selectedItem);
				this._zoomToFeature(this._accordion.selectedItem);
				this.mapPanel.selectedItemTitle =
					this._accordion.selectedItem.attributes['app-accordion-title'] || null;
			}
			this._accordion.selectedItem = null;
		});
	}



	_handleActionItem(name: string, selected: esri.Graphic) {
		// TODO: Eventually we'll support directions
	}
	queryFeatures(location: esri.Graphic, distance: number) {
		this.distance = distance;
		this.state = 'loading';
		this.location = location;
		this.lookupGraphics.graphic = location;
		const promises = [];
		if (!location) {
			this.state = 'init';
			this._featureResults = [];
			promises.push(resolve());
		} else {
			// Highlight search layer
			this.lookupGraphics.addGraphics();
			this._searchHighlight(location);
			this.lookupLayers.forEach((layer) => {

				const query: esri.Query = this._createQuery(layer, location);

				this._applyLayerEffectAndFilter(layer, query);

				if (!layer) {
					this.state = 'init';
					return resolve();
				}

				let performQuery = true;
				// If the search geometry is from the lookup layer we don't
				// need to query. This can happen when a feature layer locator is
				// setup or when the search layer is included in the results layers.
				if (layer && location.layer) {
					if (layer.id === location.layer.id) {
						performQuery = false;
						this._applyLayerEffectAndFilter(layer, {
							where: `${layer.objectIdField} = ${location.attributes[layer.objectIdField]} `
						});
					}
				}
				if (!performQuery) {
					promises.push(resolve({ features: [location], title: layer && layer.title ? layer.title : null, id: layer && layer.id ? layer.id : null }));
				} else {
					promises.push(layer.queryFeatures(query).then(results => {
						return resolve({
							features: results.features,
							title: layer && layer.title ? layer.title : null,
							id: layer && layer.id ? layer.id : null
						});
					}).catch(error => {
						console.log("Error loading layer", error);
						return resolve();
					}));
					this._applyLayerEffectAndFilter(layer, query);
				}
			});
		}

		return Promise.all(promises).then((results) => {

			this._featureResults = [];

			const { groupResultsByLayer } = this.config;
			// Loop through the feaures 

			if (results) {
				results.forEach(result => {
					// do we have features?

					if (result?.features && result.features?.length && result.features.length > 0) {
						if (groupResultsByLayer) {
							//this._sortFeatures(result.features);
							this._featureResults.push({
								title: result.title,
								features: result.features
							});
						} else {
							// each feature is its own section 
							let features = [];

							results.forEach(result => {
								if (result?.features) {
									features.push(...result.features);
								}

							});
							//this._sortFeatures(features);
							this._featureResults = [{
								features,
								title: null,
								grouped: false
							}];
						}
					}
				});
			}
			this._empty = this._featureResults ? this._featureResults.every(result => {
				return result.features && result.features.length && result.features.length > 0 ? false : true;
			}) : true;
			this.state = 'ready';

		});
	}
	private _createQuery(layer: esri.FeatureLayer, location: esri.Graphic): esri.Query {

		const { lookupType, relationship, units } = this.config;
		const geometry = location.geometry;

		const query: esri.Query =
			layer && typeof layer['createQuery'] === 'function'
				? layer.createQuery()
				: new Query();

		const layerGeometryType = layer && layer ? layer.geometryType : null;
		query.geometry = geometry;

		// If we don't have a search layer defined use a point lookup.
		if (lookupType === 'distance' || (lookupType === 'geometry' && !this.searchLayer)) {
			// Find features that are within x distance of search geometry
			query.spatialRelationship = relationship;
			query.distance = this.distance;
			query.units = units;
		} else if (lookupType === 'geometry') {
			query.spatialRelationship = layerGeometryType === "polygon" ? "contains" : "intersects";

		}
		return query;
	}
	private _applyLayerEffectAndFilter(layer, query) {
		const { geometry, units, spatialRelationship, where } = query;
		const props: __esri.FeatureFilterProperties = {
			geometry,
			distance: this.distance,
			units,
			spatialRelationship,
			where
		};
		if (this.distance) {
			props.distance = this.distance;
		}
		if (units) {
			props.units = units;
		}
		const gray = 'grayscale(100%)';
		const sepia = 'sepia(100%)';
		// Filter the displayed features
		const { displayUnmatchedResults } = this.config;
		if (layer && layer.type === "feature") {
			this.view.whenLayerView(layer as esri.FeatureLayer).then(layerView => {

				const filter = new FeatureFilter(props);
				const effect = new FeatureEffect({ filter });

				if (!displayUnmatchedResults || displayUnmatchedResults === 'hide') {
					layerView.filter = filter;
					effect.filter = filter;
				} else {
					effect.excludedEffect = displayUnmatchedResults === 'gray' ? gray : sepia;
				}
				layerView.effect = effect;
			});
		}

	}

	private _searchHighlight(graphic) {
		const { lookupType } = this.config;
		if (this?.searchLayer && lookupType === 'geometry') {
			const key = 'search-layer-handle';
			this._handles.remove(key);
			this.view.whenLayerView(this.searchLayer).then((layerView) => {
				this._handles.add(layerView.highlight(graphic), key);
			});

			// graphic
			const queryFilter = {
				distance: 0,
				units: null,
				geometry: null,
				where: null
			};

			if (
				//	hideLookupLayers &&
				graphic.layer &&
				graphic.layer.id &&
				this?.searchLayer?.id &&
				graphic.layer.id === this.searchLayer.id
			) {
				queryFilter.where = `${this.searchLayer?.objectIdField} = ${graphic.attributes[
					this.searchLayer?.objectIdField
				]}`;
			} else {
				queryFilter.geometry =
					graphic.geometry.type === 'polygon' ? graphic.geometry.extent.center : graphic.geometry;
			}

			this._applyLayerEffectAndFilter(this?.searchLayer, queryFilter);
		}
	}

	_sortFeatures(features) {
		const { includeDistance, units, portal } = this.config;
		// TODO: We really want the search location here so reconfigure
		// the app to include the searched location. 
		if (includeDistance && this.location) {
			// add distance val to the features and sort array by distance
			let location = this.location.geometry;
			if (this.location.geometry && this.location.geometry.type && this.location.geometry.type === "polygon") {
				const g = this.location.geometry as esri.Polygon;
				location = g.centroid;
			}
			getDistances({
				location,
				portal,
				distance: this.distance || 0,
				unit: units,
				features
			});
			// sort the features based on the distance
			features.sort((a, b) => {
				if (a.attributes.lookupDistance > b.attributes.lookupDistance) {
					return 1;
				}
				if (a.attributes.lookupDistance < b.attributes.lookupDistance) {
					return -1;
				}
				return 0;
			});
		}
	}
	clearResults() {
		const hideLayers: boolean = this.config.hideLookupLayers as boolean;

		this._empty = true;
		this.lookupGraphics.clearGraphics();
		//this._bufferGraphic && this.view && this.view.graphics.remove(this._bufferGraphic);
		this._accordion && this._accordion.clear();

		this.lookupLayers &&
			this.lookupLayers.forEach((layer) => {
				this.view.whenLayerView(layer).then((layerView) => {
					layerView.effect = null;
					layerView.filter = null;
					if (hideLayers) {
						layerView.effect = new FeatureEffect({
							excludedEffect: "opacity(0%)",
							filter: new FeatureFilter({ where: '1=0' })
						});
					}
				});

			});
		if (this.searchLayer) {
			this.view.whenLayerView(this.searchLayer).then((layerView) => {
				layerView.effect = null;
				layerView.filter = null;
				if (hideLayers) {
					layerView.effect = new FeatureEffect({
						excludedEffect: "opacity(0%)",
						filter: new FeatureFilter({ where: '1=0' })
					});
				}
			});
		}
		this.clearHighlights();
		this.state = 'init';
	}
	clearHighlights() {
		this._handles.removeAll();
	}
	_highlightFeature(graphic: esri.Graphic) {
		this.clearHighlights();
		this.view.whenLayerView(graphic.layer).then((layerView: esri.FeatureLayerView) => {
			this._handles.add(layerView.highlight(graphic));
		});
	}
	_zoomToFeature(graphic: esri.Graphic) {
		const { view } = this;

		const zoomFactor = 4;
		let zoomScale = this.config.zoomScale ? this.config.zoomScale : view.scale / zoomFactor;
		const geometry: esri.Geometry = graphic.geometry;

		const isPoint = geometry && geometry.type === 'point';
		let useZoomScale = this.config.zoomScale || (isPoint && this._viewPoint.scale === view.scale) ? true : false;

		// config.zoomScale let's app configurer have control over zoom behavior
		this.view.goTo({ target: geometry, scale: useZoomScale ? zoomScale : undefined });
		this._highlightFeature(graphic);
	}

	destroy() {
		this.clearResults();
		this.clearHighlights();
	}

	createPostText() {
		return this.config.resultsPanelPostText && !this._empty ? (
			<p key="postText" class={CSS.messageText} innerHTML={this.config.resultsPanelPostText} />
		) : null;
	}
	createPreText() {
		return this.config.resultsPanelPreText && !this._empty ? (
			<p key="preText" class={CSS.messageText} innerHTML={this.config.resultsPanelPreText} />
		) : null
	}
	createToggleLinks() {
		return this._accordion && this._accordion.showToggle() ? (
			<div key="toggleBar" class={this.classes(CSS.toggleContentTools, CSS.calciteStyles.leaderHalf)}>
				<button
					key="open"
					class={this.classes(
						CSS.calciteStyles.button,
						CSS.calciteStyles.trailerHalf,
						CSS.calciteStyles.right,
						CSS.toggleContentBtn,
						CSS.calciteStyles.clearBtn,
						CSS.calciteStyles.smallBtn
					)}
					onclick={this._openItems}
				>
					{i18n.tools.open}
				</button>
				<button
					key="close"
					class={this.classes(
						CSS.calciteStyles.button,
						CSS.calciteStyles.trailerHalf,
						CSS.calciteStyles.leaderFull,
						CSS.calciteStyles.right,
						CSS.toggleContentBtn,
						CSS.calciteStyles.clearBtn,
						CSS.calciteStyles.smallBtn
					)}
					onclick={this._closeItems}
				>
					{i18n.tools.collapse}
				</button>
			</div>
		) : null;


	}
	_openItems() {
		// IE 11 doesn't have support for Array.from 
		const elements = document.getElementsByClassName('accordion-section');
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.add("is-active");
		}
	}
	_closeItems() {
		const elements = document.getElementsByClassName('accordion-section');
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.remove("is-active");
		}
	}

}

export = DisplayLookupResults;
