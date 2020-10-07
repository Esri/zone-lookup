
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Share from '../components/Share/Share';
import ShareFeatures from '../components/Share/Share/ShareFeatures';
import { whenOnce } from "esri/core/watchUtils";
import Handles from 'esri/core/Handles';
import { tsx, renderable } from 'esri/widgets/support/widget';
import i18n = require('dojo/i18n!../nls/resources');

import esri = __esri;
import ConfigurationSettings = require('../ConfigurationSettings');
import ShareItem = require('./Share/Share/ShareItem');


type State = 'ready' | 'loading';

const CSS = {
	calciteStyles: {
		right: 'right',
		left: 'left',
		fontSize2: 'font-size--2',
		paddingTrailer: 'padding-right-1',
		panel: 'panel',
		panelNoPadding: 'panel-no-padding',
		btn: 'btn',
		btnFill: 'btn-fill',
		btnTransparent: 'btn-transparent',
		phoneHide: 'phone-hide'
	},
	svgIcon: 'svg-icon',
	detailsTitle: 'details-title',
	detailsContent: 'details-content',
	hide: 'hide',
	details: 'detail'
};

export interface DetailPanelProps extends esri.WidgetProperties {
	config: ConfigurationSettings,
	view: esri.MapView;
}

@subclass('app.DetailPanel')
class DetailPanel extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property()
	@renderable(["introductionTitle", "introductionContent", "socialSharing"])
	config: ConfigurationSettings;
	@property() shareWidget: Share = null;
	@property() view: esri.MapView = null;

	private _handles: Handles = new Handles();
	//----------------------------------
	//
	//  state - readOnly
	//
	//----------------------------------
	@property({
		dependsOn: ['view.ready'],
		readOnly: true
	})
	get state(): State {
		const ready = this.get('view.ready');
		return ready ? 'ready' : 'loading';
	}

	constructor(props: DetailPanelProps) {
		super(props);
	}
	initialize() {

		const setupShare = 'setup-share';
		this._handles.add(
			whenOnce(this, 'view.ready', () => {
				const shareFeatures = new ShareFeatures({
					copyToClipboard: true,
					embedMap: false,
				});

				this.shareWidget = new Share({
					view: this.view,
					shareFeatures,
					container: document.createElement('div'),
					isDefault: true
				});


				this._handles.remove(setupShare);
			}),
			setupShare
		);
	}
	destroy() {
		this._handles.removeAll();
		this._handles = null;
	}

	render() {
		const { share, introductionContent, introductionTitle } = this.config;
		const show = share || introductionTitle || introductionContent ? "" : "hide";

		const socialShare =
			share && this.shareWidget ? (
				<div
					bind={this.shareWidget.container}
					afterCreate={this._attachToNode}
					class={this.classes(CSS.calciteStyles.phoneHide)}
				/>
			) : null;
		return (
			<div bind={this} class={this.classes(show, CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding)}>
				<button
					bind={this}
					aria-label={i18n.tools.info}
					title={i18n.tools.close}
					onclick={this._hidePanel}
					class={this.classes(
						CSS.details,
						CSS.calciteStyles.btnFill,
						CSS.calciteStyles.btn,
						CSS.calciteStyles.btnTransparent
					)}
				>
					<svg
						class={this.classes(CSS.svgIcon)}
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 32 32"
					>
						<path d="M2 24l14-14 14 14H2z" />
					</svg>
				</button>

				<h3 class={this.classes(CSS.detailsTitle)}>{introductionTitle}</h3>
				<p class={this.classes(CSS.detailsContent)} innerHTML={introductionContent} />
				{socialShare}
			</div>
		);
	}
	private _hidePanel(e) {
		const container = this.container as HTMLElement;
		e.target.title = container.classList.contains("collapse") ? i18n.tools.close : i18n.tools.infoTip;

		container.classList.toggle('collapse');
	}
	private _toggleButton() {
		// Show the header button
		const nodes = document.getElementsByClassName('btn-detail');
		for (let j = 0; j < nodes.length; j++) {
			nodes[j].classList.toggle('hide');
		}
	}

	_attachToNode(this: HTMLElement, node: HTMLElement): void {
		const content: HTMLElement = this;
		node.appendChild(content);
	}
	public collapse() {
		const container = this.container as HTMLElement;
		container.classList.add('collapse');
	}
}

export default DetailPanel;
