#! /usr/bin/env node

'use strict'

// Handle other dependencies
const path = require('path')
const pkg = require('../package.json')
const program = require('commander')
const Caravel = require('./Caravel.js')
const DataLogger = require('./DataLogger.js')
const express = require('express')
const engine = require('express-dot-engine')
const app = express()

program.version(pkg.version)

program.option('-p, --project', 'Get project name')
program.option('--port [port]', 'Define port for watch task')
program.option('-r, --repo', 'Get repository URL from config file')
program.option('-t, --tutorial', 'See simple tutorial & usage sample')

program.command('checksum').action((url) => {
  console.log('    Getting checksum...')
  Caravel.getChecksum((hash) => {
    console.log(`    ${hash}`)
    console.log(' ')
  })
})

program.command('fetch').action(() => {
  Caravel.fetch()
})

program.command('build')
  .option('-n, --no-install', 'Do\'t run \'npm install\' before build')
	.action((options) => {
  let args = options.parent.rawArgs
  if (args.indexOf('--no-install') > -1 || args.indexOf('-n') > -1) {
    Caravel.build()
  } else {
    Caravel.installDependenciesAndBuild()
  }
})

program.command('watch')
  .option('-n, --no-install', 'Do\'t run \'npm install\' before build')
  .action((options) => {
    let args = options.parent.rawArgs
    let port = program.port || 7007

    // Caravel:status server configuration
    app.engine('.html', engine.__express)
    app.set('views', path.join(__dirname, '/status/views'))
    app.set('view engine', 'dot')
    app.use(express.static(path.join(__dirname, '/status/public')))

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
      res.send(Caravel.config)
    })

    // Start Caravel:status server start
    app.listen(port, () => {

    })

    // Start Watching for repo changes
    Caravel.watch(false, args)
  })

// Start listening for CLI
program.parse(process.argv)

if (program.project) {
  console.log(Caravel.config.name)
}
if (program.repo) {
  console.log(Caravel.config.repo)
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
  console.log('│     caravel fetch && caravel build       │')
  console.log('│     (sudo may be needed)                 │')
  console.log('│                                          │')
  console.log('│ 5 - To detect changes and build automat. │')
  console.log('│     use the command: caravel watch       │')
  console.log('│                                          │')
  console.log('│   If you followed step 5 you can also    │')
  console.log('│   check builds at: localhost:7007        │')
  console.log('└──────────────────────────────────────────┘')
}
