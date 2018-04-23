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

/* GET owner registration page. */
router.get('/owner', function(req, res, next) {
    res.render('register/owner', {});
});

/* GET visitor registration page. */
router.get('/visitor', function(req, res, next) {
    res.render('register/visitor', {});
});

/* Delete visit */
router.post('/visitor', [
    check('email')
        .isLength({min:1})
        .withMessage('Email is required.')
        .normalizeEmail()
        .trim(),
    check('username')
        .isLength({min:1})
        .withMessage('Username is required.')
        .trim(),
    check('password')
        .isLength({min:8})
        .withMessage('Password is required.')
        .trim(),
    check('confirm')
        .isLength({min:1})
        .withMessage('Passwords must match!.')
        .trim()
        .custom((value, { req }) => value === req.body.password)

], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        res.render('register/visitor', {
            errors : errors.mapped()
        });
    }
    else
    {
        var data = req.body;

        // Insert the new item
        connection.query({
            sql     : "SELECT * FROM User WHERE Username = ?;",
            timeout : 30000, // 30s
            values  : [data.username]
        }, function (error, results, fields) {
            if(results != [])
            {
                // We need a custom error for failing validation
                var custom_error = {
                    param : 'username',
                    msg   : 'This username is already in the system!',
                    value : ''
                }

                res.render('register/visitor', {
                    errors : [custom_error]
                });
            }
            else
            {
                connection.query({
                    sql     : "SELECT * FROM User WHERE Email = ?;",
                    timeout : 30000, // 30s
                    values  : [data.email]
                }, function (error, results, fields) {
                    // We need a custom error for failing validation
                    if(results != [])
                    {
                        var custom_error = {
                            param : 'username',
                            msg   : 'This username is already in the system!',
                            value : ''
                        }

                        res.render('register/visitor', {
                            errors : [custom_error]
                        });
                    }
                    else
                    {
                        connection.query({
                            sql     : "INSERT INTO User (Username,Email,Password,UserType) VALUES (?,?,MD5(?),'VISITOR');",
                            timeout : 30000, // 30s
                            values  : [data.username,data.email,data.password]
                        }, function (error, results, fields) {
                            if(!error)
                            {
                                // Set the user session
                                req.session.valid_login = true;
                                req.session.user_type   = 'VISITOR';
                                req.session.user_name   = data.username;

                                res.render('login', {});
                            }
                            else
                            {
                                console.log(error);
                            }
                        });
                    }
                });
            }
        });
    }
});

/* Delete visit */
router.post('/owner', [
    check('email')
        .isLength({min:1})
        .withMessage('Email is required.')
        .normalizeEmail()
        .trim(),
    check('username')
        .isLength({min:1})
        .withMessage('Username is required.')
        .trim(),
    check('password')
        .isLength({min:8})
        .withMessage('Password is required.')
        .trim(),
    check('confirm')
        .isLength({min:1})
        .withMessage('Passwords must match!.')
        .trim()
        .custom((value, { req }) => value === req.body.password),
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
    check('id')
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
        res.render('register/owner', {
            errors : errors.mapped()
        });
    }
    else
    {
        var data = req.body;

        // Insert the new item
        connection.query({
            sql     : "SELECT * FROM User WHERE Username = ?;",
            timeout : 30000, // 30s
            values  : [data.username]
        }, function (error, results, fields) {
            if(result != [])
            {
                // We need a custom error for failing validation
                var custom_error = {
                    param : 'username',
                    msg   : 'This username is already in the system!',
                    value : ''
                }

                res.render('register/owner', {
                    errors : [custom_error]
                });
            }
            else
            {
                connection.query({
                    sql     : "SELECT * FROM User WHERE Email = ?;",
                    timeout : 30000, // 30s
                    values  : [data.email]
                }, function (error, results, fields) {
                    // We need a custom error for failing validation
                    if(results != [])
                    {
                        var custom_error = {
                            param : 'username',
                            msg   : 'This username is already in the system!',
                            value : ''
                        }

                        res.render('register/owner', {
                            errors : [custom_error]
                        });
                    }
                    else
                    {
                        // Set the user session
                        req.session.valid_login = true;
                        req.session.user_type   = 'OWNER';
                        req.session.user_name   = data.username;

                        connection.query({
                            sql     : "INSERT INTO User (Username,Email,Password,UserType) VALUES (?,?,MD5(?),'OWNER');",
                            timeout : 30000, // 30s
                            values  : [data.username,data.email,data.password]
                        }, function (error, results, fields) {
                            if(!error)
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
                                            msg   : 'This property name already exists!',
                                            value : ''
                                        };

                                        res.render('register/owner', {
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
                            else
                            {
                                console.log(error);
                            }
                        });
                    }
                });
            }
        });
    }
});

module.exports = router;
