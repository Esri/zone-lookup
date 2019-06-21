import { getCredentials } from './auth'
import { getUser } from './user'
import AwsSigner from './signer'
import request from '../request'

const METRICS = ['size', 'duration', 'position', 'number', 'count']
const DEFAULT_ENDPOINT = 'https://mobileanalytics.us-east-1.amazonaws.com/2014-06-05/events'

export default class Amazon {
  constructor (options) {
    this.name = 'amazon'
    Object.assign(this, options)
    const session = getUser().session
    if (session.new && !options.test) this.logEvent({ eventType: '_session.start' })
  }

  logPageView (page, options) {
    const event = createPageView(page, this.previousPage, options)
    sendTelemetry(event, this.userPoolID, this.app)
    this.previousPage = event.attributes
  }

  logEvent (event) {
    const events = createEventLog(event)
    sendTelemetry(events, this.userPoolID, this.app)
  }
}

function createPageView (page, previousPage = {}, options = {}) {
  const session = getUser().session
  return {
    eventType: 'pageView',
    timestamp: new Date().toISOString(),
    session: {
      id: session.id,
      startTimestamp: session.startTimestamp
    },
    attributes: {
      referrer: document.referrer,
      hostname: window.location.hostname,
      path: page || window.location.pathname,
      pageUrl: page || window.location.pathname,
      pageName: document.title,
      previousPageUrl: previousPage.pageUrl,
      previousPageName: previousPage.pageName,
      ...extractAttributes(options)
    },
    metrics: extractMetrics(options)
  }
}

function createEventLog (event) {
  const session = getUser().session
  return {
    eventType: event.eventType || 'other',
    timestamp: new Date().toISOString(),
    session: {
      id: session.id,
      startTimestamp: session.startTimestamp
    },
    attributes: {
      referrer: document.referrer,
      hostname: window.location.hostname,
      path: window.location.pathname,
      ...extractAttributes(event)
    },
    metrics: extractMetrics(event)
  }
}

function extractAttributes (event) {
  const attributes = Object.assign({}, event)
  delete attributes.workflow
  METRICS.forEach(metric => delete attributes[metric])
  Object.keys(attributes).forEach(attr => {
    if (attr === 'json') {
      attributes[attr] = attributes[attr] ? JSON.stringify(attributes[attr]) : 'null'
    } else {
      attributes[attr] = attributes[attr] !== undefined ? attributes[attr].toString() : 'null'
    }
  })
  return attributes
}

function extractMetrics (event) {
  const metrics = {}
  METRICS.forEach(metric => {
    if (event[metric]) metrics[metric] = event[metric]
  })
  return metrics
}

function createHeaders (credentials = {}, options) {
  const config = {
    region: 'us-east-1',
    service: 'mobileanalytics',
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretKey,
    sessionToken: credentials.SessionToken
  }
  const signer = new AwsSigner(config)
  const signed = signer.sign(options)
  return signed
}

function createClientContext (clientId, app) {
  // eslint-disable-line
  return JSON.stringify({
    client: {
      client_id: clientId,
      app_title: app.name,
      app_version_name: app.version || 'unknown'
    },
    services: {
      mobile_analytics: {
        app_id: app.id
      }
    }
  })
}

function sendTelemetry (events, userPoolID, app) {
  const user = getUser()
  events = Array.isArray(events) ? events : [events]
  const options = createTelemetryOptions(events)
  getCredentials(userPoolID, credentials => {
    try {
      options.headers = createHeaders(credentials, options)
      options.headers['x-amz-Client-Context'] = createClientContext(user.id, app)
    } catch (e) {
      console.error(e)
      return
    }
    request(options, response => {
      if (response) {
        console.error(JSON.parse(response))
      }
    })
  })
}

function createTelemetryOptions (events, url = DEFAULT_ENDPOINT) {
  return {
    url,
    method: 'POST',
    body: JSON.stringify({
      events
    })
  }
}
