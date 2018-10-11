const mongoose = require('mongoose');
const threadSchema = require('./threadSchema.js');
const findOneOrCreate = require('mongoose-find-one-or-create');

const boardSchema = new mongoose.Schema({
  boardName: {type: String, required: true, lowercase: true},
  threadList: [threadSchema]
});

boardSchema.plugin(findOneOrCreate);
module.exports = boardSchema;