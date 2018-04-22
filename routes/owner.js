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

/* GET owner page. */
router.get('/', function(req, res, next) {
    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p JOIN Visit v on p.ID = v.PropertyID WHERE Owner = ? GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000, // 30s
        values  : [req.session.user_name]
    }, function (error, results, fields) {
        console.log(results);
        res.render('owner', {
            results : results
        });
    });
});

/* GET other owners page. */
router.get('/other_properties', function(req, res, next) {
    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p JOIN Visit v on p.ID = v.PropertyID WHERE Owner != ? GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000, // 30s
        values  : [req.session.user_name]
    }, function (error, results, fields) {
        console.log(results);
        res.render('owner/other_properties', {
            results : results
        });
    });
});

module.exports = router;
