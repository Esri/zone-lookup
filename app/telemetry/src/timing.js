// import took from './took';
//
// /**
//  * Start a timer that will either kill itself
//  * or be stopped by a call to StopTimer
//  */
// export function setTimer (actionName, maxDuration, meta) {
//   var sid = this.get('sessionId');
//   var route = getOwner(this).lookup('router:main').get('url');
//
//   if (!this.timers) {
//     this.timers = {};
//   }
//   var obj = {
//     session: sid,
//     route: route,
//     action: actionName,
//     maxDuration: 20000,
//     meta: {
//       category: 'Timing'
//     }
//   };
//   // if optional args are passes, tack them on
//   if (meta) {
//     obj.meta = meta;
//   }
//   if (maxDuration) {
//     obj.maxDuration = maxDuration;
//   }
//
//   if (this.timers[actionName]) {
//     // console.log('There is already an timer running for event "' + actionName + '". Can you use another name?');
//   } else {
//     var t = new Took(obj, this.stopTimer.bind(this));
//
//     this.timers[actionName] = t;
//   }
// }
//
// /**
//  * Stop a timer by name and send the telemetry
//  */
// export function stopTimer (actionName) {
//   var self = this;
//   if (self.timers && self.timers[actionName]) {
//     self.timers[actionName].stop();
//     self.timers[actionName].log();
//
//     self._sendTelemetry('timing', self.timers[actionName].payload)
//     .then(function () {
//       // TODO: Figure out if we are leaking
//       if (self.timers[actionName].maxDurationExceededCallback) {
//         self.timers[actionName].maxDurationExceededCallback = null;
//       }
//       delete self.timers[actionName];
//     });
//   } else {
//     // console.log('TELEMETRY SERVICE:STOPTIMER No timer running for event "' + actionName + '".');
//   }
// }
