var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('dotenv').config();

const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// order model
var orderSchema = new Schema({
    customer_name: String,
    cards: Array,
    created_date: { type: Date, default: Date.now },
    status: {type: String, default: 'new' }
});

connection.model('Order', orderSchema);
exports.connection = connection;