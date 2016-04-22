'use strict';

const express   = require('express');
const engine    = require('express-dot-engine');
const DataLogger = require('../DataLogger.js');
const caravel    = require('../../caravel.json');
const app       = express();

// Caravel:status server configuration
app.engine('.html', engine.__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'dot');
app.use(express.static(__dirname + '/public'));

// Caravel:Status server routes
app.get('/', function (req, res) {
    DataLogger.insertLog('success');
    res.render('index.html');
});

app.get('/log', (req, res) => {
    DataLogger.getLogs((docs) => {
        res.send(docs);
    });
});

app.get('/last', (req, res) => {
    DataLogger.getLastId((id) => {
        res.send({id: id});
    });

    DataLogger.insertLog('success');
});

app.get('/details', (req, res) => {
    res.send(caravel);
});


// Start Caravel:status server start
app.listen(7007, () => {

});
