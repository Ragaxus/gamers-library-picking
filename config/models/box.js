var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('dotenv').config();

const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// card metadata model
var boxSchema = new Schema({
    name: String,
    type: String,
    startCard: Object,
    endCard: Object,
    sets: Array,
});

connection.model('Box', boxSchema);
exports.connection = connection;