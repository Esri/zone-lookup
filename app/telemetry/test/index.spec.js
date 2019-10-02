const test = require('tape')

const Telemetry = require('./helpers/telemetry')
const portal = require('./fixtures/portal-self.json')
const portalPublic = require('./fixtures/public-user-self.json')
const portalAnonymous = require('./fixtures/portal-self-anonymous.json')

const options = {
  test: true,
  amazon: {
    userPoolID: 'us-east-1:aed3c2fe-4d28-431f-abb0-fca6e3167a25',
    app: {
      name: 'test',
      id: '36c5713d9d75496789973403b13548fd',
      version: '1.0'
    }
  }
}

const telemetry = new Telemetry(Object.assign({}, options, { portal }))

test('initiate telemetry w/ portal self and an internal user', t => {
  let telemetry
  const opts = Object.assign({}, options, { portal })
  try {
    telemetry = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.equal(telemetry.user.username, 'DFenton_dcdev', 'picked up correct user name')
  t.equal(telemetry.user.accountType, 'In House')
  t.equal(telemetry.user.internalUser, true, 'detected internal user')
  t.end()
})

test('initiate telemetry w/ portal self and a public user', t => {
  let publicUser
  const opts = Object.assign({}, options, { portal: portalPublic })
  try {
    publicUser = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.equal(publicUser.user.username, 'foobarbaz-google', 'picked up correct user name')
  t.equal(publicUser.user.accountType, 'Public', 'set correct account type')
  t.notOk(publicUser.user.internalUser, 'detected external user')
  t.end()
})

test('disabled with eueiEnabled: false', t => {
  let telemetry2
  const opts = Object.assign({}, options, { portal }, { portal: { eueiEnabled: false } })
  try {
    telemetry2 = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.notOk(telemetry2.logPageView())
  t.end()
})

test('enabled for public anonymous user', t => {
  let anonymous
  const opts = Object.assign({}, options, { portal: portalAnonymous })
  try {
    anonymous = new Telemetry(opts)
  } catch (e) {
    t.fail(e)
  }
  t.ok(anonymous.logPageView(), 'tracking works')
  t.end()
})

test('log a page view', t => {
  const event = telemetry.logPageView('/foobar', {})
  t.notEqual(event.user, 'DFenton_dcdev', 'username is obfuscated')
  t.notEqual(event.orgId, 'bkrWlSKcjUDFDtgw', 'org id is obfuscated')
  t.equal(event.internalUser, true, 'detected internal user')
  t.equal(event.lastLogin, 1509983757000, 'included last login')
  t.equal(event.userSince, 1405088999000, 'included last user since')
  t.end()
})

test('log a workflow end to end', t => {
  telemetry.startWorkflow('test')
  t.deepEqual(telemetry.workflows.test.steps, ['start'], 'collected workflow start')
  const workflowId = telemetry.workflows.test.workflowId
  t.ok(workflowId, 'workflow has an id')

  telemetry.stepWorkflow('test', 'step 1')
  t.deepEqual(telemetry.workflows.test.steps, ['start', 'step 1'], 'collected first workflow step')
  t.equal(telemetry.workflows.test.workflowId, workflowId, 'workflow id is maintained')

  telemetry.stepWorkflow('test', 'step 2')
  t.deepEqual(telemetry.workflows.test.steps, ['start', 'step 1', 'step 2'], 'collected second workflow step')
  t.equal(telemetry.workflows.test.workflowId, workflowId, 'workflow id is maintained')

  telemetry.endWorkflow('test')
  t.notOk(telemetry.workflows.test, 'ended and deleted workflow')
  t.end()
})

test('cancel and replay a workflow', t => {
  telemetry.startWorkflow('test')
  telemetry.stepWorkflow('test', 'step a')
  telemetry.cancelWorkflow('test')
  t.notOk(telemetry.workflows.test, 'canceled and deleted workflow')

  telemetry.startWorkflow('test')
  telemetry.stepWorkflow('test', 'step b')
  t.deepEqual(telemetry.workflows.test.steps, ['start', 'step b'], 'did not included canceled step')

  telemetry.endWorkflow('test')
  t.notOk(telemetry.workflows.test, 'ended and deleted workflow')

  t.end()
})

test('start a workflow with a step', t => {
  telemetry.stepWorkflow('test', 'step c')
  t.deepEqual(telemetry.workflows.test.steps, ['start', 'step c'])

  telemetry.endWorkflow('test')
  t.notOk(telemetry.workflows.test, 'ended and deleted workflow')

  t.end()
})

test('Set demo and marketing org type to internal', t => {
  telemetry.setUser({ username: 'foobar', email: 'foo@bar.com' }, 'Demo and Marketing')
  t.ok(telemetry.user.internalUser, 'detected internal user')
  t.end()
})

test('Set in house org type to internal', t => {
  telemetry.setUser({ username: 'foobar', email: 'foo@bar.com' }, 'In House')
  t.ok(telemetry.user.internalUser, 'detected internal user')
  t.end()
})

test('init with the wrong type of options', t => {
  t.plan(1)
  try {
    new Telemetry('foobar') // eslint-disable-line
    t.pass('error not thrown')
  } catch (e) {
    t.fail('error should not be thrown')
  }
})
