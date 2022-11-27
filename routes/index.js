var format = require('date-format');

var express = require('express');
var router = express.Router();

//Mongoose
var {
  connection
} = require('../config/models/order');
var Order = connection.model('Order');

//All current cards -- read from file which is updated out of band
const fs = require('fs');
var allCardNames;
fs.readFile('./default-cards.json', 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const defaultCards = JSON.parse(data);
  allCardNames = defaultCards.map(card => card.name).sort();
});

router.get('/submit', function (req, res, next) {
  const data = {
    order: {
      customer_name: "",
      cards: []
    },
    new_item: {
      new_item_quantity: 0,
      new_item_name: ""
    },
    card_names: allCardNames
  };
  res.renderVue('submit-order', data);
});

router.post('/submit-order', function (req, res) {
  var newOrder = req.body;
  Order.create(newOrder, function (err, todo) {
    if (err) res.renderVue('error.vue', {
      title: 'Error creating your order :('
    })
    res.redirect('/submit');
  });
});

router.get('/view-orders', async function (req, res) {
  var oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  oneMonthAgo.setHours(0, 0, 0, 0);
  var orders = await Order.find({}).where('updated_at').gt(oneMonthAgo).lean();
  orders = orders.map(order => {
    order.updated_at = format.asString('MM/dd/yyyy', order.updated_at);
    return order;
  });
  res.renderVue('view-orders', {
    orders: orders
  });
});


module.exports = router;