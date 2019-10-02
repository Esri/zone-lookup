import Storage from '../storage'

const SESSION_LENGTH = 30 * 60 * 1000
const SESSION_KEY = 'TELEMETRY_SESSION'
const CLIENT_KEY = 'TELEMETRY_CLIENT_ID'

export function getUser () {
  return {
    session: getSession(),
    id: getClientID()
  }
}

function getSession () {
  let newSession
  let session = Storage.get(SESSION_KEY)
  if (!session || Date.now() > session.expiration) {
    newSession = true
    session = generateNewSession()
  }
  session.expiration = Date.now() + SESSION_LENGTH
  Storage.set(SESSION_KEY, session)
  if (newSession) session.new = true
  return session
}

function getClientID () {
  let id = Storage.get(CLIENT_KEY)
  if (!id) {
    id = generateNewClientID()
    Storage.set(CLIENT_KEY, id)
  }
  return id
}

function generateNewSession () {
  return {
    id: Math.floor((1 + Math.random()) * 0x100000000000).toString(16),
    startTimestamp: new Date().toISOString()
  }
}

/*

Copyright 2016 Amazon.com, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
function generateNewClientID () {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
}

function s4 () {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
}
