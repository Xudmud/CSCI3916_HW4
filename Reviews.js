var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB, {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

//review schema
//Need to know which userID left the review and which movieID it is.
//userID is extracted from the JWT token, then passed in...?
var ReviewSchema = new Schema ({
    user: Object,
    rating: {type: Number, min:0, max: 5, required: true},
    movie: {type: mongoose.types.ObjectId, required: true},
    review: {type: String, required: true}
});

mongoose.exports = mongoose.model('Review',ReviewSchema);