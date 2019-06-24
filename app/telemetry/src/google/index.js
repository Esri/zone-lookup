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
export default class Google {
  constructor(options = {}) {
    this.name = 'google'
    Object.assign(this, options)
  }

  logPageView(page, options) {
    const pageviewObj = buildPageViewObject(page, options, this.dimensions, this.metrics)
    getTrackers((trackers) => {
      trackers.forEach((tracker) => {
        tracker.send(pageviewObj)
      })
    })
  }

  logEvent(event) {
    const eventObject = buildEventObject(event, this.dimensions, this.metrics)
    getTrackers(trackers => {
      trackers.forEach(tracker => {
        tracker.send(eventObject)
      })
    })
  }
}

function getTrackers(callback) {
  if (window.ga) {
    window.ga(() => {
      callback(window.ga.getAll())
    })
  } else {
    console.log(new Error('Google Analytics trackers not available'))
  }
}

function buildPageViewObject(page, options, dimensions = {}, metrics = {}) {
  const pageviewObject = {
    hitType: 'pageview',
    page: page || window.location.pathname
  }

  return mapMetricsAndDimensions(pageviewObject, options, dimensions, metrics)
}

function buildEventObject(event, dimensions = {}, metrics = {}) {
  const eventObject = {
    hitType: 'event',
    eventCategory: event.category || 'none',
    eventAction: event.action,
    eventLabel: event.label
  }

  return mapMetricsAndDimensions(eventObject, event, dimensions, metrics)
}

function mapMetricsAndDimensions(inputObject, options, dimensions, metrics) {
  let mappedObject = inputObject

  Object.keys(dimensions).forEach(dimension => {
    mappedObject[`dimension${dimensions[dimension]}`] = options[dimension]
  })

  Object.keys(metrics).forEach(metric => {
    mappedObject[`metric${metrics[metric]}`] = options[metric]
  })

  return mappedObject
}
