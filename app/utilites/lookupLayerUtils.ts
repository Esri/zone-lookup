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

import { ApplicationConfig } from 'ApplicationBase/interfaces';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import Graphic from 'esri/Graphic';
import { TextSymbol } from 'esri/symbols';

import promiseUtils = require('esri/core/promiseUtils');

import esri = __esri;
import FeatureEffect = require('esri/views/layers/support/FeatureEffect');

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
	searchLayer: esri.FeatureLayer;
	results: any;
}
export async function getSearchLayer(props: LookupLayerProps): Promise<esri.FeatureLayer | null> {
	const { view, searchLayer } = props;
	let layer = null;
	if (searchLayer && searchLayer.id) {
		layer = view.map.findLayerById(searchLayer.id);
		if (!layer) {
			// do we have a substring? 
			const lastunderscore = searchLayer.id.lastIndexOf("_");
			if (lastunderscore !== -1) {
				const layerId = searchLayer.id.substr(0, lastunderscore);
				//	const subLayerId = searchLayer.id.substr(lastunderscore + 1, searchLayer.id.length);
				layer = view.map.findLayerById(layerId);
			}
		}
	}
	if (layer && layer.type === 'feature') {
		if (props.hideFeaturesOnLoad) hideLookuplayers([layer as esri.FeatureLayer], props.view);
		return layer as esri.FeatureLayer;
	} else {
		return null;
	}
}
export async function getLookupLayers(props: LookupLayerProps): Promise<__esri.FeatureLayer[]> {
	const { view, hideFeaturesOnLoad, lookupLayers } = props;
	const searchableLayers: Collection<esri.Layer> = !lookupLayers ? view.map.layers : new Collection();

	const returnLayers = [];
	// Get all the map layers
	if (lookupLayers) {
		// get any predefined layers otherwise we'll use all map layers
		lookupLayers.forEach((layerItem) => {
			if (layerItem.id) {
				if (layerItem.type === 'DynamicLayer') {
					const sublayerId = layerItem.id.lastIndexOf('.');
					if (sublayerId !== -1) {
						const id = layerItem.id.slice(0, sublayerId);
						const layer = view.map.findLayerById(id) as esri.MapImageLayer;
						if (layer && searchableLayers.indexOf(layer) === -1) {
							searchableLayers.add(layer);
						}
					}
				} else {
					// feature layer
					let layer = view.map.findLayerById(layerItem.id) as esri.FeatureLayer;
					if (!layer) {
						//maybe its a feature collection
						const sublayerId = layerItem.id.lastIndexOf('_');
						if (sublayerId !== -1) {
							const id = layerItem.id.slice(0, sublayerId);
							layer = view.map.findLayerById(id) as esri.FeatureLayer;
						}
					}
					layer && searchableLayers.add(layer);
				}
			}
		});
	}
	// Include the search layer in the lookup layers if specified
	searchableLayers.forEach((layer: esri.FeatureLayer | esri.MapImageLayer) => {
		if (layer && layer.type) {
			if (layer.type === 'feature') {
				const flayer = layer as esri.FeatureLayer;
				if (flayer.popupEnabled) {
					flayer.outFields = ["*"];
					returnLayers.push(flayer);
				}
			} else if (layer.type === 'map-image') {
				// if sub layers have been enabled during config
				// only add those. Otherwise add all dynamic sub layers
				const mapLayer = layer as esri.MapImageLayer;
				const checkSubLayer = lookupLayers && lookupLayers.length && lookupLayers.length > 0 ? true : false;
				mapLayer.sublayers &&
					mapLayer.sublayers.forEach((sublayer) => {

						if (checkSubLayer) {
							const configId = `${sublayer.layer.id}.${sublayer.id}`;
							lookupLayers.forEach((l) => {
								if (l.id && l.id === configId) {
									sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
										view.map.add(l);
										returnLayers.push(l);
									});
									sublayer.visible = false;
								}
							});
						} else {
							sublayer.createFeatureLayer().then((l: esri.FeatureLayer) => {
								view.map.add(l);
								returnLayers.push(l);
							});
							sublayer.visible = false;

						}
					});
			}
		}
	});

	if (hideFeaturesOnLoad) hideLookuplayers(returnLayers, props.view);

	return promiseUtils.resolve(returnLayers);
}
export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, view, config, searchLayer } = props;
	const { lookupType } = config;

	const graphic = _getResultGeometries(results);
	// add marker to map
	_addLocationGraphics(graphic, config, view);
	// If it's not a geometry search or it is geometry
	// but we don't have a search layer defined
	if (lookupType !== 'geometry' || !searchLayer) {
		let returnGraphic = graphic;
		if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
			returnGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
		}
		return promiseUtils.resolve(returnGraphic);
	} else {
		// Is the source layer of the graphic equal to the search layer?
		const sourceLayerGraphic: any = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic.clone() : null;


		if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
			if (sourceLayerGraphic.sourceLayer.id === searchLayer.id) {
				// Is the search geometry from the search layer? If so use it
				return promiseUtils.resolve(graphic);
			}
		}
		//else {
		const searchGeometry = graphic.geometry;
		const query = searchLayer.createQuery();
		query.geometry = searchGeometry;
		if (searchGeometry && searchGeometry.type === 'point') {
			query.spatialRelationship = 'within';
		} else {
			query.spatialRelationship = 'intersects';
		}

		const results = await searchLayer.queryFeatures(query);
		return promiseUtils.resolve(
			results && results.features && results.features.length && results.features.length > 0
				? results.features[0]
				: null
		);
	}
}
function _addLocationGraphics(graphic, config, view) {
	const { includeAddressText, addressGraphicColor, includeAddressGraphic, addMarker } = config;
	// add a custom graphic at geocoded location if we have something to display
	if (graphic && graphic.geometry) {
		const geometry =
			graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
		let displayText = null;
		if (graphic && includeAddressText) {

			if (graphic.attributes && graphic.attributes.Match_addr) {
				// replace first comma with a new line character
				displayText = graphic.attributes.Match_addr.replace(',', '\n');
			} else if (graphic.attributes && graphic.attributes.name) {
				displayText = graphic.attributes.name;
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
		if (displayText && addMarker) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						font: {
							size: 10
						},
						text: displayText,
						color: addressGraphicColor,
						horizontalAlignment: 'center'
					})
				})
			);
		}
		if (includeAddressGraphic && addMarker) {
			view.graphics.add(
				new Graphic({
					geometry,
					symbol: new TextSymbol({
						color: addressGraphicColor,
						text: '\ue61d', // esri-icon-map-pin
						yoffset: 10,
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
				//if (r.name && feature.attributes && feature.attributes.Match_addr) {
				//feature.attributes.name = r.name;
				//}
				return true;
			} else {
				return false;
			}
		});
	});
	return feature;
}
export function hideLookuplayers(layers: esri.FeatureLayer[], view: esri.MapView) {
	const noMap = document.body.classList.contains('no-map');
	if (noMap) {
		return;
	}
	layers.forEach((layer) => {
		view.whenLayerView(layer).then((layerView) => {
			//hide layers
			layerView.effect = new FeatureEffect({
				excludedEffect: "opacity(0%)",
				filter: new FeatureFilter({ where: '1=0' })
			});
		});
	});
}
