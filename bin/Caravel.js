'use strict'

// Handle other dependencies
const rimraf = require('rimraf')
const exec = require('child_process').exec
const ncp = require('ncp').ncp
const DataLogger = require('./DataLogger.js')

ncp.limit = 16

const opts = {
  temporaryFolder: 'temp_caravel_files',
  currentTimestamp: 'Not set yet.'
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
    console.log(' ')
    console.log('    Cloning project...')

    let args = this.caravel.branch || 'master'
    args = `-b ${args} --single-branch`
    let cmd = `git clone ${args} ${this.caravel.repo} ${opts.temporaryFolder}`

    rimraf(opts.temporaryFolder, () => {
      let run = exec(cmd, (e, out, err) => {
        if (e) {
          console.log(err)
          process.exit()
        }

        console.log('    [OK] Project cloned.')

        if (cb) {
          cb()
        }
      })

      if (this.caravel.repoPassword) {
        run.stdin.write(this.caravel.repoPassword)
      } else {
        console.log('There isn\'t repo password. Something bad happened.')
      }
    })
  }

  installDependencies (cb) {
    console.log(' ')
    console.log('    Installing npm dependencies (may take a while)...')

    exec(`npm install --prefix ${opts.temporaryFolder}`, (e, out, err) => {
      if (e || err) {
        console.log(err)
        process.exit()
      }

      console.log('    [OK] npm dependencies installed.')

      if (cb) {
        cb()
      }
    })
  }

  build (cb) {
    let self = this

    if (!this.isRunning) {
      DataLogger.insertLog('running')
    }

    // if buildArgs ommited or not an array, return empty array
    if (!this.caravel.buildArgs || !(this.caravel.buildArgs instanceof Array)) {
      this.caravel.buildArgs = []
    }

    // if buildArgs actually have any args... then run them
    if (true) {
      console.log(' ')
      console.log('    Running build scripts...')

      process.chdir(opts.temporaryFolder)

      exec(this.caravel.buildArgs.join(' && '), (e, out, err) => {
        if (e || err) {
          self.isRunning = false
          DataLogger.updateLastLog('error', err + out)
          console.log(e)
          console.log(err)
          console.log(out)
          console.log('    [ERROR] Caravel could not build.')
          process.exit()
        }

        console.log(`    [OK] ${this.caravel.buildArgs.length} scripts performed.`)
        console.log('    [OK] Build scripts finished.')

        ncp(`../${opts.temporaryFolder}/${this.caravel.buildFolder}`, this.caravel.deployDirectory, (err) => {
          if (err) {
            console.error(err)
            process.exit()
          }
          rimraf(`../${opts.temporatyFolder}`, () => {
            if (cb) {
              cb()
            }

            self.isRunning = false
            DataLogger.updateLastLog('success')
            console.log(' ')
            console.log('    [OK] Project successfully delivered!')
            console.log(' ')
            console.log(' ')
          })
        })
      })
    }
  }

  watch (self) {
    self = self || this

    console.log('    Watching for changes...')

    self.getChecksum((hash) => {
      self.hash = hash

      let loop = setInterval(() => {
        self.getChecksum((newHash) => {
          if (self.hash !== newHash) {
            self.hash = newHash
            clearInterval(loop)
            console.log('    Change detected. Re-building...')
            self.fetch(() => {
              self.installDependenciesAndBuildAndWatch(self)
            })
          }
        })
      }, 30000)
    })
  }

  moveBuildFiles () {
    ncp(opts.temporaryFolder, this.caravel.deployDirectory, (err) => {
      if (err) {
        console.error(err)
        process.exit()
      }
      rimraf(opts.temporatyFolder, () => {
        console.log('    [OK] Project successfully delivered.')
      })
    })
  }

  getChecksum (cb) {
    let args = this.caravel.branch || 'HEAD'
    let cmd = `git ls-remote ${this.caravel.repo} ${args}`

    console.log(' ')
    console.log('    Fetching checksum...')

    exec(cmd, (e, out, err) => {
      if (e || err) {
        console.log(e)
        console.log(err)
        console.log(out)
        process.exit()
        console.log('    [ERROR] Caravel could not build.')
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
