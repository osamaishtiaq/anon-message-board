const mongoose = require('mongoose');
const findOneOrCreate = require('mongoose-find-one-or-create');

const threadSchema = new mongoose.Schema({
  text: {type: String, required: true},
  created_on: {type: Date, default: Date.now},
  bumped_on: {type: Date, default: Date.now},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: {
    type: [{text: String, date: Date, reported: Boolean}], default: []}
});

threadSchema.plugin(findOneOrCreate);

module.exports = threadSchema;