var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

require('dotenv').config();

const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// order model
var orderSchema = new Schema({
    customer_name: String,
    cards: Array,
    completed: { type: Boolean, default: false },
    updated_at: { type: Date, default: Date.now }
});

connection.model('Order', orderSchema);
exports.connection = connection;