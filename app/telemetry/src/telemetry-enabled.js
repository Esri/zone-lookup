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
