'use strict'

// Handle other dependencies
const path = require('path')
const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const exec = require('child_process').exec
const DataLogger = require('./DataLogger.js')

ncp.limit = 16

const opts = {
  currentTimestamp: 'Not set yet.',
  temporaryFolder: 'temp_caravel_files'
}

class Caravel {

  constructor () {
    this.isRunning = false
    try {
      this.caravel = require(`${process.cwd()}/caravel.json`)
    } catch (e) {
      this.configNotFoundMessage()
    }
  }

  fetch (cb) {
    this.console('Cloning project...')

    let args = this.caravel.branch || 'master'
    args = `-b ${args} --single-branch`
    let cmd = `git clone ${args} ${this.caravel.repo} ${opts.temporaryFolder}`

    rimraf(opts.temporaryFolder, () => {
      let run = exec(cmd, (e, out, err) => {
        if (e) {
          console.log(err)
          process.exit()
        }

        this.console('[OK] Project cloned.')

        if (cb) {
          cb()
        }
      })

      if (this.caravel.repoPassword) {
        run.stdin.write(this.caravel.repoPassword)
      } else {
        this.console('There isn\'t repo password. Something bad happened.')
      }
    })
  }

  installDependencies (cb) {
    this.console('Installing npm dependencies (may take a while)...')

    exec(`npm install --prefix ${opts.temporaryFolder}`, (e, out, err) => {
      if (e || err) {
        console.log(err)
        process.exit()
      }

      this.console('[OK] npm dependencies installed.')

      if (cb) {
        cb()
      }
    })
  }

  build (cb) {
    if (!this.isRunning) {
      DataLogger.insertLog('running')
    }

    // if buildArgs ommited or not an array, return empty array
    if (!this.caravel.buildArgs || !(this.caravel.buildArgs instanceof Array)) {
      this.caravel.buildArgs = []
    }

    // get into temporary folder
    process.chdir(opts.temporaryFolder)

    // if buildArgs actually have any args... then run them
    if (this.caravel.buildArgs.length > 0) {
      this.console('Running build scripts...')
      exec(this.caravel.buildArgs.join(' && '), (e, out, err) => {
        this.buildMoveFiles(true)
      })
    // else, just move files from git into production
    } else {
      this.buildMoveFiles(false)
    }
  }

  buildHandleExecution (e, out, err) {
    if (e || err) {
      this.isRunning = false
      DataLogger.updateLastLog('error', err + out)
      console.log(e)
      console.log(err)
      console.log(out)
      this.console('[ERROR] Caravel could not build.')
      process.exit()
    }

    this.console(`[OK] ${this.caravel.buildArgs.length} scripts performed.`)
    this.console('[OK] Build scripts finished.')
  }

  buildMoveFiles (hasBuild) {
    let path = './'

    // If build exists, copy files from build folder
    // instead of temporary git folder
    if (hasBuild) {
      path = path.join('../', `${opts.temporaryFolder}`, `${this.caravel.buildFolder}`)
    }

    // Copy files
    ncp(path, this.caravel.deployDirectory, (err) => {
      if (err) {
        console.error(err)
        process.exit()
      }
      rimraf(`../${opts.temporatyFolder}`, () => {
        this.isRunning = false
        DataLogger.updateLastLog('success')
        this.console('[OK] Project successfully delivered!')
      })
    })
  }

  watch (self) {
    self = self || this

    this.console('Watching for changes...')

    self.getChecksum((hash) => {
      self.hash = hash

      let loop = setInterval(() => {
        self.getChecksum((newHash) => {
          if (self.hash !== newHash) {
            self.hash = newHash
            clearInterval(loop)
            this.console('Change detected. Re-building...')
            self.fetch(() => {
              self.installDependenciesAndBuildAndWatch(self)
            })
          }
        })
      }, this.caravel.watchInterval || 30000)
    })
  }

  getChecksum (cb) {
    let args = this.caravel.branch || 'HEAD'
    let cmd = `git ls-remote ${this.caravel.repo} ${args}`

    this.console('Fetching checksum...')

    exec(cmd, (e, out, err) => {
      if (e || err) {
        console.log(e)
        console.log(err)
        console.log(out)
        process.exit()
        this.console('[ERROR] Caravel could not build.')
        return
      }
      let hash = out.split('\n')[0].replace(/\s{1,}.+/, '')
      if (cb) {
        cb(hash)
      }
    })
  }

  installDependenciesAndBuild () {
    DataLogger.insertLog('running')
    this.isRunning = true
    this.installDependencies(() => {
      this.build()
    })
  }

  installDependenciesAndBuildAndWatch (self) {
    DataLogger.insertLog('running')
    self.isRunning = true
    self.installDependencies(() => {
      self.build(() => {
        self.watch(self)
      })
    })
  }

  console (text) {
    console.log('    ' + text)
  }

  consolePadded (text) {
    console.log(' ')
    console.log('    ' + text)
  }

  configNotFoundMessage () {
    console.log('┌──────────────────────────────────────────┐')
    console.log('│       Configuration file not found       │')
    console.log('├──────────────────────────────────────────┤')
    console.log('│                                          │')
    console.log('│     You must run Caravel in a folder     │')
    console.log('│  containing a caravel.json config file.  │')
    console.log('│                                          │')
    console.log('└──────────────────────────────────────────┘')
    return
  }

  get config () {
    return this.caravel
  }
}

module.exports = new Caravel()
