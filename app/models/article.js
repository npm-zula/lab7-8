// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

ArticleSchema = new Schema({
    title : String,
    body : String,
    author : String,
    published : Boolean,
    tags : String,
});
module.exports = mongoose.model('Article', ArticleSchema);