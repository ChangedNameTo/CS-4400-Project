var express = require('express');
var router  = express.Router();

const check            = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

var tablesort = require('tablesort');

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'will',
    password : 'testing',
    database : 'cs4400'
});

/* GET admin page. */
router.get('/', function(req, res, next) {
    res.render('admin', {});
});

/* GET unconfirmed properites page. */
router.get('/unconfirmed', function(req, res, next) {
    connection.query({
        sql     : "SELECT * FROM Property WHERE ApprovedBy IS null;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        console.log('results',results);
        res.render('admin/unconfirmed', {results : results});
    });
});

module.exports = router;
