var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken')
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

    router.route('/movies')
        //Movie stuff goes here.
        //Need extra check for showing reviews
        .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            if(!req.body.title || !req.body.year || req.body.actor.length < 3)
                res.json({success: false, msg: 'Please include all required fields!'});
            else {
                var movieNew = new Movie();
                movieNew.title = req.body.title;
                movieNew.year = req.body.year;
                movieNew.genre = req.body.genre;
                movieNew.actor = req.body.actor;

                //Not checking for duplicates, might be multiple movies with the same title.
                movieNew.save(function(err) {
                    if(err) {
                        return(res.send(err));
                    }
                    res.json({success: true, msg: 'Successfully created movie!'})
                });
            }
        })

    .put(authJwtController.isAuthenticated, function (req, res, next) {
        //Validate input. Require all four fields.
        if(!req.body.title || !req.body.year || !req.body.genre || !req.body.actor) {
            return(next(res.status(400).send({success: false, msg:'Please include all required fields!'})));
        }
        //Double-check length of actor array
        if(req.body.actor.length < 3)
            return(next(res.status(400).send({success: false, msg:'Please include at least three actors!'})));
        Movie.findOneAndUpdate(
            {"title": req.body.title},
            {
                $set: {
                    "year": req.body.year,
                    "genre": req.body.genre,
                    "actor": req.body.actor
                }
            },
            {new: true},
            (err, data) => {
                if(err) res.status(404).send({success: false, msg: 'Movie not found.'});
            });
            res.json({success: true, msg: 'Movie updated'});
    })


    .delete(authJwtController.isAuthenticated, function (req, res) {
        //Receives: title to be deleted.
        //Weakness: This will find the first instance and delete that.
        //First check if the movie even exists.
        Movie.findOneAndDelete({ title: req.body.title }).select('title').exec(function(err, movie) {
            if(movie === null) {
                return(next(res.status(404).send({success: false, msg: 'Movie not found.'})));
            }

            else {
                res.json({success: true, msg: 'Successfully deleted movie.'});
            }
        });


    })

    .get(authJwtController.isAuthenticated, function (req, res, next) {
        // First check to see if we need to get reviews.
        if(req.query && req.query.reviews && req.query.reviews === "true")
        {
            Movie.aggregate()
            .match(req.body)
            .lookup({from: 'reviews', localField: '_id', foreignField: 'movie', as: 'reviews'})
            .exec(function(err, movie) {
                if(err) return res.status(400).send({success: false, msg: 'Unknown error.'});
                //average rating stuff probably goes here.
                return(res.status(200).json({success: true, result: movie}));
            })
        }

        //Otherwise it's the same as before, return the movie
        else
        {
            Movie.find(function(err, movies) {
            if(err) res.send(err);
            res.json(movies);
            })
        }
    })

    .all(function(req, res) {
        console.log(req.body);
        res.status(405).send({success: false, msg: 'Unsupported method.'});
    });

    router.route('movies/:movieId')
        //Should work similarly to the normal /movies GET...
        .get(authJwtController.isAuthenticated, function(req, res, next) {
            let mov = req.params.movieId;
            if(req.query && req.query.reviews && req.query.reviews === "true")
            {
                Movie.aggregate()
                .match(mov)
                .lookup({from: 'reviews', localField: '_id', foreignField: 'movie', as: 'reviews'})
                .exec(function(err,movie) {
                    if(err) return res.status(400).send({success: false, msg: 'Unknown error.'});
                    //Average rating here
                    return(res.status(200).json(movie));
                })
            }
            else
            {
                //Same as normal, call findOne
                Movie.findById(mov, function(err, movie) {
                    if(err) res.send(err);
                    let movieJson = JSON.stringify(movie);
                    res.json(movie);
                })
            }
        })
        .all(function(req, res) {
            console.log(req.body);
            res.status(405).send({success: false, msg: 'Unsupported method.'});
        })

    router.route('/reviews')
        .post(authJwtController.isAuthenticated, function(req, res, next) {
        let utoken = req.headers.authorization;
        let token = utoken.split(' ');
        let decoded = jwt.verify(token[1], process.env.SECRET_KEY);
        console.log(decoded);
        let mid = req.body.movieId;
        Review.findOne(decoded.id)
        Movie.findById(mid, function(err, mid) {
            if(err) {
                res.status(404).send({success: false, message: 'Movie not found.'});
            }
            else if(mid) {
                let review = new Review();
                review.username = decoded.username;
                review.user = decoded.id;
                review.review = req.body.review;
                review.rating = req.body.rating;
                review.movie = req.body.movieId;
                review.save(function(err) {
                    if(err) {
                        return res.status(400).send({success: false, message: 'Some required fields not entered!'});
                    } else {
                        res.json({success: true, message: 'Review added successfully!'});
                    }
                })
            }
            else {
                return res.status(404).send({success: false, message: 'Movie not found'});
            }
        })
    })
    .all(function(req, res) {
        console.log(req.body);
        res.status(405).send({succes: false, msg: 'Unsupported method.'});
    })

app.use('/', router);
app.listen(process.env.PORT || 8080);
