var express = require('express');
var router  = express.Router();

const check            = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;

/* POST submit logout form. */
router.get('/', [], (req, res) => {
    // Checks for the existance of errors
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        console.log('Literally impossible');
    }
    else
    {
        req.session.valid_login = false;
        req.session.user_type   = null;
        req.session.user_name   = null;

        res.redirect('/');
    }
});

module.exports = router;
