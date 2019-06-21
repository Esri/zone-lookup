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
import Collection = require('esri/core/Collection');
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import promiseUilts = require('esri/core/promiseUtils');
import Graphic from 'esri/Graphic';
import { TextSymbol } from 'esri/symbols';
import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';

interface ConfigureLayerProperties {
	id: string;
	fields: string[];
	featureCollection?: any;
	type: string;
}
interface LookupLayerProps {
	view: esri.MapView;
	lookupLayers: ConfigureLayerProperties[];
	searchLayer: ConfigureLayerProperties;
	hideFeaturesOnLoad: boolean;
}

interface SearchGeometryProps {
	view: esri.MapView;
	config: ApplicationConfig;
	searchLayer: esri.FeatureLayerView;
	results: any;
}
export async function getSearchLayer(props: LookupLayerProps): Promise<esri.FeatureLayerView | null> {
	const { view, searchLayer } = props;
	const layer = searchLayer && searchLayer.id ? view.map.findLayerById(searchLayer.id) : null;
	if (layer && layer.type === 'feature') {
		const lv = (await view.whenLayerView(layer)) as esri.FeatureLayerView;
		if (props.hideFeaturesOnLoad) hideLookuplayers([ lv ]);
		return lv;
	} else {
		return null;
	}
	return layer && layer.type === 'feature' ? (await view.whenLayerView(layer)) as esri.FeatureLayerView : null;
}
export async function getLookupLayers(props: LookupLayerProps): Promise<any[]> {
	const { view, hideFeaturesOnLoad, lookupLayers } = props;

	const searchableLayers: Collection<esri.Layer> = !lookupLayers ? view.map.layers : new Collection();
	const returnLayers = [];
	// Check to see if the user has specified a search layer
	// otherwise just get the layers from the map
	if (lookupLayers) {
		lookupLayers.forEach((layerItem) => {
			if (layerItem.id) {
				let layer = view.map.findLayerById(layerItem.id) as esri.FeatureLayer;
				if (!layer) {
					//maybe its a feature collection
					const sublayerId = layerItem.id.lastIndexOf('_');
					if (sublayerId !== -1) {
						layerItem.id = layerItem.id.slice(0, sublayerId);
						layer = view.map.findLayerById(layerItem.id) as esri.FeatureLayer;
					}
				}
				layer && searchableLayers.add(layer);
			}
		});
	}
	const promises = [];
	// Include the search layer in the lookup layers if specified

	searchableLayers.forEach((layer: esri.FeatureLayer | esri.MapImageLayer) => {
		if (layer && layer.type) {
			if (layer.type === 'feature') {
				const flayer = layer as esri.FeatureLayer;
				if (flayer.popupEnabled) {
					promises.push(view.whenLayerView(layer as esri.FeatureLayer));
				}
			} else if (layer.type === 'map-image') {
				const mapLayer = layer as esri.MapImageLayer;

				mapLayer.sublayers.forEach((sublayer) => {
					if (sublayer.popupEnabled) {
						sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
							view.map.add(l);
							promises.push(view.whenLayerView(l));
						});
					}
				});
			}
		}
	});
	const results = await promiseUilts.eachAlways(promises);
	results.forEach((result) => {
		if (result && result.value) returnLayers.push(result.value);
	});
	if (hideFeaturesOnLoad) hideLookuplayers(returnLayers);
	return returnLayers;
}
export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, view, config, searchLayer } = props;
	const { lookupType } = config;
	let graphic = _getResultGeometries(results);

	// add marker to map
	_addLocationGraphics(graphic, config, view);
	// If it's not a geometry search or it is geometry
	// but we don't have a search layer defined
	if (lookupType !== 'geometry' || !searchLayer) {
		let returnGraphic = graphic;
		if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
			returnGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
		}
		return promiseUilts.resolve(returnGraphic);
	} else {
		// Is the source layer of the graphic equal to the search layer?
		const sourceLayerGraphic: any = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic : null;
		if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
			if (sourceLayerGraphic.sourceLayer.id === searchLayer.layer.id) {
				// Is the search geometry from the search layer? If so use it
				return promiseUilts.resolve(graphic);
			}
		}
		//else {
		const searchGeometry = graphic.geometry;
		const query = searchLayer.layer.createQuery();
		query.geometry = searchGeometry;
		if (searchGeometry && searchGeometry.type === 'point') {
			query.spatialRelationship = 'within';
		} else {
			query.spatialRelationship = 'intersects';
		}

		const results = await searchLayer.layer.queryFeatures(query);
		return promiseUilts.resolve(
			results && results.features && results.features.length && results.features.length > 0
				? results.features[0]
				: null
		);
		//	}
	}
}
function _addLocationGraphics(graphic, config, view) {
	const { includeAddressText, addressGraphicColor, includeAddressGraphic } = config;
	// add a custom graphic at geocoded location if we have something to display
	if (graphic && graphic.geometry) {
		const geometry =
			graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
		//view.goTo(geometry);
		let displayText = null;
		if (graphic && graphic.attributes && includeAddressText) {
			// TODO: At 7.3 add config option for display field
			if (graphic.attributes.Match_addr) {
				// replace first comma with a new line character
				displayText = graphic.attributes.Match_addr.replace(',', '\n');
			} else if (graphic.layer && graphic.layer.displayField && graphic.layer.displayField !== '') {
				displayText = graphic.attributes[graphic.layer.displayField] || null;
			} else if (graphic.layer && graphic.layer.fields) {
				// get the first string field?
				graphic.layer.fields.some((field) => {
					if (field.type === 'string') {
						displayText = graphic.attributes[field.name];
						return true;
					}
				});
			}
		}
		if (displayText) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						font: {
							size: 10
						},
						text: displayText,
						color: addressGraphicColor,
						xoffset: 8,
						yoffset: 4,
						horizontalAlignment: 'left'
					})
				})
			);
		}
		if (includeAddressGraphic) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						color: addressGraphicColor,
						text: '\ue61d', // esri-icon-map-pin
						font: {
							size: 20,
							family: 'calcite-web-icons'
						}
					})
				})
			);
		}
	}
}
function _getResultGeometries(results): esri.Graphic {
	let feature = null;
	results.results.some((searchResults) => {
		return searchResults.results.some((r) => {
			if (r.feature) {
				feature = r.feature;
				return true;
			} else {
				return false;
			}
		});
	});
	return feature;
}
export function hideLookuplayers(layers) {
	layers.forEach((layer) => {
		layer.filter = new FeatureFilter({
			where: '1=0'
		});
	});
}
