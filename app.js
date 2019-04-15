var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');

//Need the signup/signin POST methods, and a reviews method.
var app = express();
module.exports = app; // for testing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(cors());

var router = express.Router();

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
    })
    .all(function(req, res) {
        //Other methods should return 405 Method Not Allowed
        console.log(req.body);
        res.status(405).send({success: false, msg: 'Unsupported method.'});
    });

    router.route('/postjwt')
        .post(authJwtController.isAuthenticated, function (req, res) {
                console.log(req.body);
                res = res.status(200);
                if (req.get('Content-Type')) {
                    console.log("Content-Type: " + req.get('Content-Type'));
                    res = res.type(req.get('Content-Type'));
                }
                res.send(req.body);
        })
        .all(function(req, res) {
            //Other methods should return 405 Method Not Allowed
            console.log(req.body);
            res.status(405).send({success: false, msg: 'Unsupported method.'});
        });

    router.route('/users')
        .get(authJwtController.isAuthenticated, function (req, res) {
            User.find(function (err, users) {
                if (err) res.send(err);
                // return the users
                res.json(users);
            });
        });

    router.route('/signup')
        .post(function(req, res) {
            if (!req.body.username || !req.body.password) {
                res.json({success: false, message: 'Please pass username and password.'});
            }
            else {
                var user = new User();
                user.name = req.body.name;
                user.username = req.body.username;
                user.password = req.body.password;
                // save the user
                user.save(function(err) {
                    if (err) {
                        // duplicate entry
                        if (err.code == 11000)
                            //Send a 409 Conflict code, otherwise it will send 200 OK a la Facebook
                            return res.status(409).send({ success: false, message: 'A user with that username already exists. '});
                        else
                            return res.send(err);
                    }

                    res.json({ success: true, message: 'User created!' });
                });
            }
        })
        .all(function(req,res) {
            console.log(req.body);
            res.status(405).send({success: false, msg: 'Unsupported method.'})
        });


    router.route('/signin')
        .post(function(req, res) {
            var userNew = new User();
            userNew.name = req.body.name;
            userNew.username = req.body.username;
            userNew.password = req.body.password;

            User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
                if (err) res.send(err);
                if(user === null) return(res.status(401).send({success: false, message: 'Authentication failed.'}));
                user.comparePassword(userNew.password, function(isMatch){
                    if (isMatch) {
                        var userToken = {id: user._id, username: user.username};
                        var token = jwt.sign(userToken, process.env.SECRET_KEY);
                        res.json({success: true, token: 'JWT ' + token});
                    }
                    else {
                        res.status(401).send({success: false, message: 'Authentication failed.'});
                    }
                });
            });
        })
        .all(function(req, res) {
            console.log(req.body);
            res.status(405).send({success: false, msg: 'Unsupported method.'});
        });

app.use('/', router);
app.listen(process.env.PORT || 8080);
