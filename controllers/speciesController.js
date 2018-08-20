var Species = require('../models/species');
var Plant = require('../models/plant');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Species.
exports.species_list = function(req, res, next) {

  Species.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_speciess) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('species_list', { title: 'Species List', list_speciess:  list_speciess});
    });

};

// Display detail page for a specific Species.
exports.species_detail = function(req, res, next) {

    async.parallel({
        species: function(callback) {

            Species.findById(req.params.id)
              .exec(callback);
        },

        species_plants: function(callback) {
          Plant.find({ 'species': req.params.id })
          .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.species==null) { // No results.
            var err = new Error('Species not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('species_detail', { title: 'Species Detail', species: results.species, species_plants: results.species_plants } );
    });

};

// Display Species create form on GET.
exports.species_create_get = function(req, res, next) {
    res.render('species_form', { title: 'Create Species'});
};

// Handle Species create on POST.
exports.species_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Species name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a species object with escaped and trimmed data.
        var species = new Species(
          { name: req.body.name }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('species_form', { title: 'Create Species', species: species, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Species with same name already exists.
            Species.findOne({ 'name': req.body.name })
                .exec( function(err, found_species) {
                     if (err) { return next(err); }

                     if (found_species) {
                         // Species exists, redirect to its detail page.
                         res.redirect(found_species.url);
                     }
                     else {

                         species.save(function (err) {
                           if (err) { return next(err); }
                           // Species saved. Redirect to species detail page.
                           res.redirect(species.url);
                         });

                     }

                 });
        }
    }
];

// Display Species delete form on GET.
exports.species_delete_get = function(req, res, next) {

    async.parallel({
        species: function(callback) {
            Species.findById(req.params.id).exec(callback);
        },
        species_plants: function(callback) {
            Plant.find({ 'species': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.species==null) { // No results.
            res.redirect('/catalog/speciess');
        }
        // Successful, so render.
        res.render('species_delete', { title: 'Delete Species', species: results.species, species_plants: results.species_plants } );
    });

};

// Handle Species delete on POST.
exports.species_delete_post = function(req, res, next) {

    async.parallel({
        species: function(callback) {
            Species.findById(req.params.id).exec(callback);
        },
        species_plants: function(callback) {
            Plant.find({ 'species': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.species_plants.length > 0) {
            // Species has plants. Render in same way as for GET route.
            res.render('species_delete', { title: 'Delete Species', species: results.species, species_plants: results.species_plants } );
            return;
        }
        else {
            // Species has no plants. Delete object and redirect to the list of speciess.
            Species.findByIdAndRemove(req.body.id, function deleteSpecies(err) {
                if (err) { return next(err); }
                // Success - go to speciess list.
                res.redirect('/catalog/speciess');
            });

        }
    });

};

// Display Species update form on GET.
exports.species_update_get = function(req, res, next) {

    Species.findById(req.params.id, function(err, species) {
        if (err) { return next(err); }
        if (species==null) { // No results.
            var err = new Error('Species not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('species_form', { title: 'Update Species', species: species });
    });

};

// Handle Species update on POST.
exports.species_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Species name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a species object with escaped and trimmed data (and the old id!)
        var species = new Species(
          {
          name: req.body.name,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('species_form', { title: 'Update Species', species: species, errors: errors.array()});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Species.findByIdAndUpdate(req.params.id, species, {}, function (err,thespecies) {
                if (err) { return next(err); }
                   // Successful - redirect to species detail page.
                   res.redirect(thespecies.url);
                });
        }
    }
];
