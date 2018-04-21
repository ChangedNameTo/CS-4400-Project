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

/* GET unconfirmed properites page. */
router.get('/property/:id', function(req, res, next) {
    var property_result = {};

    // Get property info
    connection.query({
        sql     : "SELECT * FROM Property WHERE ID LIKE ?;",
        timeout : 30000, // 30s
        values  : req.params.id
    }, function (error, result, fields) {
        // Only grabs one result
        property_result = result[0];

        console.log('result ', property_result);

        var has = {};
        // Get has
        connection.query({
            sql     : "SELECT Name, `IsApproved`, Type FROM `Has` h JOIN `FarmItem` f ON h.`ItemName` = f.Name WHERE h.`PropertyID` = ?;",
            timeout : 30000, // 30s
            values  : req.params.id
        }, function (error, results, fields) {
            has = results;

            var animals         = [];
            var fruits          = [];
            var vegetables      = [];
            var flowers         = [];
            var nuts            = [];

            // Parse results
            has.forEach(function(item){
                switch(item.Type)
                {
                    case 'ANIMAL':
                        animals.push(item);
                        break;
                    case 'FRUIT':
                        fruits.push(item);
                        break;
                    case 'FLOWER':
                        flowers.push(item);
                        break;
                    case 'VEGETABLE':
                        vegetables.push(item);
                        break;
                    case 'NUT':
                        nuts.push(item);
                        break;
                }
            });

            // Deal with the results
            switch(property_result.PropertyType)
            {

                case 'FARM':
                    break;
                case 'GARDEN':
                    var animals         = null;
                    var fruits          = null;
                    var nuts            = null;
                    break;
                case 'ORCHARD':
                    var animals         = null;
                    var vegetables      = null;
                    var flowers         = null;
                    break;
            }

            // Dump the arrays in to this map
            var better_has = {};
            better_has['Animals']    = animals;
            better_has['Fruits']     = fruits;
            better_has['Flowers']    = flowers;
            better_has['Vegetables'] = vegetables;
            better_has['Nuts']       = nuts;

            console.log(better_has);

            // Render the page
            res.render('admin/property', {
                result : property_result,
                has    : better_has
            });
        });
    });
});

module.exports = router;
