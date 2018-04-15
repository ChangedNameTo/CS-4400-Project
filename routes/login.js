var express = require('express');
var router  = express.Router();

const check            = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

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
    }
});

module.exports = router;
