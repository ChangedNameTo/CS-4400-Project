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
router.get('/confirmed', function(req, res, next) {
    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p JOIN Visit v on p.ID = v.PropertyID GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        console.log('results',results);
        res.render('admin/confirmed', {results : results});
    });
});

/* GET unconfirmed properites page. */
router.get('/unconfirmed', function(req, res, next) {
    connection.query({
        sql     : "SELECT * FROM Property WHERE ApprovedBy IS null;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        res.render('admin/unconfirmed', {results : results});
    });
});

module.exports = router;
