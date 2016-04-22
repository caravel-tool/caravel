'use strict';

class DataLogger {
    constructor() {
        this.Datastore = require('nedb');
        this.db        = new this.Datastore({filename: process.cwd() + '/caravel_log.db', autoload: true });
        console.log(process.cwd() + '/caravel_log.db');
    }

    insertLog(status, details) {
        let self = this;
        let timestamp = +new Date;
        let date   = new Date().toISOString();

        let data = {
            timestamp: timestamp,
            time: date,
            status: status
        }

        if(details) {
            data.details = details;
        }

        self.db.count({}, (err, count) => {
            if(err) {
                console.log(err);
            }

            data.id = count;

            self.db.insert(data, (err, newDoc) => {
                if(err) {
                    console.log(err);
                }
            });
        });
    }

    updateLastLog(status, details) {
        let self = this;
        let timestamp = +new Date;
        let date   = new Date().toISOString();

        let data = {
            timestamp: timestamp,
            time: date,
            status: status
        }

        if(details) {
            data.details = details;
        }

        self.db.find({}).sort({ id: -1 }).limit(1).exec((err, lastLogID) => {
            if(err) {
                console.log(err);
            }

            lastLogID = lastLogID[0].id;

            data.id = lastLogID;
            console.log(lastLogID);

            self.db.update({id: lastLogID}, data, {}, (err, newDoc) => {
                if(err) {
                    console.log(err);
                }
                self.db.persistence.compactDatafile()
            });
        });
    }

    getLogs(cb) {
        let self = this;
        self.db.persistence.compactDatafile()
        self.db.find({}).sort({ id: -1 }).exec((err, docs) => {
            if(err) {
                console.log(err);
            }
            cb(docs);
        });
    }

    getLastId(cb) {
        let self = this;
        self.db.persistence.compactDatafile()
        self.db.find({}).sort({ id: -1 }).limit(1).exec((err, docs) => {
            if(err) {
                console.log(err);
            }
            cb(docs[0].id);
        });
    }
}

module.exports = new DataLogger();
