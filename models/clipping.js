var mongoose = require('mongoose');
var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var ClippingSchema = new Schema(
    {
    species: { type: Schema.ObjectId, ref: 'Species', required: true },
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: { type: Date },
    date_of_death: { type: Date },
    }
  );

// Virtual for clipping "full" name.
ClippingSchema
.virtual('name')
.get(function () {
  return this.family_name +', '+this.first_name;
});

// Virtual for this clipping instance URL.
ClippingSchema
.virtual('url')
.get(function () {
  return '/catalog/clipping/'+this._id
});

ClippingSchema
.virtual('lifespan')
.get(function () {
  var lifetime_string='';
  if (this.date_of_birth) {
      lifetime_string=moment(this.date_of_birth).format('MMMM Do, YYYY');
      }
  lifetime_string+=' - ';
  if (this.date_of_death) {
      lifetime_string+=moment(this.date_of_death).format('MMMM Do, YYYY');
      }
  return lifetime_string
});

ClippingSchema
.virtual('date_of_birth_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_birth).format('YYYY-MM-DD');
});

ClippingSchema
.virtual('date_of_death_yyyy_mm_dd')
.get(function () {
  return moment(this.date_of_death).format('YYYY-MM-DD');
});

// Export model.
module.exports = mongoose.model('Clipping', ClippingSchema);
