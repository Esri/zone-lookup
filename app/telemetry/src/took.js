// export default class Took {
//   constructor (options, maxDurationExceededCallback) {
//     this.ensureWindowPerformance()
//     this.payload = options
//     this.payload.start = window.performance.now()
//
//     if (options.maxDuration) {
//       this.timer = window.setTimeout(this._maxDurationExceeded.bind(this), options.maxDuration)
//     }
//     // TODO: validate function
//     if (maxDurationExceededCallback && typeof maxDurationExceededCallback === 'function') {
//       this.maxDurationExceededCallback = maxDurationExceededCallback
//     }
//   }
//
//   _maxDurationExceeded () {
//     console.log('TOOK: MAX DURATION EXCEEDED')
//     this.payload.meta = this.payload.meta || {}
//     this.payload.meta.message = 'Timer exceeded maxDuration'
//
//     if (this.maxDurationExceededCallback) {
//       console.log('Calling the maxDurationExceededCallback')
//       this.maxDurationExceededCallback(this.payload.eventName)
//     }
//   }
//
//   stop () {
//     this.payload.end = window.performance.now()
//
//     if (this.timer) {
//       window.clearTimeout(this.timer)
//     }
//     // calc the duration
//     this.payload.duration = this.payload.end - this.payload.start
//   }
//
//   log () {
//     console.log('Telemetry: ' + this.payload.eventName + ' took ' + this.payload.duration + 'ms')
//   }
//
//   ensureWindowPerformance () {
//     window.performance = window.performance || {}
//     window.performance.now =
//            window.performance.now ||
//            window.performance.webkitNow ||
//            window.performance.msNow ||
//            window.performance.oNow ||
//            window.performance.mozNow ||
//            function () { return new Date().getTime() }
//   }
// }
