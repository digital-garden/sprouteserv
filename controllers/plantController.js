var Plant = require('../models/plant');
var Clipping = require('../models/clipping');
var Species = require('../models/species');


const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        plant_count: function(callback) {
            Plant.count(callback);
        },
        clipping_count: function(callback) {
            Clipping.count(callback);
        },
        species_count: function(callback) {
            Species.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Sproute Admin Panel', error: err, data: results });
    });
};


// Display list of all plants.
exports.plant_list = function(req, res, next) {

  Plant.find({}, 'title clipping ')
    .populate('clipping')
    .exec(function (err, list_plants) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('plant_list', { title: 'Plant List', plant_list:  list_plants});
    });

};

// Display detail page for a specific plant.
exports.plant_detail = function(req, res, next) {

    async.parallel({
        plant: function(callback) {

            Plant.findById(req.params.id)
              .populate('clipping')
              .populate('species')
              .exec(callback);
        },
        
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.plant==null) { // No results.
            var err = new Error('Plant not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('plant_detail', { title: 'Title', plant:  results.plant} );
    });

};

// Display plant create form on GET.
exports.plant_create_get = function(req, res, next) {

    // Get all clippings and speciess, which we can use for adding to our plant.
    async.parallel({
        clippings: function(callback) {
            Clipping.find(callback);
        },
        speciess: function(callback) {
            Species.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('plant_form', { title: 'Create Plant',clippings:results.clippings, speciess:results.speciess });
    });

};

// Handle plant create on POST.
exports.plant_create_post = [
    // Convert the species to an array.
    (req, res, next) => {
        if(!(req.body.species instanceof Array)){
            if(typeof req.body.species==='undefined')
            req.body.species=[];
            else
            req.body.species=new Array(req.body.species);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('species', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('soilType', 'Clipping must not be empty.').isLength({ min: 1 }).trim(),
    body('sunType', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('waterType', 'ISBN must not be empty').isLength({ min: 1 }).trim(),
    body('notes', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    sanitizeBody('species.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Plant object with escaped and trimmed data.
        var plant = new Plant(
          { title: req.body.title,
            species: req.body.species,
            soilType: req.body.soilType,
            sunType: req.body.sunType,
            waterType: req.body.waterType,
            notes: req.body.notes
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all clippings and speciess for form.
            async.parallel({
                clippings: function(callback) {
                    Clipping.find(callback);
                },
                speciess: function(callback) {
                    Species.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected speciess as checked.
                for (let i = 0; i < results.speciess.length; i++) {
                    if (plant.species.indexOf(results.speciess[i]._id) > -1) {
                        results.speciess[i].checked='true';
                    }
                }
                res.render('plant_form', { title: 'Create Plant',clippings:results.clippings, speciess:results.speciess, plant: plant, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save plant.
            plant.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new plant record.
                   res.redirect(plant.url);
                });
        }
    }
];



// Display plant delete form on GET.
exports.plant_delete_get = function(req, res, next) {

    async.parallel({
        plant: function(callback) {
            Plant.findById(req.params.id).populate('clipping').populate('species').exec(callback);
        },
       
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.plant==null) { // No results.
            res.redirect('/catalog/plants');
        }
        // Successful, so render.
        res.render('plant_delete', { title: 'Delete Plant', plant: results.plant } );
    });

};

// Handle plant delete on POST.
exports.plant_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        plant: function(callback) {
            Plant.findById(req.params.id).populate('clipping').populate('species').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            // Plant has no PlantInstance objects. Delete object and redirect to the list of plants.
            Plant.findByIdAndRemove(req.body.id, function deletePlant(err) {
                if (err) { return next(err); }
                // Success - got to plants list.
                res.redirect('/catalog/plants');
            });

        }
    });

};

// Display plant update form on GET.
exports.plant_update_get = function(req, res, next) {

    // Get plant, clippings and speciess for form.
    async.parallel({
        plant: function(callback) {
            Plant.findById(req.params.id).populate('clipping').populate('species').exec(callback);
        },
        clippings: function(callback) {
            Clipping.find(callback);
        },
        speciess: function(callback) {
            Species.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.plant==null) { // No results.
                var err = new Error('Plant not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected speciess as checked.
            for (var all_g_iter = 0; all_g_iter < results.speciess.length; all_g_iter++) {
                for (var plant_g_iter = 0; plant_g_iter < results.plant.species.length; plant_g_iter++) {
                    if (results.speciess[all_g_iter]._id.toString()==results.plant.species[plant_g_iter]._id.toString()) {
                        results.speciess[all_g_iter].checked='true';
                    }
                }
            }
            res.render('plant_form', { title: 'Update Plant', clippings:results.clippings, speciess:results.speciess, plant: results.plant });
        });

};


// Handle plant update on POST.
exports.plant_update_post = [

    // Convert the species to an array.
    (req, res, next) => {
        if(!(req.body.species instanceof Array)){
            if(typeof req.body.species==='undefined')
            req.body.species=[];
            else
            req.body.species=new Array(req.body.species);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('clipping', 'Clipping must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('clipping').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('species.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Plant object with escaped/trimmed data and old id.
        var plant = new Plant(
          { title: req.body.title,
            clipping: req.body.clipping,
            summary: req.body.summary,
            isbn: req.body.isbn,
            species: (typeof req.body.species==='undefined') ? [] : req.body.species,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all clippings and speciess for form
            async.parallel({
                clippings: function(callback) {
                    Clipping.find(callback);
                },
                speciess: function(callback) {
                    Species.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected speciess as checked.
                for (let i = 0; i < results.speciess.length; i++) {
                    if (plant.species.indexOf(results.speciess[i]._id) > -1) {
                        results.speciess[i].checked='true';
                    }
                }
                res.render('plant_form', { title: 'Update Plant',clippings:results.clippings, speciess:results.speciess, plant: plant, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Plant.findByIdAndUpdate(req.params.id, plant, {}, function (err,theplant) {
                if (err) { return next(err); }
                   // Successful - redirect to plant detail page.
                   res.redirect(theplant.url);
                });
        }
    }
];

