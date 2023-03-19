var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// user model
var userSchema = new Schema({
    user_name: String,
    user_email: String
});

connection.model('User', userSchema);
exports.connection = connection;