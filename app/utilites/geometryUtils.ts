/*
  Copyright 2019 Esri

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
import geometryEngine from 'esri/geometry/geometryEngineAsync';
import esri = __esri;

interface BufferParams {
	location: esri.Geometry;
	portal: esri.Portal;
	distance: number;
	unit: string;
}
interface DistanceParams extends BufferParams {
	features: Graphic[];
}
export function getDistances(params: DistanceParams) {
	const { location, unit } = params;
	const promises = [];
	params.features.forEach((feature) => {
		promises.push(geometryEngine.distance(location, feature.geometry, unit));
	});
	return Promise.all(promises).then((results) => {
		results.map((result, index) => {
			const f = params.features[index];
			if (f && f.attributes) {
				f.attributes.lookupDistance = result.toFixed(2);
			}
		});
	});
}
export async function bufferGeometry(params: BufferParams) {
	const { location, distance, unit } = params;
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
