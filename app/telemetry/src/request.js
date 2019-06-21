export default function request (options, callback) {
  const req = new XMLHttpRequest() //eslint-disable-line
  req.addEventListener('load', () => {
    callback(req.responseText)
  })

  req.open(options.method, options.url)

  Object.keys(options.headers).forEach(header => {
    req.setRequestHeader(header, options.headers[header])
  })

  req.send(options.body)
}
