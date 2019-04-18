const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find().sort([['name', 'ascending']]).exec(function(err, genre) {
        if(!err && genre) {
            res.render('genre_list', { title: 'Genre List', genre_list: genre });
        } else {
            return next(err);
        }
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById( mongoose.Types.ObjectId(req.params.id))
              .exec(callback);
        },

        genre_books: function(callback) {
            Book.find({ 'genre': mongoose.Types.ObjectId(req.params.id) })
              .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
    });
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render("genre_form", { title: "Create genre"});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    //validate that the name is not empty
    body('name', "Genre name required").isLength({min: 1 }).trim(),
    //sanitize the name field
    sanitizeBody('name').escape(),
    //process the request after the validation
    (req, res, next) => {
        //extract the validation result from the request
        const errors = validationResult(req);

        //create a genre object with escaped and trimmed data
        const genre = new Genre({ name: req.body.name});

        if(!errors.isEmpty()) {
          //there are errors. Render the form again with the sanitized data
          res.render('genre_form', { title: "Create Genre", genre, errors: errors.array()});  
          return;
        } else {
            //validation passed
            Genre.findOne({name: req.body.name})
                .exec(function(err, found_genre) {
                    if(err) { return next(err);}
                    if(found_genre) {
                        //genre exist, redirect to detail page
                        res.redirect(found_genre.url);
                    } else {
                       genre.save(function (err) {
                           if(err) { return next(err); }
                           //genre saved. Redirect to genre detail page.
                           res.redirect(genre.url);
                       }) 
                    }
                });
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        book: function(callback) {
            Book.find({genre: req.params.id}).exec(callback);
        }
    }, function(err, results) {
        if(err) return next(err);
        if(results.genre == null) res.redirect('/catalog/genres');
        res.render("genre_delete", { title: "Delete Genre", books: results.book, genre: results.genre});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },
        book: function(callback) {
            Book.find({genre: req.body.genreid}).exec(callback);
        }
    }, function(err, results) {
        if(err) return next(err);
        if(results.book.length > 0) {
            res.render("genre_delete", {title: "Delete Genre", books: results.book, genre: results.genre});
            return;
        } else {
            Genre.findByIdAndRemove(req.body.genreid, (err) => {
                if(err) return next(err);
                res.redirect("/catalog/genres");
            })
        }
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};