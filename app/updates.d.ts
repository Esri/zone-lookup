declare namespace __esri {
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
    substitute(object: object, template: string)
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
    getExifValue(options: GetExifValueOptions): any
  }

}
