
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import { tsx, renderable } from 'esri/widgets/support/widget';
import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import esri = __esri;
import Accordion, { AccordionProps } from './Accordion';


const CSS = {
    base: 'accordion',
    basejs: 'js-accordion',
    single: 'single',
    section: 'accordion-section',
    groupSection: 'group-accordion-section',
    active: 'is-active',
    title: 'accordion-title',
    titleArea: 'title-area',
    count: 'group-accordion-count',
    content: 'accordion-content',
    groupContent: 'group-accordion-content',
    featureGroup: 'feature-group',
    button: 'btn',
    transparentButton: 'btn-transparent',
    smallButton: 'btn-small',
    accordionIcon: 'accordion-icon',
    groupAccordionIcon: 'group-accordion-icon',
    paddingTrailer: 'padding-right-quarter',
    right: 'right',
    actions: 'accordion-actions',
    templateContent: 'template',
    scrollable: "scrollable-content",
};

export interface FeatureResults {
    features: esri.Graphic[],
    title?: string,
    grouped?: boolean
}
interface GroupedAccordionProps extends AccordionProps {
    featureResults: FeatureResults[];
}

@subclass('app.GroupedAccordion')
class GroupedAccordion extends (Accordion) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------
    @property() featureResults: FeatureResults[];

    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------
    _calciteLoaded: boolean = false;
    _handles: Handles = new Handles();
    _featureCount: number = 0;
    _screenshot: any = null;
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: GroupedAccordionProps) {
        super(props);
        if (props.featureResults) {
            props.featureResults.forEach((result) => {
                this._featureCount += result.features && result.features.length;
            });
        }
    }
    render() {
        return (<div key="feature-container"
            afterCreate={this.updateCalcite}>
            <div bind={this} afterCreate={this._accordionCreated} class={this.classes(CSS.base, CSS.basejs, CSS.scrollable)}>
                {this.featureResults &&
                    this.featureResults.map((result, i) => this._createSections(result, i))}
            </div>
        </div >);
    }
    _accordionCreated(container) {
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
    _createSections(result: FeatureResults, key) {
        const count = result.features && result.features.length;
        const classes = count === 1 ? [CSS.section, CSS.single, CSS.groupSection] : [CSS.section, CSS.groupSection];
        // Open section if its the first section or if there is only one feature in the section
        if (count === 1 || key === 0) {
            classes.push(CSS.active);
        }
        return (<section
            bind={this}
            key={`section${key}`}
            class={this.classes(classes)}

        >
            <h5 class={CSS.title}>
                <span class={CSS.count}>{count}</span>
                <span class={CSS.titleArea}>
                    {result.title}
                    <span class={this.classes(CSS.accordionIcon, CSS.groupAccordionIcon, CSS.paddingTrailer)}>
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
                </span>

            </h5>
            <ul role='group' class={this.classes(CSS.templateContent, CSS.content, CSS.groupContent)} >
                {result.features &&
                    result.features.map((feature, i) => {
                        return (<li role='menuitem' tabindex="0" data-feature={feature}
                            afterCreate={this._createFeature}
                            class={this.classes(CSS.featureGroup)}
                            bind={this}
                            key={`feature${i}`} />)
                    })}
            </ul>
        </section>);


    }
    _createFeature(node: HTMLElement) {

        const graphic = node['data-feature'];
        const titleNode = document.createElement("div");
        node.appendChild(titleNode);
        const container = document.createElement("div");

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
        node.appendChild(container);
        const handle = feature.watch('title', () => {
            let title: string = feature.get('title');
            handle.remove();
            if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
                titleNode.innerHTML += this.convertUnitText(graphic.attributes.lookupDistance, this.config.units);
            } else {
                titleNode.innerHTML = title;
            }
        });
        node.addEventListener("click", () => {
            this.selectedItem = graphic;
        });
    }
    clear() {
        this.featureResults = null;
        this._featureCount = 0;
    }
    showToggle(): boolean {
        // show toggle buttons if we have more than 2 sections? 
        return this.featureResults && this.featureResults.length && this.featureResults.length > 2;
    }
}
export default GroupedAccordion;
