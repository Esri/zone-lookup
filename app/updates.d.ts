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
*/ declare namespace __esri {
	interface lang {
		/**
     * Use this method to deeply clone objects with properties that are computed or have their own `clone()` method. For example, if you are creating an object that stores an initial extent and a spatial reference for your application, you can use `esriLang.clone(initialProps)` to clone this object so that the `extent` and `spatialReference` are properly cloned.
     *
     * [Read more...](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-lang.html#clone)
     *
     * @param elem The object to be cloned.
     *
     */
		clone(elem: any): any;
		substitute(object: object, template: string);
	}

	interface widget {
		isWidgetBase(value: any): any;
		isWidget(value: any): any;
	}
	interface chartUtils {
		loadChartsModule(locale: string): IPromise<any>;
	}

	export type ExifTag = {
		name: string;
		description: string;
		value: any;
	};

	export type GetExifValueOptions = {
		exifName: string;
		tagName: string;
		exifInfo: ExifInfo[];
	};

	interface exifUtils {
		getExifValue(options: GetExifValueOptions): any;
	}
}
