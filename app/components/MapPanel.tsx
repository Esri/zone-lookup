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
*/
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import * as errorUtils from '../utilites/errorUtils';
import i18n = require('dojo/i18n!../nls/resources');
import { tsx, renderable } from 'esri/widgets/support/widget';
import { ApplicationConfig } from 'ApplicationBase/interfaces';
import ApplicationBase from 'ApplicationBase/ApplicationBase';
import { createMapFromItem, createView, getConfigViewProperties } from 'ApplicationBase/support/itemUtils';

import esri = __esri;

const CSS = {
	miniMap: {
		panel: 'mini-map-panel'
	},
	tabletShow: 'tablet-show',
	tabletHide: 'tablet-hide',
	configApp: 'configurable-application__view-container',
	hide: 'hide',
	theme: 'app-header',
	btnOpenMap: 'btn-open-map',
	appButton: 'app-button',

	calciteStyles: {
		alert: 'alert',
		active: 'is-active',
		alertRed: 'alert-red',
		alertGreen: 'alert-green',
		alertClose: 'alert-close',
		topNav: 'top-nav',
		topNavTitle: 'top-nav-title',
		column14: 'column-14',
		leader: 'leader-0',
		trailer: 'trailer-0',
		paddingLeft: 'padding-left-0',
		paddingRight: 'padding-right-0',
		button: 'btn',
		buttonGreen: 'btn-green',
		buttonFill: 'btn-fill',
		right: 'right',
		panel: 'panel',
		iconDesc: 'icon-ui-description'
	}
};

interface MapPanelProps extends esri.WidgetProperties {
	base: ApplicationBase;
	item: esri.PortalItem;
	mainMapAccessoryClassName?: string;
	selectedItemTitle?: string;
	isMobileView?: boolean;
}
@subclass('app.MapPanel')
class MapPanel extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() base: ApplicationBase;
	@property() item: __esri.PortalItem;
	@property() config: ApplicationConfig;
	@property() view: esri.MapView;

	@property() mainMapAccessoryClassName: string = 'main-map-content';

	@property() selectedItemTitle: string = null;

	@renderable()
	@property()
	isMobileView: boolean = false;

	@renderable()
	@property()
	message: string;

	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_initialExtent: esri.Extent;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: MapPanelProps) {
		super();
		const { config } = props.base;
		this.config = config;
	}
	render() {
		const allClasses = [
			CSS.calciteStyles.paddingRight,
			CSS.calciteStyles.paddingLeft,
			CSS.calciteStyles.trailer,
			CSS.calciteStyles.leader,
			CSS.calciteStyles.trailer
		];
		const mainMapClasses = [ CSS.calciteStyles.column14 ];
		const miniMapClasses = [ CSS.miniMap.panel, CSS.calciteStyles.panel ];
		const mapPositionClasses = this.isMobileView
			? this.classes(...allClasses, ...miniMapClasses)
			: this.classes(...mainMapClasses, ...allClasses);
		const mapTabletClass = this.isMobileView ? this.classes(CSS.tabletShow) : null;
		const mapButton = this.isMobileView ? (
			<button
				bind={this}
				onclick={this.closeMap}
				class={this.classes(
					CSS.calciteStyles.button,
					CSS.btnOpenMap,
					CSS.appButton,
					CSS.tabletShow,
					CSS.calciteStyles.buttonGreen,
					CSS.calciteStyles.buttonFill,
					CSS.calciteStyles.iconDesc
				)}
			>
				Info
			</button>
		) : null;

		const alertMessage =
			this.isMobileView && this.message ? (
				<div
					key="mobile-message"
					class={
						this.isMobileView && this.message ? (
							this.classes(CSS.calciteStyles.alert, CSS.calciteStyles.active, CSS.calciteStyles.alertRed)
						) : null
					}
				>
					<span innerHTML={this.message} />
					<button class={this.classes(CSS.calciteStyles.alertClose)} onclick={this._closeAlert}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 32 32"
							class="svg-icon"
						>
							<path d="M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z" />
						</svg>
					</button>
				</div>
			) : null;
		return (
			<div class={mapPositionClasses} role="application">
				<div class={this.classes(CSS.configApp)}>
					<div class={mapTabletClass} bind={this} afterCreate={this._createMap} />
				</div>
				{alertMessage}
				{mapButton}
			</div>
		);
	}
	private _closeAlert() {
		this.message = null;
		const alerts = document.getElementsByClassName('alert is-active');
		for (let j = 0; j < alerts.length; j++) {
			alerts[j].classList.remove('is-active');
		}
	}
	private async _createMap(container) {
		const portalItem: esri.PortalItem = this.base.results.applicationItem.value;
		const appProxies = portalItem && portalItem.applicationProxies ? portalItem.applicationProxies : null;

		const defaultViewProperties = getConfigViewProperties(this.config);
		const mapContainer = {
			container
		};

		const viewProperties = {
			...defaultViewProperties,
			...mapContainer
		};
		try {
			const map = (await createMapFromItem({ item: this.item, appProxies })) as esri.WebMap;

			this.view = (await createView({ ...viewProperties, map })) as esri.MapView;
			this.view.highlightOptions.fillOpacity = 0;

			const handler = this.view.watch('extent', () => {
				handler.remove();
				this._initialExtent = this.view.extent.clone();
			});

			document.getElementById('mapDescription').innerHTML = i18n.map.description;

			const rootNode = document.getElementsByClassName('esri-view-surface');
			for (let k = 0; k < rootNode.length; k++) {
				rootNode[k].setAttribute('aria-describedby', 'mapDescription');
			}
		} catch (error) {
			const title = (this.item && this.item.title) || ' the application';
			errorUtils.displayError({ title: 'Error', message: `Unable to load ${title} ` });
		}
	}
	closeMap() {
		this.view.container.classList.add('tablet-hide');
		const mainNodes = document.getElementsByClassName('main-map-content');
		for (let j = 0; j < mainNodes.length; j++) {
			mainNodes[j].classList.remove('hide');
		}

		this.selectedItemTitle = null;

		this.isMobileView = false;
		document.getElementById('mapDescription').innerHTML = i18n.map.description;
	}
	public clearResults() {
		this.message = null;
	}
	public resetExtent() {
		this.view.extent = this._initialExtent;
	}
}
export = MapPanel;
