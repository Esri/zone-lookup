import request from '../request'
import Storage from '../storage'

const COGNITO_KEY = 'TELEMETRY_COGNITO_CREDENTIALS'
const COGNITO_URL = 'https://cognito-identity.us-east-1.amazonaws.com/'

export function getCredentials (IdentityPoolId, callback) {
  let cached = Storage.get(COGNITO_KEY)
  if (cached && Date.now() / 1000 < cached.Expiration) return callback(cached)

  authWithCognito(IdentityPoolId, credentials => {
    Storage.set(COGNITO_KEY, credentials)
    callback(credentials)
  })
}

function authWithCognito (IdentityPoolId, callback) {
  const options = Object.assign({}, defaults)
  options.headers['X-Amz-Target'] = 'AWSCognitoIdentityService.GetId'
  options.body = JSON.stringify({ IdentityPoolId })

  request(options, response => {
    requestCredentials(JSON.parse(response), callback)
  })
}

function requestCredentials (json, callback) {
  const options = Object.assign({}, defaults)
  options.headers['X-Amz-Target'] = 'AWSCognitoIdentityService.GetCredentialsForIdentity'
  options.body = JSON.stringify({ IdentityId: json.IdentityId })

  request(options, response => {
    const json = JSON.parse(response)
    callback(json.Credentials)
  })
}

const defaults = {
  method: 'POST',
  url: COGNITO_URL,
  headers: {
    'Content-type': 'application/x-amz-json-1.1'
  }
}
