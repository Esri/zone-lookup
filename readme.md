
# zone-lookup
Zone Lookup is a configurable app template that allows users to look up information based on their location or a searched location 

## Features

* 'Know your zone' applications for hurricane evacuations.
* School attendance area maps
* 
* **appid**: Application id that contains configured app properties

`Map options`
* **webmap**: Web map to display
* **includeAddressGraphic**: Include a graphic on the map showing the search location. The graphic is a map pin,
* **includeAddressText**: Include address text on the map showing the clicked location. 
* **addressGraphicColor**: The color of the graphic and address text. 

`Search results panel options`
* **resultsPanelPreText**: This is text that will display prior to the search results and can be used to provide additional information to the user about the search results. Can include allowed HTML.
* **resultsPanelPostText**: Text that displays after the serach results. Can included allowed HTML

`Title`
* **title**: Main title for the app
* **titleLink**: Url if you want the title to be a clickable link that navigates to the specified site.


`Info Panel` 
* **socialSharing**: When true social sharing (Facebook,email and twitter) buttons are displayed at the top of the info panel. 
* **detailTitle**: Title text displayed in bold at the top of the info panel 
* **detailContent**: Content that displays in the description area of the info panel. Can include HTML that is supported by ArcGIS Online. 


`Lookup settings`
* **lookupLayers**: Layers to use for location based searching. By default will search all feature layers in the map.  if **hideLookupLayers** is enabled features in these layers will only be visible when part of search results.
* **noResultsMessage**: Define message that displays when no search results are found.
* **displayUnmatchedResults**: How do the features that don't match the requirements appear. Options are grayscale, sepia or hide

* **autoZoomFirstResult**: When true the map will automatically zoom to the first result

`Theme`
* **headerBackground**: Default value is white (#fff). If a shared theme is set in the organization the header.background color will be used. Users can specify a color via the configuration process. This color will be used for the header/footer background color.
* **headerColor**: Default value is dark gray (#4c4c4c). If a shared theme is set in the organization the header.text color will be used. Users can specify a color via the configuration process. This color will be used for the header/footer text color and the color of any tools that are displayed in the header/footer area.
* **buttonBackground**: Default value is empty. If a shared theme is set in the organization the button.background color will be used. Users can specify a color via the configuration process. This color will be used for the splash screen button background color. Note: This value is not applied to map buttons.
* **buttonColor**: Default value is empty. If a shared theme is set in the organization the button.text color will be used. Users can specify a color via the configuration process. This color will be used for the splash screen button text color. Note: this value is not applied to map buttons.

`Tools`
* **legend**: Default value is false. When true a legend button is added to the map.
* **zoom**: Default value is false. When true a zoom (+/-) button is added to the maps.
* **home**: "Default value is false. When true the home button is added to the map enabling users to go back to the initial map extent with one click.
* **scalebar**: Default value is false. When true a scalebar is added to the map.
* **basemapToggle**: Default value is false. When true a basemap switcher is added to the map. This will let you switch between your web map's basemap and a basemap you define with the **altBasemap** option. 


## Instructions
 Copy the code to your web server then from a terminal run npm install to install project dependencies. 

 The package.json file has a few scripts setup to make it easy to make modifications to the TypeScript and SASS files. You can use **npm run start** to watch the .ts and .sass files and when changes are made the commands to convert the typescript to javascript and sass to css will be run. 

## Requirements
This web app includes the capability to edit a hosted feature service or an ArcGIS Server feature service. Creating hosted feature services requires an ArcGIS Online organizational subscription or an ArcGIS Developer account. 

`Supported Devices`:
This application is responsively designed to support use in browsers on desktops, mobile phones, and tablets.


## Resources

- [ArcGIS for JavaScript API Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)
- [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)
- [twitter@esri](http://twitter.com/esri)

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing

Copyright 2019 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license](license.txt) file.
