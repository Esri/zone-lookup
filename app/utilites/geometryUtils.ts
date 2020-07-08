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
import Graphic from 'esri/Graphic';
import Color from 'esri/Color';
import SpatialReference from 'esri/geometry/SpatialReference';
import { getBackgroundColorTheme } from 'esri/views/support/colorUtils';

import geometryEngine from 'esri/geometry/geometryEngine';
import esri = __esri;

interface BufferParams {
	location: esri.Geometry;
	portal: esri.Portal;
	distance: number;
	unit: __esri.BufferParameters["unit"]
}
interface DistanceParams extends BufferParams {
	features: Graphic[];
}
export function getDistances(params: DistanceParams) {
	const { location, unit } = params;
	params.features.forEach(feature => {
		const distance = geometryEngine.distance(location, feature.geometry, unit);
		if (feature && feature.attributes) {
			feature.attributes.lookupDistance = distance !== null ? distance.toFixed(2) : null;
		}
	});
}
export function bufferGeometry(params: BufferParams) {
	const { location, distance, unit } = params;
	const bp = {
		geometries: [location],
		distances: [distance],
		unit
	}
	const spatialReference =
		location.spatialReference ||
		new SpatialReference({
			wkid: 102100
		});
	if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
		return geometryEngine.geodesicBuffer(location, distance, unit);
	} else {
		return geometryEngine.buffer(location, distance, unit);
	}
}

export function createBufferGraphic(geometry: esri.Polygon, symbolColor: string) {
	const color = new Color(symbolColor);
	const fillColor = color.clone();
	fillColor.a = 0.1;
	const fillSymbol = {
		type: 'simple-fill',
		color: fillColor,
		outline: {
			color
		}
	};
	const bufferGraphic = new Graphic({
		geometry,
		symbol: fillSymbol
	});
	return bufferGraphic;
}
export async function getBasemapTheme(view: esri.MapView): Promise<string> {
	return await getBackgroundColorTheme(view);
}