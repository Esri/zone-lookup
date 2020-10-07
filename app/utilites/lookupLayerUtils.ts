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
import FeatureLayer from 'esri/layers/FeatureLayer';
import { resolve } from 'esri/core/promiseUtils';

import esri = __esri;
import FeatureEffect = require('esri/views/layers/support/FeatureEffect');
import { search } from 'dojo/text!*';

interface ConfigureLayerProperties {
	id: string;
	fields: string[];
	featureCollection?: any;
	type: string;
}
interface LookupLayerProps {
	view: esri.MapView;
	lookupLayers?: ConfigureLayerProperties[];
	searchLayer?: any;
	hideFeaturesOnLoad: boolean;
}

interface SearchGeometryProps {
	view: esri.MapView;
	config: ApplicationConfig;
	searchLayer: esri.FeatureLayer;
	results?: any;
}
export function getSearchLayer(props: LookupLayerProps) {
	const { view, searchLayer } = props;
	const layers = searchLayer?.layers;
	let layer = layers?.length > 0 ? layers[0] : null;
	let returnLayer = null;
	if (layer && layer.id) {
		returnLayer = view.map.findLayerById(layer.id);
		if (returnLayer.type === "feature") {
			if (props.hideFeaturesOnLoad) hideLookuplayers([returnLayer as esri.FeatureLayer], props.view);
		}
	}
	return returnLayer;
}
export function getLookupLayers(props: LookupLayerProps): Promise<__esri.FeatureLayer[]> {
	const { view, hideFeaturesOnLoad, lookupLayers } = props;
	const hasLookupLayers = lookupLayers && lookupLayers?.length > 0 ? true : false;

	const searchableLayers: Collection<esri.Layer> = !hasLookupLayers ? view.map.layers : new Collection();

	const returnLayers = [];
	// Get all the map layers
	if (hasLookupLayers) {
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
					// disable clustering 
					if (layer && layer.get("featureReduction")) {
						layer.set("featureReduction", null);
					}
					layer && searchableLayers.add(layer);
				}
			}
		});
	}
	// Include the search layer in the lookup layers if specified
	searchableLayers.forEach((layer: esri.FeatureLayer | esri.MapImageLayer | __esri.GroupLayer) => {

		if (layer && layer.type) {
			if (layer.type === 'feature') {
				const flayer = layer as esri.FeatureLayer;
				if (flayer.popupEnabled) {
					flayer.outFields = ["*"];
					returnLayers.push(flayer);
				}
				// disable clustering 
				if (flayer && flayer.get("featureReduction")) {
					flayer.set("featureReduction", null);
				}
			} else if (layer.type === "group") {
				const flattendGroup = _getLayersFromGroupLayer(layer);
				if (flattendGroup?.length > 0) {
					flattendGroup.forEach(b => {
						searchableLayers.add(b);
					});
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

	return resolve(returnLayers);
}
export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, config, searchLayer, view } = props;
	const { lookupType } = config;
	const graphic = _getResultGeometries(results);
	let displayGraphic = graphic;
	if (lookupType !== 'geometry' || !searchLayer) {
		if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
			displayGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
		}
		return resolve(displayGraphic);
	} else {
		// Is the source layer of the graphic equal to the search layer?
		const sourceLayerGraphic: any = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic.clone() : null;

		if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
			if (sourceLayerGraphic.sourceLayer.id === searchLayer.id) {
				// Is the search geometry from the search layer? If so use it
				displayGraphic = graphic;
			}
		}
		const searchGeometry = displayGraphic.geometry;
		const query = searchLayer.createQuery();
		query.geometry = searchGeometry;
		if (searchGeometry && searchGeometry.type === 'point') {
			query.spatialRelationship = 'within';
		} else {
			query.spatialRelationship = 'intersects';
		}
		query.outFields = ["*"]

		const results = await searchLayer.queryFeatures(query);

		return resolve(
			results && results.features && results.features.length && results.features.length > 0
				? results.features[0]
				: null
		);
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
function _getLayersFromGroupLayer(group): __esri.Layer[] {
	let layers = [];
	group.layers.filter(layer => {
		if (layer.group) {
			const innerGroup = this._getLayersFromGroupLayer(layer.group);
			layers = [...layers, innerGroup];
		} else {
			layers.push(layer);
		}
	});
	return layers;
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
