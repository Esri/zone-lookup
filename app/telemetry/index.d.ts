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
declare module 'telemetry/telemetry.dojo' {
	import Portal = require('esri/portal/Portal');

	class Telemetry {
		disabled: boolean;
		logPageView(): void;
		logEvent(args: {
			category: string;
			action: string;
			label: string;
			datasetID?: string;
			attribute?: string;
			user?: string;
		}): void;
		logError(args: { error: string; urlRequested?: string; statusCode?: number }): void;
		constructor(args: {
			debug?: boolean;
			disabled?: boolean;
			amazon?: {
				userPoolID: string;
				app: {
					name: string;
					id: string;
					version: string;
				};
			};
			portal?: Portal;
		});
	}
	export = Telemetry;
}
