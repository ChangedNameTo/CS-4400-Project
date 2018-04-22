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

/* GET unconfirmed properites page. */
router.get('/other_property/:id', function(req, res, next) {
    var property_result = {};

    // Get property info
    connection.query({
        sql     : "SELECT * FROM Property WHERE ID LIKE ?;",
        timeout : 30000, // 30s
        values  : req.params.id
    }, function (error, result, fields) {
        // Only grabs one result
        property_result = result[0];

        var has = {};

        // Get has
        connection.query({
            sql     : "SELECT Name, `IsApproved`, PropertyID, Type FROM `Has` h JOIN `FarmItem` f ON h.`ItemName` = f.Name WHERE h.`PropertyID` = ?;",
            timeout : 30000, // 30s
            values  : req.params.id
        }, function (error, results, fields) {
            has = results;

            var dont_have = {};

            // Get Don't haves
            connection.query({
                sql     : "SELECT * FROM FarmItem WHERE Name NOT IN (SELECT Name FROM `Has` h JOIN `FarmItem` f ON h.`ItemName` = f.Name WHERE h.`PropertyID` = ?) AND IsApproved = 1;",
                timeout : 30000, // 30s
                values  : req.params.id
            }, function (error, results, fields) {
                dont_have = results;

                var animals       = {};
                var fruits        = {};
                var vegetables    = {};
                var flowers       = {};
                var nuts          = {};

                animals['have']    = [];
                fruits['have']     = [];
                vegetables['have'] = [];
                flowers['have']    = [];
                nuts['have']       = [];

                animals['not']    = [];
                fruits['not']     = [];
                vegetables['not'] = [];
                flowers['not']    = [];
                nuts['not']       = [];

                // Parse results for have
                has.forEach(function(item){
                    switch(item.Type)
                    {
                        case 'ANIMAL':
                            animals['have'].push(item);
                            break;
                        case 'FRUIT':
                            fruits['have'].push(item);
                            break;
                        case 'FLOWER':
                            flowers['have'].push(item);
                            break;
                        case 'VEGETABLE':
                            vegetables['have'].push(item);
                            break;
                        case 'NUT':
                            nuts['have'].push(item);
                            break;
                    }
                });

                // Parse results for don't have
                dont_have.forEach(function(item){
                    switch(item.Type)
                    {
                        case 'ANIMAL':
                            animals['not'].push(item);
                            break;
                        case 'FRUIT':
                            fruits['not'].push(item);
                            break;
                        case 'FLOWER':
                            flowers['not'].push(item);
                            break;
                        case 'VEGETABLE':
                            vegetables['not'].push(item);
                            break;
                        case 'NUT':
                            nuts['not'].push(item);
                            break;
                    }
                });

                // Dump the arrays in to this map
                var better_has = {};
                better_has['Animals']    = animals;
                better_has['Fruits']     = fruits;
                better_has['Flowers']    = flowers;
                better_has['Vegetables'] = vegetables;
                better_has['Nuts']       = nuts;

                switch(property_result.PropertyType)
                {
                    case 'FARM':
                        break;
                    case 'GARDEN':
                        better_has['Animals'] = null;
                        better_has['Fruits'] = null;
                        better_has['Nuts'] = null;
                        break;
                    case 'ORCHARD':
                        better_has['Animals'] = null;
                        better_has['Vegetables'] = null;
                        better_has['Flowers'] = null;
                        break;
                }

                // Render the page
                res.render('owner/other_property', {
                    result : property_result,
                    has    : better_has
                });
            });
        });
    });
});

module.exports = router;
