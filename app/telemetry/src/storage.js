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
export default {
  storage: {},
  memory: true,
  get(key) {
    let stored
    try {
      stored = (window.localStorage && window.localStorage.getItem(key)) || this.storage[key]
    } catch (e) {
      stored = this.storage[key]
    }
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return undefined
      }
    } else {
      return undefined
    }
  },
  set(key, value) {
    // handle Safari private mode (setItem is not allowed)
    value = JSON.stringify(value)
    try {
      window.localStorage.setItem(key, value)
    } catch (e) {
      if (!this.memory) {
        console.error('setting local storage failed, falling back to in-memory storage')
        this.memory = true
      }
      this.storage[key] = value
    }
  }
}
