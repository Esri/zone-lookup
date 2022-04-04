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
define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, tslib_1, decorators_1, Widget_1, widget_1) {
    "use strict";
    Widget_1 = tslib_1.__importDefault(Widget_1);
    var Notification = /** @class */ (function (_super) {
        tslib_1.__extends(Notification, _super);
        function Notification(params) {
            var _this = _super.call(this, params) || this;
            _this.bundle = null;
            _this.rootNode = null;
            return _this;
        }
        Notification.prototype.postInitialize = function () {
        };
        Notification.prototype.render = function () {
            var _a;
            var noResultsMessage = this.config.noResultsMessage;
            var message = noResultsMessage && noResultsMessage !== "" ? noResultsMessage : (_a = this.config) === null || _a === void 0 ? void 0 : _a.appBundle.noFeatures;
            return (widget_1.tsx("div", null,
                widget_1.tsx("calcite-notice", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "rootNode", scale: "l", width: "auto", icon: "information", active: true, dismissible: true, color: "blue" },
                    widget_1.tsx("div", { slot: "message", innerHTML: message }))));
        };
        Notification.prototype.dismissNotice = function () {
            if (this === null || this === void 0 ? void 0 : this.rootNode) {
                this.rootNode.active = false;
            }
        };
        Notification.prototype.showNotice = function () {
            if (this === null || this === void 0 ? void 0 : this.rootNode) {
                this.rootNode.active = true;
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Notification.prototype, "config", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Notification.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.messageBundle("instant/../t9n/common")
        ], Notification.prototype, "bundle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Notification.prototype, "rootNode", void 0);
        Notification = tslib_1.__decorate([
            decorators_1.subclass("Notification")
        ], Notification);
        return Notification;
    }(Widget_1.default));
    return Notification;
});
