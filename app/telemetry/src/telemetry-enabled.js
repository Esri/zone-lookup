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
/*
 * Determines whether or not the telemetry library should be enabled based on passed in options
 */
export default function (options = {}) {
  const portal = options.portal || {}
  if (options.disabled) {
    // Tracking is manually disabled
    return false
  } else if (navigator.doNotTrack === '1') {
    // user's browser has turned off tracking
    return false
  } else if (portal.eueiEnabled) {
    // Portal allows tracking
    return true
  } else if (typeof portal.eueiEnabled !== 'undefined' && portal.eueiEnabled === false) {
    // Portal does not allow tracking
    return false
  } else if (!portal.user && portal.ipCntryCode === 'US') {
    // Anonymous user in the United States on a portal that allows tracking
    return true
  } else if (Object.keys(portal).length > 0) {
    // Initialized with a Portal object but does not meet tracking conditions
    return false
  } else {
    // Default condition not initialized with a Portal-Self object
    return true
  }
}
