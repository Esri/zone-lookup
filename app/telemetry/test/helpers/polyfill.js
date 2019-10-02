const Window = require('window')
global.window = new Window()
global.document = window.document
global.navigator = window.navigator
const { LocalStorage } = require('node-localstorage')
global.window.localStorage = new LocalStorage('./scratch')
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
