var Clipping = require('../models/clipping')
var async = require('async')
var Plant = require('../models/plant')

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Clippings.
exports.clipping_list = function (req, res, next) {

    Clipping.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_clippings) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('clipping_list', { title: 'Clipping List', clipping_list: list_clippings });
        })

};

// Display detail page for a specific Clipping.
exports.clipping_detail = function (req, res, next) {

    async.parallel({
        clipping: function (callback) {
            Clipping.findById(req.params.id)
                .exec(callback)
        },
        clippings_plants: function (callback) {
            Plant.find({ 'clipping': req.params.id }, 'title summary')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.clipping == null) { // No results.
            var err = new Error('Clipping not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('clipping_detail', { title: 'Clipping Detail', clipping: results.clipping, clipping_plants: results.clippings_plants });
    });

};

// Display Clipping create form on GET.
exports.clipping_create_get = function (req, res, next) {
    res.render('clipping_form', { title: 'Create Clipping' });
};

// Handle Clipping create on POST.
exports.clipping_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('clipping_form', { title: 'Create Clipping', clipping: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Clipping object with escaped and trimmed data.
            var clipping = new Clipping(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            clipping.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new clipping record.
                res.redirect(clipping.url);
            });
        }
    }
];



// Display Clipping delete form on GET.
exports.clipping_delete_get = function (req, res, next) {

    async.parallel({
        clipping: function (callback) {
            Clipping.findById(req.params.id).exec(callback)
        },
        clippings_plants: function (callback) {
            Plant.find({ 'clipping': req.params.id }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.clipping == null) { // No results.
            res.redirect('/catalog/clippings');
        }
        // Successful, so render.
        res.render('clipping_delete', { title: 'Delete Clipping', clipping: results.clipping, clipping_plants: results.clippings_plants });
    });

};

// Handle Clipping delete on POST.
exports.clipping_delete_post = function (req, res, next) {

    async.parallel({
        clipping: function (callback) {
            Clipping.findById(req.body.clippingid).exec(callback)
        },
        clippings_plants: function (callback) {
            Plant.find({ 'clipping': req.body.clippingid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success.
        if (results.clippings_plants.length > 0) {
            // Clipping has plants. Render in same way as for GET route.
            res.render('clipping_delete', { title: 'Delete Clipping', clipping: results.clipping, clipping_plants: results.clippings_plants });
            return;
        }
        else {
            // Clipping has no plants. Delete object and redirect to the list of clippings.
            Clipping.findByIdAndRemove(req.body.clippingid, function deleteClipping(err) {
                if (err) { return next(err); }
                // Success - go to clipping list.
                res.redirect('/catalog/clippings')
            })

        }
    });

};

// Display Clipping update form on GET.
exports.clipping_update_get = function (req, res, next) {

    Clipping.findById(req.params.id, function (err, clipping) {
        if (err) { return next(err); }
        if (clipping == null) { // No results.
            var err = new Error('Clipping not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('clipping_form', { title: 'Update Clipping', clipping: clipping });

    });
};

// Handle Clipping update on POST.
exports.clipping_update_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Clipping object with escaped and trimmed data (and the old id!)
        var clipping = new Clipping(
            {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('clipping_form', { title: 'Update Clipping', clipping: clipping, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Clipping.findByIdAndUpdate(req.params.id, clipping, {}, function (err, theclipping) {
                if (err) { return next(err); }
                // Successful - redirect to species detail page.
                res.redirect(theclipping.url);
            });
        }
    }
];
