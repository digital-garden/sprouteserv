var express = require('express');
var router = express.Router();


// Require our controllers.
var plant_controller = require('../controllers/plantController'); 
var clipping_controller = require('../controllers/clippingController');
var species_controller = require('../controllers/speciesController');



/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', plant_controller.index);  

// GET request for creating a Plant. NOTE This must come before routes that display Plant (uses id).
router.get('/plant/create', plant_controller.plant_create_get);

// POST request for creating Plant.
router.post('/plant/create', plant_controller.plant_create_post);

// GET request to delete Plant.
router.get('/plant/:id/delete', plant_controller.plant_delete_get);

// POST request to delete Plant.
router.post('/plant/:id/delete', plant_controller.plant_delete_post);

// GET request to update Plant.
router.get('/plant/:id/update', plant_controller.plant_update_get);

// POST request to update Plant.
router.post('/plant/:id/update', plant_controller.plant_update_post);

// GET request for one Plant.
router.get('/plant/:id', plant_controller.plant_detail);

// GET request for list of all Plant.
router.get('/plants', plant_controller.plant_list);

/// AUTHOR ROUTES ///

// GET request for creating Clipping. NOTE This must come before route for id (i.e. display clipping).
router.get('/clipping/create', clipping_controller.clipping_create_get);

// POST request for creating Clipping.
router.post('/clipping/create', clipping_controller.clipping_create_post);

// GET request to delete Clipping.
router.get('/clipping/:id/delete', clipping_controller.clipping_delete_get);

// POST request to delete Clipping
router.post('/clipping/:id/delete', clipping_controller.clipping_delete_post);

// GET request to update Clipping.
router.get('/clipping/:id/update', clipping_controller.clipping_update_get);

// POST request to update Clipping.
router.post('/clipping/:id/update', clipping_controller.clipping_update_post);

// GET request for one Clipping.
router.get('/clipping/:id', clipping_controller.clipping_detail);

// GET request for list of all Clippings.
router.get('/clippings', clipping_controller.clipping_list);


/// GENRE ROUTES ///

// GET request for creating a Species. NOTE This must come before route that displays Species (uses id).
router.get('/species/create', species_controller.species_create_get);

// POST request for creating Species.
router.post('/species/create', species_controller.species_create_post);

// GET request to delete Species.
router.get('/species/:id/delete', species_controller.species_delete_get);

// POST request to delete Species.
router.post('/species/:id/delete', species_controller.species_delete_post);

// GET request to update Species.
router.get('/species/:id/update', species_controller.species_update_get);

// POST request to update Species.
router.post('/species/:id/update', species_controller.species_update_post);

// GET request for one Species.
router.get('/species/:id', species_controller.species_detail);

// GET request for list of all Species.
router.get('/speciess', species_controller.species_list);



module.exports = router;
