const axios = require('axios');
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

router.get('/submit-order', function (req, res, next) {
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


router.get('/view-orders', async function (req, res) {
  var orders = await Order.find({}).where('status').ne('sold').lean();
  res.renderVue('view-orders', {
    orders: orders,
    search_criteria: {
      showSoldOrders: false
    }
  });
});

router.get('/order', async function (req, res) {
  try {
    const search_params = req.query;
    if (search_params.showSoldOrders === 'false') allOrders = await Order.where('status').ne('sold').lean();
    else allOrders = await Order.find({}).lean();
    res.send(allOrders);
  } catch (error) {
    res.statusCode = 400;
    res.send({"error": error.stack})
  }
});

router.post('/order', function (req, res) {
  var newOrder = req.body;
  Order.create(newOrder, function (err, todo) {
    if (err) res.renderVue('error.vue', {
      title: 'Error creating your order :('
    })
  });
  res.send('succeeded');
});

router.put('/order/:orderId', async function (req, res) {
  const order = await Order.findByIdAndUpdate(req.params.orderId, req.body);
  res.send('succeeded');
});

router.get('/order/:orderId/setinfo', async function (req, res) {
  var allCardsUrl;
  axios.get('https://api.scryfall.com/bulk-data')
    .then(response => {
      console.log(response.data.url);
      console.log(response.data.explanation);
    })
    .catch(error => {
      console.log(error);
    });
});


module.exports = router;