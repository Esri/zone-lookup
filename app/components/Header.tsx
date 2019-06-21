/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import DetailPanel, { DetailPanelProps } from './DetailPanel';
import i18n = require('dojo/i18n!../nls/resources');
import { tsx } from 'esri/widgets/support/widget';

import esri = __esri;

const CSS = {
	title: 'esri-header-title',
	theme: 'app-header',
	hide: 'hide',
	calciteStyles: {
		phoneColumn: 'phone-column-6',
		tabletColumn: 'tablet-column-12',
		fade: 'fade-in',
		topNav: 'top-nav',
		topNavFlex: 'top-nav-flex',
		topNavTitleFlex: 'top-nav-flex-title',
		topNavPaddingLeft: 'padding-left-half',
		topNavTitle: 'top-nav-title',
		ellipsis: 'text-ellipsis',
		topNavList: 'top-nav-flex-list',
		left: 'left',
		right: 'right',
		button: 'btn',
		buttonTransparent: 'btn-transparent'
	},
	detailButton: 'btn-detail'
};

interface HeaderProps extends esri.WidgetProperties {
	title: string;
	titleLink?: string;
	detailPanelProps?: DetailPanelProps;
}

@subclass('app.Header')
class Header extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@property() titleLink: string;

	@property() title: string;

	@property() detailPanelProps: DetailPanelProps;

	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_detailPanel: DetailPanel;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: HeaderProps) {
		super();
	}
	render() {
		const title = this.titleLink ? (
			<a target="_blank" href={this.titleLink}>
				{this.title}
			</a>
		) : (
			this.title
		);

		return (
			<header class={this.classes(CSS.calciteStyles.topNav, CSS.theme)}>
				<div class={this.classes(CSS.calciteStyles.fade)}>
					<h1 class={this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis)}>{title}</h1>
				</div>
			</header>
		);
	}
}
export = Header;
