var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const connection = mongoose.createConnection(process.env.DB_CONN_STRING)

// card metadata model
var cardmetadataSchema = new Schema({
    name: String,
    realName: String,
    color: String,
    sets: Array,
    prices: Object
});

connection.model('CardMetadata', cardmetadataSchema);
exports.connection = connection;