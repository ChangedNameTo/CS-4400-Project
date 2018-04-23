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
    // Deletes all properties without any items
    if(req.query.destroy)
    {
        connection.query({
            sql     : "DELETE FROM Property WHERE ID NOT IN (SELECT DISTINCT PropertyID FROM Has);",
            timeout : 30000 // 30s
        }, function (error, results, fields) {
            res.render('admin', {});
        });
    }
    else
    {
        res.render('admin', {});
    }
});

/* GET unconfirmed properites page. */
router.get('/confirmed', function(req, res, next) {
    connection.query({
        sql     : "SELECT ID,Name,Size,IsCommercial,IsPublic,Street,City,Zip,PropertyType,ApprovedBy,AVG(Rating) AS Rating FROM Property p LEFT JOIN Visit v on p.ID = v.PropertyID GROUP BY p.ID ORDER BY p.ID;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        console.log(results);
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
                var item_count = 0;
                has.forEach(function(item) {
                    item_count++;
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

                if(item_count == 0)
                {
                    // Render the page
                    res.render('admin/property', {
                        result  : property_result,
                        has     : better_has,
                        destroy : true
                    });
                }
                else
                {
                    // Render the page
                    res.render('admin/property', {
                        result : property_result,
                        has    : better_has
                    });
                }
            });
        });
    });
});

/* Update a property. */
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
                    var item_count = 0;

                    has.forEach(function(item){
                        item_count++;
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

                    if(item_count == 0)
                    {
                        // Render the page
                        res.render('admin/property/' + property_result.id + '/?danger=true', {
                            result : property_result,
                            has    : better_has,
                            errors : errors.mapped()
                        });
                    }
                    else
                    {
                        // Render the page
                        res.render('admin/property', {
                            result : property_result,
                            has    : better_has,
                            errors : errors.mapped()
                        });
                    }
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
            sql     : "UPDATE `Property` SET `Name` = ?, `Size` = ?, `IsCommercial` = ?, `IsPublic` = ?, `Street` = ?, `City` = ?, `Zip` = ?, `ApprovedBy` = ? WHERE ID = ?;",
            timeout : 30000, // 30s
            values  : [fields.name, fields.size, fields.iscommercial, fields.ispublic, fields.street, fields.city, fields.zip, fields.approvedby, fields.id]
        }, function (error, results, fields) {
            res.redirect('/admin/property/' + req.params.id);
        });
    }
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
        // FIX ME IF YOU HAVE TIME
        console.log(errors);
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
            res.redirect('/admin/property/' + req.params.id);
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
        res.redirect('/admin/property/' + id);
    });
});

/* GET all visitors page. */
router.get('/visitors', function(req, res, next) {
    connection.query({
        sql     : "SELECT u.Username, u.Email, COUNT(v.Username) as VNumber FROM User u LEFT JOIN Visit v on u.Username = v.Username WHERE u.Usertype = 'VISITOR' GROUP BY u.Username",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        res.render('admin/visitors', {results : results});
    });
});

/* Delete a visitor. */
router.post('/visitor/delete_user', [
    check('username')
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
        // Insert the new item
        connection.query({
            sql     : "DELETE FROM User WHERE Username = ?",
            timeout : 30000, // 30s
            values  : [req.body.username]
        }, function (error, results, fields) {
            res.redirect('/admin/visitors');
        });
    }
});

/* Delete a visitor. */
router.post('/visitor/delete_log', [
    check('username')
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
        // Insert the new item
        connection.query({
            sql     : "DELETE FROM Visit WHERE Username = ?",
            timeout : 30000, // 30s
            values  : [req.body.username]
        }, function (error, results, fields) {
            res.redirect('/admin/visitors');
        });
    }
});

/* GET all visitors page. */
router.get('/owners', function(req, res, next) {
    connection.query({
        sql     : "SELECT u.Username, u.Email, COUNT(p.ID) as VNumber FROM User u LEFT JOIN Property p on u.Username = p.Owner WHERE u.Usertype = 'OWNER' GROUP BY u.Username",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        res.render('admin/owners', {results : results});
    });
});

/* Delete a owner. */
router.post('/owner/delete_user', [
    check('username')
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
        // Insert the new item
        connection.query({
            sql     : "DELETE FROM User WHERE Username = ?",
            timeout : 30000, // 30s
            values  : [req.body.username]
        }, function (error, results, fields) {
            res.redirect('/admin/owners');
        });
    }
});

/* GET all visitors page. */
router.get('/items_approved', function(req, res, next) {
    var approved = {};

    connection.query({
        sql     : "SELECT Name, Type FROM FarmItem WHERE IsApproved = 1;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        var unapproved = {};

        approved = results;

        connection.query({
            sql     : "SELECT Name, Type FROM FarmItem WHERE IsApproved = 0;",
            timeout : 30000 // 30s
        }, function (error, results, fields) {
            res.render('admin/items_approved', {
                approved   : approved,
                unapproved : results
            });
        });
    });
});

/* Approve new farm item */
router.post('/items_approved/approve', [
    check('name')
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
        // Insert the new item
        connection.query({
            sql     : "UPDATE FarmItem SET IsApproved = 1 WHERE Name = ?;",
            timeout : 30000, // 30s
            values  : [req.body.name]
        }, function (error, results, fields) {
            res.redirect('/admin/items_approved');
        });
    }
});

/* GET all visitors page. */
router.get('/items_unapproved', function(req, res, next) {
    var approved = {};

    connection.query({
        sql     : "SELECT Name, Type FROM FarmItem WHERE IsApproved = 1;",
        timeout : 30000 // 30s
    }, function (error, results, fields) {
        var unapproved = {};

        approved = results;

        connection.query({
            sql     : "SELECT Name, Type FROM FarmItem WHERE IsApproved = 0;",
            timeout : 30000 // 30s
        }, function (error, results, fields) {
            res.render('admin/items_unapproved', {
                approved   : approved,
                unapproved : results
            });
        });
    });
});

/* Approve new farm item */
router.post('/items_unapproved/approve', [
    check('name')
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
        // Insert the new item
        connection.query({
            sql     : "UPDATE FarmItem SET IsApproved = 1 WHERE Name = ?;",
            timeout : 30000, // 30s
            values  : [req.body.name]
        }, function (error, results, fields) {
            res.redirect('/admin/items_unapproved');
        });
    }
});

module.exports = router;
