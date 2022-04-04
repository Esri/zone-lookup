/*
 *   Copyright (c) 2021 Esri
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import AppConfig from "../ConfigurationSettings";

import { tsx, messageBundle, storeNode } from "esri/widgets/support/widget";
import { esriWidgetProps } from "../interfaces/interfaces";

@subclass("Notification")
class Notification extends Widget {
    @property()
    config: AppConfig;
    @property()
    view: __esri.MapView;
    @property()
    @messageBundle("instant/../t9n/common")
    bundle: any = null;
    @property()
    rootNode: any = null;
    constructor(params: esriWidgetProps) {
        super(params);
    }
    postInitialize() {

    }
    render() {
        const { noResultsMessage } = this.config;
        const message = noResultsMessage && noResultsMessage !== "" ? noResultsMessage : this.config?.appBundle.noFeatures;
        return (
            <div>
                <calcite-notice bind={this} afterCreate={storeNode} data-node-ref="rootNode" scale="l" width="auto" icon="information" active dismissible color="blue" >
                    <div slot="message" innerHTML={message}>
                    </div>
                </calcite-notice>
            </div>
        )
    }

    dismissNotice() {
        if (this?.rootNode) {
            this.rootNode.active = false;
        }
    }
    showNotice() {
        if (this?.rootNode) {
            this.rootNode.active = true;
        }
    }

}

export = Notification;
