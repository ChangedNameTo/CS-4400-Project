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
            if(results == null || results == [] || results == undefined)
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
                    if(results == null || results == [] || results == undefined)
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
            if(results == null || results == [] || results == undefined)
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
                    if(results == null || results == [] || results == undefined)
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

module.exports = router;
