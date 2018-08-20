var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PlantSchema = new Schema({
    title: {type: String, required: true},
    species: { type: Schema.ObjectId, ref: 'Species', required: true },
    soilType: {type: String},
    sunType: {type: String},
    waterType: {type: String},
    notes: {type: String},
    propogations: [{ type: Schema.ObjectId, ref: 'Clippings' }]
});

// Virtual for this plant instance URL.
PlantSchema
.virtual('url')
.get(function () {
  return '/catalog/plant/'+this._id;
});

// Export model.
module.exports = mongoose.model('Plant', PlantSchema);
