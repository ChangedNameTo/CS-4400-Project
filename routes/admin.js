var express = require('express'); var router  = express.Router();

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

            // Render the page
            res.render('admin/property', {
                result : property_result,
                has    : better_has
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
        // FIX ME IF YOU HAVE TIME
        console.log(errors);
    }
    else
    {
        console.log(req.body);
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

        var fields = req.body
        console.log(fields);

        // Update the property
        connection.query({
            sql     : "UPDATE `Property` SET `Name` = ?, `Size` = ?, `IsCommercial` = ?, `IsPublic` = ?, `Street` = ?, `City` = ?, `Zip` = ? WHERE ID = ?;",
            timeout : 30000, // 30s
            values  : [fields.name, fields.size, fields.iscommercial, fields.ispublic, fields.street, fields.city, fields.zip, fields.id]
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

module.exports = router;
