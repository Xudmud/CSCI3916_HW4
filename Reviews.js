var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

mongoose.connect(process.env.db, {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

//review schema
//Need to know which userID left the review and which movieID it is.
//userID is extracted from the JWT token, then passed in...?
var ReviewSchema = new Schema {
    user: Object,
    movie: Object,
    Review: String
}
