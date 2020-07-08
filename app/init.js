/*
  Copyright 2017 Esri

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
define(["require", "exports", "tslib", "dojo/text!config/applicationBase.json", "dojo/text!config/application.json", "ApplicationBase/ApplicationBase", "./Main", "dojo/i18n!./nls/resources", "./utilites/errorUtils", "./components/unsupported/UnsupportedBrowser"], function (require, exports, tslib_1, applicationBaseConfig, applicationConfig, ApplicationBase, Application, i18n, errorUtils, UnsupportedBrowser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    errorUtils = tslib_1.__importStar(errorUtils);
    UnsupportedBrowser_1 = tslib_1.__importDefault(UnsupportedBrowser_1);
    var Main = new Application();
    new ApplicationBase({
        config: applicationConfig,
        settings: applicationBaseConfig
    })
        .load()
        .then(function (base) {
        if (base["isIE"]) {
            // load unsupported browser and show message 
            new UnsupportedBrowser_1.default({
                isIE11: base["isIE"],
                container: document.body
            });
            var container = document.getElementById("appMain");
            if (container) {
                container.classList.add("hide");
            }
            document.body.classList.remove("no-map");
            document.body.classList.remove("configurable-application--loading");
            return;
        }
        Main.init(base);
    }, function (message) {
        if (message === "identity-manager:not-authorized") {
            errorUtils.displayError({
                title: i18n.licenseError.title,
                message: i18n.licenseError.message
            });
        }
    });
});
//# sourceMappingURL=init.js.map