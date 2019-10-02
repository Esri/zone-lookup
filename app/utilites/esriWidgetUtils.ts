import { ApplicationConfig } from 'ApplicationBase/interfaces';
import esri = __esri;


interface esriWidgetProps {
	config: ApplicationConfig;
	view: esri.MapView;
	portal: esri.Portal;
}
export interface esriMoveWidgetProps {
	view: esri.MapView;
	className: string;
	mobile?: boolean;
	config: ApplicationConfig;
}
export async function addMapComponents(props: esriWidgetProps): Promise<void> {
	const { config, view } = props;

	if (config.zoom && config.zoomPosition !== 'top-left') {
		view.ui.move('zoom', config.zoomPosition);
	}
	if (config.home) addHome(props);
	if (config.legend) addLegend(props);
	if (config.scalebar) addScaleBar(props);
	if (config.basemapToggle) addBasemap(props);
}
export function moveComponent(props: esriMoveWidgetProps) {
	const mainNodes = document.getElementsByClassName(props.className);
	let node = null;
	for (let j = 0; j < mainNodes.length; j++) {
		node = mainNodes[j] as HTMLElement;
	}
	if (node) {
		const direction = props.mobile ? 'manual' : props.config.legendPosition;
		props.mobile ? node.classList.add('mobile') : node.classList.remove('mobile');
		props.view.ui.move(node, direction);
	}
}
export async function addBasemap(props: esriWidgetProps) {
	const { view, config } = props;
	const BasemapToggle = await import('esri/widgets/BasemapToggle');
	if (BasemapToggle) {
		const bmToggle = new BasemapToggle.default({
			view
		});
		if (config.altBasemap) {
			bmToggle.nextBasemap = config.altBasemap;
		}
		view.ui.add(bmToggle, config.basemapTogglePosition);
	}
}
export async function addHome(props: esriWidgetProps) {
	const { view, config } = props;
	const Home = await import('esri/widgets/Home');
	if (Home) {
		view.ui.add(new Home.default({ view }), config.homePosition);
	}
}
export async function addLegend(props: esriWidgetProps) {
	const { view, config } = props;
	const [Legend, Expand] = await Promise.all([import('esri/widgets/Legend'), import('esri/widgets/Expand')]);
	if (Legend && Expand) {
		const legend = new Legend.default({
			view,
			style: {
				type: 'card'
			}
		});
		const expand = new Expand.default({
			view,
			group: config.legendPosition,
			mode: 'floating',
			content: legend
		});

		view.ui.add(expand, config.legendPosition);
		const container = expand.container as HTMLElement;
		container.classList.add('legend-expand');
	}
}
export async function addScaleBar(props: esriWidgetProps) {
	const { view, portal, config } = props;
	const ScaleBar = await import('esri/widgets/ScaleBar');
	if (ScaleBar) {
		const scalebar = new ScaleBar.default({
			view,
			unit: portal.units === 'metric' ? portal.units : 'non-metric'
		});
		view.ui.add(scalebar, config.scalebarPosition);
	}
}
