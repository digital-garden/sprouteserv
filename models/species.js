var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SpeciesSchema = new Schema({
    name: {type: String, required: true, min: 3, max: 100}
});

// Virtual for this species instance URL.
SpeciesSchema
.virtual('url')
.get(function () {
  return '/catalog/species/'+this._id;
});

// Export model.
module.exports = mongoose.model('Species', SpeciesSchema);
