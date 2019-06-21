/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import { tsx } from 'esri/widgets/support/widget';
import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import { accordion } from 'calcite-web/dist/js/calcite-web';
import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';

const CSS = {
	base: 'accordion',
	basejs: 'js-accordion',
	section: 'accordion-section',
	active: 'is-active',
	title: 'accordion-title',
	titleArea: 'title-area',
	content: 'accordion-content',
	button: 'btn',
	transparentButton: 'btn-transparent',
	smallButton: 'btn-small',
	accordionIcon: 'accordion-icon',
	paddingTrailer: 'padding-right-quarter',
	right: 'right',
	actions: 'accordion-actions',
	templateContent: 'template',
	actionBar: 'action-bar',
	distance: 'distance'
};
export interface ActionButton {
	icon: string;
	id: string;
	name: string;
	class?: string;
	handleClick: (name: string, graphic: esri.Graphic) => void;
}
interface FeatureAccordionProps extends esri.WidgetProperties {
	features: esri.Graphic[];
	view: esri.MapView;
	actionBarItems?: ActionButton[];
	config: ApplicationConfig;
}

@subclass('app.FeatureAccordion')
class FeatureAccordion extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() selectedItem: esri.Graphic = null;
	@property() actionBarItems: ActionButton[];

	@property() features: esri.Graphic[];

	@property() view: esri.MapView;

	@property() config: ApplicationConfig;

	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_calciteLoaded: boolean = false;
	_handles: Handles = new Handles();
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: FeatureAccordionProps) {
		super();
	}
	render() {
		return (
			<div afterCreate={this._updateCalcite} class={this.classes(CSS.base, CSS.basejs)}>
				{this.features &&
					this.features.map((graphic, i) => this._renderFeatureWidget(graphic, this.features.length, i))}
			</div>
		);
	}
	_renderFeatureWidget(graphic: esri.Graphic, count: number, index: number) {
		// Add active class to all sections if there are less than 2. If there are
		// more than 2 just add to the first feature

		return count && count > 0 ? (
			<div key="feature-content">
				<section
					data-feature={graphic}
					afterCreate={this._createFeature}
					bind={this}
					key={`section${index}`}
					class={this.classes(CSS.section, count <= 2 || (count > 2 && index === 0) ? CSS.active : null)}
				>
					<h4 class={CSS.title}>
						<span class={this.classes(CSS.accordionIcon, CSS.paddingTrailer)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 32 32"
								class="svg-icon"
							>
								<path d="M28 9v5L16 26 4 14V9l12 12L28 9z" />
							</svg>
						</span>
						<span class={CSS.titleArea} />
					</h4>

					<div key={`btn${index}`} class={CSS.content}>
						<nav class={this.classes(CSS.actionBar)}>
							{this.actionBarItems &&
								this.actionBarItems.length > 0 &&
								this.actionBarItems.map((item) => this._createActionItem(item, graphic))}
						</nav>
						<div class={CSS.templateContent} />
					</div>
				</section>
			</div>
		) : null;
	}
	_createFeature(node: HTMLElement) {
		if (node instanceof HTMLElement) {
			const titleNode = node.querySelector(`.${CSS.titleArea}`);
			const container = node.querySelector(`.${CSS.templateContent}`) as HTMLElement;

			titleNode &&
				titleNode.parentElement &&
				titleNode.parentElement.addEventListener('click', () => this.__selectAccordionSection(node, graphic));
			container && container.addEventListener('click', () => this.__selectAccordionSection(node, graphic));
			const graphic = node['data-feature'];

			const feature = new Feature({
				graphic,
				defaultPopupTemplateEnabled: true,
				map: this.view.map,
				spatialReference: this.view.spatialReference,
				container
			});

			const handle = feature.watch('title', () => {
				let title: string = feature.get('title');
				handle.remove();
				if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
					title += this._convertUnitText(graphic.attributes.lookupDistance, this.config.units);
				}
				titleNode.innerHTML = title;
				feature.graphic.setAttribute('app-accordion-title', feature.get('title'));
			});
		}
	}

	__selectAccordionSection(node: HTMLElement, graphic: esri.Graphic) {
		const selectedClassName = 'accordion-section-selected';
		//only apply selection style if more than one feature is selected
		if (this.features && this.features.length && this.features.length > 1) {
			const mainNodes = document.getElementsByClassName(selectedClassName);
			for (let j = 0; j < mainNodes.length; j++) {
				mainNodes[j].classList.remove(selectedClassName);
			}
			if (node && node.parentElement) {
				node.parentElement.classList.add(selectedClassName);
			}
		}
		this.selectedItem = graphic;
	}
	_convertUnitText(distance, units) {
		return `<span class="distance right">${distance} ${units}</span>`;
	}
	_createActionItem(item, graphic) {
		return (
			<button
				onclick={() => this._handleActionItemClick(graphic, item)}
				class={this.classes(CSS.button, CSS.transparentButton, CSS.right, item.icon, item.class)}
			>
				{item.name}
			</button>
		);
	}
	_handleActionItemClick(graphic, item) {
		item.handleClick(item.id, graphic);
	}

	_updateCalcite() {
		if (!this._calciteLoaded) {
			accordion();
			this._calciteLoaded = true;
		}
	}
}
export default FeatureAccordion;
