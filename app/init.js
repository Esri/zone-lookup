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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "dojo/text!config/applicationBase.json", "dojo/text!config/application.json", "ApplicationBase/ApplicationBase", "./Main", "dojo/i18n!./nls/resources", "./utilites/errorUtils"], function (require, exports, applicationBaseConfig, applicationConfig, ApplicationBase, Application, i18n, errorUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    errorUtils = __importStar(errorUtils);
    var Main = new Application();
    new ApplicationBase({
        config: applicationConfig,
        settings: applicationBaseConfig
    })
        .load()
        .then(function (base) { return Main.init(base); }, function (message) {
        if (message === "identity-manager:not-authorized") {
            errorUtils.displayError({
                title: i18n.licenseError.title,
                message: i18n.licenseError.message
            });
        }
    });
});
//# sourceMappingURL=init.js.map