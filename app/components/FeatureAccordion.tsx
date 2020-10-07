import Accordion, { AccordionProps } from './Accordion';
import { property, subclass } from 'esri/core/accessorSupport/decorators';

import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import { tsx } from 'esri/widgets/support/widget';

import esri = __esri;

const CSS = {
	base: 'accordion',
	basejs: 'js-accordion',
	single: 'single',
	section: 'accordion-section',
	active: 'is-active',
	title: 'accordion-title',
	titleArea: 'title-area',
	content: 'accordion-content',
	button: 'btn',
	transparentButton: 'btn-transparent',
	accordionIcon: 'accordion-icon',
	paddingTrailer: 'padding-right-quarter',
	right: 'right',
	actions: 'accordion-actions',
	templateContent: 'template',
	scrollable: "scrollable-content",
	actionBar: 'action-bar'
};
export interface ActionButton {
	icon: string;
	id: string;
	name: string;
	class?: string;
	handleClick: (name: string, graphic: esri.Graphic) => void;
}
interface FeatureAccordionProps extends AccordionProps {
	features: esri.Graphic[];
}

@subclass('app.FeatureAccordion')
class FeatureAccordion extends (Accordion) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() features: esri.Graphic[];

	@property() sectionCount: number;

	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------

	_handles: Handles = new Handles();
	_screenshot: any = null;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: FeatureAccordionProps) {
		super(props);
	}
	render() {
		return (
			<div afterCreate={this._accordionCreated} bind={this} class={this.classes(CSS.base, CSS.basejs, CSS.scrollable)}>
				{this.features &&
					this.features.map((graphic, i) => this._renderFeatureWidget(graphic, this.features.length, i))}
			</div>
		);
	}

	_accordionCreated(container) {
		this.updateCalcite();
		// if screenshot is enabled set custom prop 
		if (this.config?.screenshot && !this._screenshot) {
			if (this?.view) {
				const expand = this.view.ui.find("screenshotExpand") as __esri.Expand;
				if (expand) {
					this._screenshot = expand.content as any;
					if (this._screenshot) { this._screenshot.custom.element = container; }
				}
			}
		}
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
					class={this.classes(CSS.section, count <= 2 || (count > 2 && index === 0) ? CSS.active : null, count === 1 ? CSS.single : null)}
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

					<div key={`btn${index}`} class={this.classes(CSS.content)}>
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
				titleNode.parentElement.addEventListener('click', () => this._selectAccordionSection(node, graphic));
			container && container.addEventListener('click', () => this._selectAccordionSection(node, graphic));
			const graphic = node['data-feature'];

			const feature = new Feature({
				graphic,
				defaultPopupTemplateEnabled: true,
				map: this.view.map,
				spatialReference: this.view.spatialReference,
				visibleElements: {
					title: false
				},
				container
			});


			const handleContent = feature.viewModel.watch("content", () => {
				handleContent.remove();
				const empty = this.checkContent(feature);
				if (empty) {
					if (container.parentElement && container.parentElement.parentElement) {
						container.parentElement.parentElement.classList.add("no-content");
					}
				}
			})
			const handle = feature.watch('title', () => {
				let title: string = feature.get('title');
				handle.remove();
				if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
					title += this.convertUnitText(graphic.attributes.lookupDistance, this.config.units);
				}
				titleNode.innerHTML = title;
				feature.graphic.setAttribute('app-accordion-title', feature.get('title'));
			});
		}
	}

	_selectAccordionSection(node: HTMLElement, graphic: esri.Graphic) {
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
	clear() {
		this.features = null;
	}
	showToggle(): boolean {
		return this.features && this.features.length && this.features.length > 2;
	}

}
export default FeatureAccordion;
