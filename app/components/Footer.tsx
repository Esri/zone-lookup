
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { tsx, renderable } from 'esri/widgets/support/widget';
import i18n = require('dojo/i18n!../nls/resources');
import esri = __esri;

const CSS = {
    base: "app-footer"
};

interface FooterProps extends esri.WidgetProperties {
    noMap: boolean
}

@subclass('app.Footer')
class Footer extends (Widget) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------
    @property()
    @renderable()
    noMap: boolean;

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
    constructor(props: FooterProps) {
        super(props);
    }
    render() {
        const showFooter = this.noMap ? "hide" : null;
        return (
            <div class={showFooter}>
                <button class={
                    this.classes("icon-ui-maps", "btn", "btn-fill", "btn-blue", "btn-open-map", "app-button", "tablet-show")
                } bind={this} onclick={this._handleClick}>
                    {i18n.map.label}
                </button>
            </div>

        );
    }
    private _handleClick(event: MouseEvent): void {

        this.emit("button-clicked");
    }
}
export = Footer;
