const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

let AuthorSchema = new Schema({
    first_name: {type: String, required: true, max: 100},
    last_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema.virtual('name').get(function() {
    return this.last_name + ", " + this.first_name;
})

AuthorSchema.virtual('lifespan').get(function() {
    if(this.date_of_birth && this.date_of_death) return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
    return "";
})

AuthorSchema.virtual('date_of_birth_formatted').get(function () {
    return this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY'): '';
});

AuthorSchema.virtual('date_of_death_formatted').get(function () {
return this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '';
});

AuthorSchema.virtual('url').get(function() {
    return "/catalog/author/" + this._id;
})

module.exports = mongoose.model("Author", AuthorSchema);