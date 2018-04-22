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

/* GET visitor page. */
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

            res.render('visitor', {
                results : properties
            });
        });
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
                res.render('visitor/property', {
                    result : property_result,
                    has    : better_has
                });
            });
        });
    });
});

/* GET visitor page. */
router.get('/visitor_log', function(req, res, next) {
    connection.query({
        sql     : "SELECT p.Name,v.PropertyID,v.VisitDate,v.Rating FROM Visit v JOIN Property p ON v.PropertyID = p.ID WHERE Username = ?;",
        timeout : 30000, // 30s
        values  : [req.session.user_name]
    }, function (error, results, fields) {
        res.render('visitor/visitor_log', {
            results : results
        });
    });
});

/* Add new visit */
router.post('/property/new_visit/:id', [
    check('rating')
        .isLength({min:1})
        .trim()
], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        // FIX ME IF YOU HAVE TIME
        console.log(errors);
    }
    else
    {
        var property_id = req.params.id;

        // Insert the new item
        connection.query({
            sql     : "INSERT INTO Visit (Username,PropertyID,Rating) VALUES (?,?,?);",
            timeout : 30000, // 30s
            values  : [req.session.user_name,property_id,req.body.rating]
        }, function (error, results, fields) {
            res.redirect('/visitor/');
        });
    }
});

/* Delete visit */
router.post('/delete_visit/', [], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        // FIX ME IF YOU HAVE TIME
        console.log(errors);
    }
    else
    {
        var property_id = req.body.propertyid;

        // Insert the new item
        connection.query({
            sql     : "DELETE FROM Visit WHERE Username = ? AND PropertyID = ?;",
            timeout : 30000, // 30s
            values  : [req.session.user_name,property_id]
        }, function (error, results, fields) {
            res.redirect('/visitor/visitor_log');
        });
    }
});

module.exports = router;
