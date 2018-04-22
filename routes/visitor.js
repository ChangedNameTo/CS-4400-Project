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
    var properties   = {};
    var property_ids = [];

    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(v1.Rating) AS Rating FROM Property p JOIN Visit v1 on p.ID = v1.PropertyID WHERE IsPublic = 1 AND ApprovedBy IS NOT NULL GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        // Extract the list of property ID's
        results.forEach(function(item) {
            property_ids.push(item.ID);

            properties[item.ID]            = item;
            properties[item.ID].VisitCount = 0;
        });
        console.log(properties);

        connection.query({
            sql     : "SELECT PropertyID,COUNT(PropertyID) AS VisitCount FROM Visit WHERE Username = ? AND PropertyID IN (?) GROUP BY PropertyID;",
            timeout : 30000, // 30s
            values  : [req.session.user_name, property_ids]
        }, function (error, results, fields) {

            results.forEach(function(item) {
                if(item.VisitCount !== 0)
                {
                    properties[item.PropertyID].VisitCount = item.VisitCount;
                }
            });

            console.log(properties);
            res.render('visitor', {
                results : properties
            });
        });
    });
});

module.exports = router;
