import Amazon from './amazon'
import Google from './google'
import anonymize from './anonymize'
import internalOrgs from './internal-orgs'
import telemetryEnabled from './telemetry-enabled'

export default class Telemetry {
  constructor (options) {
    // Make sure failure to init this library cannot have side-effects
    try {
      this.trackers = []
      this.workflows = {}
      this.test = options.test
      this.debug = options.debug

      this.disabled = !telemetryEnabled(options)
      if (this.disabled) console.log('Telemetry Disabled')

      if (options.portal && options.portal.user) {
        const subscriptionInfo = options.portal.subscriptionInfo || {}
        this.setUser(options.portal.user, subscriptionInfo.type)
      } else if (options.user) {
        this.setUser(options.user)
      }

      if (!this.disabled) {
        this._initTrackers(options)
      }
    } catch (e) {
      console.error('Telemetry Disabled')
      console.error(e)
      this.disabled = true
    }
  }

  _initTrackers (options) {
    if (options.amazon) {
      const amazon = new Amazon(options.amazon)
      this.trackers.push(amazon)
    }

    if (options.google) {
      const google = new Google(options.google)
      this.trackers.push(google)
    }
    if (!this.trackers.length) console.error(new Error('No trackers configured'))
  }

  setUser (user = {}, orgType = 'Public') {
    user = typeof user === 'string' ? { username: user } : user
    this.user = user
    this.user.accountType = orgType
    let internalDomain
    if (user.email && user.email.split) {
      const domain = user.email.split('@')[1]
      internalDomain =
        internalOrgs.filter(org => {
          return domain === org
        }).length > 0
    }

    if (internalDomain || ['In House', 'Demo and Marketing'].indexOf(orgType) > -1) {
      this.user.internalUser = true
    }
  }

  logPageView (page, options = {}) {
    const attributes = this.preProcess(options)
    if (this.debug) console.log('Tracking page view', JSON.stringify(attributes))
    else if (this.test && !this.disabled) return attributes

    if (!this.trackers.length || this.disabled) {
      if (!this.disabled) console.error(new Error('Page view was not logged because no trackers are configured.'))
      return false
    } else {
      this.trackers.forEach(tracker => {
        try {
          tracker.logPageView(page, attributes)
        } catch (e) {
          console.error(`${tracker.name} tracker failed to log page view.`, e)
        }
      })
      return true
    }
  }

  logEvent (options = {}) {
    const event = this.preProcess(options)

    if (this.debug) console.log('Tracking event', JSON.stringify(event))
    else if (this.test) return event

    if (!this.trackers.length || this.disabled) {
      if (!this.disabled) console.error(new Error('Event was not logged because no trackers are configured.'))
      return false
    } else {
      this.trackers.forEach(tracker => {
        try {
          tracker.logEvent(event)
        } catch (e) {
          console.error(`${tracker.name} tracker failed to log event`, e)
        }
      })
      return true
    }
  }

  logError (options = {}) {
    const event = Object.assign({ eventType: 'error' }, options)
    this.logEvent(event)
  }

  startWorkflow (name, attributes = {}) {
    const workflow = {
      name,
      start: Date.now(),
      steps: [],
      workflowId: Math.floor((1 + Math.random()) * 0x100000000000).toString(16)
    }
    this.workflows[name] = workflow
    const workflowObj = Object.assign({ name, step: 'start' }, attributes)
    this._logWorkflow(workflowObj)
    return workflow
  }

  stepWorkflow (name, step, attributes = {}) {
    const details = typeof options === 'string' ? attributes : attributes.details
    const workflowObj = Object.assign({ name, step, details }, attributes)
    this._logWorkflow(workflowObj)
  }

  endWorkflow (name, attributes = {}) {
    const workflowObj = Object.assign({ name, step: 'finish' }, attributes)
    this._logWorkflow(workflowObj)
    delete this.workflows[name]
  }

  cancelWorkflow (name, attributes = {}) {
    const workflowObj = Object.assign({ name, step: 'cancel' }, attributes)
    this._logWorkflow(workflowObj)
    delete this.workflows[name]
  }

  _logWorkflow (options = {}) {
    /*
    const workflow = {
      name: 'add layer to map',
      step: 'start',
      details: 'some details about the step'
    }
    */
    options = this.preProcess(options)
    let workflow = this.workflows[options.name]
    if (!workflow) {
      workflow = this.startWorkflow(options.name)
    }

    workflow.steps.push(options.step)
    workflow.duration = (Date.now() - workflow.start) / 1000

    const track = Object.assign(options, {
      eventType: 'workflow',
      category: options.name,
      action: options.step,
      label: options.details,
      duration: workflow.duration,
      workflowId: workflow.workflowId
    })

    this.logEvent(track)
  }

  preProcess (options = {}) {
    let userOptions = {}
    if (this.user) {
      userOptions = {
        user: anonymize(this.user.username),
        orgId: anonymize(this.user.orgId),
        lastLogin: this.user.lastLogin,
        userSince: this.user.created,
        internalUser: this.user.internalUser || false,
        accountType: this.user.accountType
      }
    }

    return Object.assign({}, options, userOptions)
  }
}
