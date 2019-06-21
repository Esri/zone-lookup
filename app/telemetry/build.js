'use strict'

const fs = require('fs')
const del = require('del')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const pkg = require('./package.json')
const includePaths = require('rollup-plugin-includepaths')

const bundles = [
  {
    format: 'umd',
    ext: '.js',
    plugins: []
  },
  {
    format: 'umd',
    ext: '.min.js',
    plugins: [uglify()]
  },
  {
    dojo: true,
    format: 'amd',
    ext: '.dojo.js',
    plugins: []
  },
  {
    dojo: true,
    format: 'amd',
    ext: '.dojo.min.js',
    plugins: [uglify()]
  },
  {
    format: 'amd',
    ext: '.amd.js',
    plugins: []
  },
  {
    format: 'amd',
    ext: '.amd.min.js',
    plugins: [uglify()]
  }
]

let promise = Promise.resolve()

// Clean up the output directory
promise = promise.then(() => del(['dist/*']))

// Compile source code into a distributable format with Babel and Rollup
for (const config of bundles) {
  promise = promise.then(() =>
    rollup
      .rollup({
        entry: 'src/index.js',
        plugins: [
          includePaths({ paths: ['src/amazon', 'src/google'] }),
          babel({
            exclude: 'node_modules/**',
            presets: ['es2015-rollup', 'stage-1'],
            plugins: ['transform-object-assign', 'transform-es2015-destructuring', 'transform-es2015-function-name', 'transform-es2015-parameters']
          })
        ].concat(config.plugins)
      })
      .then(bundle =>
        bundle.write({
          dest: `dist/telemetry${config.ext}`,
          format: config.format,
          sourceMap: !config.minify,
          moduleName: 'Telemetry',
          moduleId: config.dojo ? undefined : 'telemetry'
        })
      )
  )
}

// Copy package.json and LICENSE
promise = promise.then(() => {
  delete pkg.private
  delete pkg.devDependencies
  delete pkg.scripts
  delete pkg.eslintConfig
  delete pkg.babel
  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8')
  fs.writeFileSync('dist/LICENSE', fs.readFileSync('LICENSE', 'utf-8'), 'utf-8')
})

promise.catch(err => console.error(err.stack)) // eslint-disable-line no-console
