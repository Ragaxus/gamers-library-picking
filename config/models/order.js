var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const connection = mongoose.createConnection(process.env.DB_CONN_STRING);

// order model
var orderSchema = new Schema({
    customer_name: String,
    contact_info: { type: String, default: ""},
    cards: Array,
    created_date: { type: Date, default: Date.now },
    status: {type: String, default: 'placed' },
    comment: {type: String, default: ''},
    cards_found: {type: Array, default: []}
});

connection.model('Order', orderSchema);
exports.connection = connection;