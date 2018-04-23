var express = require('express');
var router  = express.Router();

const util = require('util');

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
    // Deletes all properties without any items
    if(req.query.destroy)
    {
        connection.query({
            sql     : "DELETE FROM Property WHERE ID NOT IN (SELECT DISTINCT PropertyID FROM Has);",
            timeout : 30000 // 30s
        }, function (error, results, fields) {
            connection.query({
                sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p LEFT JOIN Visit v on p.ID = v.PropertyID WHERE Owner = ? GROUP BY p.ID ORDER BY p.ID;",
                timeout : 30000, // 30s
                values  : [req.session.user_name]
            }, function (error, results, fields) {
                res.render('owner', {
                    results : results
                });
            });
        });
    }
    else
    {
        connection.query({
            sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p LEFT JOIN Visit v on p.ID = v.PropertyID WHERE Owner = ? GROUP BY p.ID ORDER BY p.ID;",
            timeout : 30000, // 30s
            values  : [req.session.user_name]
        }, function (error, results, fields) {
            res.render('owner', {
                results : results
            });
        });
    }
});

/* GET other owners page. */
router.get('/other_properties', function(req, res, next) {
    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p LEFT JOIN Visit v on p.ID = v.PropertyID WHERE Owner != ? GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000, // 30s
        values  : [req.session.user_name]
    }, function (error, results, fields) {
        res.render('owner/other_properties', {
            results : results,
			search  : util.inspect(results, {showHidden : true, depth : null, breakLength : Infinity})
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
                res.render('owner/property', {
                    destroy : req.query.destroy,
                    result  : property_result,
                    has     : better_has
                });
            });
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

/* Add a FarmItem to a Property. */
router.post('/property/has/:id',[
    check('name')
        .isLength({min:1})
        .withMessage('Name is required.')
        .trim()
], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        res.render('/owner/property/' + req.params.id, {
            errors : errors.mapped()
        });
    }
    else
    {
        // Fetch the id
        req.body.id = req.params.id;

        var fields = req.body

        // Insert the new item
        connection.query({
            sql     : "INSERT INTO `Has` (PropertyID, ItemName) VALUES (?, ?);",
            timeout : 30000, // 30s
            values  : [fields.id, fields.name]
        }, function (error, results, fields) {
            res.redirect('/owner/property/' + req.params.id);
        });
    }
});


/* DELETE an item from HAS. */
router.get('/has/delete/:name-:id', function(req, res, next) {
    // Get vars
    var name = req.params.name;
    var id   = req.params.id;

    connection.query({
        sql     : "DELETE FROM `Has` WHERE `ItemName` = ? AND `PropertyID` = ?;",
        timeout : 30000, // 30s
        values  : [name, id]
    }, function (error, results, fields) {
        res.redirect('/owner/property/' + id);
    });
});

/* GET new property page. */
router.get('/add_property', function(req, res, next) {
    // Render the page
    res.render('owner/add_property', {});
});

/* Delete visit */
router.post('/new_property/', [
    check('name')
        .isLength({min:1})
        .withMessage('Name is required.')
        .trim(),
    check('street')
        .isLength({min:1})
        .withMessage('Street is required.')
        .trim(),
    check('city')
        .isLength({min:1})
        .withMessage('City is required.')
        .trim(),
    check('zip')
        .isLength({min:1})
        .withMessage('Zip is required.')
        .trim(),
    check('size')
        .isLength({min:1})
        .withMessage('Size is required.')
        .trim(),
    check('propertytype')
        .isLength({min:1})
        .withMessage('Property Type is required.')
        .trim()
], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        res.render('owner/add_property', {
            errors : errors.mapped()
        });
    }
    else
    {

        var data = req.body;
        // Make a db connection, check for valid password
        connection.query({
            sql     : "SELECT * FROM Property WHERE Name = ?;",
            timeout : 30000, // 30s
            values  : [req.body.name]
        }, function (error, results, fields) {
            if(results[0])
            {
                // We need a custom error for failing validation
                var custom_error = {
                    param : 'name',
                    msg   : 'This name already exists!',
                    value : ''
                };

                res.render('owner/add_property', {
                    errors : [custom_error]
                });
            }
            else
            {
                connection.query({
                    sql     : "SELECT MAX(ID) + 1 AS id FROM Property;",
                    timeout : 30000 // 30s
                }, function (error, results, fields) {
                    var id = results[0].id;

                    // Normallize IsPublic and IsCommercial
                    if(req.body.ispublic)
                    {
                        req.body.ispublic = 1;
                    }
                    else
                    {
                        req.body.ispublic = 0;
                    }

                    if(req.body.iscommercial)
                    {
                        req.body.iscommercial = 1;
                    }
                    else
                    {
                        req.body.iscommercial = 0;
                    }

                    // Insert the new item
                    connection.query({
                        sql     : "INSERT INTO Property (Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,Owner,ID) VALUES (?,?,?,?,?,?,?,?,?,?);",
                        timeout : 30000, // 30s
                        values  : [data.name,data.size,data.iscommercial,data.ispublic,data.street,data.city,data.zip,data.propertytype,req.session.user_name,id]
                    }, function (error, results, fields) {
                        res.redirect('/owner/property/' + id + '/?destroy=true');
                    });
                });
            }
        });
    }
});

router.post('/property/:id',[
    check('name')
        .isLength({min:1})
        .withMessage('Name is required.')
        .trim(),
    check('street')
        .isLength({min:1})
        .withMessage('Street is required.')
        .trim(),
    check('city')
        .isLength({min:1})
        .withMessage('City is required.')
        .trim(),
    check('zip')
        .isLength({min:1})
        .withMessage('Zip is required.')
        .trim(),
    check('size')
        .isLength({min:1})
        .withMessage('Size is required.')
        .trim()
], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
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
                    res.render('owner/property', {
                        destroy : req.query.destroy,
                        result  : property_result,
                        has     : better_has,
                        errors  : errors.mapped()
                    });
                });
            });
        });
    }
    else
    {
        // Fetch the id
        req.body.id = req.params.id;

        // Normallize IsPublic and IsCommercial
        if(req.body.ispublic)
        {
            req.body.ispublic = 1;
        }
        else
        {
            req.body.ispublic = 0;
        }

        if(req.body.iscommercial)
        {
            req.body.iscommercial = 1;
        }
        else
        {
            req.body.iscommercial = 0;
        }

        req.body.approvedby = req.session.user_name;

        var fields = req.body

        // Update the property
        connection.query({
            sql     : "UPDATE `Property` SET `Name` = ?, `Size` = ?, `IsCommercial` = ?, `IsPublic` = ?, `Street` = ?, `City` = ?, `Zip` = ?, `ApprovedBy` = null WHERE ID = ?;",
            timeout : 30000, // 30s
            values  : [fields.name, fields.size, fields.iscommercial, fields.ispublic, fields.street, fields.city, fields.zip, fields.id]
        }, function (error, results, fields) {
            // Update the property
            connection.query({
                sql     : "DELETE FROM Visit WHERE PropertyID = ?;",
                timeout : 30000, // 30s
                values  : [fields.name, fields.size, fields.iscommercial, fields.ispublic, fields.street, fields.city, fields.zip, fields.id]
            }, function (error, results, fields) {
                res.redirect('/owner/property/' + req.params.id);
            });
        });
    }
});

module.exports = router;
