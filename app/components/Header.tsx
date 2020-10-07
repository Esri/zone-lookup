
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { setPageTitle } from 'ApplicationBase/support/domHelper';

import { tsx, renderable } from 'esri/widgets/support/widget';
import { init } from "esri/core/watchUtils";
import esri = __esri;
import ConfigurationSettings = require('../ConfigurationSettings');

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
		ellipsis: 'text-fade',
		topNavList: 'top-nav-flex-list',
		left: 'left',
		right: 'right',
		button: 'btn',
		buttonTransparent: 'btn-transparent'
	},
	detailButton: 'btn-detail'
};

interface HeaderProps extends esri.WidgetProperties {
	config: ConfigurationSettings
}

@subclass('app.Header')
class Header extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property()
	@renderable(["title", "titleLink", "header"])
	config: ConfigurationSettings;


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
	constructor(props: HeaderProps) {
		super(props);
		this._onTitleUpdate = this._onTitleUpdate.bind(this);
	}
	postInitialize() {
		const handle = init(this, "config.title", this._onTitleUpdate);

		this.own(handle);
	}
	render() {
		const { titleLink, title, header } = this.config;
		const showHeader = header === false ? "hide" : "show";
		const titleDiv = titleLink ? (
			<a target="_blank" rel="noopener" href={titleLink}>
				{title}
			</a>
		) : (
				title
			);
		return (
			<div class={showHeader}>
				<div class="panel panel-no-padding panel-no-border app-header">
					<header class={this.classes(CSS.calciteStyles.topNav, CSS.theme)}>
						<div class={this.classes(CSS.calciteStyles.fade)}>
							<h1 title={title} class={this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis)}
							>
								{titleDiv}
							</h1>
						</div>
					</header>
				</div>
			</div>);
	}

	private _onTitleUpdate() {
		if (this?.config?.title) {
			setPageTitle(this.config.title);
		}
	};

}
export = Header;
