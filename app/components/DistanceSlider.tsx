/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import i18n = require('dojo/i18n!../nls/resources');
import { renderable, tsx } from 'esri/widgets/support/widget';

import esri = __esri;

const CSS = {
	sliderLabel: 'slider-label',
	calciteStyles: {
		slider: 'calcite-slider'
	}
};

interface DistanceSliderProps extends esri.WidgetProperties {
	units: string;
	distance: string;
	maxDistance: string;
	minDistance: string;
}

@subclass('app.DistanceSlider')
class DistanceSlider extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@property() units: string;

	@property() distance: string;
	@property() maxDistance: string;
	@property() minDistance: string;
	@renderable()
	@property()
	currentValue: string;
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: DistanceSliderProps) {
		super();
		this.currentValue = props.distance;
	}
	render() {
		return (
			<form id="distanceSliderForm" class={this.classes(CSS.calciteStyles.slider)}>
				<label class={CSS.sliderLabel}>
					{`${i18n.tools.slider} (${this.currentValue} ${this.units})`}
					<input
						bind={this}
						onchange={this._handleSliderStep}
						type="range"
						min={this.minDistance}
						max={this.maxDistance}
						value={this.distance}
						step="1"
						aria-valuemin={this.minDistance}
						aria-valuemax={this.maxDistance}
						aria-valuenow={this.distance}
					/>
				</label>
			</form>
		);
	}
	_handleSliderStep(e) {
		const slider = e.target as HTMLInputElement;
		this.currentValue = slider.value;
	}
}
export = DistanceSlider;
