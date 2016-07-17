'use strict';


// If caravel.json not found, return friendly message.
let caravel;
try {
    caravel = require(`${process.cwd()} + /caravel.json`);
} catch(e) {
    console.log('You must run Caravel in a folder containing a caravel.json config file.');
    process.exit();
}

// Handle other dependencies
const rimraf       = require('rimraf');
const util         = require('util');
const exec         = require('child_process').exec;
const spawn        = require('child_process').spawn;
const ncp          = require('ncp').ncp;
const DataLogger   = require('./DataLogger.js');

ncp.limit = 16;

const opts = {
    temporaryFolder: 'temp_caravel_files',
    currentTimestamp: 'Not set yet.'
}

class Caravel {
    
    constructor() {
        this.isRunning = false;
    }

    fetch(cb) {
        console.log('    Cloning project...')

        let args = caravel.branch || 'master';
        args = `-b ${args} --single-branch`;
        let cmd = `git clone ${args} ${caravel.repo} ${opts.temporaryFolder}`;

        rimraf(opts.temporaryFolder, () => {
            let run = exec(cmd, (e, out, err) => {
                if(e) {
                    console.log(err);
                    process.exit();
                }

                console.log('    [OK] Project cloned.');
                if(cb) {
                    cb();
                }
            });
            
            if(caravel.repoPassword) {
                run.stdin.write(caravel.repoPassword);
            }else {
                console.log('Deu merda');
            }
            
            
        });
    }

    installDependencies(cb) {
        console.log('    Installing npm dependencies (may take a while)...');
        exec(`npm install --prefix ${opts.temporaryFolder}`, (e, out, err) => {
            if(e || err) {
                console.log(err);
                process.exit();
            }

            console.log('    [OK] npm dependencies installed.');

            if(cb) {
                cb();
            }
        });
    }

    build(cb) {
        console.log(this);
        let self = this;
        
        if(!this.isRunning) {
            DataLogger.insertLog('running');
        }

        // if buildArgs ommited or not an array, return empty array
        if(!caravel.buildArgs || !(caravel.buildArgs instanceof Array)) {
            caravel.buildArgs = [];
        }

        // if buildArgs actually have any args... then run them
        if(caravel.buildArgs.length > 0) {
            console.log('    Running build scripts...')

            process.chdir(opts.temporaryFolder);

            exec(caravel.buildArgs.join(' && '), (e, out, err) => {
                if(e || err) {
                    self.isRunning = false;
                    DataLogger.updateLastLog('error', err + out);
                    console.log(e);
                    console.log(err);
                    console.log(out);
                    console.log('    [ERROR] Caravel could not build.');
                    process.exit();

                }
                console.log('    [OK] build scripts finished.');

                ncp(`../${opts.temporaryFolder}/${caravel.buildFolder}`, caravel.deployDirectory, (err) => {
                    if(err) {
                        console.error(err);
                        process.exit();
                    }
                    rimraf(`../${opts.temporatyFolder}`, () => {
                        if(cb) {
                            cb();
                        }
                        self.isRunning = false;
                        DataLogger.updateLastLog('success');
                        console.log('    [OK] Project successfully delivered.');
                    });
                });

            });
        }
    }

    watch(self) {
        self = self || this;

        console.log('    Watching for changes...');

        self.getChecksum((hash) => {
            self.hash = hash;

            let loop = setInterval(() => {
                self.getChecksum((newHash) => {
                    if(self.hash != newHash) {
                        self.hash = newHash;
                        clearInterval(loop);
                        console.log('    Change detected. Re-building...');
                        self.fetch(() => {
                            self.installDependenciesAndBuildAndWatch(self);
                        });
                    }
                });
            }, 30000);
        });

    }

    moveBuildFiles() {

        ncp(opts.temporaryFolder, caravel.deployDirectory, (err) => {
            if(err) {
                console.error(err);
                process.exit();
            }
            rimraf(opts.temporatyFolder, () => {
                console.log('    [OK] Project successfully delivered.');
            });
        });
    }

    getChecksum(cb) {
        let args = caravel.branch || 'HEAD';
        let cmd = `git ls-remote ${caravel.repo} ${args}`;

        exec(cmd, (e, out, err) => {
            if(e || err) {
                console.log(e);
                console.log(err);
                console.log(out);
                process.exit();
                throw "    [ERROR] Caravel could not build.";
            }
            let hash = out.split('\n')[0].replace(/\s{1,}.+/, '');
            if(cb) {
                cb(hash);
            }
        });

    }

    installDependenciesAndBuild() {
        DataLogger.insertLog('running');
        this.isRunning = true;
        this.installDependencies(() => {
            this.build();   
        });
    }

    installDependenciesAndBuildAndWatch(self) {
        DataLogger.insertLog('running');
        self.isRunning = true;
        self.installDependencies(() => {
            self.build(() => {
                self.watch(self);
            });
        });
    }

}

module.exports = new Caravel();
