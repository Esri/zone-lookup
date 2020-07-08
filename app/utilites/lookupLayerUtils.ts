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

interface ConfigureLayerProperties {
	id: string;
	fields: string[];
	featureCollection?: any;
	type: string;
}
interface LookupLayerProps {
	view: esri.MapView;
	lookupLayers: esri.Collection<esri.FeatureLayer>;
	searchLayer: any;
	hideFeaturesOnLoad: boolean;
}

interface SearchGeometryProps {
	view: esri.MapView;
	config: ApplicationConfig;
	searchLayer: esri.FeatureLayer;
	results?: any;
}
export async function getSearchLayer(props: LookupLayerProps): Promise<esri.FeatureLayer | null> {
	const { view, searchLayer } = props;
	const layers = searchLayer?.layers;
	let layer = layers?.length && layers[0] || null;
	if (layer && layer?.id) {
		layer = view.map.findLayerById(layer.id);
		if (layer?.type === 'feature') {
			if (props.hideFeaturesOnLoad) hideLookuplayers([layer as esri.FeatureLayer], props.view);
			layer = layer as esri.FeatureLayer;
		} else {
			layer = null;
		}
	}
	return layer;
}
export function getLookupLayers(lookupLayers: esri.Collection<esri.Layer>) {
	const returnLayers: Collection<__esri.FeatureLayer> = new Collection();

	lookupLayers.forEach(layerItem => {
		// Add feature layers to the collection 
		if (layerItem?.type === "feature") {
			const featureLayer = layerItem as esri.FeatureLayer;
			if (featureLayer.popupEnabled) {
				returnLayers.add(featureLayer);
			}
		}
	});
	return returnLayers;
}
export async function findConfiguredLookupLayers(view: esri.MapView, config: ApplicationConfig): Promise<Collection> {
	// Find any configured layers or return all layers in the map 
	let lookupLayers: Collection<esri.Layer> = new Collection();
	const configuredLayers = config.lookupLayers?.layers ? config.lookupLayers.layers : null;

	if (configuredLayers) {
		// find the layers and add to the collection 
		configuredLayers.forEach(layerItem => {

			const layer = view.map.findLayerById(layerItem.id);
			//await view.whenLayerView(layer);
			// Get the sub layer 
			if (layerItem.sublayerId) {
				const dynamicLayer = layer as __esri.MapImageLayer;
				const createdFeatureLayer = new FeatureLayer({
					url: dynamicLayer.url + "/" + layerItem.sublayerId
				});
				createdFeatureLayer.visible = false;
				view.map.add(createdFeatureLayer)
				lookupLayers.add(createdFeatureLayer);
			} else {
				lookupLayers.add(layer);
			}
		});
	} else {
		lookupLayers = view.map.layers;
	}
	return resolve(lookupLayers);
}

export async function getSearchGeometry(props: SearchGeometryProps): Promise<esri.Graphic> {
	const { results, view, config, searchLayer } = props;
	const { lookupType } = config;
	const graphic = _getResultGeometries(results);
	// add marker to map
	//_addLocationGraphics(graphic, config, view);
	// If it's not a geometry search or it is geometry
	// but we don't have a search layer defined

	if (lookupType !== 'geometry' || !searchLayer) {
		let returnGraphic = graphic;
		if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
			returnGraphic = new Graphic({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
		}
		return resolve(returnGraphic);
	} else {
		// Is the source layer of the graphic equal to the search layer?
		const sourceLayerGraphic: any = graphic && graphic.hasOwnProperty('sourceLayer') ? graphic.clone() : null;

		if (sourceLayerGraphic.sourceLayer && sourceLayerGraphic.sourceLayer.id) {
			if (sourceLayerGraphic.sourceLayer.id === searchLayer.id) {
				// Is the search geometry from the search layer? If so use it
				return resolve(graphic);
			}
		}

		const searchGeometry = graphic.geometry;
		const query = searchLayer.createQuery();
		query.geometry = searchGeometry;
		if (searchGeometry && searchGeometry.type === 'point') {
			query.spatialRelationship = 'within';
		} else {
			query.spatialRelationship = 'intersects';
		}

		const results = await searchLayer.queryFeatures(query);
		return resolve(
			results && results.features && results.features.length && results.features.length > 0
				? results.features[0]
				: null
		);
	}
}
/*function _addLocationGraphics(graphic, config, view) {
	const { includeAddressText, addressGraphicColor, includeAddressGraphic, addMarker } = config;
	// add a custom graphic at geocoded location if we have something to display
	if (graphic && graphic.geometry) {
		const geometry =
			graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
		let displayText = null;
		if (graphic && includeAddressText) {

			if (graphic?.attributes?.Match_addr) {
				// replace first comma with a new line character
				displayText = graphic.attributes.Match_addr.replace(',', '\n');
			} else if (graphic?.attributes?.name) {
				displayText = graphic.attributes.name;
			} else if (graphic?.layer?.displayField !== '') {
				displayText = graphic.attributes[graphic.layer.displayField] || null;
			} else if (graphic?.layer?.fields) {
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
}*/
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
