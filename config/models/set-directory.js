var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// card metadata model
var setDirectorySchema = new Schema({
    core: Array,
    standard: Array,
    supplemental: Array
});

connection.model('SetDirectory', setDirectorySchema);
exports.connection = connection;