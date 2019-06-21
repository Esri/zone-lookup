/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import Handles from 'esri/core/Handles';
import { tsx, renderable } from 'esri/widgets/support/widget';
import * as geometryUtils from '../utilites/geometryUtils';
import promiseUilts = require('esri/core/promiseUtils');
import Query from 'esri/tasks/support/Query';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
import FeatureAccordion, { ActionButton } from './FeatureAccordion';
import MapPanel from './MapPanel';
import i18n = require('dojo/i18n!../nls/resources');
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import esri = __esri;

type State = 'init' | 'loading' | 'ready';

interface DisplayLookupResultsProps extends esri.WidgetProperties {
	view: esri.MapView;
	lookupLayers: esri.FeatureLayerView[];
	searchLayer: esri.FeatureLayerView;
	config: ApplicationConfig;
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
class DisplayLookupResults extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@renderable()
	@property()
	location: esri.Graphic;
	@property() view: esri.MapView;

	@property() config: ApplicationConfig;

	@property() mapPanel: MapPanel;

	@property() distance: number;
	@property() searchLayer: esri.FeatureLayerView = null;
	@property() lookupLayers: esri.FeatureLayerView[] = null;

	@property()
	@renderable()
	state: State = 'init';
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_features: esri.Graphic[] = null;
	_zoomFactor: number = 4;
	_viewPoint: esri.Viewpoint = null;
	_accordion: FeatureAccordion = null;
	_bufferGraphic: esri.Graphic = null;
	_handles: Handles = new Handles();

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: DisplayLookupResultsProps) {
		super();
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

		const { distance } = props.config;
		this.distance = distance || 0;
	}

	render() {
		const loader =
			this.state === 'loading' ? (
				<div key="loader" class="loader is-active padding-leader-3 padding-trailer-3">
					<div key="loaderBars" class="loader-bars" />
					<div key="loaderText" class="loader-text">
						Loading...
					</div>
				</div>
			) : null;
		const ready = this.state === 'ready' || false;

		const { resultsPanelPreText, resultsPanelPostText } = this.config;
		const isEmpty = !Array.isArray(this._features) || this._features.length === 0 ? true : false;
		let errorText: string = null;
		if (isEmpty && ready) {
			errorText = this.config.noResultsMessage || i18n.noFeatures;
			if (this.mapPanel && this.mapPanel.isMobileView) {
				// Add no results message to the map in mobile view
				this.mapPanel.message = errorText;
			}
		}

		const toggleContentLinks =
			!isEmpty && ready && this._features.length > 2 ? (
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
		const accordion = ready ? (
			<div key="accordion">
				<p key="errorText" class={CSS.messageText} innerHTML={errorText} />
				<div key="detailAccordion" bind={this} afterCreate={this._addDetailAccordion} />
			</div>
		) : null;
		return (
			<div key="loader">
				{loader}
				{toggleContentLinks}
				{!isEmpty && ready && resultsPanelPreText ? (
					<p key="preText" class={CSS.messageText} innerHTML={resultsPanelPreText} />
				) : null}
				{accordion}
				{!isEmpty && ready && resultsPanelPostText ? (
					<p key="postText" class={CSS.messageText} innerHTML={resultsPanelPostText} />
				) : null}
			</div>
		);
	}

	_addDetailAccordion(container: HTMLElement) {
		const { _features, config, view } = this;
		const eventHandler = this._handleActionItem.bind(this);
		let actionItems: ActionButton[];
		if (config.showDirections) {
			actionItems.push({
				icon: 'icon-ui-directions',
				id: 'directions',
				name: 'Directions',
				handleClick: eventHandler
			});
		}
		this._accordion = new FeatureAccordion({
			actionBarItems: actionItems,
			features: _features,
			config,
			view,
			container
		});
		// Auto zoom to feature features
		if (this.config.autoZoomFirstResult) {
			this.mapPanel.view && this.mapPanel.view.goTo(_features);
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
	_openItems() {
		const elements = document.getElementsByClassName('accordion-section');
		Array.from(elements).forEach((el) => {
			el.classList.add('is-active');
		});
	}
	_closeItems() {
		const elements = document.getElementsByClassName('accordion-section');
		Array.from(elements).forEach((el) => {
			el.classList.remove('is-active');
		});
	}

	_handleActionItem(name: string, selected: esri.Graphic) {
		// TODO: Eventually we'll support directions
	}
	queryFeatures(location: esri.Graphic, distance: number) {
		this.distance = distance;
		this.state = 'loading';
		const promises = [];
		if (!location) {
			this.state = 'init';
			this._features = null;
			promiseUilts.resolve();
		} else {
			this._createBuffer(location.geometry);
			// Highlight search layer
			this._searchHighlight(location);
			this.lookupLayers.forEach((layer) => {
				const query: esri.Query = this._createQuery(layer, location);
				this._applyLayerEffectAndFilter(layer, query);

				if (!layer.layer) {
					this.state = 'init';
					return promiseUilts.resolve();
				}

				let performQuery = true;
				// If the search geometry is from the lookup layer we don't
				// need to query. This can happen when a feature layer locator is
				// setup or when the search layer is included in the results layers.
				if (layer.layer && location.layer) {
					if (layer.layer.id === location.layer.id) {
						performQuery = false;
						this._applyLayerEffectAndFilter(layer, {
							where: `${layer.layer.objectIdField} = ${location.attributes[layer.layer.objectIdField]} `
						});
					}
				}
				performQuery
					? promises.push(layer.layer.queryFeatures(query))
					: promises.push(promiseUilts.resolve({ features: [ location ] }));
			});
		}

		return promiseUilts.eachAlways(
			Promise.all(promises).then((results) => {
				let features: esri.Graphic[] = [];
				results.forEach((queryResults) => {
					queryResults.features.forEach((feature) => {
						features.push(feature);
					});
				});
				this._features = features;
				this.state = 'ready';
			})
		);
	}
	private _createQuery(layer: esri.FeatureLayerView, location: esri.Graphic): esri.Query {
		const { lookupType, relationship, units } = this.config;
		const geometry = location.geometry;
		const query: esri.Query =
			layer && layer.layer && typeof layer.layer['createQuery'] === 'function'
				? layer.layer.createQuery()
				: new Query();
		const layerGeometryType = layer && layer.layer ? layer.layer.geometryType : null;
		query.geometry = geometry;

		// If we don't have a search layer defined use a point lookup.
		if (lookupType === 'distance' || (lookupType === 'geometry' && !this.searchLayer)) {
			// Find features that are within x distance of search geometry
			query.spatialRelationship = relationship;
			query.distance = this.distance;
			query.units = units;
		} else if (lookupType === 'geometry') {
			let sr: string;
			switch (layerGeometryType) {
				case 'point':
					sr = 'contains';
				case 'polygon':
					sr = 'contains';
					break;
				case 'polyline':
					sr = 'intersects';
					break;
				default:
					sr = 'intersects';
					break;
			}
			query.spatialRelationship = sr;
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

		const filter = new FeatureFilter(props);
		const effect = new FeatureEffect({ filter });

		if (!displayUnmatchedResults || displayUnmatchedResults === 'hide') {
			layer.filter = filter;
		} else {
			effect.excludedEffect = displayUnmatchedResults === 'gray' ? gray : sepia;
		}
		layer.effect = effect;
	}
	private async _createBuffer(location: esri.Geometry) {
		// For distance type lookups draw the buffer radius if enabled via configuration
		const { lookupType, drawBuffer, portal, units, bufferSymbolColor } = this.config;

		if (lookupType === 'distance' && drawBuffer) {
			const buffer = await geometryUtils.bufferGeometry({
				location,
				portal,
				distance: this.distance,
				unit: units
			});

			this._bufferGraphic = geometryUtils.createBufferGraphic(buffer as esri.Polygon, bufferSymbolColor);
			this.view.graphics.add(this._bufferGraphic);
		}
	}
	private _searchHighlight(graphic) {
		const { lookupType } = this.config;
		if (this.searchLayer && lookupType === 'geometry') {
			const key = 'search-layer-handle';
			this._handles.remove(key);
			this._handles.add(this.searchLayer.highlight(graphic), key);

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
				this.searchLayer &&
				this.searchLayer.layer &&
				this.searchLayer.layer.id &&
				graphic.layer.id === this.searchLayer.layer.id
			) {
				queryFilter.where = `${this.searchLayer.layer.objectIdField} = ${graphic.attributes[
					this.searchLayer.layer.objectIdField
				]}`;
			} else {
				queryFilter.geometry =
					graphic.geometry.type === 'polygon' ? graphic.geometry.extent.center : graphic.geometry;
			}

			this._applyLayerEffectAndFilter(this.searchLayer, queryFilter);
		}
	}

	async _sortFeatures(features) {
		const { lookupType, includeDistance, units, portal } = this.config;
		if (lookupType && lookupType === 'distance' && includeDistance) {
			// add distance val to the features and sort array by distance

			await geometryUtils.getDistances({
				location: this.location.geometry,
				portal,
				distance: this.distance,
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
		const { hideLookupLayers } = this.config;
		this._bufferGraphic && this.view && this.view.graphics.remove(this._bufferGraphic);
		if (this._accordion) {
			this._accordion.features = null;
		}
		this.lookupLayers &&
			this.lookupLayers.forEach((layer) => {
				layer.effect = null;
				layer.filter = hideLookupLayers ? new FeatureFilter({ where: '1=0' }) : null;
			});
		if (this.searchLayer) {
			this.searchLayer.effect = null;
			this.searchLayer.filter = hideLookupLayers ? new FeatureFilter({ where: '1=0' }) : null;
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
}

export = DisplayLookupResults;
