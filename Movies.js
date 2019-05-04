var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//Don't need bcrypt really

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, { useNewUrlParser: true } );
mongoose.set('useCreateIndex', true);

//Movie schema
var MovieSchema = new Schema({
    title: {type: String, required: true},
    year: {type: Number, required: true},
    genre: {type: String, required: true},
    actor: {type: Object, required: true},
    imageUrl: {type: String, default: "https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/026/full/react.png"}
});


module.exports = mongoose.model('Movie', MovieSchema);
