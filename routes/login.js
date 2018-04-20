var express = require('express');
var router  = express.Router();

const check            = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'will',
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
    // Checks for the existance of errors
    const errors = validationResult(req);
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
            sql     : "SELECT * FROM User WHERE Email like ? AND Password LIKE ( SELECT MD5(?));",
            timeout : 30000, // 30s
            values  : [req.body.email, req.body.password]
        }, function (error, results, fields) {
            if(results == null || results == [])
            {
                console.log('req.session', req.session)
                req.session.valid_login = false;
                console.log('req.session', req.session)

                // We need a custom error for failing validation
                var custom_error = {
                    param : 'email',
                    msg   : 'This email/password combination does not exist!',
                    value : ''
                }

                res.render('login', {
                    data   : req.body,
                    errors : [custom_error]
                });
            }
            else
            {
                var type = results[0].UserType;
                req.session.valid_login = true;

                if( !req.session.user_type )
                {
                    req.session.user_type = type;
                }
                console.log(req.session);
            }
        });
    }
});

module.exports = router;
