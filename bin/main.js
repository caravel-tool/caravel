#! /usr/bin/env node

'use strict'

// If caravel.json not found, return friendly message.
let caravel
try {
  caravel = require(process.cwd() + '/caravel.json')
} catch (e) {
  console.log('┌──────────────────────────────────────────┐')
  console.log('│       Configuration file not found       │')
  console.log('├──────────────────────────────────────────┤')
  console.log('│                                          │')
  console.log('│     You must run Caravel in a folder     │')
  console.log('│  containing a caravel.json config file.  │')
  console.log('│                                          │')
  console.log('└──────────────────────────────────────────┘')
  process.exit()
}

// Handle other dependencies
const pkg = require('../package.json')
const exec = require('child_process').exec
const path = require('path')
const util = require('util')
const rimraf = require('rimraf')
const program = require('commander')
const Caravel = require('./Caravel.js')
const DataLogger = require('./DataLogger.js')
const express = require('express')
const engine = require('express-dot-engine')
const app = express()
const fs = require('fs')

program.version(pkg.version)

program.option('-p, --project', 'Get project name')
program.option('-r, --repo', 'Get repository URL from config file')
program.option('-t, --tutorial', 'See simple tutorial & usage sample')

program.command('checksum').action((url) => {
  Caravel.getChecksum((hash) => {
    console.log(hash)
  })
})

program.command('fetch').action(() => {
  Caravel.fetch()
})

program.command('build')
  .option('-i, --install', 'Use with build command to install dependencies before running build')
	.action((options) => {
  if (options.install) {
    Caravel.installDependenciesAndBuild()
  } else {
    Caravel.build()
  }
})

program.command('watch').action((url) => {
    // Caravel:status server configuration
  app.engine('.html', engine.__express)
  app.set('views', __dirname + '/status/views')
  app.set('view engine', 'dot')
  app.use(express.static(__dirname + '/status/public'))

    // Caravel:Status server routes
  app.get('/', function (req, res) {
    res.render('index.html')
  })

  app.get('/log', (req, res) => {
    DataLogger.getLogs((docs) => {
      res.send(docs)
    })
  })

  app.get('/last', (req, res) => {
    DataLogger.getLastId((id) => {
      res.send({id: id})
    })
  })

  app.get('/details', (req, res) => {
    res.send(caravel)
  })

  // Start Caravel:status server start
  app.listen(7007, () => {

  })

  // Start Watching for repo changes
  Caravel.watch()
})

// Start listening for CLI
program.parse(process.argv)

if (program.project) {
  console.log(caravel.name)
}
if (program.repo) {
  console.log(caravel.repo)
}

if (program.tutorial) {
  console.log('┌──────────────────────────────────────────┐')
  console.log('│             Caravel Tutorial             │')
  console.log('├──────────────────────────────────────────┤')
  console.log('│ 1 - Configure your caravel.json file     │')
  console.log('│     (visit our website for details)      │')
  console.log('│                                          │')
  console.log('│ 2 - Install Caravel on your server       │')
  console.log('│     by running: npm install caravel -g   │')
  console.log('│                                          │')
  console.log('│ 3 - Create a new folder and put your     │')
  console.log('│     caravel.json file there              │')
  console.log('│                                          │')
  console.log('│ 4 - Get into that folder and run:        │')
  console.log('│     caravel fetch && caravel build -i    │')
  console.log('│     (sudo may be needed)                 │')
  console.log('│                                          │')
  console.log('│ 5 - To detect changes and build automat. │')
  console.log('│     use the command: caravel watch       │')
  console.log('│                                          │')
  console.log('│   If you followed step 5 you can also    │')
  console.log('│   check builds at: localhost:7007        │')
  console.log('└──────────────────────────────────────────┘')
}
