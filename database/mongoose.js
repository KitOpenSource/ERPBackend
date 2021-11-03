const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb+srv://rdjk287:tCrQPQSkABOgwANE@cluster0.8og1z.mongodb.net/testdb?retryWrites=true&w=majority')
	.then(() => console.log("connected db."))
	.catch((error) => console.log(error));

module.exports = mongoose;