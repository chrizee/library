const { body, validationResult} = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const passport = require('passport');

module.exports.register_get = (req, res) => {
  res.render('register', {title: "Register"});    
}

module.exports.register_post = [
    body('name').not().isEmpty().withMessage("Name cannot be empty").isLength({min: 4}).withMessage("Name must be a minimum of 4 characters").trim(),
    body('email').isEmail().withMessage("email must be a valid email address").trim(),
    body('password').isLength({min: 6}).withMessage("Password must be aminimum of 6 characters").trim(),
    // body('password2').custom((value, {req}) => {
    //     console.log('password', req.body.password);
    //     console.log('password2', value);
    //     if(value !== req.body.password) {
    //         throw new Error("Password confirmation did not match");
    //     }
    // }).withMessage("Password confirmation did not match"),
    sanitizeBody('*').escape(),

    (req, res, next) => {
        const {name, email, password, password2} = req.body;
        let errors = validationResult(req);
        let passwordMatch = true;
        if(password !== password2) {
            passwordMatch = false;
        }
        if(!errors.isEmpty() || !passwordMatch) {
            errors = errors.array();
            if(!passwordMatch) {
                errors.push({msg: "Password confirmation did not match"});                
            }
            res.render('register', {title: "Register", name, email, password, password2, errors});
            return;
        }

        User.findOne({email})
            .then(user => {
                if(user) {
                    res.render('register', {title: "Register", name, email, password, password2, errors: [{msg: "User already exist"}]});
                    return;
                } else {
                    const newUser = new User({
                        name, email, password
                    });
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;

                            newUser.password = hash;

                            newUser.save()
                                .then(user => {
                                    req.flash("success_msg", "Registration successful, You can now login");
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err))
                        })
                    });
                }
            })
            .catch(err => console.log(err));    
    }
];
  
module.exports.login_get = (req, res) => {
    res.render('login', {title: "Login"});    
};

module.exports.login_post = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/catalog",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next);
};

module.exports.logout = (req, res, next) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect('/users/login');
};