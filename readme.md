

 # Installation 
 Prerequisites: The webserver needs npm and node installed. 
 * Fork and then clone the repo.
 * Run npm install
 * Host on local web server.
 * Open web browser
 * Append your configured appid to the url with ?appid= 

# Configuration Options
Test apps
* Congressional districts:521fa0defa054c389097e685328d4bc3
* School districts web map: "80a6a6c21574452b961001b8d08f2607"
* Evacuation zones: d0feeb5963f7468d85a79f540adf3cea
## General options
* **appid**: Application id that contains configured app properties

## Map options
* **webmap**: Web map to display
* **mapPin**: Include a graphic on the map showing the search location. The graphic is a map pin,
* **mapPinLabel**: Include address text on the map showing the clicked location. 
* **addressGraphicColor**: The color of the graphic and address text. 

## Search results panel options
* **resultsPanelPreText**: This is text that will display prior to the search results and can be used to provide additional information to the user about the search results. Can include allowed HTML.
* **resultsPanelPostText**: Text that displays after the serach results. Can included allowed HTML
* **groupResultsByLayer**: Choose how to group the results. By default the results are not grouped. Set this to true to group by layer. 

## Title options
* **title**: Main title for the app
* **titleLink**: Url if you want the title to be a clickable link that navigates to the specified site.


## Info Panel 
* **socialSharing**: When true social sharing (Facebook,email and twitter) buttons are displayed at the top of the info panel. 
* **introductionTitle**: Title text displayed in bold at the top of the info panel 
* **introductionContent**: Content that displays in the description area of the info panel. Can include HTML that is supported by ArcGIS Online. 


## Lookup settings

* **lookupType**: Specify the type of lookup app you want to create. The following options are valid: "distance", "closest", "geometry"
  * **distance**: This option will find features within the specified distances and units of the input location. Distance is specifed using **distance** and units is specified using **units**. 
  * **geometry**: Determine if the input location is within a search geometry. The search geometries are defined using the **lookupLayers** and the **relationship** defines the spatial relationship between the features.

* **lookupLayers**: Layers to use for location based searching. By default will search all feature layers in the map.  if **hideSearchLayerFeatures** is enabled features in these layers will only be visible when part of search results.
* **relationship**: Define the spatial relationship used to filter features. Default value is intersects. Valid values are *intersects|contains|crosses|envelope-intersects|index-intersects|overlaps|touches|within*
* **noResultsMessage**: Define message that displays when no search results are found.
* **displayUnmatchedResults**: How do the features that don't match the requirements appear. Options are grayscale, sepia or hide
* **includeDistance**: When true and when the lookup type is distance include a distance from the lookup location option. 
* **showDirections**: Add an option to display directions. 
* **zoomScale**: Define the scale to zoom in to show results  
* **autoZoomFirstResult**: When true the map will automatically zoom to the first result

## Theme
* **bodyBackground**: Default value is empty. If a shared theme is set in the organization the body.background color will be used. Users can specify a color via the configuration process. This color will be used for the splash and description panel background color.
* **bodyColor**: Default value is empty. If a shared theme is set in the organization the body.text color will be used. Users can specify a color via the configuration process. This color will be used for the splash and description panel text color.
* **headerBackground**: Default value is white (#fff). If a shared theme is set in the organization the header.background color will be used. Users can specify a color via the configuration process. This color will be used for the header/footer background color.
* **headerColor**: Default value is dark gray (#4c4c4c). If a shared theme is set in the organization the header.text color will be used. Users can specify a color via the configuration process. This color will be used for the header/footer text color and the color of any tools that are displayed in the header/footer area.
* **buttonBackground**: Default value is empty. If a shared theme is set in the organization the button.background color will be used. Users can specify a color via the configuration process. This color will be used for the splash screen button background color. Note: This value is not applied to map buttons.
* **buttonColor**: Default value is empty. If a shared theme is set in the organization the button.text color will be used. Users can specify a color via the configuration process. This color will be used for the splash screen button text color. Note: this value is not applied to map buttons.

## Tools
* **legend**: Default value is false. When true a legend button is added to the map.
* **legendPosition**: Location on the map where the legend button is displayed. Valid values are *top-left|top-center|top-right|bottom-left|bottom-center|bottom-right*
* **zoom**: Default value is false. When true a zoom (+/-) button is added to the maps.
* **zoomPosition**: Location on the map where the zoom tool is placed.  Default value is *top-left*. Valid values are *top-left|top-center|top-right|bottom-left|bottom-center|bottom-right*
* **home**: "Default value is false. When true the home button is added to the map enabling users to go back to the initial map extent with one click.
* **homePosition**: Location on the map where the home extent tool is placed.  Default value is *top-left*. Valid values are *top-left|top-center|top-right|bottom-left|bottom-center|bottom-right*
* **scalebar**: Default value is false. When true a scalebar is added to the map.
* **scalebarPosition**:Location on the map where the scalebar is placed.  Valid values are *top-left|top-center|top-right|bottom-left|bottom-center|bottom-right*


