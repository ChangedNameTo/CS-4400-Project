var express = require('express');
var router  = express.Router();

const check            = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'will',
    password : 'testing',
    database : 'cs4400'
});

/* GET login page. */
router.get('/', function(req, res, next) {
    res.render('login', {});
    // res.send('respond with a resource');
});

/* POST submit login form. */
router.post('/', [
    check('email')
        .isLength({min:1})
        .withMessage('Email is required.')
        .trim()
        .normalizeEmail(),
    check('password')
        .isLength({min:1})
        .withMessage('Password is required.')
        .trim(),
], (req, res) => {
    const errors = validationResult(req);
    console.log('before');
    // Checks for the existance of errors
    if(!errors.isEmpty())
    {
        res.render('login', {
            data   : req.body,
            errors : errors.mapped()
        });
    }
    else
    {
        // Make a db connection, check for valid password
        connection.query({
            sql     : "SELECT Id FROM User WHERE Email like ? AND Password like ?",
            timeout : 30000, // 30s
            values  : [req.body.email, req.body.password]
        }, function (error, results, fields) {
            console.log('here');
            if(results == null || results == [])
            {
                console.log('empty');
            }
            else
            {
                console.log('Here');
            }
        });
    }
});

module.exports = router;
