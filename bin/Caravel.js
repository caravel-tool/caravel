'use strict';

const caravel      = require('../caravel.json');
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
        var self = this;
    }

	fetch(cb) {
        console.log('    Cloning project...')

        let args = caravel.branch || 'master';
        args = '-b ' + args + ' --single-branch';
        let cmd = "git clone " + " " + args + " " + caravel.repo + " " + opts.temporaryFolder;

		rimraf(opts.temporaryFolder, () => {
            exec(cmd, (e, out, err) => {
                if(e) {
                    console.log(err);
                }

				console.log('    [OK] Project cloned.');
                if(cb) {
                    cb();
                }
			});
		});
	}

    installDependencies(cb) {
        console.log('    Installing npm dependencies (may take a while)...')
        exec('npm install --prefix ' + opts.temporaryFolder, (e, out, err) => {
            if(e || err) {
                console.log(err);
            }
            console.log('    [OK] npm dependencies installed.');
            if(cb) {
                cb();
            }
    	});
    }

    build(cb) {
        var self = this;

    	if(caravel.buildArgs instanceof Array && caravel.buildArgs.length > 0) {
            console.log('    Running build scripts...')
            DataLogger.insertLog('running');

            process.chdir(opts.temporaryFolder);

            exec(caravel.buildArgs.join(' && '), (e, out, err) => {
                if(e || err) {
                    DataLogger.updateLastLog('error', err + out);
                    console.log(e);
                    console.log(err);
                    console.log(out);
                    console.log('    [ERROR] Caravel could not build.');

                }
                console.log('    [OK] build scripts finished.');

                ncp('../' + opts.temporaryFolder + '/' + caravel.buildFolder, caravel.deployDirectory, (err) => {
                    if(err) {
                        return console.error(err);
                    }
                    rimraf('../' + opts.temporatyFolder, () => {
                        if(cb) {
                            cb();
                        }
                        DataLogger.updateLastLog('success');
                        console.log('    [OK] Project successfully delivered.');
                    });
                });

            });
		}
    }

    watch(self) {
        self = self || this;

        DataLogger.insertLog('running');

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
                return console.error(err);
            }
            rimraf(opts.temporatyFolder, () => {
                console.log('    [OK] Project successfully delivered.');
            });
        });
    }

    getChecksum(cb) {
        let args = caravel.branch || 'HEAD';
        let cmd = "git ls-remote " + caravel.repo + " " + args;

        exec(cmd, (e, out, err) => {
            if(e || err) {
                console.log(e);
                console.log(err);
                console.log(out);
                throw "    [ERROR] Caravel could not build.";
            }
    		let hash = out.split('\n')[0].replace(/\s{1,}.+/, '');
            if(cb) {
                cb(hash);
            }
    	});

    }

    installDependenciesAndBuild() {
        this.installDependencies(this.build);
    }

    installDependenciesAndBuildAndWatch(self) {
        self.installDependencies(() => {
            self.build(() => {
                self.watch(self);
            });
        });
    }

}

module.exports = new Caravel();
