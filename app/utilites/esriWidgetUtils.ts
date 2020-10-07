import { ApplicationConfig } from 'ApplicationBase/interfaces';
import esri = __esri;
import ConfigurationSettings = require('../ConfigurationSettings');
import { init } from "esri/core/watchUtils";
import { eachAlways } from "esri/core/promiseUtils";
import Handles from 'esri/core/Handles';
import Expand from "esri/widgets/Expand";
import i18n = require('dojo/i18n!../nls/resources');
import {
	getBasemaps,
	resetBasemapsInToggle
} from "ApplicationBase/support/widgetConfigUtils/basemapToggle";

interface esriWidgetProps {
	config: ConfigurationSettings;
	view: esri.MapView;
	portal: esri.Portal;
	propertyName?: string;
}
export interface esriMoveWidgetProps {
	view: esri.MapView;
	className: string;
	mobile?: boolean;
	config: ApplicationConfig;
}
export async function addMapComponents(props: esriWidgetProps): Promise<void> {
	const { config } = props;
	this._handles = new Handles();

	this._handles.add([init(config, ["home", "homePosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addHome(props);
	}),
	init(config, ["mapZoom", "mapZoomPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addZoom(props);
	}),
	init(config, ["legend", "legendPosition", "legendOpenAtStart", "legendConfig"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addLegend(props);
	}),
	init(config, ["screenshot", "screenshotPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addScreenshot(props);
	}),
	init(config, ["scalebar", "scalebarPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addScaleBar(props);
	}),
	init(config, ["nextBasemap", "basemapTogglePosition", "basemapToggle"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addBasemap(props);
	})], "configuration");
	if (!config.withinConfigurationExperience) {
		this._handles.remove("configuration");
	}
}
export async function addScreenshot(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { screenshot, screenshotPosition, legend } = config;

	const Screenshot = await import("Components/Screenshot/Screenshot");
	const node = view.ui.find("screenshotExpand") as __esri.Expand;
	if (!screenshot) {
		if (node) view.ui.remove(node);
		return;
	}

	// move the node if it exists 
	if (propertyName === "screenshotPosition" && node) {
		view.ui.move(node, screenshotPosition);
	} else if (propertyName === "screenshot") {
		const content = new Screenshot.default({
			view,
			enableLegendOption: legend ? true : false,
			enablePopupOption: false,
			includeLayoutOption: true,
			custom: {
				label: i18n.tools.screenshotResults,
				element: document.getElementById("resultsPanel")
			},
			includePopupInScreenshot: false,
			includeCustomInScreenshot: false,
			includeLegendInScreenshot: false
		});
		const screenshotExpand = new Expand({
			id: "screenshotExpand",
			content,
			mode: "floating",
			expandTooltip: i18n.tools.screenshot,
			view
		});
		view.ui.add(screenshotExpand, screenshotPosition);
	}
}
export async function addZoom(props: esriWidgetProps) {
	const { view, config, propertyName } = props;
	const { mapZoom, mapZoomPosition } = config;

	const Zoom = await import("esri/widgets/Zoom");
	const node = _findNode("esri-zoom");
	if (!mapZoom) {
		if (node) view.ui.remove(node);
		return;
	}
	if (node && !mapZoom) view.ui.remove(node);

	if (propertyName === "mapZoomPosition" && node) {
		view.ui.move(node, mapZoomPosition);
	} else if (propertyName === "mapZoom" && !node) {
		view.ui.add(new Zoom.default({ view }), mapZoomPosition);
	}
}
export async function addBasemap(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { basemapTogglePosition, basemapToggle } = config;
	const node = view.ui.find("basemapWidget") as __esri.BasemapToggle;
	const { originalBasemap, nextBasemap } = await getBasemaps(props);
	// If basemapToggle isn't enabled remove the widget if it exists and exit 
	if (!basemapToggle) {
		if (node) {
			view.ui.remove(node);
			node.destroy();
		}
		return;
	}
	const BasemapToggle = await import("esri/widgets/BasemapToggle");
	if (!BasemapToggle) return;
	// Move the basemap toggle widget if it exists 
	if (propertyName === "basemapTogglePosition" && node) {
		view.ui.move(node, basemapTogglePosition);
	}
	// Add the basemap toggle widget if its enabled or if a different basemap was 
	// specified
	if (propertyName === "basemapToggle" && !node) {

		const bmToggle = new BasemapToggle.default({
			view,
			nextBasemap,
			id: "basemapWidget"
		});
		resetBasemapsInToggle(bmToggle, originalBasemap, nextBasemap);
		view.ui.add(bmToggle, basemapTogglePosition);
	} else if (node && (propertyName === "nextBasemap" || propertyName === "basemapSelector")) {
		if (propertyName === "nextBasemap" || propertyName === "basemapSelector") {
			resetBasemapsInToggle(node, originalBasemap, nextBasemap);
		}
	}
}

async function _getBasemap(id: string) {
	const Basemap = await import("esri/Basemap");
	if (!Basemap) { return; }

	let basemap = Basemap.default.fromId(id);

	if (!basemap) {
		basemap = await new Basemap.default({
			portalItem: {
				id
			}
		}).loadAll();
	}
	return basemap as any;
}
export async function addHome(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { home, homePosition } = config;
	const Home = await import('esri/widgets/Home');
	const node = _findNode("esri-home");
	if (!home) {
		if (node) view.ui.remove(node);
		return;
	}
	if (node && !home) view.ui.remove(node);

	if (propertyName === "homePosition" && node) {
		view.ui.move(node, homePosition);
	} else if (propertyName === "home") {
		view.ui.add(new Home.default({ view }), homePosition);
	}
}
export async function addLegend(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { legend, legendPosition, legendOpenAtStart, legendConfig } = config;

	const modules = await eachAlways([import("esri/widgets/Legend"), import("esri/widgets/Expand")]);
	const [Legend, Expand] = modules.map((module) => module.value);
	const node = view.ui.find("legendExpand") as __esri.Expand;

	if (!legend) {
		if (node) view.ui.remove(node);
		return;
	}
	// move the node if it exists 
	if (propertyName === "legendPosition" && node) {
		view.ui.move(node, legendPosition);
	} else if (propertyName === "legend") {
		const content = new Legend.default({
			style: legendConfig.style,
			view
		});
		const legendExpand = new Expand.default({
			id: "legendExpand",
			content,
			mode: "floating",
			group: legendPosition,
			view
		});

		view.ui.add(legendExpand, legendPosition);
	} else if (propertyName === "legendOpenAtStart" && node) {
		node.expanded = legendOpenAtStart;
	} else if (propertyName === "legendConfig" && node) {
		const l = node.content as __esri.Legend;
		if (legendConfig?.style) {
			l.style = legendConfig.style;
		}
	}
}
export async function addScaleBar(props: esriWidgetProps) {

	const { view, portal, config, propertyName } = props;
	const { scalebar, scalebarPosition } = config;
	const ScaleBar = await import("esri/widgets/ScaleBar");
	const node = _findNode("esri-scale-bar");
	if (!scalebar) {
		if (node) view.ui.remove(node);
		return;
	}
	// move the node if it exists 
	if (propertyName === "scalebarPosition" && node) {
		view.ui.move(node, scalebarPosition);
	} else if (propertyName === "scalebar") {
		view.ui.add(new ScaleBar.default({
			view,
			unit: portal?.units === "metric" ? portal?.units : "non-metric"
		}), scalebarPosition);
	}
}

function _findNode(className: string): HTMLElement {

	const mainNodes = document.getElementsByClassName(className);
	let node = null;
	for (let j = 0; j < mainNodes.length; j++) {
		node = mainNodes[j] as HTMLElement;
	}
	return node ? node : null;

}
